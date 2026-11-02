"""Carreras exclusivas de un PostgreSQL temporal con Firebase simulado."""
import os
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from django.test import override_settings
from django.db import connection
from fcm_django.models import FCMDevice
from administracion import tests_device_postgres as existing_tests
from finanzas.models import ProcedenciaFCM
from finanzas.procedencia_fcm import huella


class ProcedenciaRaceTests(unittest.TestCase):
    race = existing_tests.DeviceRaceTests.race
    sync = existing_tests.DeviceRaceTests.sync

    def setUp(self):
        data = os.environ.get('FCM_TEST_PG_DATA')
        if not data or connection.vendor != 'postgresql' or connection.settings_dict['USER'] != 'prueba_aislada':
            raise unittest.SkipTest('Requiere PostgreSQL temporal comprobado por el ejecutor aislado.')
        with connection.cursor() as cursor:
            cursor.execute('SHOW data_directory')
            if Path(cursor.fetchone()[0]).resolve() != Path(data).resolve():
                raise RuntimeError('El directorio no coincide con el PostgreSQL temporal.')
        existing_tests.DeviceRaceTests.setUp(self)
        options = override_settings(FCM_PROCEDENCIA_ACTIVA=True, FCM_PROYECTO_ID='ficticio')
        options.enable()
        self.addCleanup(options.disable)
        app = patch('finanzas.procedencia_fcm.firebase_admin.get_app', return_value=SimpleNamespace(project_id='ficticio'))
        send = patch('finanzas.procedencia_fcm.messaging.send', return_value='simulado')
        app.start(); send.start()
        self.addCleanup(app.stop); self.addCleanup(send.stop)

    def test_procedencia_carrera_dos_cuentas_token_nuevo(self):
        results = self.race([self.sync(self.a), self.sync(self.b)], force_empty_lookup=True)
        self.assertEqual(sorted(results), [204, 400])
        device = FCMDevice.objects.get(registration_id=self.token)
        self.assertEqual(device.user_id, (self.a.pk, self.b.pk)[results.index(204)])
        proof = ProcedenciaFCM.objects.get(dispositivo=device)
        self.assertEqual(proof.token_hash, huella(self.token))
        self.assertEqual(proof.proyecto, 'ficticio')

    def test_procedencia_carrera_baja_y_registro_ajeno(self):
        existing_tests.DeviceRaceTests.test_owner_deactivation_and_foreign_claim_do_not_transfer(self)
