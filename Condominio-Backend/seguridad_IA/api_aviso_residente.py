"""Consulta limitada de avisos propios; no crea ni envía notificaciones."""
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from administracion.access import effective_role
from .api_notificaciones import ActivacionRequerida
from .models import EvidenciaEventoSeguridad, NotificacionSeguridad


class ResidenteActivo(BasePermission):
    def has_permission(self, request, view):
        return effective_role(request.user) in ('propietario', 'inquilino')


class AvisoResidenteSerializer(serializers.ModelSerializer):
    categoria = serializers.CharField(source='evento.categoria', read_only=True)
    fecha_evento = serializers.DateTimeField(source='evento.fecha_evento', read_only=True)
    evidencia_disponible = serializers.SerializerMethodField()

    def get_evidencia_disponible(self, obj):
        return EvidenciaEventoSeguridad.objects.filter(evento_id=obj.evento_id).exists()

    class Meta:
        model = NotificacionSeguridad
        fields = ['id', 'categoria', 'fecha_evento', 'creada', 'leida_en', 'evidencia_disponible']
        read_only_fields = fields


class AvisoResidenteViewSet(ActivacionRequerida, viewsets.ReadOnlyModelViewSet):
    permission_classes = [ResidenteActivo]
    serializer_class = AvisoResidenteSerializer

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response['Cache-Control'] = 'private, no-store, max-age=0'
        return response

    def get_queryset(self):
        return NotificacionSeguridad.objects.filter(destinatario=self.request.user, tipo='AVISO_RESIDENTE').select_related('evento')

    @action(detail=True, methods=['get'])
    def evidencia(self, request, pk=None):
        aviso = self.get_object()
        evidencia = get_object_or_404(EvidenciaEventoSeguridad, evento_id=aviso.evento_id)
        response = HttpResponse(bytes(evidencia.imagen), content_type='image/jpeg')
        response['Cache-Control'] = 'private, no-store, max-age=0'
        response['X-Content-Type-Options'] = 'nosniff'
        return response

    @action(detail=True, methods=['post'])
    def leer(self, request, pk=None):
        aviso = self.get_object()
        NotificacionSeguridad.objects.filter(pk=aviso.pk, leida_en__isnull=True).update(leida_en=timezone.now())
        aviso.refresh_from_db()
        return Response(self.get_serializer(aviso).data)
