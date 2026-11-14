"""Fuente única de la zona Imou existente; no devuelve datos al navegador."""
import ipaddress
from urllib.parse import parse_qsl
from django.core.exceptions import ImproperlyConfigured
from django.db import DatabaseError
from .models import MonitorImou
from .credenciales import descifrar_contrasena

_REDES = tuple(ipaddress.ip_network(x) for x in ('10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'))


def fuente_monitor():
    """None: puente anterior; dict: conexión vinculada; excepción: no usar fuente antigua."""
    try:
        monitor = MonitorImou.objects.select_related('camara').filter(pk=1).first()
        if monitor is None:
            return None
        return fuente_camara(monitor.camara)
    except (ValueError, TypeError, DatabaseError):
        raise ImproperlyConfigured('Fuente de monitor no disponible') from None


def fuente_camara(camara):
    try:
        ip = ipaddress.IPv4Address(camara.direccion_ip)
        ruta = camara.ruta_rtsp
        if (not camara.activa or camara.tipo != 'RED' or not any(ip in r for r in _REDES)
                or not camara.puerto_rtsp or not 1 <= camara.puerto_rtsp <= 65535
                or not ruta or not ruta.startswith('/') or ruta.startswith('//')
                or any(c in ruta for c in '@#\\') or any(c.isspace() or ord(c) < 32 for c in ruta)
                or not camara.usuario_dispositivo or not camara.contrasena_cifrada):
            raise ImproperlyConfigured('Fuente de monitor no disponible')
        if '?' in ruta and any(any(s in k.casefold() for s in ('user', 'pass', 'token', 'secret', 'clave', 'auth'))
                               for k, _ in parse_qsl(ruta.split('?', 1)[1], keep_blank_values=True)):
            raise ImproperlyConfigured('Fuente de monitor no disponible')
        return {'ip': str(ip), 'puerto': camara.puerto_rtsp, 'ruta': ruta,
                'usuario': camara.usuario_dispositivo, 'clave': descifrar_contrasena(camara.contrasena_cifrada)}
    except (ValueError, TypeError):
        raise ImproperlyConfigured('Fuente de monitor no disponible') from None
