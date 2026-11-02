"""Disposable loopback-only roles demonstration with fictional data.

The SQLite database is created in a temporary directory and external socket
connections are blocked in this process. Never points at the project's DB.
"""
import os
import secrets
import socket
import sys
import tempfile
import types
import threading
import subprocess
import shutil
from contextlib import redirect_stdout
from datetime import date
from io import StringIO
from pathlib import Path
from unittest.mock import patch
from wsgiref.simple_server import WSGIRequestHandler, make_server


class QuietHandler(WSGIRequestHandler):
    def log_message(self, format, *args):
        pass


def main():
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument('--check', action='store_true', help='Prueba HTTP automática y cierre del entorno temporal.')
    mode.add_argument('--web-check', action='store_true', help='Prueba React/Playwright y limpieza automática; requiere puerto 18081 libre.')
    parser.add_argument('--port', type=int, choices=(18080, 18081), default=18081,
                        help='18080 para la variante Android aislada; 18081 para web.')
    args = parser.parse_args()
    web_result = 0
    if args.web_check and args.port != 18081:
        parser.error('--web-check requiere el puerto aislado 18081')
    os.environ.update(DJANGO_SETTINGS_MODULE='condominioBACK.settings', DATABASE_URL='sqlite:///:memory:',
        SECRET_KEY=secrets.token_urlsafe(48), FIREBASE_CREDENTIALS_JSON='{}', PLATE_TOKEN='', LUXAND_TOKEN='',
        STRIPE_SECRET_KEY='', STRIPE_PUBLISHABLE_KEY='', DEBUG='False', ROLES_PERSONALIZADOS_ACTIVOS='True',
        NOTIFICACIONES_SEGURIDAD_ACTIVAS='False', COLA_FCM_SEGURIDAD_ACTIVA='False', ENVIO_FCM_SEGURIDAD_ACTIVO='False')
    original_connect = socket.socket.connect

    def loopback_only(sock, address):
        if not isinstance(address, tuple) or address[0] != '127.0.0.1':
            raise OSError('Conexión externa bloqueada en la prueba aislada.')
        return original_connect(sock, address)

    with tempfile.TemporaryDirectory(prefix='condominio-roles-web-aislada-') as directory, \
         patch('firebase_admin.credentials.Certificate', side_effect=RuntimeError('Firebase deshabilitado')), \
         patch('firebase_admin.initialize_app', side_effect=RuntimeError('Firebase deshabilitado')), \
         patch('socket.socket.connect', loopback_only):
        import django
        with redirect_stdout(StringIO()):
            django.setup()
        import firebase_admin
        if firebase_admin._apps:
            raise RuntimeError('Firebase debe permanecer deshabilitado.')
        from django.conf import settings
        from django.core.management import call_command
        from django.core.wsgi import get_wsgi_application
        from django.db import connection
        from django.contrib.auth.models import Group, User
        from django.urls import path
        from django.http import JsonResponse
        from django.utils import timezone
        from administracion.models import Cargo, Empleado, Persona
        from administracion.views import CustomTokenObtainPairView, CurrentUserView, LogoutView, UserViewSet, RolViewSet
        from administracion.urls import ApplicationTokenRefreshView
        from administracion.roles_personalizados import ListaRolesPersonalizados, DetalleRolPersonalizado, AsignarRolPersonalizado
        from finanzas.devices import DispositivoPropioViewSet
        from residencial.models import Visita
        from residencial.views_visita import VisitaViewSet

        database = Path(directory).resolve() / 'roles.sqlite3'
        settings.DATABASES['default']['NAME'] = str(database)
        settings.ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
        settings.PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
        module = types.ModuleType('roles_web_urls_temporales')
        module.urlpatterns = [
            path('api/prueba-aislada/', lambda request: JsonResponse({'entorno': 'roles-aislados', 'firebase': False})),
            path('api/login/', CustomTokenObtainPairView.as_view()),
            path('api/me/', CurrentUserView.as_view()),
            path('api/logout/', LogoutView.as_view()),
            path('api/refresh/', ApplicationTokenRefreshView.as_view()),
            path('api/users/', UserViewSet.as_view({'get': 'list'})),
            path('api/roles/', RolViewSet.as_view({'get': 'list'})),
            path('api/roles-personalizados/', ListaRolesPersonalizados.as_view()),
            path('api/roles-personalizados/<uuid:rol_id>/', DetalleRolPersonalizado.as_view()),
            path('api/roles-personalizados/<uuid:rol_id>/asignar/', AsignarRolPersonalizado.as_view()),
            path('api/visitas/', VisitaViewSet.as_view({'get': 'list', 'post': 'create'})),
            path('api/devices/sincronizar/', DispositivoPropioViewSet.as_view({'post': 'sincronizar'})),
        ]
        sys.modules[module.__name__] = module
        settings.ROOT_URLCONF = module.__name__
        if connection.vendor != 'sqlite' or Path(connection.settings_dict['NAME']).resolve() != database:
            raise RuntimeError('La base no corresponde al directorio temporal.')
        call_command('migrate', interactive=False, verbosity=0)
        admin_group = Group.objects.create(name='administrador')
        guard_group = Group.objects.create(name='Seguridad')
        admin = User.objects.create_user(username='admin_ficticio', password='PruebaTemporal2026')
        admin.groups.add(admin_group)
        employee_user = User.objects.create_user(username='empleado_ficticio', password='PruebaTemporal2026')
        employee_user.groups.add(guard_group)
        cargo = Cargo.objects.create(nombre='Cargo ficticio', salario_base=1)
        Empleado.objects.create(nombre='Empleado', apellido='Ficticio', direccion='Prueba', sexo='M',
            CI='ficticio01', sueldo=1, cargo=cargo, user=employee_user)
        visitor = Persona.objects.create(nombre='Visita', apellido='Ficticia', sexo='F', tipo='V',
            CI='ficticio02', fecha_nacimiento=date(1990, 1, 1))
        receiver = Persona.objects.create(nombre='Residente', apellido='Ficticio', sexo='M', tipo='P',
            CI='ficticio03', fecha_nacimiento=date(1990, 1, 1))
        Visita.objects.create(visitante=visitor, recibe_persona=receiver, estado='ACTIVA', fecha_hora_entrada=timezone.now())
        try:
            with make_server('127.0.0.1', 0 if args.check else args.port, get_wsgi_application(), handler_class=QuietHandler) as server:
                if args.check or args.web_check:
                    from administracion.check_roles_http import check_roles_http
                    from django.db import connections

                    def serve():
                        try:
                            server.serve_forever()
                        finally:
                            connections.close_all()

                    worker = threading.Thread(target=serve, daemon=True)
                    worker.start()
                    try:
                        if args.web_check:
                            frontend = Path(__file__).resolve().parents[2] / 'Condominio-Frontend'
                            node = shutil.which('node')
                            if not node:
                                raise RuntimeError('Node.js no está disponible.')
                            web_result = subprocess.run([node, str(frontend / 'node_modules/@playwright/test/cli.js'),
                                            'test', '--config=playwright.config.js'],
                                           cwd=frontend, check=False, timeout=240).returncode
                        else:
                            check_roles_http(server.server_port)
                    finally:
                        server.shutdown()
                        worker.join(timeout=10)
                        if worker.is_alive():
                            raise RuntimeError('El servidor temporal no se ha detenido.')
                else:
                    print(f'Servidor de roles aislado en 127.0.0.1:{args.port}; detener con Ctrl+C.', flush=True)
                    try:
                        server.serve_forever()
                    except KeyboardInterrupt:
                        pass
        finally:
            connection.close()
    print('Servidor cerrado y directorio temporal eliminado.', flush=True)
    if web_result:
        raise SystemExit(web_result)


if __name__ == '__main__':
    main()
