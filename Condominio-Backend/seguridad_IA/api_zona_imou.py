"""Configuración compartida para la única fuente Imou local existente."""
import math

from django.db import transaction
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from administracion.access import SecurityOperator, is_admin
from .models import HistorialZonaImou, ZonaImou


def validar_zona(puntos):
    if not isinstance(puntos, list) or not 3 <= len(puntos) <= 30:
        return False
    for p in puntos:
        if not isinstance(p, dict) or set(p) != {'x', 'y'}:
            return False
        if any(isinstance(p[k], bool) or not isinstance(p[k], (int, float))
               or not math.isfinite(p[k]) or not 0 <= p[k] <= 1 for k in ('x', 'y')):
            return False
    def orient(a, b, c):
        return (b['x'] - a['x']) * (c['y'] - a['y']) - (b['y'] - a['y']) * (c['x'] - a['x'])
    def on(a, b, p):
        return (abs(orient(a, b, p)) < 1e-9 and
                min(a['x'], b['x']) - 1e-9 <= p['x'] <= max(a['x'], b['x']) + 1e-9 and
                min(a['y'], b['y']) - 1e-9 <= p['y'] <= max(a['y'], b['y']) + 1e-9)
    def cruzan(a, b, c, d):
        return (orient(a, b, c) * orient(a, b, d) < 0 and orient(c, d, a) * orient(c, d, b) < 0
                or on(a, b, c) or on(a, b, d) or on(c, d, a) or on(c, d, b))
    area = 0
    n = len(puntos)
    for i, a in enumerate(puntos):
        b = puntos[(i + 1) % n]
        if math.hypot(a['x'] - b['x'], a['y'] - b['y']) < .001:
            return False
        area += a['x'] * b['y'] - b['x'] * a['y']
        for j in range(i + 1, n):
            if j != i + 1 and not (i == 0 and j == n - 1):
                if cruzan(a, b, puntos[j], puntos[(j + 1) % n]):
                    return False
    return abs(area) >= .0002


class ConfiguracionZonaImou(APIView):
    permission_classes = [IsAuthenticated, SecurityOperator]

    def get(self, request):
        zona = ZonaImou.objects.filter(pk=1).first()
        response = Response({'puntos': zona.puntos if zona else [],
                             'segundos': zona.segundos if zona else 5,
                             'automatico': zona.automatico if zona else False,
                             'actualizado': zona.actualizado if zona else None})
        response['Cache-Control'] = 'no-store'
        return response

    def put(self, request):
        if not is_admin(request.user):
            return Response({'detail': 'Solo el administrador puede configurar la zona.'}, status=403)
        if not isinstance(request.data, dict):
            return Response({'detail': 'Configuración inválida.'}, status=400)
        puntos = request.data.get('puntos')
        segundos = request.data.get('segundos')
        automatico = request.data.get('automatico')
        if (puntos != [] and not validar_zona(puntos)) or not isinstance(puntos, list):
            return Response({'detail': 'La zona debe ser un polígono válido.'}, status=400)
        if isinstance(segundos, bool) or not isinstance(segundos, int) or not 2 <= segundos <= 120:
            return Response({'detail': 'El tiempo debe ser un entero entre 2 y 120 segundos.'}, status=400)
        if not isinstance(automatico, bool) or (automatico and not puntos):
            return Response({'detail': 'El registro automático requiere una zona válida.'}, status=400)
        with transaction.atomic():
            ahora = timezone.now()
            zona, _ = ZonaImou.objects.update_or_create(pk=1, defaults={
                'puntos': puntos, 'segundos': segundos, 'automatico': automatico, 'actualizado': ahora,
                'actualizado_por': request.user})
            HistorialZonaImou.objects.create(puntos=puntos, segundos=segundos, automatico=automatico,
                                            fecha=ahora, actor=request.user)
        return Response({'puntos': zona.puntos, 'segundos': zona.segundos, 'automatico': zona.automatico, 'actualizado': zona.actualizado})
