"""Servidor temporal para una única prueba push dirigida al teléfono de prueba."""
import json
import os
import secrets
import socket
import sys
import tempfile
import types
import uuid
from contextlib import redirect_stdout
from io import StringIO
from pathlib import Path
from wsgiref.simple_server import WSGIRequestHandler, WSGIServer, make_server


class QuietHandler(WSGIRequestHandler):
    def log_message(self, format, *args):
        pass


class ExclusiveServer(WSGIServer):
    """Impide que dos pruebas compartan accidentalmente el mismo puerto."""
    allow_reuse_address = False

    def server_bind(self):
        if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
            self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
        super().server_bind()


def main():
    key = Path(os.environ['LOCALAPPDATA']) / 'CondominioSeguridad' / 'credenciales' / 'firebase-admin.json'
    if json.loads(key.read_text(encoding='utf-8')).get('project_id') != 'condominio-seguridad':
        raise RuntimeError('La credencial no corresponde al proyecto de prueba.')
    os.environ.update(DJANGO_SETTINGS_MODULE='condominioBACK.settings', DEBUG='False',
        DATABASE_URL='sqlite:///:memory:', SECRET_KEY=secrets.token_urlsafe(48),
        FIREBASE_CREDENTIALS_JSON='', FIREBASE_CREDENTIALS_PATH=str(key),
        PLATE_TOKEN='', LUXAND_TOKEN='', STRIPE_SECRET_KEY='', STRIPE_PUBLISHABLE_KEY='',
        NOTIFICACIONES_SEGURIDAD_ACTIVAS='True', COLA_FCM_SEGURIDAD_ACTIVA='True',
        ENVIO_FCM_SEGURIDAD_ACTIVO='True', ENVIO_FCM_LEGADO_ACTIVO='False')
    with tempfile.TemporaryDirectory(prefix='condominio-push-aislado-') as directory:
        import django
        with redirect_stdout(StringIO()):
            django.setup()
        import firebase_admin
        app = firebase_admin.get_app()
        if app.project_id != 'condominio-seguridad':
            raise RuntimeError('Firebase no corresponde al proyecto autorizado.')
        # La prueba necesita salida de red; detectar bloqueo antes de instalar o enviar.
        try:
            from google.auth.transport.requests import AuthorizedSession
            scoped = app.credential.get_credential().with_scopes(
                ['https://www.googleapis.com/auth/firebase.readonly'])
            session = AuthorizedSession(scoped)
            try:
                check = session.get('https://firebase.googleapis.com/v1beta1/projects/condominio-seguridad', timeout=10)
                if check.status_code != 200 or check.json().get('projectId') != 'condominio-seguridad':
                    raise RuntimeError('Proyecto Firebase no accesible.')
            finally:
                session.close()
        except Exception:
            raise RuntimeError('No se pudo verificar la salida de red al proyecto Firebase.') from None
        print('Conexion de solo lectura al Firebase de prueba verificada.', flush=True)
        from django.conf import settings
        from django.contrib.auth.models import Group, User
        from django.core.management import call_command
        from django.core.wsgi import get_wsgi_application
        from django.db import connection
        from django.http import JsonResponse
        from django.urls import path
        from django.utils import timezone
        from rest_framework.permissions import IsAuthenticated
        from rest_framework.response import Response
        from rest_framework.views import APIView
        from fcm_django.models import FCMDevice
        from administracion.access import effective_role
        from administracion.models import Cargo, Empleado
        from administracion.views import CustomTokenObtainPairView, CurrentUserView, LogoutView
        from finanzas.devices import DispositivoPropioViewSet
        from seguridad_IA.api_notificaciones import EventoViewSet, NotificacionViewSet
        from seguridad_IA.fcm_delivery import reservar_entrega, procesar_reserva
        from seguridad_IA.models import EntregaFCMSeguridad, NotificacionSeguridad
        from seguridad_IA.notificaciones import registrar_evento

        database = Path(directory).resolve() / 'push.sqlite3'
        settings.DATABASES['default']['NAME'] = str(database)
        settings.ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
        settings.PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
        if connection.vendor != 'sqlite' or Path(connection.settings_dict['NAME']).resolve() != database:
            raise RuntimeError('Se requiere una base temporal aislada.')

        test_control = {'finished': False}

        class TriggerOnce(APIView):
            permission_classes = [IsAuthenticated]

            def get(self, request):
                if effective_role(request.user) != 'guardia' or request.user.username != 'guardia_ficticio':
                    return Response(status=403)
                return Response({'dispositivo_listo': FCMDevice.objects.count() == 1 and
                    FCMDevice.objects.filter(user=request.user, active=True).count() == 1})

            def post(self, request):
                if effective_role(request.user) != 'guardia' or request.user.username != 'guardia_ficticio':
                    return Response(status=403)
                if FCMDevice.objects.count() != 1 or FCMDevice.objects.filter(user=request.user, active=True).count() != 1:
                    return Response({'detail': 'Se requiere un solo dispositivo ficticio activo.'}, status=409)
                if NotificacionSeguridad.objects.exists() or EntregaFCMSeguridad.objects.exists():
                    return Response({'detail': 'La prueba ya fue ejecutada.'}, status=409)
                registrar_evento(request.user, uuid.uuid4(), {'origen': 'MANUAL', 'categoria': 'Prueba',
                    'descripcion': 'Aviso ficticio de prueba', 'fecha_evento': timezone.now()})
                if NotificacionSeguridad.objects.count() != 1 or EntregaFCMSeguridad.objects.count() != 1:
                    return Response({'detail': 'No se pudo aislar la entrega.'}, status=409)
                reservation = reservar_entrega()
                if not reservation:
                    return Response({'detail': 'No existe una entrega pendiente.'}, status=409)
                result = procesar_reserva(*reservation)
                return Response({'estado': result}, status=200 if result == 'ENVIADA' else 502)

        class FinishTest(APIView):
            permission_classes = [IsAuthenticated]

            def get(self, request):
                if effective_role(request.user) != 'guardia' or request.user.username != 'guardia_ficticio':
                    return Response(status=403)
                return Response({'finalizar': test_control['finished']})

            def post(self, request):
                if effective_role(request.user) != 'guardia' or request.user.username != 'guardia_ficticio':
                    return Response(status=403)
                if not EntregaFCMSeguridad.objects.filter(estado='ENVIADA').exists():
                    return Response(status=409)
                test_control['finished'] = True
                return Response({'finalizar': True})

        module = types.ModuleType('push_test_urls_temporales')
        module.urlpatterns = [
            path('api/prueba-aislada/', lambda request: JsonResponse({'entorno': 'push-aislado', 'proyecto': 'condominio-seguridad'})),
            path('api/login/', CustomTokenObtainPairView.as_view()),
            path('api/me/', CurrentUserView.as_view()),
            path('api/logout/', LogoutView.as_view()),
            path('api/devices/sincronizar/', DispositivoPropioViewSet.as_view({'post': 'sincronizar'})),
            path('api/devices/desregistrar/', DispositivoPropioViewSet.as_view({'post': 'desregistrar'})),
            path('api/notificaciones-seguridad/', NotificacionViewSet.as_view({'get': 'list'})),
            path('api/notificaciones-seguridad/<uuid:pk>/leer/', NotificacionViewSet.as_view({'post': 'leer'})),
            path('api/eventos-seguridad/<uuid:pk>/', EventoViewSet.as_view({'get': 'retrieve'})),
            path('api/prueba-enviar/', TriggerOnce.as_view()),
            path('api/prueba-finalizar/', FinishTest.as_view()),
        ]
        sys.modules[module.__name__] = module
        settings.ROOT_URLCONF = module.__name__
        call_command('migrate', interactive=False, verbosity=0)
        group = Group.objects.create(name='Seguridad')
        user = User.objects.create_user(username='guardia_ficticio', password='PruebaTemporal2026')
        user.groups.add(group)
        cargo = Cargo.objects.create(nombre='Prueba', salario_base=1)
        Empleado.objects.create(nombre='Guardia', apellido='Ficticio', direccion='Prueba', sexo='M',
            CI='prueba9901', sueldo=1, cargo=cargo, user=user)
        try:
            with make_server('127.0.0.1', 18082, get_wsgi_application(),
                             server_class=ExclusiveServer, handler_class=QuietHandler) as server:
                print('Servidor push de prueba listo en 127.0.0.1:18082.', flush=True)
                try:
                    server.serve_forever()
                except KeyboardInterrupt:
                    pass
        finally:
            connection.close()
    print('Base de prueba eliminada.', flush=True)


if __name__ == '__main__':
    main()
