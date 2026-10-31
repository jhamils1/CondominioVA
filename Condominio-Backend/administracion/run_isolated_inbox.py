"""Disposable loopback-only demo, using fictional data and no external services."""
import argparse
import json
import os
import secrets
import socket
import sys
import tempfile
import threading
import urllib.error
import urllib.request
import uuid
from contextlib import redirect_stdout
from datetime import date
from io import StringIO
from pathlib import Path
from unittest.mock import patch
from wsgiref.simple_server import WSGIRequestHandler, make_server


class QuietHandler(WSGIRequestHandler):
    def log_message(self, format, *args):
        pass


def run(mode):
    # Force values before importing settings; do not read the project's database or keys.
    os.environ.update(DJANGO_SETTINGS_MODULE='condominioBACK.settings',
        DATABASE_URL='sqlite:///:memory:', SECRET_KEY=secrets.token_urlsafe(48),
        FIREBASE_CREDENTIALS_JSON='{}', PLATE_TOKEN='', LUXAND_TOKEN='',
        STRIPE_SECRET_KEY='', STRIPE_PUBLISHABLE_KEY='', DEBUG='False',
        NOTIFICACIONES_SEGURIDAD_ACTIVAS='True', COLA_FCM_SEGURIDAD_ACTIVA='False',
        ENVIO_FCM_SEGURIDAD_ACTIVO='False')

    original_connect = socket.socket.connect
    def loopback_only(sock, address):
        if not isinstance(address, tuple) or address[0] != '127.0.0.1':
            raise OSError('Conexión externa bloqueada en la prueba aislada.')
        return original_connect(sock, address)

    with tempfile.TemporaryDirectory(prefix='condominio-bandeja-aislada-') as directory, \
         patch('firebase_admin.credentials.Certificate', side_effect=RuntimeError('Firebase deshabilitado')), \
         patch('firebase_admin.initialize_app', side_effect=RuntimeError('Firebase deshabilitado')), \
         patch('socket.socket.connect', loopback_only):
        import django
        with redirect_stdout(StringIO()):
            django.setup()
        import firebase_admin
        if firebase_admin._apps:
            raise RuntimeError('Firebase no puede estar inicializado en la prueba aislada.')
        from django.conf import settings
        from django.core.management import call_command
        from django.core.wsgi import get_wsgi_application
        from django.db import connection
        from django.contrib.auth.models import Group, User
        from django.utils import timezone
        from administracion.models import Cargo, Empleado, Persona
        from seguridad_IA.notificaciones import registrar_evento
        from seguridad_IA.models import NotificacionSeguridad, EntregaFCMSeguridad

        database = Path(directory).resolve() / 'bandeja.sqlite3'
        settings.DATABASES['default']['NAME'] = str(database)
        settings.ROOT_URLCONF = 'administracion.isolated_inbox_urls'
        settings.ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
        settings.DEBUG = False
        settings.NOTIFICACIONES_SEGURIDAD_ACTIVAS = True
        settings.COLA_FCM_SEGURIDAD_ACTIVA = False
        settings.ENVIO_FCM_SEGURIDAD_ACTIVO = False
        settings.PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
        if connection.vendor != 'sqlite' or Path(connection.settings_dict['NAME']).resolve() != database:
            raise RuntimeError('La base no corresponde al directorio temporal.')
        call_command('migrate', interactive=False, verbosity=0)

        password = secrets.token_urlsafe(18)
        security = Group.objects.create(name='Seguridad')
        owner_role = Group.objects.create(name='propietario')
        cargo = Cargo.objects.create(nombre='Seguridad', salario_base=1)
        guards = []
        for n in (1, 2):
            user = User.objects.create_user(username=f'guardia_ficticio_{n}', password=password)
            user.groups.add(security)
            Empleado.objects.create(nombre='Guardia', apellido=f'Ficticio{n}', direccion='Prueba',
                sexo='M', CI=f'9900{n}', sueldo=1, cargo=cargo, user=user)
            guards.append(user)
        owner = User.objects.create_user(username='propietario_ficticio', password=password)
        owner.groups.add(owner_role)
        Persona.objects.create(nombre='Propietario', apellido='Ficticio', sexo='M', tipo='P',
                               CI='99003', fecha_nacimiento=date(1990, 1, 1), user=owner)
        registrar_evento(guards[0], uuid.uuid4(), {'origen': 'MANUAL', 'categoria': 'Simulación',
            'descripcion': 'Evento ficticio para probar la bandeja', 'fecha_evento': timezone.now()})
        if NotificacionSeguridad.objects.count() != 2 or EntregaFCMSeguridad.objects.exists():
            raise RuntimeError('No se generaron las alertas ficticias esperadas.')

        app = get_wsgi_application()
        port = 18080 if mode == 'serve' else 0
        with make_server('127.0.0.1', port, app, handler_class=QuietHandler) as server:
            if mode == 'serve':
                print('Servidor aislado en 127.0.0.1:18080. Datos temporales; Ctrl+C para detener.', flush=True)
                print(f'Usuarios ficticios: guardia_ficticio_1, guardia_ficticio_2; contraseña temporal: {password}', flush=True)
                try:
                    server.serve_forever()
                except KeyboardInterrupt:
                    pass
            else:
                thread = threading.Thread(target=server.serve_forever, daemon=True)
                thread.start()
                try:
                    smoke(server.server_port, password)
                    if EntregaFCMSeguridad.objects.exists():
                        raise AssertionError('No debe existir cola push.')
                finally:
                    server.shutdown()
                    thread.join(timeout=5)
        connection.close()


