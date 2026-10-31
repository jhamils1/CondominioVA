"""Concurrency scenarios; run only through run_device_postgres_isolated."""
import threading
import unittest
import uuid
from concurrent.futures import ThreadPoolExecutor

from django.contrib.auth import get_user_model
from django.db import close_old_connections, connection
from fcm_django.models import FCMDevice
from rest_framework.test import APIClient


class DeviceRaceTests(unittest.TestCase):
    def setUp(self):
        if connection.vendor != 'postgresql' or connection.settings_dict['USER'] != 'prueba_aislada':
            raise RuntimeError('Esta prueba requiere la instancia PostgreSQL temporal.')
        suffix = uuid.uuid4().hex
        self.a = get_user_model().objects.create_user(username='a_' + suffix)
        self.b = get_user_model().objects.create_user(username='b_' + suffix)
        self.token = 'ficticio_' + suffix

    def race(self, actions, force_empty_lookup=False):
        start = threading.Barrier(2, timeout=10)
        looked_up = threading.Barrier(2, timeout=10)

        def run(action):
            close_old_connections()
            seen = False
            def wrapper(execute, sql, params, many, context):
                nonlocal seen
                result = execute(sql, params, many, context)
                if (force_empty_lookup and not seen and 'fcm_django_fcmdevice' in sql
                        and 'FOR UPDATE' in sql.upper()):
                    seen = True
                    looked_up.wait()
                return result
            try:
                client = APIClient()
                client.force_authenticate(user=action[0])
                start.wait()
                with connection.execute_wrapper(wrapper):
                    if action[1] == 'delete':
                        response = client.delete(action[2])
                    else:
                        response = client.post(action[2], action[3], format='json')
                if force_empty_lookup and not seen:
                    raise AssertionError('No se interceptó la consulta esperada.')
                return response.status_code
            finally:
                connection.close()

        with ThreadPoolExecutor(max_workers=2) as pool:
            futures = [pool.submit(run, action) for action in actions]
            return [future.result(timeout=20) for future in futures]

    def sync(self, user, token=None):
        return (user, 'post', '/api/devices/sincronizar/',
                {'registration_id': token or self.token, 'type': 'android'})

    def test_two_accounts_race_to_register_an_unowned_token(self):
        results = self.race([self.sync(self.a), self.sync(self.b)], force_empty_lookup=True)
        self.assertEqual(sorted(results), [204, 400])
        devices = list(FCMDevice.objects.filter(registration_id=self.token))
        self.assertEqual(len(devices), 1)
        self.assertEqual(devices[0].user_id, (self.a.pk, self.b.pk)[results.index(204)])

    def test_legacy_creation_and_sync_compete_without_reassignment(self):
        legacy = (self.a, 'post', '/api/devices/', {'registration_id': self.token, 'type': 'android'})
        results = self.race([legacy, self.sync(self.b)], force_empty_lookup=True)
        self.assertIn(results, ([201, 400], [400, 204]))
        device = FCMDevice.objects.get(registration_id=self.token)
        self.assertEqual(device.user_id, self.a.pk if results[0] == 201 else self.b.pk)

    def test_owner_deactivation_and_foreign_claim_do_not_transfer(self):
        FCMDevice.objects.create(user=self.a, registration_id=self.token, type='android', active=True)
        retire = (self.a, 'post', '/api/devices/desregistrar/', {'registration_id': self.token})
        self.assertEqual(self.race([retire, self.sync(self.b)]), [204, 400])
        device = FCMDevice.objects.get(registration_id=self.token)
        self.assertEqual(device.user_id, self.a.pk)
        self.assertFalse(device.active)

    def test_legacy_delete_and_foreign_claim_do_not_transfer(self):
        FCMDevice.objects.create(user=self.a, registration_id=self.token, type='android', active=True)
        delete = (self.a, 'delete', '/api/devices/' + self.token + '/')
        self.assertEqual(self.race([delete, self.sync(self.b)]), [204, 400])
        device = FCMDevice.objects.get(registration_id=self.token)
        self.assertEqual(device.user_id, self.a.pk)
        self.assertFalse(device.active)

    def test_same_account_simultaneous_registration_and_retirement_are_serialized(self):
        FCMDevice.objects.create(user=self.a, registration_id=self.token, type='android', active=True)
        retire = (self.a, 'post', '/api/devices/desregistrar/', {'registration_id': self.token})
        self.assertEqual(self.race([retire, self.sync(self.a)]), [204, 204])
        self.assertEqual(FCMDevice.objects.filter(registration_id=self.token, user=self.a).count(), 1)

    def test_two_accounts_cannot_cross_rotate_each_others_tokens(self):
        other_token = self.token + '_b'
        FCMDevice.objects.create(user=self.a, registration_id=self.token, type='android', active=True)
        FCMDevice.objects.create(user=self.b, registration_id=other_token, type='android', active=True)
        first = (self.a, 'post', '/api/devices/sincronizar/',
                 {'registration_id': self.token, 'previous_registration_id': other_token, 'type': 'android'})
        second = (self.b, 'post', '/api/devices/sincronizar/',
                  {'registration_id': other_token, 'previous_registration_id': self.token, 'type': 'android'})
        self.assertEqual(self.race([first, second]), [400, 400])
        self.assertTrue(FCMDevice.objects.get(registration_id=self.token, user=self.a).active)
        self.assertTrue(FCMDevice.objects.get(registration_id=other_token, user=self.b).active)
