import re
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from administracion.access import SecurityOperator, is_admin
from camaras.models import Camara
from .api_zona_imou import validar_zona
from .api_camara_demo import SoloConexionLocal
from .models import ReglaPiscina, HistorialReglaPiscina


class ConfiguracionPiscina(APIView):
    permission_classes = [IsAuthenticated, SecurityOperator, SoloConexionLocal]

    @staticmethod
    def validar_fuente(fuente):
        if fuente == 'imou':
            return
        coincidencia = re.fullmatch(r'catalogo-([1-9][0-9]*)', fuente)
        if not coincidencia:
            from rest_framework.exceptions import NotFound
            raise NotFound()
        get_object_or_404(Camara, pk=int(coincidencia.group(1)), tipo='RED', activa=True)

    @staticmethod
    def datos(regla):
        return {'puntos': regla.puntos if regla else [], 'segundos': regla.segundos if regla else 10,
                'automatico': regla.automatico if regla else False,
                'version': regla.actualizado.isoformat() if regla else None}

    def get(self, request, fuente):
        self.validar_fuente(fuente)
        respuesta = Response(self.datos(ReglaPiscina.objects.filter(pk=fuente).first()))
        respuesta['Cache-Control'] = 'private, no-store'
        return respuesta

    def put(self, request, fuente):
        if not is_admin(request.user):
            return Response({'detail': 'Solo el administrador puede configurar la piscina.'}, status=403)
        self.validar_fuente(fuente)
        data = request.data
        if not isinstance(data, dict) or set(data) != {'puntos', 'segundos', 'automatico', 'version'}:
            return Response({'detail': 'Configuración inválida.'}, status=400)
        puntos, segundos, automatico, version = (data[k] for k in ('puntos', 'segundos', 'automatico', 'version'))
        if not isinstance(puntos, list) or (puntos and not validar_zona(puntos)):
            return Response({'detail': 'Zona inválida.'}, status=400)
        if isinstance(segundos, bool) or not isinstance(segundos, int) or not 2 <= segundos <= 120:
            return Response({'detail': 'Tiempo inválido.'}, status=400)
        if not isinstance(automatico, bool) or (automatico and not puntos) or (version is not None and not isinstance(version, str)):
            return Response({'detail': 'Configuración inválida.'}, status=400)
        try:
            with transaction.atomic():
                regla = ReglaPiscina.objects.select_for_update().filter(pk=fuente).first()
                if version != (regla.actualizado.isoformat() if regla else None):
                    return Response({'detail': 'La configuración cambió; recarga antes de guardar.'}, status=409)
                ahora = timezone.now()
                regla, _ = ReglaPiscina.objects.update_or_create(pk=fuente, defaults={
                    'puntos': puntos, 'segundos': segundos, 'automatico': automatico,
                    'actualizado': ahora, 'actualizado_por': request.user})
                HistorialReglaPiscina.objects.create(fuente=fuente, puntos=puntos, segundos=segundos,
                                                     automatico=automatico, fecha=ahora, actor=request.user)
        except IntegrityError:
            return Response({'detail': 'La configuración cambió; recarga antes de guardar.'}, status=409)
        respuesta = Response(self.datos(regla))
        respuesta['Cache-Control'] = 'private, no-store'
        return respuesta
