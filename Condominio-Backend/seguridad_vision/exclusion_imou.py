"""Exclusión de la fuente física Imou para una sesión remota.

El bloqueo se conserva hasta que el titular lo libere o termine el proceso.
No usa caducidad automática: perder la conexión debe bloquear el registro local
hasta que se resuelva el estado de la sesión, no permitir dos monitores.
"""
import hmac
import json
import os
from pathlib import Path
import re
import socket
import threading

FORMATO_TITULAR = re.compile(r'[A-Za-z0-9_-]{32,128}\Z')
MARCA_REMOTA = Path(__file__).resolve().parent / 'recursos' / 'imou_remota.activa'


class ExclusionImou:
    def __init__(self, puerto=28769, marca=MARCA_REMOTA):
        self.puerto = puerto
        self.marca = Path(marca)
        self._lock = threading.Lock()
        self._socket = None
        self._titular = None
        self._operaciones = 0
        self._liberacion_pendiente = False

    @staticmethod
    def _valido(titular):
        return isinstance(titular, str) and FORMATO_TITULAR.fullmatch(titular) is not None

    def _es_titular(self, titular):
        return (self._titular is not None and self._valido(titular)
                and hmac.compare_digest(self._titular, titular))

    def adquirir(self, titular):
        if not self._valido(titular):
            return False
        with self._lock:
            if self._socket is not None:
                return self._es_titular(titular) and not self._liberacion_pendiente
            try:
                descriptor = os.open(str(self.marca), os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
                with os.fdopen(descriptor, 'wb') as archivo:
                    archivo.write(b'{"operaciones":0}')
                    archivo.flush()
                    os.fsync(archivo.fileno())
            except OSError:
                return False
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
            try:
                sock.bind(('127.0.0.1', self.puerto))
            except OSError:
                sock.close()
                try:
                    self.marca.unlink()
                except OSError:
                    pass
                return False
            self._socket = sock
            self._titular = titular
            self._operaciones = 0
            self._liberacion_pendiente = False
            return True

    def pertenece(self, titular):
        with self._lock:
            return self._socket is not None and self._es_titular(titular) and not self._liberacion_pendiente

    def iniciar(self, titular):
        with self._lock:
            if not self._es_titular(titular) or self._liberacion_pendiente:
                return False
            if not self._persistir_operaciones(self._operaciones + 1):
                return False
            self._operaciones += 1
            return True

    def terminar(self, titular):
        with self._lock:
            if not self._es_titular(titular) or self._operaciones <= 0:
                return False
            if not self._persistir_operaciones(self._operaciones - 1):
                return False
            self._operaciones -= 1
            if self._operaciones == 0 and self._liberacion_pendiente:
                self._cerrar_sin_bloqueo()
            return True

    def _persistir_operaciones(self, cantidad):
        try:
            contenido = json.dumps({'operaciones': cantidad}, separators=(',', ':')).encode('ascii')
            with self.marca.open('r+b', buffering=0) as archivo:
                archivo.write(contenido)
                archivo.truncate()
                os.fsync(archivo.fileno())
            return True
        except OSError:
            return False

    def _cerrar_sin_bloqueo(self, conservar_marca=False):
        tenia_bloqueo = self._socket is not None
        if self._socket is not None:
            self._socket.close()
        if tenia_bloqueo and not conservar_marca:
            try:
                self.marca.unlink()
            except OSError:
                # Si no se puede retirar, se conserva el bloqueo preventivo.
                pass
        self._socket = None
        self._titular = None
        self._operaciones = 0
        self._liberacion_pendiente = False

    def liberar(self, titular):
        with self._lock:
            if not self._es_titular(titular):
                return False
            if self._operaciones:
                self._liberacion_pendiente = True
            else:
                self._cerrar_sin_bloqueo()
            return True

    def recuperar(self):
        """Recupera solo si no hay operaciones pendientes y el puerto está libre."""
        with self._lock:
            if self._operaciones:
                return False
            if self._socket is None:
                if not self.marca.exists():
                    return True
                try:
                    contenido = self.marca.read_bytes()
                    datos = json.loads(contenido) if len(contenido) <= 128 else None
                    if (not isinstance(datos, dict) or set(datos) != {'operaciones'}
                            or type(datos['operaciones']) is not int or datos['operaciones'] != 0):
                        return False
                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as prueba:
                        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
                            prueba.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
                        prueba.bind(('127.0.0.1', self.puerto))
                        self.marca.unlink()
                    return True
                except (OSError, ValueError, TypeError):
                    return False
            self._cerrar_sin_bloqueo()
            return not self.marca.exists()

    def cerrar(self, conservar_marca=False):
        with self._lock:
            self._cerrar_sin_bloqueo(conservar_marca=conservar_marca)
