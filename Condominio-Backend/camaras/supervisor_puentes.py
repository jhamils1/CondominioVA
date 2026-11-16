"""Supervisión local de puentes de cámara, sin iniciar el procesador de IA."""
import logging
import http.client
import os
from pathlib import Path
import re
import socket
import subprocess
import threading

logger = logging.getLogger(__name__)
RAIZ = Path(__file__).resolve().parent.parent / 'seguridad_vision'
PUENTES = (('Imou', 'imou_local.py', 28766), ('catálogo', 'camaras_catalogo.py', 28768))


def puerto_en_uso(puerto):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', puerto)) == 0


class SupervisorPuentes:
    def __init__(self, intervalo=5):
        self.intervalo = intervalo
        self.detener = threading.Event()
        self.procesos = {}
        self.hilo = None

    def iniciar(self):
        self.hilo = threading.Thread(target=self._vigilar, name='puentes-camaras', daemon=True)
        self.hilo.start()

    def _vigilar(self):
        while not self.detener.is_set():
            self._revisar()
            self.detener.wait(self.intervalo)

    def _revisar(self):
        ejecutable = RAIZ / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
        for nombre, archivo, puerto in PUENTES:
            proceso = self.procesos.get(puerto)
            if proceso is not None and proceso.poll() is None:
                continue
            self.procesos.pop(puerto, None)
            if puerto_en_uso(puerto):
                continue
            if not ejecutable.is_file() or not (RAIZ / archivo).is_file():
                logger.warning('No se puede iniciar el puente %s: falta el entorno o el archivo.', nombre)
                continue
            try:
                self.procesos[puerto] = subprocess.Popen(
                    [str(ejecutable), str(RAIZ / archivo)], cwd=str(RAIZ),
                    stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                    creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0),
                )
            except OSError:
                logger.warning('No se pudo iniciar el puente %s.', nombre)

    def cerrar(self):
        self.detener.set()
        if self.hilo:
            self.hilo.join(timeout=3)
        for puerto, proceso in self.procesos.items():
            if proceso.poll() is None:
                try:
                    nombre_token = 'imou_local.token' if puerto == 28766 else 'camaras_catalogo.token'
                    token = (RAIZ / 'recursos' / nombre_token).read_text(encoding='ascii')
                    if not re.fullmatch(r'[A-Za-z0-9_-]{43}', token):
                        raise ValueError
                    conn = http.client.HTTPConnection('127.0.0.1', puerto, timeout=2)
                    try:
                        conn.request('POST', '/cerrar', headers={'Authorization': 'Bearer ' + token})
                        if conn.getresponse().status != 200:
                            raise ValueError
                    finally:
                        conn.close()
                    proceso.wait(timeout=5)
                except (OSError, ValueError, http.client.HTTPException, subprocess.TimeoutExpired):
                    proceso.terminate()
                    try:
                        proceso.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        proceso.kill()
                        proceso.wait(timeout=5)
        self.procesos.clear()
