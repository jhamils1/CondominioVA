from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError
from rest_framework.response import Response
from administracion.access import SecurityOperator, effective_role
from .models import EntregaFCMSeguridad, EventoSeguridad, HistorialEventoSeguridad, NotificacionSeguridad
from .notificaciones import atender_evento, distribuir_revision, registrar_actuacion, registrar_evento, revisar_evento, TransicionInvalida


class ServicioNoActivado(APIException):
    status_code = 503
    default_detail = 'Las notificaciones de seguridad aún no están habilitadas.'


class ActivacionRequerida:
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not getattr(settings, 'NOTIFICACIONES_SEGURIDAD_ACTIVAS', False):
            raise ServicioNoActivado()


class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventoSeguridad
        fields = ['id', 'origen', 'categoria', 'descripcion', 'camara', 'ubicacion', 'prioridad',
                  'fecha_evento', 'fecha_recepcion', 'estado', 'sin_guardias', 'revisor',
                  'fecha_revision', 'motivo_descarte', 'incidencia', 'atendido_por', 'observaciones', 'fecha_resolucion']
        read_only_fields = ['origen', 'fecha_recepcion', 'estado', 'sin_guardias', 'revisor',
                            'fecha_revision', 'motivo_descarte', 'incidencia', 'atendido_por', 'observaciones', 'fecha_resolucion']
        extra_kwargs = {'id': {'read_only': False, 'required': True}}


class NotificacionSerializer(serializers.ModelSerializer):
    # El mensaje es genérico y no contiene datos personales ni evidencias.
    mensaje = serializers.SerializerMethodField()

    class Meta:
        model = NotificacionSeguridad
        fields = ['id', 'evento', 'tipo', 'creada', 'leida_en', 'mensaje']
        read_only_fields = fields

    def get_mensaje(self, obj):
        return 'Evento enviado a revisión' if obj.tipo == 'REVISION' else 'Incidencia confirmada'


class EventoViewSet(ActivacionRequerida, viewsets.ReadOnlyModelViewSet):
    permission_classes = [SecurityOperator]
    serializer_class = EventoSerializer
    queryset = EventoSeguridad.objects.all().order_by('-fecha_recepcion')

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        event_id = data.pop('id')
        data['origen'] = 'MANUAL'
        try:
            evento, created = registrar_evento(request.user, event_id, data)
        except TransicionInvalida as exc:
            raise ValidationError(str(exc))
        return Response(self.get_serializer(evento).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        return self._revisar(request, pk, True)

    @action(detail=True, methods=['post'])
    def descartar(self, request, pk=None):
        return self._revisar(request, pk, False)

    @action(detail=True, methods=['post'])
    def atender(self, request, pk=None):
        return self._atender(request, False)

    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        return self._atender(request, True)

    @action(detail=True, methods=['post'], url_path='actuaciones')
    def actuaciones(self, request, pk=None):
        if effective_role(request.user) != 'guardia':
            raise PermissionDenied('Solo un guardia activo puede registrar actuaciones.')
        evento = self.get_object()
        observacion = request.data.get('observacion', '')
        if not isinstance(observacion, str):
            raise ValidationError({'observacion': 'Debe ser un texto.'})
        try:
            evento = registrar_actuacion(request.user, evento.pk, observacion)
        except TransicionInvalida as exc:
            raise ValidationError(str(exc))
        return Response(self.get_serializer(evento).data)

    def _atender(self, request, resolver):
        if effective_role(request.user) != 'guardia':
            raise PermissionDenied('Solo un guardia activo puede atender el evento.')
        evento = self.get_object()
        observacion = request.data.get('observacion', '')
        if not isinstance(observacion, str):
            raise ValidationError({'observacion': 'Debe ser un texto.'})
        try:
            evento = atender_evento(request.user, evento.pk, resolver, observacion)
        except TransicionInvalida as exc:
            raise ValidationError(str(exc))
        return Response(self.get_serializer(evento).data)

    def _revisar(self, request, pk, confirmar):
        if effective_role(request.user) != 'guardia':
            raise PermissionDenied('Solo un guardia activo puede revisar el evento.')
        evento = self.get_object()
        motivo = request.data.get('motivo', '')
        if not isinstance(motivo, str):
            raise ValidationError({'motivo': 'Debe ser un texto.'})
        try:
            evento = revisar_evento(request.user, evento.pk, confirmar, motivo)
        except TransicionInvalida as exc:
            raise ValidationError(str(exc))
        return Response(self.get_serializer(evento).data)

    @action(detail=True, methods=['post'])
    def redistribuir(self, request, pk=None):
        if effective_role(request.user) != 'administrador':
            raise PermissionDenied('Solo el administrador puede redistribuir alertas.')
        evento = self.get_object()
        try:
            count = distribuir_revision(evento.pk)
        except TransicionInvalida as exc:
            raise ValidationError(str(exc))
        return Response({'guardias_activos': count})

    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        evento = self.get_object()
        history = HistorialEventoSeguridad.objects.filter(evento=evento).values('accion', 'actor_id', 'fecha', 'observacion').order_by('fecha', 'id')
        return Response(list(history))

    @action(detail=True, methods=['get'])
    def entregas(self, request, pk=None):
        if effective_role(request.user) != 'administrador':
            raise PermissionDenied('Solo el administrador puede revisar las entregas.')
        if not getattr(settings, 'COLA_FCM_SEGURIDAD_ACTIVA', False):
            raise ServicioNoActivado()
        evento = self.get_object()
        records = EntregaFCMSeguridad.objects.filter(notificacion__evento=evento).values(
            'id', 'estado', 'intentos', 'siguiente_intento', 'enviada_en', 'error_codigo').order_by('id')
        return Response(list(records))


class NotificacionViewSet(ActivacionRequerida, viewsets.ReadOnlyModelViewSet):
    permission_classes = [SecurityOperator]
    serializer_class = NotificacionSerializer

    def get_queryset(self):
        role = effective_role(self.request.user)
        tipo = 'REVISION' if role == 'guardia' else 'CONFIRMADA'
        return NotificacionSeguridad.objects.filter(destinatario=self.request.user, tipo=tipo)

    @action(detail=True, methods=['post'])
    def leer(self, request, pk=None):
        obj = self.get_object()
        NotificacionSeguridad.objects.filter(pk=obj.pk, leida_en__isnull=True).update(leida_en=timezone.now())
        obj.refresh_from_db()
        return Response(self.get_serializer(obj).data)
