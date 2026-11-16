from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
import re
import json
from datetime import timedelta
from django.db import transaction
from django.db.models import Exists, OuterRef
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError
from rest_framework.response import Response
from administracion.access import SecurityOperator, effective_role
from residencial.modelsVehiculo import Vehiculo
from .models import EntregaFCMSeguridad, EventoSeguridad, EvidenciaEventoSeguridad, HistorialEventoSeguridad, LecturaPlaca, NotificacionSeguridad
from .notificaciones import atender_evento, distribuir_revision, registrar_actuacion, registrar_evento, revisar_evento, TransicionInvalida
from .evidencia import procesar_evidencia
from .monitoreo_imou import adquirir_exclusion


class ServicioNoActivado(APIException):
    status_code = 503
    default_detail = 'Las notificaciones de seguridad aún no están habilitadas.'


class ActivacionRequerida:
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not getattr(settings, 'NOTIFICACIONES_SEGURIDAD_ACTIVAS', False):
            raise ServicioNoActivado()


class EventoSerializer(serializers.ModelSerializer):
    evidencia = serializers.FileField(write_only=True, required=False)
    evidencia_disponible = serializers.SerializerMethodField()

    def get_evidencia_disponible(self, obj):
        if hasattr(obj, '_evidencia_disponible'):
            return obj._evidencia_disponible
        return EvidenciaEventoSeguridad.objects.filter(evento_id=obj.pk).exists()

    class Meta:
        model = EventoSeguridad
        fields = ['id', 'origen', 'categoria', 'descripcion', 'camara', 'ubicacion', 'prioridad',
                  'fecha_evento', 'fecha_recepcion', 'estado', 'sin_guardias', 'revisor',
                  'fecha_revision', 'motivo_descarte', 'incidencia', 'atendido_por', 'observaciones', 'fecha_resolucion',
                  'evidencia', 'evidencia_disponible']
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
    queryset = EventoSeguridad.objects.annotate(
        _evidencia_disponible=Exists(EvidenciaEventoSeguridad.objects.filter(evento_id=OuterRef('pk')))
    ).order_by('-fecha_recepcion')

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            archivados = HistorialEventoSeguridad.objects.filter(evento_id=OuterRef('pk'), accion='RETIRADA_HISTORIAL')
            queryset = queryset.annotate(_retirado=Exists(archivados)).filter(_retirado=False)
        return queryset

    @action(detail=True, methods=['post'], url_path='retirar-historial')
    def retirar_historial(self, request, pk=None):
        if effective_role(request.user) not in ('guardia', 'administrador'):
            raise PermissionDenied('No tienes permiso para retirar incidencias.')
        with transaction.atomic():
            evento = get_object_or_404(EventoSeguridad.objects.select_for_update(), pk=pk)
            if evento.estado not in (EventoSeguridad.CONFIRMADO, EventoSeguridad.EN_ATENCION, EventoSeguridad.RESUELTA):
                raise ValidationError('Solo se pueden retirar incidencias confirmadas.')
            HistorialEventoSeguridad.objects.get_or_create(evento=evento, accion='RETIRADA_HISTORIAL',
                                                           defaults={'actor': request.user})
        return Response({'retirada': True})

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        archivo = data.pop('evidencia', None)
        imagen, huella = procesar_evidencia(archivo) if archivo is not None else (None, None)
        event_id = data.pop('id')
        data['origen'] = 'MANUAL'
        # El monitor mantiene esta exclusión mientras trabaja; así la vista web
        # puede seguir mostrando IA sin registrar el mismo hallazgo en paralelo.
        bloqueo = None
        if data.get('camara') == 'Imou (vista local)':
            bloqueo = adquirir_exclusion()
            if bloqueo is None:
                return Response({'detail': 'El monitor Imou independiente está en ejecución.'}, status=409)
        try:
            with transaction.atomic():
                evento, created = registrar_evento(request.user, event_id, data)
                if created and imagen is not None:
                    EvidenciaEventoSeguridad.objects.create(evento=evento, imagen=imagen, sha256=huella)
                elif not created:
                    previo = EvidenciaEventoSeguridad.objects.filter(evento=evento).values_list('sha256', flat=True).first()
                    if previo != huella:
                        raise TransicionInvalida('El identificador ya corresponde a un evento con otra evidencia.')
        except TransicionInvalida as exc:
            raise ValidationError(str(exc))
        finally:
            if bloqueo is not None:
                bloqueo.close()
        return Response(self.get_serializer(evento).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='evidencia')
    def evidencia(self, request, pk=None):
        evento = self.get_object()
        registro = get_object_or_404(EvidenciaEventoSeguridad, evento=evento)
        response = HttpResponse(bytes(registro.imagen), content_type='image/jpeg')
        response['Cache-Control'] = 'private, no-store, max-age=0'
        response['X-Content-Type-Options'] = 'nosniff'
        return response

    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        return self._revisar(request, pk, True)

    @action(detail=True, methods=['post'], url_path='registrar-placa')
    def registrar_placa(self, request, pk=None):
        if effective_role(request.user) != 'guardia':
            raise PermissionDenied('Solo un guardia activo puede registrar la placa revisada.')
        if not isinstance(request.data, dict) or set(request.data) != {'placa'} or not isinstance(request.data['placa'], str):
            raise ValidationError('Indica una placa.')
        placa = request.data['placa'].strip().upper()
        if not re.fullmatch(r'[A-Z0-9][A-Z0-9 -]{0,19}', placa):
            raise ValidationError('Revisa el formato de la placa.')
        with transaction.atomic():
            evento = get_object_or_404(EventoSeguridad.objects.select_for_update(), pk=pk)
            if evento.estado not in (EventoSeguridad.PENDIENTE, EventoSeguridad.CONFIRMADO, EventoSeguridad.EN_ATENCION):
                raise ValidationError('No se puede registrar una placa en este estado.')
            HistorialEventoSeguridad.objects.create(evento=evento, actor=request.user,
                                                     accion='PLACA_REVISADA', observacion=placa)
        return Response({'placa': placa}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='reconocer-placa-evidencia')
    def reconocer_placa_evidencia(self, request, pk=None):
        """Lee exclusivamente la evidencia privada de este evento."""
        if effective_role(request.user) != 'guardia':
            raise PermissionDenied('Solo un guardia activo puede consultar la placa.')
        if request.data:
            raise ValidationError('No se admiten imágenes ni datos adicionales.')
        evento = self.get_object()
        if evento.estado not in (EventoSeguridad.PENDIENTE, EventoSeguridad.CONFIRMADO, EventoSeguridad.EN_ATENCION):
            raise ValidationError('El evento ya no admite revisión.')
        evidencia = get_object_or_404(EvidenciaEventoSeguridad, evento=evento)
        imagen = bytes(evidencia.imagen)
        if not 0 < len(imagen) <= 1024 * 1024 or not imagen.startswith(b'\xff\xd8\xff'):
            raise ValidationError('La evidencia no es válida.')
        from .views import AlprScanView
        resultado = AlprScanView.procesar_imagen(SimpleUploadedFile('evidencia.jpg', imagen, content_type='image/jpeg'))
        if resultado.status_code != 200:
            return Response({'detail': 'No se pudo consultar el servicio de placas.'}, status=502)
        placa = resultado.data.get('plate') or ''
        lectura = resultado.data.get('lectura') or {}
        lectura_id = lectura.get('id')
        if not placa or not isinstance(lectura_id, int) or not re.fullmatch(r'[A-Z0-9][A-Z0-9 -]{0,19}', placa):
            resultado.data['sugerencia_asociada'] = False
            return resultado
        with transaction.atomic():
            evento = get_object_or_404(EventoSeguridad.objects.select_for_update(), pk=pk)
            if evento.estado not in (EventoSeguridad.PENDIENTE, EventoSeguridad.CONFIRMADO, EventoSeguridad.EN_ATENCION):
                raise ValidationError('El evento cambió durante la consulta; no se asoció la lectura.')
            if not EvidenciaEventoSeguridad.objects.filter(evento=evento, sha256=evidencia.sha256).exists():
                raise ValidationError('La evidencia cambió durante la consulta; no se asoció la lectura.')
            observacion = json.dumps({'lectura_id': lectura_id, 'placa': placa, 'origen': 'evidencia_evento'}, ensure_ascii=True)
            HistorialEventoSeguridad.objects.get_or_create(
                evento=evento, actor=request.user, accion='PLACA_SUGERIDA', observacion=observacion)
        resultado.data['sugerencia_asociada'] = True
        return resultado

    @action(detail=True, methods=['get'], url_path='posibles-lecturas-entrada')
    def posibles_lecturas_entrada(self, request, pk=None):
        """Coincidencias orientativas; no identifican automáticamente el vehículo."""
        if effective_role(request.user) != 'guardia':
            raise PermissionDenied('Solo un guardia activo puede consultar lecturas.')
        evento = self.get_object()
        if evento.estado not in (EventoSeguridad.PENDIENTE, EventoSeguridad.CONFIRMADO, EventoSeguridad.EN_ATENCION):
            raise ValidationError('El evento ya no admite revisión.')
        sugerencia = HistorialEventoSeguridad.objects.filter(evento=evento, accion='PLACA_SUGERIDA').order_by('-fecha', '-pk').first()
        try:
            dato = json.loads(sugerencia.observacion) if sugerencia else {}
            placa = dato.get('placa')
            if dato.get('origen') != 'evidencia_evento' or not isinstance(placa, str) or not re.fullmatch(r'[A-Z0-9][A-Z0-9 -]{0,19}', placa):
                raise ValueError
        except (ValueError, TypeError):
            return Response({'estado': 'sin_sugerencia', 'lecturas': []})
        lecturas = (LecturaPlaca.objects.filter(placa__iexact=placa,
                    created_at__gte=evento.fecha_evento - timedelta(minutes=30),
                    created_at__lte=evento.fecha_evento)
                    .exclude(camera_id='').order_by('-created_at', '-pk')[:5])
        response = Response({'estado': 'orientativo', 'lecturas': [
            {'id': item.pk, 'placa': item.placa, 'camara': item.camera_id, 'fecha': item.created_at}
            for item in lecturas]})
        response['Cache-Control'] = 'private, no-store'
        return response

    @action(detail=True, methods=['get', 'post'], url_path='destinatario-placa')
    def destinatario_placa(self, request, pk=None):
        if effective_role(request.user) != 'guardia':
            raise PermissionDenied('Solo un guardia activo puede verificar el destinatario.')
        with transaction.atomic():
            evento = get_object_or_404(EventoSeguridad.objects.select_for_update(), pk=pk)
            if evento.estado not in (EventoSeguridad.CONFIRMADO, EventoSeguridad.EN_ATENCION):
                raise ValidationError('Primero confirma la incidencia.')
            registro = HistorialEventoSeguridad.objects.filter(evento=evento, accion='PLACA_REVISADA').order_by('-fecha', '-pk').first()
            if not registro:
                return Response({'estado': 'sin_placa'}, status=409 if request.method == 'POST' else 200)
            vehiculos = list(Vehiculo.objects.filter(placa__iexact=registro.observacion).select_related('persona', 'persona__user')[:2])
            if len(vehiculos) != 1:
                return Response({'estado': 'sin_coincidencia' if not vehiculos else 'ambigua'}, status=409 if request.method == 'POST' else 200)
            vehiculo = vehiculos[0]
            persona = vehiculo.persona
            if persona.estado != 'A' or persona.tipo not in ('P', 'I'):
                return Response({'estado': 'no_residente_activo'}, status=409 if request.method == 'POST' else 200)
            usuario = persona.user
            rol_esperado = 'propietario' if persona.tipo == 'P' else 'inquilino'
            cuenta_activa = bool(usuario and effective_role(usuario) == rol_esperado)
            if request.method == 'GET':
                response = Response({'estado': 'candidato', 'vehiculo_id': vehiculo.pk,
                                     'nombre': persona.nombre_completo, 'tipo': rol_esperado,
                                     'cuenta_activa': cuenta_activa})
                response['Cache-Control'] = 'private, no-store'
                return response
            if not isinstance(request.data, dict) or set(request.data) != {'vehiculo_id'} or type(request.data['vehiculo_id']) is not int or request.data['vehiculo_id'] != vehiculo.pk:
                raise ValidationError('La coincidencia cambió; vuelve a consultar.')
            if not cuenta_activa:
                raise ValidationError('El residente no tiene una cuenta activa compatible.')
            HistorialEventoSeguridad.objects.create(evento=evento, actor=request.user, accion='DESTINATARIO_VERIFICADO',
                observacion=json.dumps({'vehiculo_id': vehiculo.pk, 'persona_id': persona.pk, 'usuario_id': usuario.pk, 'placa': registro.observacion}, ensure_ascii=True))
            return Response({'estado': 'verificado', 'nombre': persona.nombre_completo, 'tipo': rol_esperado}, status=201)

    @action(detail=True, methods=['post'], url_path='preparar-aviso-residente')
    def preparar_aviso_residente(self, request, pk=None):
        """Prepara un aviso interno; no encola ni envía mensajes push."""
        if effective_role(request.user) != 'guardia':
            raise PermissionDenied('Solo un guardia activo puede preparar el aviso.')
        if request.data:
            raise ValidationError('No se admiten datos adicionales.')
        with transaction.atomic():
            evento = get_object_or_404(EventoSeguridad.objects.select_for_update(), pk=pk)
            if evento.estado not in (EventoSeguridad.CONFIRMADO, EventoSeguridad.EN_ATENCION):
                raise ValidationError('La incidencia no está confirmada o en atención.')
            ultima_placa = HistorialEventoSeguridad.objects.filter(evento=evento, accion='PLACA_REVISADA').order_by('-fecha', '-pk').first()
            verificacion = HistorialEventoSeguridad.objects.filter(evento=evento, accion='DESTINATARIO_VERIFICADO').order_by('-fecha', '-pk').first()
            if not ultima_placa or not verificacion or (verificacion.fecha, verificacion.pk) < (ultima_placa.fecha, ultima_placa.pk):
                raise ValidationError('Verifica nuevamente la placa y el destinatario.')
            try:
                datos = json.loads(verificacion.observacion)
                placa, vehiculo_id, persona_id, usuario_id = (datos[k] for k in ('placa', 'vehiculo_id', 'persona_id', 'usuario_id'))
            except (ValueError, TypeError, KeyError):
                raise ValidationError('La confirmación no es válida; verifica nuevamente.') from None
            if placa != ultima_placa.observacion:
                raise ValidationError('La placa cambió; verifica nuevamente.')
            coincidencias = list(Vehiculo.objects.filter(placa__iexact=placa).select_related('persona', 'persona__user')[:2])
            if len(coincidencias) != 1:
                raise ValidationError('La placa ya no identifica un vehículo único.')
            vehiculo = coincidencias[0]
            persona = vehiculo.persona
            usuario = persona.user
            esperado = {'P': 'propietario', 'I': 'inquilino'}.get(persona.tipo)
            if (vehiculo.pk != vehiculo_id or persona.pk != persona_id or not usuario or usuario.pk != usuario_id
                    or persona.estado != 'A' or not esperado or effective_role(usuario) != esperado):
                raise ValidationError('La relación o la cuenta cambió; verifica nuevamente.')
            previo = NotificacionSeguridad.objects.filter(evento=evento, tipo='AVISO_RESIDENTE').first()
            if previo and previo.destinatario_id != usuario.pk:
                raise ValidationError('Ya existe un aviso para otro destinatario; requiere revisión.')
            aviso, creado = NotificacionSeguridad.objects.get_or_create(evento=evento, destinatario=usuario, tipo='AVISO_RESIDENTE')
            if creado:
                HistorialEventoSeguridad.objects.create(evento=evento, actor=request.user, accion='AVISO_RESIDENTE_PREPARADO', observacion=str(aviso.pk))
        return Response({'estado': 'preparado', 'id': aviso.pk, 'creado': creado, 'push_enviado': False}, status=201 if creado else 200)

    @action(detail=True, methods=['post'], url_path='encolar-aviso-residente')
    def encolar_aviso_residente(self, request, pk=None):
        if effective_role(request.user) != 'guardia':
            raise PermissionDenied('Solo un guardia activo puede solicitar el aviso.')
        if request.data:
            raise ValidationError('No se admiten datos adicionales.')
        if not getattr(settings, 'COLA_FCM_SEGURIDAD_ACTIVA', False):
            raise ServicioNoActivado()
        from .aviso_residente_validacion import aviso_residente_valido
        from .fcm_delivery import encolar_notificacion
        from finanzas.procedencia_fcm import ValidacionFCMNoDisponible, proyecto_configurado
        with transaction.atomic():
            evento = get_object_or_404(EventoSeguridad.objects.select_for_update(), pk=pk)
            avisos = list(NotificacionSeguridad.objects.filter(evento=evento, tipo='AVISO_RESIDENTE').select_related('destinatario', 'evento')[:2])
            if len(avisos) != 1 or not aviso_residente_valido(avisos[0]):
                raise ValidationError('El aviso o destinatario ya no es válido; vuelve a verificar.')
            try:
                proyecto_configurado()
                encolar_notificacion(avisos[0])
            except ValidacionFCMNoDisponible:
                raise ServicioNoActivado() from None
            entregas = EntregaFCMSeguridad.objects.filter(notificacion=avisos[0])
            total = entregas.count()
            if total == 0:
                return Response({'estado': 'sin_dispositivos', 'entregas': 0})
            HistorialEventoSeguridad.objects.create(evento=evento, actor=request.user, accion='AVISO_RESIDENTE_ENCOLADO', observacion=str(avisos[0].pk))
            pendientes = entregas.filter(estado__in=['PENDIENTE', 'EN_PROCESO']).count()
            enviados = entregas.filter(estado='ENVIADA').count()
            return Response({'estado': 'encolado' if pendientes else ('aceptado' if enviados else 'sin_entregas_pendientes'),
                             'entregas': total, 'pendientes': pendientes, 'aceptadas': enviados})

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
        rol = effective_role(request.user)
        if rol != 'guardia' and not (confirmar and rol == 'administrador'):
            raise PermissionDenied('No tienes permiso para revisar el evento.')
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
        tipos = ['REVISION'] if role == 'guardia' else ['REVISION', 'CONFIRMADA']
        return NotificacionSeguridad.objects.filter(destinatario=self.request.user, tipo__in=tipos)

    @action(detail=True, methods=['post'])
    def leer(self, request, pk=None):
        obj = self.get_object()
        NotificacionSeguridad.objects.filter(pk=obj.pk, leida_en__isnull=True).update(leida_en=timezone.now())
        obj.refresh_from_db()
        return Response(self.get_serializer(obj).data)
