"""Cifrado autenticado de credenciales para dispositivos registrados."""
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


def cifrador():
    try:
        return Fernet(settings.CAMARAS_CLAVE_CIFRADO.encode('ascii'))
    except (AttributeError, UnicodeError, TypeError, ValueError):
        raise ImproperlyConfigured('La clave de cifrado de cámaras no está configurada correctamente.') from None


def cifrar_contrasena(valor):
    return cifrador().encrypt(valor.encode('utf-8'))


def descifrar_contrasena(valor):
    try:
        return cifrador().decrypt(bytes(valor)).decode('utf-8')
    except (InvalidToken, UnicodeError, TypeError, ValueError):
        raise ImproperlyConfigured('No se pudo descifrar la credencial de cámara.') from None
