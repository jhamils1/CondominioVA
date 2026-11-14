"""Vista local autenticada de una cámara configurada por el operador del equipo."""
import http.client
import re
import json
from django.core.exceptions import ImproperlyConfigured
from camaras.fuente_monitor import fuente_monitor

from django.conf import settings
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from administracion.access import AdministratorOnly
from .api_camara_demo import SoloConexionLocal
from .monitoreo_imou import ocupado


def obtener_fotograma():
    try:
        token = (settings.BASE_DIR / 'seguridad_vision' / 'recursos' /
                 'imou_local.token').read_text(encoding='ascii')
        if not re.fullmatch(r'[A-Za-z0-9_-]{43}', token):
            return 503, b''
        fuente = fuente_monitor()
        cuerpo = json.dumps(fuente, ensure_ascii=True).encode('utf-8') if fuente else b''
        if len(cuerpo) > 4096:
            return 503, b''
        conn = http.client.HTTPConnection('127.0.0.1', 28766, timeout=3)
        try:
            conn.request('POST', '/fotograma-catalogo' if fuente else '/fotograma', body=cuerpo,
                         headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
            respuesta = conn.getresponse()
            datos = respuesta.read(1024 * 1024 + 1)
            if respuesta.status == 202:
                return 202, b''
            if (respuesta.status == 200 and 0 < len(datos) <= 1024 * 1024
                    and datos.startswith(b'\xff\xd8\xff')):
                return 200, datos
            return 503, b''
        finally:
            conn.close()
    except (OSError, UnicodeError, ValueError, http.client.HTTPException, ImproperlyConfigured):
        return 503, b''


class ImouFotogramaLocal(APIView):
    permission_classes = [IsAuthenticated, AdministratorOnly, SoloConexionLocal]

    def post(self, request):
        estado, datos = obtener_fotograma()
        respuesta = HttpResponse(datos, status=estado,
                                 content_type='image/jpeg' if estado == 200 else 'text/plain')
        respuesta['Cache-Control'] = 'no-store, private'
        respuesta['X-Content-Type-Options'] = 'nosniff'
        return respuesta


class EstadoMonitoreoImou(APIView):
    permission_classes = [IsAuthenticated, AdministratorOnly, SoloConexionLocal]

    def get(self, request):
        respuesta = HttpResponse('{"ocupado":true}' if ocupado() else '{"ocupado":false}',
                                 content_type='application/json')
        respuesta['Cache-Control'] = 'no-store, private'
        return respuesta