def smoke(port, password):
    base = f'http://127.0.0.1:{port}/api/'
    def request(path, body=None, access=None):
        headers = {'Content-Type': 'application/json'}
        if access:
            headers['Authorization'] = 'Bearer ' + access
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(base + path, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                return response.status, json.load(response)
        except urllib.error.HTTPError as exc:
            content = exc.read()
            try:
                return exc.code, json.loads(content)
            except (ValueError, UnicodeDecodeError):
                return exc.code, None
    def login(username):
        status, data = request('login/', {'username': username, 'password': password})
        assert status == 200, f'Inicio ficticio rechazado: {status}'
        return data['access']
    with socket.socket() as probe:
        try:
            probe.connect(('192.0.2.1', 443))
        except OSError as exc:
            assert 'bloqueada' in str(exc)
        else:
            raise AssertionError('Una conexión externa no fue bloqueada.')
    assert request('login/', {'username': 'guardia_ficticio_1', 'password': 'incorrecta'})[0] == 401
    assert request('notificaciones-seguridad/')[0] in (401, 403)
    first, second, owner = map(login, ('guardia_ficticio_1', 'guardia_ficticio_2', 'propietario_ficticio'))
    status, a = request('notificaciones-seguridad/', access=first)
    status_b, b = request('notificaciones-seguridad/', access=second)
    assert status == status_b == 200 and len(a) == len(b) == 1
    assert a[0]['evento'] == b[0]['evento'] and a[0]['id'] != b[0]['id']
    assert a[0]['leida_en'] is None and b[0]['leida_en'] is None
    assert request('eventos-seguridad/' + a[0]['evento'] + '/', access=first)[0] == 200
    assert request('notificaciones-seguridad/' + a[0]['id'] + '/leer/', {}, first)[0] == 200
    assert request('notificaciones-seguridad/', access=first)[1][0]['leida_en'] is not None
    assert request('notificaciones-seguridad/', access=second)[1][0]['leida_en'] is None
    assert request('notificaciones-seguridad/', access=owner)[0] == 403
    assert request('notificaciones-seguridad/' + a[0]['id'] + '/leer/', {}, second)[0] == 404
    assert request('eventos-seguridad/' + a[0]['evento'] + '/', access=owner)[0] == 403
    assert request('devices/', access=first)[0] == 404
    print('Prueba HTTP aislada: dos guardias, lectura individual y acceso de propietario verificados.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--serve', action='store_true', help='mantener el servidor temporal en 127.0.0.1:18080')
    args = parser.parse_args()
    sys.exit(run('serve' if args.serve else 'smoke'))
