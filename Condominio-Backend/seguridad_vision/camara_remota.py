"""Servicio RF-DETR Nano para un servidor propio detrás de un proxy HTTPS.

Escucha solo en loopback. No escribe imágenes ni información de las solicitudes.
"""
import hmac
import http.client
import json
import os
import re
import threading
from socketserver import ThreadingMixIn

from camara_local import Procesador, RECURSOS, RFDETRNano, ServidorLocal, torch
from exclusion_imou import ExclusionImou


class ServidorRemoto(ThreadingMixIn, ServidorLocal):
    # La exclusión no debe quedar en cola detrás de una inferencia larga.
    daemon_threads = True
    request_queue_size = 8


def leer_configuracion():
    token = os.environ.get('VISION_REMOTA_TOKEN', '')
    if not re.fullmatch(r'[A-Za-z0-9_-]{32,128}', token):
        raise SystemExit('Configura un token privado válido en VISION_REMOTA_TOKEN.')
    try:
        puerto = int(os.environ.get('VISION_REMOTA_PUERTO', '28767'))
    except ValueError:
        raise SystemExit('El puerto del servicio no es válido.') from None
    if not 1 <= puerto <= 65535:
        raise SystemExit('El puerto del servicio no es válido.')
    dispositivo = os.environ.get('VISION_REMOTA_DISPOSITIVO', 'cpu')
    if dispositivo not in ('cpu', 'cuda'):
        raise SystemExit('El dispositivo debe ser cpu o cuda.')
    return token, puerto, dispositivo


class ProcesadorRemoto(Procesador):
    def autorizado(self):
        valor = self.headers.get('Authorization', '')
        return valor.isascii() and hmac.compare_digest(valor, 'Bearer ' + self.server.token)

    def do_GET(self):
        if not self.autorizado():
            return self.responder(403, {'error': 'No autorizado'})
        if self.path == '/imou/fotograma':
            return self.fotograma_imou()
        if self.path != '/estado':
            return self.responder(404, {'error': 'No disponible'})
        return self.responder(200, {'disponible': True, 'contrato': 'condominio-vision-v1',
                                    'modelo': 'RF-DETR Nano', 'imou_contrato': 'condominio-imou-v1'})

    def do_POST(self):
        if self.path != '/imou/exclusion':
            if self.path != '/detectar':
                return super().do_POST()
            if not self.autorizado():
                return self.responder(403, {'error': 'No autorizado'})
            if not self.server.inferencia_lock.acquire(blocking=False):
                return self.responder(503, {'error': 'Procesador ocupado'})
            try:
                return super().do_POST()
            finally:
                self.server.inferencia_lock.release()
        if not self.autorizado():
            return self.responder(403, {'error': 'No autorizado'})
        try:
            longitud = int(self.headers.get('Content-Length', '0'))
            if not 0 < longitud <= 512:
                raise ValueError
            self.connection.settimeout(3)
            datos = json.loads(self.rfile.read(longitud))
            if not isinstance(datos, dict) or set(datos) != {'accion', 'titular'}:
                raise ValueError
            accion = datos['accion']
            titular = datos['titular']
            if accion == 'adquirir':
                resultado = self.server.exclusion_imou.adquirir(titular)
            elif accion == 'verificar':
                resultado = self.server.exclusion_imou.pertenece(titular)
            elif accion == 'liberar':
                resultado = self.server.exclusion_imou.liberar(titular)
            elif accion == 'iniciar':
                resultado = self.server.exclusion_imou.iniciar(titular)
            elif accion == 'terminar':
                resultado = self.server.exclusion_imou.terminar(titular)
            elif accion == 'recuperar':
                resultado = self.server.exclusion_imou.recuperar()
            else:
                raise ValueError
        except (ValueError, TypeError, OSError):
            return self.responder(400, {'error': 'Solicitud inválida'})
        return self.responder(200 if resultado else 409, {'concedido': resultado})

    def fotograma_imou(self):
        """Solicita un fotograma al backend local, sin revelar datos RTSP."""
        status, contenido = 503, b''
        try:
            clave = (RECURSOS / 'imou_local.token').read_text(encoding='ascii')
            if not re.fullmatch(r'[A-Za-z0-9_-]{43}', clave):
                raise ValueError
            conn = http.client.HTTPConnection('127.0.0.1', getattr(self.server, 'imou_backend_puerto', 8000), timeout=4)
            try:
                conn.request('GET', '/api/vision-imou/puente-interno/', headers={'Authorization': 'Bearer ' + clave})
                response = conn.getresponse()
                data = response.read(1024 * 1024 + 1)
                if response.status == 202:
                    status = 202
                elif response.status == 200 and data.startswith(b'\xff\xd8\xff') and len(data) <= 1024 * 1024:
                    status, contenido = 200, data
            finally:
                conn.close()
        except (OSError, UnicodeError, ValueError, http.client.HTTPException):
            pass
        self.send_response(status)
        self.send_header('Content-Type', 'image/jpeg' if status == 200 else 'text/plain')
        self.send_header('Content-Length', str(len(contenido)))
        self.send_header('Cache-Control', 'no-store, private')
        self.end_headers()
        try:
            self.wfile.write(contenido)
        except OSError:
            pass


def main():
    token, puerto, dispositivo = leer_configuracion()
    if not (RECURSOS / 'cache_roboflow' / 'rf-detr-nano.pth').is_file():
        raise SystemExit('Faltan los pesos locales de RF-DETR Nano en el servidor.')
    servidor = ServidorRemoto(('127.0.0.1', puerto), ProcesadorRemoto)
    servidor.exclusion_imou = ExclusionImou()
    servidor.inferencia_lock = threading.Lock()
    try:
        servidor.token = token
        torch.set_num_threads(2)
        servidor.modelo = RFDETRNano(device=dispositivo)
        print('Procesador remoto listo en loopback; requiere un proxy HTTPS autenticado.', flush=True)
        servidor.serve_forever()
    finally:
        servidor.exclusion_imou.cerrar(conservar_marca=True)
        servidor.server_close()


if __name__ == '__main__':
    main()
