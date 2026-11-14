"""Comprobación limitada de un dispositivo registrado; sin registrar imágenes."""
import ipaddress
import json
import os
from pathlib import Path
import subprocess
import threading
from urllib.parse import parse_qsl

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from .credenciales import descifrar_contrasena

_ocupado = threading.Lock()
_REDES = tuple(ipaddress.ip_network(x) for x in ('10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'))


def probar_rtsp(camara):
    if camara.tipo != 'RED' or not camara.activa or not camara.ruta_rtsp:
        return 'configuracion_incompleta'
    try:
        ip = ipaddress.IPv4Address(camara.direccion_ip)
        if not any(ip in red for red in _REDES) or not 1 <= camara.puerto_rtsp <= 65535:
            return 'configuracion_incompleta'
        ruta = camara.ruta_rtsp
        if (not ruta.startswith('/') or ruta.startswith('//') or any(c in ruta for c in '@#\\')
                or any(c.isspace() or ord(c) < 32 for c in ruta)):
            return 'configuracion_incompleta'
        if '?' in ruta and any(any(s in k.casefold() for s in ('user', 'pass', 'token', 'secret', 'clave', 'auth'))
                               for k, _ in parse_qsl(ruta.split('?', 1)[1], keep_blank_values=True)):
            return 'configuracion_incompleta'
        if bool(camara.usuario_dispositivo) != bool(camara.contrasena_cifrada):
            return 'configuracion_incompleta'
        clave = descifrar_contrasena(camara.contrasena_cifrada) if camara.contrasena_cifrada else ''
    except (ValueError, TypeError, ImproperlyConfigured):
        return 'configuracion_incompleta'
    raiz = Path(settings.BASE_DIR) / 'seguridad_vision'
    ejecutable = raiz / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
    if not ejecutable.is_file():
        return 'servicio_no_disponible'
    if not _ocupado.acquire(blocking=False):
        return 'ocupado'
    try:
        datos = json.dumps({'ip': str(ip), 'puerto': camara.puerto_rtsp, 'ruta': camara.ruta_rtsp,
                            'usuario': camara.usuario_dispositivo, 'clave': clave}, ensure_ascii=True)
        resultado = subprocess.run([str(ejecutable), str(raiz / 'probar_rtsp_catalogo.py')],
                                   input=datos, text=True, stdout=subprocess.DEVNULL,
                                   stderr=subprocess.DEVNULL, timeout=15, check=False)
        return 'disponible' if resultado.returncode == 0 else 'no_disponible'
    except (OSError, subprocess.TimeoutExpired):
        return 'no_disponible'
    finally:
        _ocupado.release()
