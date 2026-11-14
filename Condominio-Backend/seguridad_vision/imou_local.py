"""Puente local RTSP/JPEG; sin grabación, inferencia ni eventos."""
import hmac
import ipaddress
import json
import os
from pathlib import Path
import secrets
import socket
import threading
import time
from urllib.parse import quote, parse_qsl
from http.server import BaseHTTPRequestHandler, HTTPServer

from probar_imou import leer_configuracion

TOKEN = Path(__file__).resolve().parent / "recursos" / "imou_local.token"
PUERTO = 28766
INACTIVIDAD = 4


def url_fuente_catalogo(datos):
    if not isinstance(datos, dict) or set(datos) != {'ip', 'puerto', 'ruta', 'usuario', 'clave'}:
        raise ValueError
    ip = ipaddress.IPv4Address(datos['ip'])
    redes = tuple(ipaddress.ip_network(x) for x in ('10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'))
    puerto, ruta, usuario, clave = datos['puerto'], datos['ruta'], datos['usuario'], datos['clave']
    if (not any(ip in r for r in redes) or isinstance(puerto, bool) or not isinstance(puerto, int) or not 1 <= puerto <= 65535
            or not isinstance(ruta, str) or len(ruta) > 500 or not ruta.startswith('/') or ruta.startswith('//')
            or any(c in ruta for c in '@#\\') or any(c.isspace() or ord(c) < 32 for c in ruta)
            or not isinstance(usuario, str) or not 1 <= len(usuario) <= 150
            or not isinstance(clave, str) or not 1 <= len(clave) <= 512):
        raise ValueError
    if '?' in ruta and any(any(s in k.casefold() for s in ('user', 'pass', 'token', 'secret', 'clave', 'auth'))
                           for k, _ in parse_qsl(ruta.split('?', 1)[1], keep_blank_values=True)):
        raise ValueError
    return f"rtsp://{quote(usuario, safe='')}:{quote(clave, safe='')}@{ip}:{puerto}{ruta}"


class FuenteImou:
    def __init__(self, cv, obtener_url=leer_configuracion):
        self.cv = cv
        self.obtener_url = obtener_url
        self.lock = threading.Lock()
        self.fin = threading.Event()
        self.hilo = None
        self.ultima_peticion = 0
        self.imagen = None
        self.fecha_imagen = 0
        self.error = False
        self.url_actual = None
        self.revision = 0

    def solicitar(self, url_catalogo=None):
        try:
            url = url_catalogo if url_catalogo is not None else self.obtener_url()
        except Exception:
            return 503, b''
        with self.lock:
            self.ultima_peticion = time.monotonic()
            if self.url_actual != url:
                self.url_actual = url
                self.revision += 1
                self.imagen = None
                self.error = False
            if self.error:
                self.error = False
                return 503, b""
            if self.hilo is None or not self.hilo.is_alive():
                self.imagen = None
                self.hilo = threading.Thread(target=self.leer, args=(self.revision, url), daemon=True)
                self.hilo.start()
            if self.imagen and time.monotonic() - self.fecha_imagen < 1.5:
                return 200, self.imagen
            return 202, b""

    def leer(self, revision, url):
        captura = None
        try:
            cv = self.cv
            captura = cv.VideoCapture(url, cv.CAP_FFMPEG, [
                cv.CAP_PROP_OPEN_TIMEOUT_MSEC, 5000,
                cv.CAP_PROP_READ_TIMEOUT_MSEC, 2000,
            ])
            if not captura.isOpened():
                raise RuntimeError
            ultima_codificacion = 0
            while not self.fin.is_set():
                with self.lock:
                    if revision != self.revision or time.monotonic() - self.ultima_peticion > INACTIVIDAD:
                        break
                ok, imagen = captura.read()
                if not ok or imagen is None:
                    raise RuntimeError
                ahora = time.monotonic()
                if ahora - ultima_codificacion < 0.2:
                    continue
                alto, ancho = imagen.shape[:2]
                if max(alto, ancho) > 960:
                    escala = 960 / max(alto, ancho)
                    imagen = cv.resize(imagen, (int(ancho * escala), int(alto * escala)))
                ok, jpg = cv.imencode('.jpg', imagen, [cv.IMWRITE_JPEG_QUALITY, 75])
                if not ok or len(jpg) > 1024 * 1024:
                    raise RuntimeError
                with self.lock:
                    if revision == self.revision:
                        self.imagen = jpg.tobytes()
                        self.fecha_imagen = ahora
                ultima_codificacion = ahora
        except Exception:
            with self.lock:
                if revision == self.revision:
                    self.error = True
        finally:
            if captura is not None:
                captura.release()
            with self.lock:
                self.imagen = None

    def cerrar(self):
        self.fin.set()
        if self.hilo:
            self.hilo.join(timeout=7)


class Servidor(HTTPServer):
    allow_reuse_address = False

    def server_bind(self):
        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


class Peticion(BaseHTTPRequestHandler):
    def setup(self):
        super().setup()
        self.connection.settimeout(3)

    def log_message(self, *args):
        pass

    def do_POST(self):
        if not hmac.compare_digest(self.headers.get('Authorization', ''),
                                   'Bearer ' + self.server.clave):
            estado, cuerpo = 403, b''
        elif self.path not in ('/fotograma', '/fotograma-catalogo'):
            estado, cuerpo = 404, b''
        else:
            try:
                if self.path == '/fotograma-catalogo':
                    longitud = int(self.headers.get('Content-Length', '0'))
                    if not 0 < longitud <= 4096:
                        raise ValueError
                    datos = json.loads(self.rfile.read(longitud))
                    url = url_fuente_catalogo(datos)
                    estado, cuerpo = self.server.fuente.solicitar(url)
                else:
                    estado, cuerpo = self.server.fuente.solicitar()
            except (ValueError, TypeError, KeyError, OSError):
                estado, cuerpo = 400, b''
        self.send_response(estado)
        self.send_header('Content-Type', 'image/jpeg' if estado == 200 else 'text/plain')
        self.send_header('Content-Length', str(len(cuerpo)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        try:
            self.wfile.write(cuerpo)
        except (OSError, ConnectionError):
            pass


def main():
    # Suprime errores nativos que podrían incluir la URL con credenciales.
    with open(os.devnull, 'w') as nulo:
        os.dup2(nulo.fileno(), 2)
    os.environ['OPENCV_LOG_LEVEL'] = 'SILENT'
    os.environ['OPENCV_FFMPEG_CAPTURE_OPTIONS'] = 'rtsp_transport;tcp'
    import cv2
    try:
        servidor = Servidor(('127.0.0.1', PUERTO), Peticion)
    except Exception:
        print('No se pudo iniciar el puente Imou. Revisa configuración o puerto ocupado.', flush=True)
        return 1
    servidor.clave = secrets.token_urlsafe(32)
    servidor.fuente = FuenteImou(cv2)
    try:
        TOKEN.write_text(servidor.clave, encoding='ascii')
        print('Puente Imou listo. La cámara se abre solo al solicitar la vista web.', flush=True)
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        servidor.fuente.cerrar()
        servidor.server_close()
        if TOKEN.exists() and TOKEN.read_text(encoding='ascii') == servidor.clave:
            TOKEN.unlink()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
