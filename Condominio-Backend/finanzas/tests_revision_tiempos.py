"""Diagnóstico de una carrera con sesión real en PostgreSQL exclusivamente temporal."""
import os
import threading
import time
import unittest
from datetime import timedelta
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

from django.db import close_old_connections, connection, transaction
from django.utils import timezone
from fcm_django.models import FCMDevice
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken
from administracion import tests_device_postgres as existing_tests


class RevisionTiemposTests(unittest.TestCase):
    def setUp(self):
        data = os.environ.get('FCM_TEST_PG_DATA')
        if not data or connection.vendor != 'postgresql' or connection.settings_dict['USER'] != 'prueba_aislada':
            raise unittest.SkipTest('Requiere PostgreSQL temporal verificado.')
        with connection.cursor() as cursor:
            cursor.execute('SHOW data_directory')
            if Path(cursor.fetchone()[0]).resolve() != Path(data).resolve():
                raise RuntimeError('El directorio no corresponde al entorno aislado.')
        existing_tests.DeviceRaceTests.setUp(self)

    def login(self, user):
        user.set_password('ClaveFicticia123')
        user.save(update_fields=['password'])
        client = APIClient()
        response = client.post('/api/login/', {'username': user.username, 'password': 'ClaveFicticia123'}, format='json')
        self.assertEqual(response.status_code, 200)
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])
        return client, response.data['refresh']

    def test_cierre_despues_registro_y_otras_sesiones(self):
        first, first_refresh = self.login(self.a)
        second, _ = self.login(self.a)
        other, _ = self.login(self.b)
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            for client, token in ((second, self.token + '_otro'), (other, self.token + '_ajeno')):
                self.assertEqual(client.post('/api/devices/sincronizar/',
                    {'registration_id': token, 'type': 'android'}, format='json').status_code, 204)
            # La baja de un pendiente inexistente no bloquea un registro posterior.
            self.assertEqual(first.post('/api/devices/desregistrar/',
                {'registration_id': self.token}, format='json').status_code, 204)
            self.assertEqual(first.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
            self.assertEqual(first.post('/api/logout/', {'refresh': first_refresh}, format='json').status_code, 205)
        self.assertFalse(FCMDevice.objects.get(registration_id=self.token).active)
        self.assertTrue(FCMDevice.objects.get(registration_id=self.token + '_otro').active)
        self.assertTrue(FCMDevice.objects.get(registration_id=self.token + '_ajeno').active)

    def test_token_reutilizado_otra_sesion_conserva_ultimo_vinculo(self):
        first, refresh = self.login(self.a)
        second, _ = self.login(self.a)
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            for client in (first, second):
                self.assertEqual(client.post('/api/devices/sincronizar/',
                    {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
            self.assertEqual(first.post('/api/devices/desregistrar/',
                {'registration_id': self.token}, format='json').status_code, 400)
            self.assertEqual(first.post('/api/logout/', {'refresh': refresh}, format='json').status_code, 205)
        self.assertTrue(FCMDevice.objects.get(registration_id=self.token).active)

    def test_baja_ajena_no_cambia_dispositivo(self):
        owner, _ = self.login(self.b)
        client, _ = self.login(self.a)
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            self.assertEqual(owner.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
            self.assertEqual(client.post('/api/devices/desregistrar/',
                {'registration_id': self.token}, format='json').status_code, 400)
        self.assertTrue(FCMDevice.objects.get(registration_id=self.token, user=self.b).active)

    def test_logout_sin_baja_previa_retira_dispositivo_registrado(self):
        client, refresh = self.login(self.a)
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            self.assertEqual(client.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
            self.assertEqual(client.post('/api/logout/', {'refresh': refresh}, format='json').status_code, 205)
            self.assertIn(client.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json').status_code, (401, 403))
        self.assertFalse(FCMDevice.objects.get(registration_id=self.token).active)

    def test_fallo_auditoria_revierte_desactivacion_y_revocacion(self):
        client, refresh = self.login(self.a)
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            self.assertEqual(client.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
            with patch('administracion.views.record_action', side_effect=RuntimeError('fallo simulado')):
                with self.assertRaises(RuntimeError):
                    client.post('/api/logout/', {'refresh': refresh}, format='json')
            self.assertTrue(FCMDevice.objects.get(registration_id=self.token).active)
            self.assertEqual(client.post('/api/logout/', {'refresh': refresh}, format='json').status_code, 205)
        self.assertFalse(FCMDevice.objects.get(registration_id=self.token).active)

    def test_expiracion_durante_espera_del_proveedor(self):
        client, _ = self.login(self.a)
        token = AccessToken(client._credentials['HTTP_AUTHORIZATION'].split(' ', 1)[1])
        token.set_exp(lifetime=timedelta(seconds=2))
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + str(token))
        def lento(_):
            time.sleep(3)
            return 'proyecto-ficticio'
        with patch('finanzas.devices.validar_token', side_effect=lento), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            response = client.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json')
        self.assertEqual(response.status_code, 401)
        self.assertFalse(FCMDevice.objects.filter(registration_id=self.token).exists())

    def test_revocacion_de_sesion_durante_validacion(self):
        from administracion.models import SesionAplicacion
        client, _ = self.login(self.a)
        token = AccessToken(client._credentials['HTTP_AUTHORIZATION'].split(' ', 1)[1])
        def revoke(_):
            SesionAplicacion.objects.filter(pk=token['session_id']).update(revocada=timezone.now())
            return 'proyecto-ficticio'
        with patch('finanzas.devices.validar_token', side_effect=revoke), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            response = client.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json')
        self.assertEqual(response.status_code, 401)
        self.assertFalse(FCMDevice.objects.filter(registration_id=self.token).exists())

    def test_dispositivo_anterior_sin_procedencia_solo_se_admite_tras_validar(self):
        from finanzas.procedencia_fcm import dispositivos_elegibles
        device = FCMDevice.objects.create(user=self.a, registration_id=self.token, type='android', active=True)
        client, refresh = self.login(self.a)
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)), \
             patch('finanzas.procedencia_fcm.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            self.assertFalse(dispositivos_elegibles(FCMDevice.objects.filter(pk=device.pk)).exists())
            self.assertEqual(client.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
            self.assertTrue(dispositivos_elegibles(FCMDevice.objects.filter(pk=device.pk)).exists())
            self.assertEqual(client.post('/api/logout/', {'refresh': refresh}, format='json').status_code, 205)
        device.refresh_from_db()
        self.assertFalse(device.active)

    def test_reintento_respuesta_perdida_y_cierre(self):
        client, refresh = self.login(self.a)
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            for _ in range(2):
                self.assertEqual(client.post('/api/devices/sincronizar/',
                    {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
            self.assertEqual(FCMDevice.objects.filter(registration_id=self.token).count(), 1)
            self.assertEqual(client.post('/api/logout/', {'refresh': refresh}, format='json').status_code, 205)
        self.assertFalse(FCMDevice.objects.get(registration_id=self.token).active)

    def test_rotacion_nueva_sesion_con_token_previo_de_sesion_cerrada(self):
        first, refresh = self.login(self.a)
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            self.assertEqual(first.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
            self.assertEqual(first.post('/api/logout/', {'refresh': refresh}, format='json').status_code, 205)
            second, _ = self.login(self.a)
            response = second.post('/api/devices/sincronizar/', {'registration_id': self.token + '_nuevo',
                'previous_registration_id': self.token, 'type': 'android'}, format='json')
        self.assertEqual(response.status_code, 204)
        self.assertTrue(FCMDevice.objects.filter(registration_id=self.token + '_nuevo', user=self.a, active=True).exists())
        self.assertFalse(FCMDevice.objects.get(registration_id=self.token).active)

    def test_rotacion_no_desactiva_dispositivo_de_otra_sesion_activa(self):
        first, _ = self.login(self.a)
        second, _ = self.login(self.a)
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            self.assertEqual(first.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
            response = second.post('/api/devices/sincronizar/', {'registration_id': self.token + '_nuevo',
                'previous_registration_id': self.token, 'type': 'android'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertTrue(FCMDevice.objects.get(registration_id=self.token).active)
        self.assertFalse(FCMDevice.objects.filter(registration_id=self.token + '_nuevo').exists())

    def test_cierres_concurrentes_misma_sesion(self):
        client, refresh = self.login(self.a)
        header = client._credentials['HTTP_AUTHORIZATION']
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            self.assertEqual(client.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
        barrier = threading.Barrier(2, timeout=10)
        def close():
            close_old_connections()
            try:
                peer = APIClient()
                peer.credentials(HTTP_AUTHORIZATION=header)
                barrier.wait()
                return peer.post('/api/logout/', {'refresh': refresh}, format='json').status_code
            finally:
                connection.close()
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(lambda _: close(), range(2)))
        self.assertEqual(results.count(205), 1)
        self.assertIn(next(result for result in results if result != 205), (400, 401))
        self.assertFalse(FCMDevice.objects.get(registration_id=self.token).active)

    def test_expira_esperando_bloqueos_de_sesion_usuario_y_dispositivo(self):
        from administracion.models import SesionAplicacion
        client, _ = self.login(self.a)
        original = AccessToken(client._credentials['HTTP_AUTHORIZATION'].split(' ', 1)[1])
        device = FCMDevice.objects.create(user=self.a, registration_id=self.token, type='android', active=False)
        for name in ('sesion', 'usuario', 'dispositivo'):
            with self.subTest(bloqueo=name):
                access = AccessToken(str(original))
                access.set_exp(from_time=timezone.now(), lifetime=timedelta(seconds=3))
                arrived = threading.Event()
                def send():
                    close_old_connections()
                    try:
                        peer = APIClient()
                        peer.credentials(HTTP_AUTHORIZATION='Bearer ' + str(access))
                        def observer(execute, sql, params, many, context):
                            tables = {'sesion': 'administracion_sesionaplicacion',
                                      'usuario': 'auth_user', 'dispositivo': 'fcm_django_fcmdevice'}
                            if 'FOR UPDATE' in sql.upper() and tables[name] in sql:
                                arrived.set()
                            return execute(sql, params, many, context)
                        with connection.execute_wrapper(observer):
                            return peer.post('/api/devices/sincronizar/',
                                {'registration_id': self.token, 'type': 'android'}, format='json').status_code
                    finally:
                        connection.close()
                with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
                     patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)), \
                     ThreadPoolExecutor(max_workers=1) as pool:
                    with transaction.atomic():
                        if name == 'sesion':
                            SesionAplicacion.objects.select_for_update().get(pk=access['session_id'])
                        elif name == 'usuario':
                            type(self.a).objects.select_for_update().get(pk=self.a.pk)
                        else:
                            FCMDevice.objects.select_for_update().get(pk=device.pk)
                        future = pool.submit(send)
                        self.assertTrue(arrived.wait(10), f'No se observó la espera de {name}.')
                        time.sleep(3.2)
                    self.assertEqual(future.result(timeout=10), 401)
                device.refresh_from_db()
                self.assertFalse(device.active)

    def test_delete_heredado_cancela_sync_pendiente(self):
        client, _ = self.login(self.a)
        FCMDevice.objects.create(user=self.a, registration_id=self.token, type='android', active=True)
        started, release = threading.Event(), threading.Event()
        header = client._credentials['HTTP_AUTHORIZATION']
        def validate(_):
            started.set()
            if not release.wait(10): raise RuntimeError('Ensayo interrumpido.')
            return 'proyecto-ficticio'
        def sync():
            close_old_connections()
            try:
                peer = APIClient()
                peer.credentials(HTTP_AUTHORIZATION=header)
                return peer.post('/api/devices/sincronizar/',
                    {'registration_id': self.token, 'type': 'android'}, format='json').status_code
            finally:
                connection.close()
        with patch('finanzas.devices.validar_token', side_effect=validate), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)), \
             ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(sync)
            try:
                self.assertTrue(started.wait(10))
                self.assertEqual(client.delete('/api/devices/' + self.token + '/').status_code, 204)
            finally:
                release.set()
            self.assertEqual(future.result(timeout=10), 400)
        self.assertFalse(FCMDevice.objects.get(registration_id=self.token).active)

    def test_delete_heredado_no_retiro_otra_sesion_activa(self):
        owner, _ = self.login(self.a)
        other_session, _ = self.login(self.a)
        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)):
            self.assertEqual(owner.post('/api/devices/sincronizar/',
                {'registration_id': self.token, 'type': 'android'}, format='json').status_code, 204)
            self.assertEqual(other_session.delete('/api/devices/' + self.token + '/').status_code, 400)
            self.assertTrue(FCMDevice.objects.get(registration_id=self.token).active)
            self.assertEqual(owner.delete('/api/devices/' + self.token + '/').status_code, 204)
            self.assertEqual(owner.delete('/api/devices/' + self.token + '/').status_code, 204)
        self.assertFalse(FCMDevice.objects.get(registration_id=self.token).active)

    def test_rechaza_registro_tardio_tras_cerrar_sesion(self):
        self.a.set_password('ClaveFicticia123'); self.a.save(update_fields=['password'])
        client = APIClient()
        login = client.post('/api/login/', {'username': self.a.username, 'password': 'ClaveFicticia123'}, format='json')
        self.assertEqual(login.status_code, 200)
        access, refresh = login.data['access'], login.data['refresh']
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
        started, release = threading.Event(), threading.Event()

        def validate(token):
            started.set()
            if not release.wait(15): raise RuntimeError('Ensayo interrumpido.')
            return 'proyecto-ficticio'

        def synchronize():
            close_old_connections()
            try:
                peer = APIClient()
                peer.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
                response = peer.post('/api/devices/sincronizar/',
                    {'registration_id': self.token, 'type': 'android'}, format='json')
                return response.status_code
            finally:
                connection.close()

        with patch('finanzas.devices.validar_token', side_effect=validate), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)), \
             ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(synchronize)
            try:
                self.assertTrue(started.wait(10))
                self.assertEqual(client.post('/api/devices/desregistrar/',
                    {'registration_id': self.token}, format='json').status_code, 204)
                self.assertEqual(client.post('/api/logout/', {'refresh': refresh}, format='json').status_code, 205)
            finally:
                release.set()
            status = future.result(timeout=15)
        self.assertIn(status, (400, 401))
        self.assertFalse(FCMDevice.objects.filter(user=self.a, registration_id=self.token, active=True).exists())

    def test_rechaza_registro_pendiente_antes_de_revocacion(self):
        self.a.set_password('ClaveFicticia123'); self.a.save(update_fields=['password'])
        client = APIClient()
        login = client.post('/api/login/', {'username': self.a.username, 'password': 'ClaveFicticia123'}, format='json')
        self.assertEqual(login.status_code, 200)
        access, refresh = login.data['access'], login.data['refresh']
        client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
        started, release = threading.Event(), threading.Event()

        def validate(token):
            started.set()
            if not release.wait(15): raise RuntimeError('Ensayo interrumpido.')
            return 'proyecto-ficticio'

        def synchronize():
            close_old_connections()
            try:
                peer = APIClient()
                peer.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
                response = peer.post('/api/devices/sincronizar/',
                    {'registration_id': self.token, 'type': 'android'}, format='json')
                return response.status_code
            finally:
                connection.close()

        with patch('finanzas.devices.validar_token', side_effect=validate), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)), \
             ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(synchronize)
            try:
                self.assertTrue(started.wait(10))
                self.assertEqual(client.post('/api/devices/desregistrar/',
                    {'registration_id': self.token}, format='json').status_code, 204)
            finally:
                release.set()
            self.assertIn(future.result(timeout=15), (400, 401))
            self.assertEqual(client.post('/api/logout/', {'refresh': refresh}, format='json').status_code, 205)
        self.assertFalse(FCMDevice.objects.filter(user=self.a, registration_id=self.token, active=True).exists())
