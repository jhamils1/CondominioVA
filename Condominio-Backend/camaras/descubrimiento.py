"""Descubrimiento ONVIF acotado. No consulta URL ni solicita credenciales."""
import ipaddress
import socket
import threading
import time
import uuid
from urllib.parse import urlsplit
from xml.etree import ElementTree

_LOCK = threading.Lock()
_REDES = tuple(ipaddress.ip_network(x) for x in ('10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'))
_WSA = 'http://schemas.xmlsoap.org/ws/2004/08/addressing'
_WSD = 'http://schemas.xmlsoap.org/ws/2005/04/discovery'


def _respuesta_dispositivo(datos, origen, mensaje):
    if len(datos) > 16384 or b'<!' in datos or b'\x00' in datos:
        return None
    try:
        raiz = ElementTree.fromstring(datos)
        mensajes = {mensaje} if isinstance(mensaje, str) else mensaje
        if raiz.findtext(f'.//{{{_WSA}}}RelatesTo') not in mensajes:
            return None
        respuestas = raiz.findall(f'.//{{{_WSD}}}ProbeMatch')
        ip_origen = ipaddress.IPv4Address(origen)
        if not any(ip_origen in red for red in _REDES):
            return None
        encontrado = False
        puerto_http = None
        for respuesta in respuestas:
            for url in (respuesta.findtext(f'{{{_WSD}}}XAddrs') or '').split():
                partes = urlsplit(url)
                if partes.scheme in ('http', 'https') and partes.username is None and partes.hostname == str(ip_origen):
                    puerto = partes.port
                    if puerto is not None and not 1 <= puerto <= 65535:
                        continue
                    encontrado = True
                    # La consulta implementada usa HTTP y esta ruta concreta.
                    if partes.scheme == 'http' and partes.path == '/onvif/device_service' and not partes.query and not partes.fragment:
                        puerto_http = puerto or 80
                        break
            if puerto_http is not None:
                break
        if encontrado:
            return {'ip': str(ip_origen), 'puerto_onvif': puerto_http}
    except (ElementTree.ParseError, ValueError, TypeError):
        return None
    return None


def _respuesta_ip(datos, origen, mensaje):
    dispositivo = _respuesta_dispositivo(datos, origen, mensaje)
    return dispositivo['ip'] if dispositivo else None


def descubrir():
    if not _LOCK.acquire(blocking=False):
        return 'ocupado', []
    try:
        mensajes = [f'urn:uuid:{uuid.uuid4()}' for _ in range(2)]
        def crear_probe(mensaje):
            return f'''<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="{_WSA}" xmlns:d="{_WSD}" xmlns:dn="http://www.onvif.org/ver10/network/wsdl"><s:Header><a:MessageID>{mensaje}</a:MessageID><a:To>urn:schemas-xmlsoap-org:ws:2005:04:discovery</a:To><a:Action>http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</a:Action></s:Header><s:Body><d:Probe><d:Types>dn:NetworkVideoTransmitter</d:Types></d:Probe></s:Body></s:Envelope>'''.encode('utf-8')
        dispositivos = {}
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP) as canal:
            canal.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 1)
            canal.sendto(crear_probe(mensajes[0]), ('239.255.255.250', 3702))
            inicio = time.monotonic()
            limite = inicio + 4
            reintento = False
            for _ in range(100):
                restante = limite - time.monotonic()
                if restante <= 0 or len(dispositivos) >= 30:
                    break
                canal.settimeout(min(restante, max(0.001, inicio + 1 - time.monotonic())) if not reintento else restante)
                try:
                    datos, origen = canal.recvfrom(16385)
                except socket.timeout:
                    if not reintento:
                        canal.sendto(crear_probe(mensajes[1]), ('239.255.255.250', 3702))
                        reintento = True
                        continue
                    break
                dispositivo = _respuesta_dispositivo(datos, origen[0], mensajes)
                if dispositivo:
                    anterior = dispositivos.get(dispositivo['ip'])
                    if anterior is None or (anterior['puerto_onvif'] is None and dispositivo['puerto_onvif'] is not None):
                        dispositivos[dispositivo['ip']] = dispositivo
                if not reintento and time.monotonic() >= inicio + 1:
                    canal.sendto(crear_probe(mensajes[1]), ('239.255.255.250', 3702))
                    reintento = True
        return 'completado', sorted(dispositivos.values(), key=lambda d: ipaddress.IPv4Address(d['ip']))
    except OSError:
        return 'error_red', []
    finally:
        _LOCK.release()
