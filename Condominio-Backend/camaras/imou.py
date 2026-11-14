"""Identifica el catálogo que corresponde al único puente Imou existente."""
import configparser
import ipaddress
from django.conf import settings


def direccion_imou_configurada():
    """Lee únicamente la dirección; nunca devuelve usuario, clave o URL."""
    cfg = configparser.ConfigParser(interpolation=None)
    try:
        archivo = settings.BASE_DIR / 'seguridad_vision' / 'recursos' / 'imou.local.ini'
        if not cfg.read(archivo, encoding='utf-8-sig'):
            return None
        ip = ipaddress.IPv4Address(cfg['camara']['ip'].strip())
        redes = ('10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16')
        puerto = cfg['camara'].getint('puerto', 554)
        if not any(ip in ipaddress.ip_network(red) for red in redes) or not 1 <= puerto <= 65535:
            return None
        return str(ip), puerto
    except (OSError, UnicodeError, KeyError, ValueError, configparser.Error):
        return None


def estado_vinculo(camara, configurada):
    from .models import MonitorImou
    monitor = MonitorImou.objects.filter(pk=1).values_list('camara_id', flat=True).first()
    if monitor is not None:
        if monitor != camara.pk:
            return 'sin_vinculo'
        return 'vinculada' if camara.activa else 'deshabilitada'
    if not configurada or camara.tipo != 'RED' or (camara.direccion_ip, camara.puerto_rtsp) != configurada:
        return 'sin_vinculo'
    # Evitar atribuir el mismo puente físico a dos registros de catálogo.
    if camara.__class__.objects.filter(tipo='RED', direccion_ip=configurada[0], puerto_rtsp=configurada[1]).count() != 1:
        return 'ambiguo'
    return 'vinculada' if camara.activa else 'deshabilitada'


def credenciales_imou_local():
    """Credenciales del puente local; nunca incluirlas en registros o errores."""
    cfg = configparser.ConfigParser(interpolation=None)
    try:
        archivo = settings.BASE_DIR / 'seguridad_vision' / 'recursos' / 'imou.local.ini'
        if not cfg.read(archivo, encoding='utf-8-sig'):
            return None
        usuario = cfg['camara']['usuario'].strip()
        clave = cfg['camara']['clave']
        return (usuario, clave) if usuario and clave else None
    except (OSError, UnicodeError, KeyError, configparser.Error):
        return None


def ruta_imou_local():
    """Ruta utilizada por el puente según el flujo configurado, sin credenciales."""
    cfg = configparser.ConfigParser(interpolation=None)
    try:
        archivo = settings.BASE_DIR / 'seguridad_vision' / 'recursos' / 'imou.local.ini'
        if not cfg.read(archivo, encoding='utf-8-sig'):
            return None
        flujo = cfg['camara'].getint('flujo', 1)
        if flujo not in (0, 1):
            return None
        return f'/cam/realmonitor?channel=1&subtype={flujo}'
    except (OSError, UnicodeError, KeyError, ValueError, configparser.Error):
        return None
