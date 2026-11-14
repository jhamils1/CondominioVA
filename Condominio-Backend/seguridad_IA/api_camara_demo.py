"""Pasarela autenticada al proceso de inferencia local de demostración."""
import http.client
import json
import re

from django.conf import settings
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from administracion.access import SecurityOperator

MAX_BYTES = 1024 * 1024


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


class CamaraEstadoDemo(APIView):
    permission_classes = [IsAuthenticated, SecurityOperator, SoloConexionLocal]

    def get(self, request):
        if solicitar_local("/estado") is None:
            return Response({"detail": "El procesador local no está iniciado."}, status=503)
        response = Response({"disponible": True})
        response["Cache-Control"] = "no-store"
        return response


class CamaraAnalizarDemo(APIView):
    permission_classes = [IsAuthenticated, SecurityOperator, SoloConexionLocal]
    parser_classes = [MultiPartParser]

    def post(self, request):
        archivo = request.FILES.get("imagen")
        if not archivo or archivo.size <= 0 or archivo.size > MAX_BYTES:
            return Response({"detail": "Imagen inválida."}, status=status.HTTP_400_BAD_REQUEST)
        datos = archivo.read(MAX_BYTES + 1)
        if len(datos) > MAX_BYTES or not datos.startswith(b"\xff\xd8\xff"):
            return Response({"detail": "Imagen inválida."}, status=status.HTTP_400_BAD_REQUEST)
        resultado = solicitar_local("/detectar", datos)
        if resultado is None:
            return Response({"detail": "No se pudo conectar con el procesador local."}, status=503)
        response = Response(resultado)
        response["Cache-Control"] = "no-store"
        return response
