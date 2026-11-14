"""Consulta ONVIF de perfiles Media 1, sin abrir ni guardar vídeo."""
import base64
import hashlib
import ipaddress
import os
from datetime import datetime, timezone
from urllib.parse import urlsplit
from xml.etree import ElementTree as ET
from xml.sax.saxutils import escape
import requests
from requests.auth import HTTPDigestAuth

_DEVICE = 'http://www.onvif.org/ver10/device/wsdl'
_MEDIA = 'http://www.onvif.org/ver10/media/wsdl'
_SCHEMA = 'http://www.onvif.org/ver10/schema'
_REDES = tuple(ipaddress.ip_network(x) for x in ('10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'))


class ErrorOnvif(Exception):
    pass


def _direccion(ip, puerto):
    try:
        valor = ipaddress.IPv4Address(ip)
        if not any(valor in red for red in _REDES) or isinstance(puerto, bool) or not isinstance(puerto, int) or not 1 <= puerto <= 65535:
            raise ValueError
        return str(valor)
    except (ValueError, TypeError):
        raise ErrorOnvif('configuracion') from None


def _url_segura(url, ip, esquema):
    try:
        p = urlsplit(url)
        if (p.scheme != esquema or p.hostname != ip or p.username is not None or p.password is not None
                or p.fragment or not p.path.startswith('/') or p.path.startswith('//')
                or any(c.isspace() or ord(c) < 32 for c in url) or not 1 <= (p.port or (554 if esquema == 'rtsp' else 80)) <= 65535):
            raise ValueError
        if esquema == 'http' and p.query:
            raise ValueError
        if esquema == 'rtsp':
            from urllib.parse import parse_qsl
            if any(any(s in k.casefold() for s in ('pass', 'user', 'token', 'secret', 'clave', 'auth')) for k, _ in parse_qsl(p.query)):
                raise ValueError
        return p
    except (ValueError, TypeError):
        raise ErrorOnvif('respuesta_incompatible') from None


def _consultar(session, url, body, usuario, clave):
    nonce = os.urandom(20)
    fecha = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    digest = base64.b64encode(hashlib.sha1(nonce + fecha.encode() + clave.encode()).digest()).decode()
    security = (f'<wsse:Security s:mustUnderstand="1"><wsse:UsernameToken><wsse:Username>{escape(usuario)}</wsse:Username>'
                f'<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest">{digest}</wsse:Password>'
                f'<wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">{base64.b64encode(nonce).decode()}</wsse:Nonce>'
                f'<wsu:Created>{fecha}</wsu:Created></wsse:UsernameToken></wsse:Security>') if usuario else ''
    xml = (f'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:tds="{_DEVICE}" xmlns:trt="{_MEDIA}" xmlns:tt="{_SCHEMA}" '
           'xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" '
           f'xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"><s:Header>{security}</s:Header><s:Body>{body}</s:Body></s:Envelope>')
    try:
        with session.post(url, data=xml.encode(), headers={'Content-Type': 'application/soap+xml; charset=utf-8'},
                          auth=HTTPDigestAuth(usuario, clave) if usuario else None, timeout=(3, 3), allow_redirects=False, stream=True) as respuesta:
            if respuesta.status_code != 200:
                raise ErrorOnvif('acceso_o_servicio')
            datos = b''
            for bloque in respuesta.iter_content(8192):
                datos += bloque
                if len(datos) > 131072:
                    raise ErrorOnvif('respuesta_incompatible')
        if b'<!' in datos or b'\x00' in datos:
            raise ErrorOnvif('respuesta_incompatible')
        return ET.fromstring(datos)
    except (requests.RequestException, ET.ParseError, ValueError):
        raise ErrorOnvif('acceso_o_servicio') from None


def consultar_perfiles(ip, puerto, usuario, clave):
    ip = _direccion(ip, puerto)
    if not isinstance(usuario, str) or not isinstance(clave, str) or len(usuario) > 150 or len(clave) > 512 or bool(usuario) != bool(clave):
        raise ErrorOnvif('configuracion')
    with requests.Session() as session:
        session.trust_env = False
        caps = _consultar(session, f'http://{ip}:{puerto}/onvif/device_service', '<tds:GetCapabilities><tds:Category>Media</tds:Category></tds:GetCapabilities>', usuario, clave)
        media_url = caps.findtext(f'.//{{{_SCHEMA}}}Media/{{{_SCHEMA}}}XAddr')
        if not media_url:
            raise ErrorOnvif('respuesta_incompatible')
        _url_segura(media_url, ip, 'http')
        perfiles = _consultar(session, media_url, '<trt:GetProfiles/>', usuario, clave)
        opciones = []
        for perfil in perfiles.findall(f'.//{{{_MEDIA}}}Profiles')[:4]:
            token = perfil.get('token', '')
            if not token or len(token) > 200:
                continue
            body = ('<trt:GetStreamUri><trt:StreamSetup><tt:Stream>RTP-Unicast</tt:Stream><tt:Transport><tt:Protocol>RTSP</tt:Protocol></tt:Transport></trt:StreamSetup>'
                    f'<trt:ProfileToken>{escape(token)}</trt:ProfileToken></trt:GetStreamUri>')
            resultado = _consultar(session, media_url, body, usuario, clave)
            uri = resultado.findtext(f'.//{{{_SCHEMA}}}Uri')
            if not uri:
                continue
            partes = _url_segura(uri, ip, 'rtsp')
            ruta = partes.path + ('?' + partes.query if partes.query else '')
            if len(ruta) > 500 or '@' in ruta or '\\' in ruta:
                continue
            opciones.append({'nombre': (perfil.findtext(f'{{{_SCHEMA}}}Name') or 'Perfil de vídeo')[:100],
                             'puerto_rtsp': partes.port or 554, 'ruta_rtsp': ruta})
        return opciones
