"""Lector aislado: recibe acceso por stdin y no imprime credenciales ni imágenes."""
import json
import os
import sys
from urllib.parse import quote


def main():
    try:
        datos = json.load(sys.stdin)
        acceso = ''
        if datos['usuario']:
            acceso = quote(datos['usuario'], safe='') + ':' + quote(datos['clave'], safe='') + '@'
        url = f"rtsp://{acceso}{datos['ip']}:{datos['puerto']}{datos['ruta']}"
        os.environ['OPENCV_FFMPEG_CAPTURE_OPTIONS'] = 'rtsp_transport;tcp'
        os.environ['OPENCV_LOG_LEVEL'] = 'SILENT'
        import cv2
        captura = cv2.VideoCapture(url, cv2.CAP_FFMPEG,
                                  [cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 5000,
                                   cv2.CAP_PROP_READ_TIMEOUT_MSEC, 5000])
        try:
            if captura.isOpened():
                valido, imagen = captura.read()
                if valido and imagen is not None:
                    return 0
        finally:
            captura.release()
    except Exception:
        pass
    return 1


if __name__ == '__main__':
    sys.exit(main())
