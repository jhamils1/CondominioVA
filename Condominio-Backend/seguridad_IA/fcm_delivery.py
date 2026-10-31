"""Cola persistente FCM: selección de destinatarios, reserva y reintentos."""
import hashlib
import uuid
from datetime import timedelta
from django.db import connection, transaction
from django.db.models import Q
from django.utils import timezone
from firebase_admin import messaging
from fcm_django.models import FCMDevice
from administracion.access import effective_role
from .models import EntregaFCMSeguridad, EventoSeguridad

MAX_INTENTOS = 5
RESERVA_SEGUNDOS = 300


def token_hash(value):
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def encolar_notificacion(notification):
    """Se ejecuta en la transacción que persiste la notificación interna."""
    for device in FCMDevice.objects.filter(user=notification.destinatario, active=True):
        EntregaFCMSeguridad.objects.get_or_create(notificacion=notification, dispositivo=device,
                                                  defaults={'token_hash': token_hash(device.registration_id)})


def reservar_entrega():
    now = timezone.now()
    with transaction.atomic():
        queryset = EntregaFCMSeguridad.objects.filter(
            Q(estado='PENDIENTE', siguiente_intento__lte=now) |
            Q(estado='EN_PROCESO', reserva_hasta__lte=now)
        ).order_by('siguiente_intento', 'pk')
        if connection.features.has_select_for_update_skip_locked:
            queryset = queryset.select_for_update(skip_locked=True)
        else:
            queryset = queryset.select_for_update()
        delivery = queryset.first()
        if not delivery:
            return None
        if delivery.intentos >= MAX_INTENTOS:
            delivery.estado = 'FALLIDA'
            delivery.error_codigo = 'INTENTOS_AGOTADOS'
            delivery.reserva_hasta = None
            delivery.reserva_id = None
            delivery.save(update_fields=['estado', 'error_codigo', 'reserva_hasta', 'reserva_id'])
            return (delivery.pk, None)
        delivery.estado = 'EN_PROCESO'
        delivery.intentos += 1
        delivery.reserva_hasta = now + timedelta(seconds=RESERVA_SEGUNDOS)
        delivery.reserva_id = uuid.uuid4()
        delivery.save(update_fields=['estado', 'intentos', 'reserva_hasta', 'reserva_id'])
        return (delivery.pk, delivery.reserva_id)


def procesar_reserva(delivery_id, reservation_id):
    if reservation_id is None:
        return 'FALLIDA'
    delivery = EntregaFCMSeguridad.objects.select_related('notificacion__destinatario', 'notificacion__evento', 'dispositivo').get(pk=delivery_id)
    if (delivery.estado != 'EN_PROCESO' or delivery.reserva_id != reservation_id or
            not delivery.reserva_hasta or delivery.reserva_hasta <= timezone.now()):
        return 'RESERVA_VENCIDA'
    notification, device = delivery.notificacion, delivery.dispositivo
    role = 'guardia' if notification.tipo == 'REVISION' else 'administrador'
    obsolete = notification.tipo == 'REVISION' and notification.evento.estado != EventoSeguridad.PENDIENTE
    if (not device or not device.active or device.user_id != notification.destinatario_id or
            effective_role(notification.destinatario) != role or obsolete or
            token_hash(device.registration_id) != delivery.token_hash):
        return finalizar(delivery_id, reservation_id, 'CANCELADA', 'DESTINATARIO_NO_VALIDO')
    message = messaging.Message(
        token=device.registration_id,
        notification=messaging.Notification(title='Seguridad del condominio',
            body='Hay una alerta para revisar.' if role == 'guardia' else 'Hay una incidencia confirmada.'),
        data={'tipo': 'seguridad', 'notificacion_id': str(notification.pk), 'evento_id': str(notification.evento_id)},
        android=messaging.AndroidConfig(notification=messaging.AndroidNotification(tag=str(notification.pk))),
    )
    try:
        messaging.send(message)
    except messaging.UnregisteredError:
        # No desactivar un token que haya sido actualizado durante la llamada.
        FCMDevice.objects.filter(pk=device.pk, registration_id=device.registration_id).update(active=False)
        return finalizar(delivery_id, reservation_id, 'CANCELADA', 'TOKEN_NO_REGISTRADO')
    except Exception:
        # No registrar mensajes de excepción: pueden contener credenciales o tokens.
        return finalizar(delivery_id, reservation_id, 'REINTENTAR', 'ERROR_ENVIO')
    return finalizar(delivery_id, reservation_id, 'ENVIADA', '')


@transaction.atomic
def finalizar(delivery_id, reservation_id, result, code):
    delivery = EntregaFCMSeguridad.objects.select_for_update().get(pk=delivery_id)
    if delivery.estado != 'EN_PROCESO' or delivery.reserva_id != reservation_id:
        return 'RESERVA_VENCIDA'
    if result == 'REINTENTAR':
        delivery.estado = 'FALLIDA' if delivery.intentos >= MAX_INTENTOS else 'PENDIENTE'
        delivery.siguiente_intento = timezone.now() + timedelta(seconds=min(60 * 2 ** (delivery.intentos - 1), 3600))
    else:
        delivery.estado = result
    delivery.error_codigo = code
    delivery.reserva_hasta = None
    delivery.reserva_id = None
    if result == 'ENVIADA':
        delivery.enviada_en = timezone.now()
    delivery.save(update_fields=['estado', 'siguiente_intento', 'error_codigo', 'reserva_hasta', 'reserva_id', 'enviada_en'])
    return delivery.estado
