"""Pasarela autenticada al proceso de inferencia local de demostración."""
import base64
import http.client
import json
import re
import math
import time
from urllib.parse import urlsplit
import requests

from django.conf import settings
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from administracion.access import SecurityOperator, is_admin

MAX_BYTES = 1024 * 1024
MAX_RESPUESTA = 65536


class SoloConexionLocal(BasePermission):
    """Esta demostración requiere navegador y Django en el mismo equipo."""

    def has_permission(self, request, view):
        return request.META.get("REMOTE_ADDR") in ("127.0.0.1", "::1")


def solicitar_local(ruta, imagen=None):
    token_file = settings.BASE_DIR / "seguridad_vision" / "recursos" / "camara_local.token"
    try:
        clave = token_file.read_text(encoding="ascii")
        if not re.fullmatch(r"[A-Za-z0-9_-]{43}", clave):
            return None
        conn = http.client.HTTPConnection("127.0.0.1", 28765, timeout=15)
        try:
            conn.request("POST" if imagen is not None else "GET", ruta, body=imagen,
                         headers={"Authorization": "Bearer " + clave,
                                  "Content-Type": "image/jpeg"})
            respuesta = conn.getresponse()
            contenido = respuesta.read(65537)
            if respuesta.status != 200 or len(contenido) > 65536:
                return None
            return json.loads(contenido)
        finally:
            conn.close()
    except (OSError, UnicodeError, ValueError, http.client.HTTPException):
        return None


def solicitar_roboflow(ruta, imagen=None):
    """El estado solo indica configuración; no verifica conexión ni credenciales."""
    clave = getattr(settings, 'ROBOFLOW_API_KEY', '').strip()
    if not clave or '\n' in clave or '\r' in clave:
        return None
    if ruta == '/estado' and imagen is None:
        return {'disponible': True, 'verificado': False}
    if ruta != '/detectar' or imagen is None:
        return None
    try:
        # El SDK oficial resuelve rfdetr-nano como coco/38.
        with requests.post('https://detect.roboflow.com/coco/38',
                           data=base64.b64encode(imagen),
                           headers={'Authorization': 'Bearer ' + clave,
                                    'Content-Type': 'application/x-www-form-urlencoded'},
                           timeout=(5, 20), allow_redirects=False, stream=True) as respuesta:
            if respuesta.status_code != 200:
                return None
            contenido = bytearray()
            limite = time.monotonic() + 25
            for bloque in respuesta.iter_content(chunk_size=8192):
                if time.monotonic() > limite:
                    return None
                contenido.extend(bloque)
                if len(contenido) > MAX_RESPUESTA:
                    return None
            datos = json.loads(contenido)
        predicciones = datos.get('predictions') if isinstance(datos, dict) else None
        if not isinstance(predicciones, list) or len(predicciones) > 500:
            return None
        detecciones = []
        for item in predicciones:
            clase = item.get('class') if isinstance(item, dict) else None
            valores = [item.get(k) for k in ('x', 'y', 'width', 'height', 'confidence')] if isinstance(item, dict) else []
            if (not isinstance(clase, str) or not 0 < len(clase) <= 80 or len(valores) != 5
                    or any(isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) for v in valores)):
                return None
            x, y, ancho, alto, confianza = valores
            caja = [x - ancho / 2, y - alto / 2, x + ancho / 2, y + alto / 2]
            if ancho <= 0 or alto <= 0 or not 0 <= confianza <= 1 or any(not -1280 <= v <= 2560 for v in caja):
                return None
            if confianza >= 0.5:
                detecciones.append({'clase': clase, 'confianza': confianza, 'caja': caja})
        return {'detecciones': detecciones}
    except (requests.RequestException, ValueError, UnicodeError, TypeError):
        return None


