"""Admisión FCM por proyecto; no confiar en metadatos enviados por el cliente."""
import hashlib
import hmac
import firebase_admin
from firebase_admin import exceptions, messaging
from django.conf import settings
from rest_framework.exceptions import APIException, ValidationError
from .models import ProcedenciaFCM


class ValidacionFCMNoDisponible(APIException):
    status_code = 503
    default_detail = 'No se puede validar el dispositivo en este momento.'
    default_code = 'validacion_fcm_no_disponible'


def proyecto_configurado():
    if not getattr(settings, 'FCM_PROCEDENCIA_ACTIVA', False):
        raise ValidacionFCMNoDisponible()
    proyecto = getattr(settings, 'FCM_PROYECTO_ID', '').strip()
    try:
        app = firebase_admin.get_app()
    except ValueError:
        raise ValidacionFCMNoDisponible() from None
    if not proyecto or app.project_id != proyecto:
        raise ValidacionFCMNoDisponible()
    return proyecto, app


def huella(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def validar_token(token):
    proyecto, app = proyecto_configurado()
    try:
        # FCM valida sin entregar una notificación ni datos del residente.
        messaging.send(messaging.Message(token=token, data={'tipo': 'validacion'}),
                       dry_run=True, app=app)
    except (messaging.UnregisteredError, messaging.SenderIdMismatchError,
            exceptions.InvalidArgumentError, ValueError):
        raise ValidationError({'detail': 'No se puede validar este dispositivo.'}) from None
    except Exception:
        # No registrar el error del proveedor, que puede contener datos sensibles.
        raise ValidacionFCMNoDisponible() from None
    return proyecto


def elegible(device):
    try:
        proyecto, _ = proyecto_configurado()
    except ValidacionFCMNoDisponible:
        return False
    if not device or not device.active:
        return False
    try:
        proof = device.procedencia_condominio
    except ProcedenciaFCM.DoesNotExist:
        return False
    return proof.proyecto == proyecto and hmac.compare_digest(proof.token_hash, huella(device.registration_id))


def dispositivos_elegibles(queryset):
    # Acotar primero por proyecto; el hash además detecta un token modificado.
    try:
        proyecto, _ = proyecto_configurado()
    except ValidacionFCMNoDisponible:
        return queryset.none()
    candidatos = queryset.filter(active=True, procedencia_condominio__proyecto=proyecto).select_related('procedencia_condominio')
    ids = [device.pk for device in candidatos if elegible(device)]
    return queryset.filter(pk__in=ids, active=True, procedencia_condominio__proyecto=proyecto)
