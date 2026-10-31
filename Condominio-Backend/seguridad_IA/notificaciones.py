"""Registro interno transaccional; no envía mensajes a proveedores externos."""
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models.functions import Lower, Trim
from django.utils import timezone
from administracion.access import effective_role
from residencial.modelsVehiculo import incidente
from .models import EventoSeguridad, NotificacionSeguridad, HistorialEventoSeguridad
from django.conf import settings


class TransicionInvalida(ValueError):
    pass


def destinatarios(role):
    names = ('seguridad', 'guardia de seguridad') if role == 'guardia' else ('administrador',)
    users = get_user_model().objects.alias(role_name=Lower(Trim('groups__name'))).filter(
        role_name__in=names, is_active=True).distinct().select_related('persona', 'empleado')
    return [user for user in users if effective_role(user) == role]


def crear_notificaciones(evento, role, tipo):
    users = destinatarios(role)
    for user in users:
        notification, created = NotificacionSeguridad.objects.get_or_create(evento=evento, destinatario=user, tipo=tipo)
        if created and getattr(settings, 'COLA_FCM_SEGURIDAD_ACTIVA', False):
            from .fcm_delivery import encolar_notificacion
            encolar_notificacion(notification)
    return len(users)


@transaction.atomic
def registrar_incidencia_manual_confirmada(actor, incidencia):
    if effective_role(actor) != 'guardia':
        raise PermissionError('Solo un guardia activo puede confirmar una incidencia manual.')
    evento, created = EventoSeguridad.objects.get_or_create(
        incidencia=incidencia,
        defaults={'origen': 'MANUAL', 'categoria': 'Manual', 'descripcion': incidencia.descripcion,
                  'fecha_evento': incidencia.fecha_incidente, 'estado': EventoSeguridad.CONFIRMADO,
                  'revisor': actor, 'fecha_revision': timezone.now()})
    if created:
        HistorialEventoSeguridad.objects.create(evento=evento, actor=actor, accion='CONFIRMADA_MANUAL')
        crear_notificaciones(evento, 'administrador', 'CONFIRMADA')
    return evento


@transaction.atomic
def distribuir_revision(evento_id):
    evento = EventoSeguridad.objects.select_for_update().get(pk=evento_id)
    if evento.estado != EventoSeguridad.PENDIENTE:
        raise TransicionInvalida('El evento ya fue revisado.')
    count = crear_notificaciones(evento, 'guardia', 'REVISION')
    evento.sin_guardias = count == 0
    evento.save(update_fields=['sin_guardias'])
    return count


@transaction.atomic
def registrar_evento(actor, evento_id, datos):
    evento, created = EventoSeguridad.objects.get_or_create(pk=evento_id, defaults=datos)
    if not created:
        # Una clave de idempotencia nunca debe aceptar contenidos diferentes.
        if any(getattr(evento, key) != value for key, value in datos.items()):
            raise TransicionInvalida('El identificador ya corresponde a otro evento.')
        return evento, False
    HistorialEventoSeguridad.objects.create(evento=evento, actor=actor, accion='CREADO')
    distribuir_revision(evento.pk)
    evento.refresh_from_db()
    return evento, True


@transaction.atomic
def revisar_evento(actor, evento_id, confirmar, motivo=''):
    if effective_role(actor) != 'guardia':
        raise PermissionError('Solo un guardia activo puede revisar el evento.')
    evento = EventoSeguridad.objects.select_for_update().get(pk=evento_id)
    if evento.estado != EventoSeguridad.PENDIENTE:
        raise TransicionInvalida('El evento ya fue revisado.')
    motivo = motivo.strip()
    if not confirmar and not motivo:
        raise TransicionInvalida('El descarte requiere un motivo.')
    evento.revisor = actor
    evento.fecha_revision = timezone.now()
    if confirmar:
        evento.incidencia = incidente.objects.create(descripcion=evento.descripcion, fecha_incidente=evento.fecha_evento)
        evento.estado = EventoSeguridad.CONFIRMADO
    else:
        evento.estado = EventoSeguridad.FALSO
        evento.motivo_descarte = motivo
    evento.save(update_fields=['revisor', 'fecha_revision', 'incidencia', 'estado', 'motivo_descarte'])
    HistorialEventoSeguridad.objects.create(evento=evento, actor=actor, accion=evento.estado, observacion=motivo if not confirmar else '')
    if confirmar:
        crear_notificaciones(evento, 'administrador', 'CONFIRMADA')
    return evento


@transaction.atomic
def atender_evento(actor, evento_id, resolver, observacion):
    if effective_role(actor) != 'guardia':
        raise PermissionError('Solo un guardia activo puede atender una incidencia.')
    evento = EventoSeguridad.objects.select_for_update().get(pk=evento_id)
    expected = EventoSeguridad.EN_ATENCION if resolver else EventoSeguridad.CONFIRMADO
    if evento.estado != expected:
        raise TransicionInvalida('La transición solicitada no está permitida.')
    observacion = observacion.strip()
    if resolver and not observacion:
        raise TransicionInvalida('La resolución requiere una observación.')
    evento.estado = EventoSeguridad.RESUELTA if resolver else EventoSeguridad.EN_ATENCION
    evento.atendido_por = actor
    evento.observaciones = observacion
    if resolver:
        evento.fecha_resolucion = timezone.now()
    evento.save(update_fields=['estado', 'atendido_por', 'observaciones', 'fecha_resolucion'])
    HistorialEventoSeguridad.objects.create(evento=evento, actor=actor, accion=evento.estado, observacion=observacion)
    return evento


@transaction.atomic
def registrar_actuacion(actor, evento_id, observacion):
    if effective_role(actor) != 'guardia':
        raise PermissionError('Solo un guardia activo puede registrar actuaciones.')
    evento = EventoSeguridad.objects.select_for_update().get(pk=evento_id)
    if evento.estado != EventoSeguridad.EN_ATENCION:
        raise TransicionInvalida('La incidencia debe estar en atención para registrar actuaciones.')
    observacion = observacion.strip()
    if not observacion:
        raise TransicionInvalida('La actuación requiere una observación.')
    evento.atendido_por = actor
    evento.observaciones = observacion
    evento.save(update_fields=['atendido_por', 'observaciones'])
    HistorialEventoSeguridad.objects.create(evento=evento, actor=actor, accion='ACTUACION', observacion=observacion)
    return evento