def solicitar_remoto(ruta, imagen=None):
    """Contrato propio HTTPS; nunca sigue redirecciones ni registra imágenes o claves."""
    proveedor = getattr(settings, 'VISION_REMOTA_PROVEEDOR', 'propio').strip().lower()
    if proveedor == 'roboflow':
        return solicitar_roboflow(ruta, imagen)
    if proveedor != 'propio':
        return None
    url = getattr(settings, 'VISION_REMOTA_URL', '').strip().rstrip('/')
    clave = getattr(settings, 'VISION_REMOTA_TOKEN', '').strip()
    try:
        partes = urlsplit(url)
        if (partes.scheme != 'https' or not partes.hostname or partes.username or partes.password
                or partes.query or partes.fragment or not re.fullmatch(r'[A-Za-z0-9_-]{32,128}', clave)
                or ruta not in ('/estado', '/detectar')):
            return None
        with requests.request('GET' if imagen is None else 'POST', url + ruta, data=imagen,
                              headers={'Authorization': 'Bearer ' + clave, 'Content-Type': 'image/jpeg'},
                              timeout=(5, 20), allow_redirects=False, stream=True) as respuesta:
            if respuesta.status_code != 200:
                return None
            contenido = bytearray()
            limite = time.monotonic() + 25
            for bloque in respuesta.iter_content(chunk_size=8192):
                if time.monotonic() > limite:
                    return None
                contenido.extend(bloque)
                if len(contenido) > MAX_RESPUESTA:
                    return None
            datos = json.loads(contenido)
        if ruta == '/estado':
            return datos if isinstance(datos, dict) and datos.get('disponible') is True and datos.get('contrato') == 'condominio-vision-v1' and datos.get('modelo') == 'RF-DETR Nano' else None
        detecciones = datos.get('detecciones') if isinstance(datos, dict) else None
        if not isinstance(detecciones, list) or len(detecciones) > 500:
            return None
        for item in detecciones:
            if not isinstance(item, dict) or not isinstance(item.get('clase'), str) or not 0 < len(item['clase']) <= 80:
                return None
            caja, confianza = item.get('caja'), item.get('confianza')
            if (not isinstance(caja, list) or len(caja) != 4 or any(isinstance(x, bool) or not isinstance(x, (int, float)) or not math.isfinite(x) or not -1280 <= x <= 2560 for x in caja)
                    or caja[2] <= caja[0] or caja[3] <= caja[1] or isinstance(confianza, bool)
                    or not isinstance(confianza, (int, float)) or not math.isfinite(confianza) or not 0 <= confianza <= 1):
                return None
        return {'detecciones': detecciones}
    except (requests.RequestException, ValueError, UnicodeError, TypeError):
        return None


def procesador_solicitado(request):
    modo = request.query_params.get('procesador', 'local')
    if modo not in ('local', 'remoto'):
        return None
    if modo == 'remoto' and not is_admin(request.user):
        return None
    return modo


class CamaraEstadoDemo(APIView):
    permission_classes = [IsAuthenticated, SecurityOperator, SoloConexionLocal]

    def get(self, request):
        modo = procesador_solicitado(request)
        if modo is None:
            return Response({'detail': 'Procesador no permitido.'}, status=403)
        resultado = solicitar_local('/estado') if modo == 'local' else solicitar_remoto('/estado')
        if not isinstance(resultado, dict) or resultado.get('disponible') is not True:
            return Response({"detail": f"El procesador {modo} no está disponible o no está configurado."}, status=503)
        response = Response({"disponible": True, 'procesador': modo,
                             'verificado': resultado.get('verificado', True)})
        response["Cache-Control"] = "no-store"
        return response


class CamaraAnalizarDemo(APIView):
    permission_classes = [IsAuthenticated, SecurityOperator, SoloConexionLocal]
    parser_classes = [MultiPartParser]

    def post(self, request):
        modo = procesador_solicitado(request)
        if modo is None:
            return Response({'detail': 'Procesador no permitido.'}, status=403)
        archivo = request.FILES.get("imagen")
        if not archivo or archivo.size <= 0 or archivo.size > MAX_BYTES:
            return Response({"detail": "Imagen inválida."}, status=status.HTTP_400_BAD_REQUEST)
        datos = archivo.read(MAX_BYTES + 1)
        if len(datos) > MAX_BYTES or not datos.startswith(b"\xff\xd8\xff"):
            return Response({"detail": "Imagen inválida."}, status=status.HTTP_400_BAD_REQUEST)
        resultado = solicitar_local('/detectar', datos) if modo == 'local' else solicitar_remoto('/detectar', datos)
        if resultado is None:
            return Response({"detail": f"No se pudo conectar con el procesador {modo}."}, status=503)
        response = Response(resultado)
        response["Cache-Control"] = "no-store"
        return response
