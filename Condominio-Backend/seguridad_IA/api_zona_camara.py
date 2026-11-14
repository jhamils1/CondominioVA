"""Zonas de cámaras del catálogo, sin activar monitoreo ni notificaciones."""
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from administracion.access import SecurityOperator, is_admin
from camaras.models import Camara, MonitorImou
from .api_camara_demo import SoloConexionLocal
from .api_zona_imou import validar_zona
from .models import ZonaCamara, HistorialZonaCamara


def datos_zona(zona):
    return {'puntos': zona.puntos if zona else [], 'segundos': zona.segundos if zona else 5,
            'version': zona.actualizado.isoformat() if zona else None}


class ConfiguracionZonaCamara(APIView):
    permission_classes = [IsAuthenticated, SecurityOperator, SoloConexionLocal]

    def camara(self, pk):
        return get_object_or_404(Camara, pk=pk, activa=True, tipo='RED')

    def get(self, request, pk):
        camara = self.camara(pk)
        if MonitorImou.objects.filter(pk=1, camara=camara).exists():
            return Response({'detail': 'La Imou utiliza su configuración de zona existente.'}, status=409)
        respuesta = Response(datos_zona(ZonaCamara.objects.filter(camara=camara).first()))
        respuesta['Cache-Control'] = 'private, no-store'
        return respuesta

    def put(self, request, pk):
        if not is_admin(request.user):
            return Response({'detail': 'Solo el administrador puede configurar zonas.'}, status=403)
        if not isinstance(request.data, dict) or set(request.data) != {'puntos', 'segundos', 'version'}:
            return Response({'detail': 'Configuración inválida.'}, status=400)
        puntos, segundos, version = request.data['puntos'], request.data['segundos'], request.data['version']
        if not isinstance(puntos, list) or (puntos and not validar_zona(puntos)):
            return Response({'detail': 'La zona debe ser un polígono válido.'}, status=400)
        if isinstance(segundos, bool) or not isinstance(segundos, int) or not 2 <= segundos <= 120:
            return Response({'detail': 'El tiempo debe ser un entero entre 2 y 120 segundos.'}, status=400)
        if version is not None and not isinstance(version, str):
            return Response({'detail': 'Versión inválida.'}, status=400)
        with transaction.atomic():
            camara = get_object_or_404(Camara.objects.select_for_update(), pk=pk, activa=True, tipo='RED')
            if MonitorImou.objects.filter(pk=1, camara=camara).exists():
                return Response({'detail': 'La Imou utiliza su configuración de zona existente.'}, status=409)
            zona = ZonaCamara.objects.filter(camara=camara).first()
            if version != (zona.actualizado.isoformat() if zona else None):
                return Response({'detail': 'La configuración cambió. Recarga antes de guardar.'}, status=409)
            ahora = timezone.now()
            zona, _ = ZonaCamara.objects.update_or_create(camara=camara, defaults={
                'puntos': puntos, 'segundos': segundos, 'actualizado': ahora, 'actualizado_por': request.user})
            HistorialZonaCamara.objects.create(camara=camara, puntos=puntos, segundos=segundos, fecha=ahora, actor=request.user)
        respuesta = Response(datos_zona(zona))
        respuesta['Cache-Control'] = 'private, no-store'
        return respuesta
