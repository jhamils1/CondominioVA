"""Puente local RTSP/JPEG; sin grabación, inferencia ni eventos."""
import hmac
import os
from pathlib import Path
import secrets
import socket
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

from probar_imou import leer_configuracion

TOKEN = Path(__file__).resolve().parent / "recursos" / "imou_local.token"
PUERTO = 18766
INACTIVIDAD = 4


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

    def solicitar(self):
        with self.lock:
            self.ultima_peticion = time.monotonic()
            if self.error:
                self.error = False
                return 503, b""
            if self.hilo is None or not self.hilo.is_alive():
                self.imagen = None
                self.hilo = threading.Thread(target=self.leer, daemon=True)
                self.hilo.start()
            if self.imagen and time.monotonic() - self.fecha_imagen < 1.5:
                return 200, self.imagen
            return 202, b""

    def leer(self):
        captura = None
        try:
            cv = self.cv
            captura = cv.VideoCapture(self.obtener_url(), cv.CAP_FFMPEG, [
                cv.CAP_PROP_OPEN_TIMEOUT_MSEC, 5000,
                cv.CAP_PROP_READ_TIMEOUT_MSEC, 2000,
            ])
            if not captura.isOpened():
                raise RuntimeError
            ultima_codificacion = 0
            while not self.fin.is_set():
                with self.lock:
                    if time.monotonic() - self.ultima_peticion > INACTIVIDAD:
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
                    self.imagen = jpg.tobytes()
                    self.fecha_imagen = ahora
                ultima_codificacion = ahora
        except Exception:
            with self.lock:
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
        elif self.path != '/fotograma':
            estado, cuerpo = 404, b''
        else:
            estado, cuerpo = self.server.fuente.solicitar()
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
        leer_configuracion()
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
