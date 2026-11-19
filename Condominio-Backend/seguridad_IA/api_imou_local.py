"""Vista local autenticada de una cámara configurada por el operador del equipo."""
import http.client
import hmac
import hashlib
import re
import json
import time
from urllib.parse import urlsplit
import requests
from django.core.exceptions import ImproperlyConfigured
from camaras.fuente_monitor import fuente_monitor

from django.conf import settings
from django.http import HttpResponse
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.throttling import SimpleRateThrottle
from rest_framework.views import APIView

from administracion.access import AdministratorOnly
from .api_camara_demo import SoloConexionLocal
from .monitoreo_imou import ocupado


class PuenteImouInterno(APIView):
    """Pasarela exclusivamente local, autenticada con la clave efímera del puente."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        if not SoloConexionLocal().has_permission(request, self):
            return HttpResponse(status=403)
        recibido = request.headers.get('Authorization', '')
        if not recibido.isascii() or not re.fullmatch(r'Bearer [A-Za-z0-9_-]{43}', recibido):
            return HttpResponse(status=403)
        try:
            clave = (settings.BASE_DIR / 'seguridad_vision' / 'recursos' /
                     'imou_local.token').read_text(encoding='ascii')
            if not re.fullmatch(r'[A-Za-z0-9_-]{43}', clave) or not hmac.compare_digest(recibido, 'Bearer ' + clave):
                return HttpResponse(status=403)
        except (OSError, UnicodeError):
            return HttpResponse(status=503)
        estado, datos = obtener_fotograma()
        respuesta = HttpResponse(datos, status=estado, content_type='image/jpeg' if estado == 200 else 'text/plain')
        respuesta['Cache-Control'] = 'no-store, private'
        respuesta['X-Content-Type-Options'] = 'nosniff'
        return respuesta


class AccesoImou(BasePermission):
    def has_permission(self, request, view):
        return SoloConexionLocal().has_permission(request, view) or getattr(settings, 'IMOU_REMOTA_ACTIVA', False)


class LimiteImouRemota(SimpleRateThrottle):
    scope = 'imou_remota'
    rate = '150/min'

    def get_cache_key(self, request, view):
        if SoloConexionLocal().has_permission(request, view):
            return None
        return self.cache_format % {'scope': self.scope, 'ident': str(request.user.pk)}


class CapacidadImouRemota(APIView):
    permission_classes = [IsAuthenticated, AdministratorOnly]

    def get(self, request):
        respuesta = HttpResponse('{"activa":true}' if getattr(settings, 'IMOU_REMOTA_ACTIVA', False)
                                 else '{"activa":false}', content_type='application/json')
        respuesta['Cache-Control'] = 'no-store, private'
        return respuesta


def obtener_fotograma_remoto():
    url = getattr(settings, 'VISION_PC_URL', '').strip().rstrip('/')
    clave = getattr(settings, 'VISION_PC_TOKEN', '').strip()
    try:
        partes = urlsplit(url)
        if (partes.scheme != 'https' or not partes.hostname or partes.username or partes.password
                or partes.query or partes.fragment or not re.fullmatch(r'[A-Za-z0-9_-]{32,128}', clave)):
            return 503, b''
        with requests.get(url + '/imou/fotograma', headers={'Authorization': 'Bearer ' + clave},
                          timeout=(3, 5), allow_redirects=False, stream=True) as respuesta:
            if respuesta.status_code == 202:
                return 202, b''
            if respuesta.status_code != 200:
                return 503, b''
            contenido = bytearray()
            limite = time.monotonic() + 8
            for bloque in respuesta.iter_content(8192):
                if time.monotonic() > limite:
                    return 503, b''
                contenido.extend(bloque)
                if len(contenido) > 1024 * 1024:
                    return 503, b''
            if not contenido.startswith(b'\xff\xd8\xff'):
                return 503, b''
            return 200, bytes(contenido)
    except (requests.RequestException, ValueError, TypeError):
        return 503, b''


def exclusion_remota(request, accion):
    """La sesión se vincula al usuario y no se expone la clave del puente."""
    if not getattr(settings, 'IMOU_REMOTA_ACTIVA', False):
        return False
    sesion = request.headers.get('X-Imou-Session', '')
    if not re.fullmatch(r'[a-f0-9]{32}', sesion) or accion not in ('adquirir', 'verificar', 'liberar', 'iniciar', 'terminar', 'recuperar'):
        return False
    url = getattr(settings, 'VISION_PC_URL', '').strip().rstrip('/')
    clave = getattr(settings, 'VISION_PC_TOKEN', '').strip()
    try:
        partes = urlsplit(url)
        if (partes.scheme != 'https' or not partes.hostname or partes.username or partes.password
                or partes.query or partes.fragment or not re.fullmatch(r'[A-Za-z0-9_-]{32,128}', clave)):
            return False
        titular = hmac.new(settings.SECRET_KEY.encode('utf-8'),
                           f'imou:{request.user.pk}:{sesion}'.encode('ascii'), hashlib.sha256).hexdigest()
        with requests.post(url + '/imou/exclusion', json={'accion': accion, 'titular': titular},
                           headers={'Authorization': 'Bearer ' + clave}, timeout=(3, 5),
                           allow_redirects=False, stream=True) as respuesta:
            if respuesta.status_code != 200:
                return False
            cuerpo = bytearray()
            limite = time.monotonic() + 8
            for bloque in respuesta.iter_content(256):
                cuerpo.extend(bloque)
                if len(cuerpo) > 1024 or time.monotonic() > limite:
                    return False
            datos = json.loads(cuerpo)
            return isinstance(datos, dict) and datos.get('concedido') is True
    except (requests.RequestException, ValueError, TypeError, UnicodeError):
        return False


class ExclusionImouRemota(APIView):
    permission_classes = [IsAuthenticated, AdministratorOnly]
    throttle_classes = [LimiteImouRemota]

    def post(self, request):
        accion = request.data.get('accion') if isinstance(request.data, dict) else None
        if accion not in ('adquirir', 'liberar', 'recuperar'):
            return HttpResponse(status=400)
        concedido = exclusion_remota(request, accion)
        respuesta = HttpResponse('{"concedido":true}' if concedido else '{"concedido":false}',
                                 status=200 if concedido else 409, content_type='application/json')
        respuesta['Cache-Control'] = 'no-store, private'
        return respuesta


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
    permission_classes = [IsAuthenticated, AdministratorOnly, AccesoImou]
    throttle_classes = [LimiteImouRemota]

    def post(self, request):
        estado, datos = (obtener_fotograma_remoto() if getattr(settings, 'IMOU_REMOTA_ACTIVA', False)
                         else obtener_fotograma())
        respuesta = HttpResponse(datos, status=estado,
                                 content_type='image/jpeg' if estado == 200 else 'text/plain')
        respuesta['Cache-Control'] = 'no-store, private'
        respuesta['X-Content-Type-Options'] = 'nosniff'
        return respuesta


class EstadoMonitoreoImou(APIView):
    permission_classes = [IsAuthenticated, AdministratorOnly, AccesoImou]

    def get(self, request):
        monitor_ocupado = (not exclusion_remota(request, 'verificar')
                            if getattr(settings, 'IMOU_REMOTA_ACTIVA', False) else ocupado())
        respuesta = HttpResponse('{"ocupado":true}' if monitor_ocupado else '{"ocupado":false}',
                                 content_type='application/json')
        respuesta['Cache-Control'] = 'no-store, private'
        return respuesta
