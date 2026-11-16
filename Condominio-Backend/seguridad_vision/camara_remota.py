"""Servicio RF-DETR Nano para un servidor propio detrás de un proxy HTTPS.

Escucha solo en loopback. No escribe imágenes ni información de las solicitudes.
"""
import hmac
import os
import re

from camara_local import Procesador, RECURSOS, RFDETRNano, ServidorLocal, torch


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
        if self.path != '/estado':
            return self.responder(404, {'error': 'No disponible'})
        return self.responder(200, {'disponible': True, 'contrato': 'condominio-vision-v1', 'modelo': 'RF-DETR Nano'})


def main():
    token, puerto, dispositivo = leer_configuracion()
    if not (RECURSOS / 'cache_roboflow' / 'rf-detr-nano.pth').is_file():
        raise SystemExit('Faltan los pesos locales de RF-DETR Nano en el servidor.')
    servidor = ServidorLocal(('127.0.0.1', puerto), ProcesadorRemoto)
    try:
        servidor.token = token
        torch.set_num_threads(2)
        servidor.modelo = RFDETRNano(device=dispositivo)
        print('Procesador remoto listo en loopback; requiere un proxy HTTPS autenticado.', flush=True)
        servidor.serve_forever()
    finally:
        servidor.server_close()


if __name__ == '__main__':
    main()
