"""Puente local aislado para cámaras de red adicionales, sin IA ni grabación."""
import hmac
import json
import os
from pathlib import Path
import secrets
import socket
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

from imou_local import FuenteImou, url_fuente_catalogo

TOKEN = Path(__file__).resolve().parent / 'recursos' / 'camaras_catalogo.token'
PUERTO = 28768
MAX_CAMARAS = 4


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
        estado, cuerpo = 403, b''
        if hmac.compare_digest(self.headers.get('Authorization', ''), 'Bearer ' + self.server.clave):
            estado = 400
            try:
                if self.path != '/fotograma':
                    raise ValueError
                longitud = int(self.headers.get('Content-Length', '0'))
                if not 0 < longitud <= 4096:
                    raise ValueError
                datos = json.loads(self.rfile.read(longitud))
                if not isinstance(datos, dict) or set(datos) != {'id', 'fuente'} or type(datos['id']) is not int or datos['id'] < 1:
                    raise ValueError
                url = url_fuente_catalogo(datos['fuente'])
                ahora = time.monotonic()
                for pk, fuente in list(self.server.fuentes.items()):
                    if ahora - fuente.ultima_peticion > 20 and (fuente.hilo is None or not fuente.hilo.is_alive()):
                        fuente.cerrar()
                        del self.server.fuentes[pk]
                if datos['id'] not in self.server.fuentes:
                    if len(self.server.fuentes) >= MAX_CAMARAS:
                        estado = 429
                    else:
                        self.server.fuentes[datos['id']] = FuenteImou(self.server.cv)
                if datos['id'] in self.server.fuentes:
                    estado, cuerpo = self.server.fuentes[datos['id']].solicitar(url)
            except (ValueError, TypeError, KeyError, OSError):
                estado = 400
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
    with open(os.devnull, 'w') as nulo:
        os.dup2(nulo.fileno(), 2)
    os.environ['OPENCV_LOG_LEVEL'] = 'SILENT'
    os.environ['OPENCV_FFMPEG_CAPTURE_OPTIONS'] = 'rtsp_transport;tcp'
    import cv2
    try:
        servidor = Servidor(('127.0.0.1', PUERTO), Peticion)
    except OSError:
        print('No se pudo iniciar el puente de cámaras; revisa el puerto.', flush=True)
        return 1
    servidor.clave, servidor.cv, servidor.fuentes = secrets.token_urlsafe(32), cv2, {}
    try:
        TOKEN.write_text(servidor.clave, encoding='ascii')
        print('Puente de cámaras de catálogo iniciado.', flush=True)
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        for fuente in servidor.fuentes.values():
            fuente.cerrar()
        servidor.server_close()
        if TOKEN.exists() and TOKEN.read_text(encoding='ascii') == servidor.clave:
            TOKEN.unlink()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
