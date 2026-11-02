"""Escenarios aislados de admisión y envío; Firebase se simula siempre."""
import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from django.test import override_settings
from fcm_django.models import FCMDevice
from firebase_admin import exceptions, messaging
from administracion import tests_access as existing_tests
from finanzas.models import ProcedenciaFCM
from finanzas.procedencia_fcm import dispositivos_elegibles, huella
from seguridad_IA.models import EntregaFCMSeguridad, NotificacionSeguridad


class ProcedenciaTests(unittest.TestCase):
    auth = existing_tests.AccessTests.auth
    tearDown = existing_tests.AccessTests.tearDown

    def setUp(self):
        existing_tests.AccessTests.setUp(self)
        options = override_settings(FCM_PROCEDENCIA_ACTIVA=True, FCM_PROYECTO_ID='proyecto-ficticio',
            NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=True)
        options.enable()
        self.addCleanup(options.disable)
        self.auth(self.guard)
        self.app = SimpleNamespace(project_id='proyecto-ficticio')
        self.app_patch = patch('finanzas.procedencia_fcm.firebase_admin.get_app', return_value=self.app)
        self.send_patch = patch('finanzas.procedencia_fcm.messaging.send', return_value='aceptado-ficticio')
        self.app_patch.start()
        self.send = self.send_patch.start()
        self.addCleanup(self.app_patch.stop)
        self.addCleanup(self.send_patch.stop)

    def sync(self, token, previous=None):
        return self.client.post('/api/devices/sincronizar/',
            {'registration_id': token, 'previous_registration_id': previous, 'type': 'android'}, format='json')

    def proof(self, device, project='proyecto-ficticio', digest=None):
        return ProcedenciaFCM.objects.create(dispositivo=device, proyecto=project,
            token_hash=digest or huella(device.registration_id))

    def test_procedencia_valida_en_servidor_y_rota_solo_el_propio(self):
        old = FCMDevice.objects.create(user=self.guard, registration_id='anterior', type='android', active=True)
        response = self.sync('nuevo', 'anterior')
        self.assertEqual(response.status_code, 204)
        self.send.assert_called_once()
        self.assertTrue(self.send.call_args.kwargs['dry_run'])
        self.assertIs(self.send.call_args.kwargs['app'], self.app)
        self.assertEqual(self.send.call_args.args[0].data, {'tipo': 'validacion'})
        old.refresh_from_db(); self.assertFalse(old.active)
        new = FCMDevice.objects.get(registration_id='nuevo')
        self.assertEqual(new.user_id, self.guard.pk)
        self.assertEqual(new.procedencia_condominio.token_hash, huella('nuevo'))
        self.assertNotEqual(new.procedencia_condominio.token_hash, 'nuevo')

    def test_procedencia_reintento_de_misma_sincronizacion_es_idempotente(self):
        old = FCMDevice.objects.create(user=self.guard, registration_id='anterior', type='android', active=True)
        self.assertEqual(self.sync('nuevo', 'anterior').status_code, 204)
        self.assertEqual(self.sync('nuevo', 'anterior').status_code, 204)
        old.refresh_from_db(); self.assertFalse(old.active)
        self.assertEqual(FCMDevice.objects.filter(registration_id='nuevo').count(), 1)
        self.assertEqual(ProcedenciaFCM.objects.count(), 1)

    def test_procedencia_rol_invalidado_no_valida_ni_crea(self):
        self.guard.groups.clear()
        self.assertIn(self.sync('nuevo').status_code, (401, 403))
        self.assertFalse(FCMDevice.objects.exists())
        self.send.assert_not_called()

    def test_procedencia_ajena_no_se_valida_ni_transfiere(self):
        other = FCMDevice.objects.create(user=self.owner, registration_id='ajeno', type='android', active=True)
        for current, previous in [('ajeno', None), ('nuevo', 'ajeno')]:
            self.assertEqual(self.sync(current, previous).status_code, 400)
        self.send.assert_not_called()
        other.refresh_from_db(); self.assertTrue(other.active)
        self.assertEqual(other.user_id, self.owner.pk)
        self.assertFalse(FCMDevice.objects.filter(registration_id='nuevo').exists())

    def test_procedencia_revalida_titular_despues_de_red(self):
        def claim(*args, **kwargs):
            FCMDevice.objects.create(user=self.owner, registration_id='en-carrera', type='android', active=True)
            return 'simulado'
        self.send.side_effect = claim
        self.assertEqual(self.sync('en-carrera').status_code, 400)
        device = FCMDevice.objects.get(registration_id='en-carrera')
        self.assertEqual(device.user_id, self.owner.pk)
        self.assertTrue(device.active)
        self.assertFalse(ProcedenciaFCM.objects.filter(dispositivo=device).exists())

    def test_procedencia_revalida_cuenta_despues_de_red(self):
        def deactivate(*args, **kwargs):
            type(self.guard).objects.filter(pk=self.guard.pk).update(is_active=False)
            return 'simulado'
        self.send.side_effect = deactivate
        self.assertIn(self.sync('nuevo').status_code, (401, 403))
        self.assertFalse(FCMDevice.objects.exists())

    def test_procedencia_error_o_proveedor_caido_no_retiro_anterior(self):
        old = FCMDevice.objects.create(user=self.guard, registration_id='anterior', type='android', active=True)
        for error, status in [(messaging.SenderIdMismatchError('simulado'), 400),
                              (messaging.UnregisteredError('simulado'), 400),
                              (exceptions.InvalidArgumentError('simulado'), 400),
                              (RuntimeError('simulado'), 503)]:
            self.send.side_effect = error
            self.assertEqual(self.sync('nuevo', 'anterior').status_code, status)
            old.refresh_from_db(); self.assertTrue(old.active)
            self.assertFalse(FCMDevice.objects.filter(registration_id='nuevo').exists())

    def test_procedencia_cliente_heredado_no_reactiva(self):
        old = FCMDevice.objects.create(user=self.guard, registration_id='antiguo', type='android', active=False)
        self.assertEqual(self.client.post('/api/devices/', {'registration_id':'antiguo','type':'android'}, format='json').status_code, 400)
        self.assertEqual(self.client.patch('/api/devices/antiguo/', {'active': True}, format='json').status_code, 400)
        old.refresh_from_db(); self.assertFalse(old.active)
        self.assertFalse(ProcedenciaFCM.objects.filter(dispositivo=old).exists())
        self.send.assert_not_called()

    def test_procedencia_desactivada_o_proyecto_distinto_falla_cerrado(self):
        with override_settings(FCM_PROCEDENCIA_ACTIVA=False):
            self.assertEqual(self.sync('nuevo').status_code, 503)
        self.app.project_id='otro-proyecto'
        self.assertEqual(self.sync('nuevo').status_code, 503)
        self.send.assert_not_called()
        self.assertEqual(FCMDevice.objects.count(), 0)

    def test_procedencia_desactivada_conserva_bandeja_sin_entregas(self):
        device = FCMDevice.objects.create(user=self.guard, registration_id='antiguo', type='android', active=True)
        self.proof(device)
        payload={'id':str(uuid.uuid4()), 'categoria':'Prueba','descripcion':'Prueba', 'fecha_evento':'2026-01-01T12:00:00Z'}
        with override_settings(FCM_PROCEDENCIA_ACTIVA=False):
            self.assertEqual(self.client.post('/api/eventos-seguridad/',payload,format='json').status_code,201)
        self.assertEqual(NotificacionSeguridad.objects.filter(destinatario=self.guard).count(), 1)
        self.assertFalse(EntregaFCMSeguridad.objects.exists())
        self.send.assert_not_called()

    def test_procedencia_seleccion_excluye_desconocido_otro_proyecto_y_hash_alterado(self):
        good = FCMDevice.objects.create(user=self.guard, registration_id='bueno', type='android', active=True)
        self.proof(good)
        missing = FCMDevice.objects.create(user=self.guard, registration_id='desconocido', type='android', active=True)
        wrong = FCMDevice.objects.create(user=self.guard, registration_id='viejo', type='android', active=True)
        self.proof(wrong, project='otro')
        altered = FCMDevice.objects.create(user=self.guard, registration_id='alterado', type='android', active=True)
        self.proof(altered, digest=huella('distinto'))
        inactive = FCMDevice.objects.create(user=self.guard, registration_id='inactivo', type='android', active=False)
        self.proof(inactive)
        self.assertEqual(list(dispositivos_elegibles(FCMDevice.objects.all()).values_list('pk', flat=True)), [good.pk])
        self.assertTrue(missing.active)

    def test_procedencia_cola_solo_guardia_valido_y_revalida_antes_de_enviar(self):
        from seguridad_IA.fcm_delivery import reservar_entrega, procesar_reserva
        good = FCMDevice.objects.create(user=self.guard, registration_id='bueno', type='android', active=True)
        self.proof(good)
        FCMDevice.objects.create(user=self.guard, registration_id='desconocido', type='android', active=True)
        owner = FCMDevice.objects.create(user=self.owner, registration_id='propietario', type='android', active=True)
        self.proof(owner)
        payload={'id':str(uuid.uuid4()), 'categoria':'Prueba','descripcion':'Prueba', 'fecha_evento':'2026-01-01T12:00:00Z'}
        self.assertEqual(self.client.post('/api/eventos-seguridad/',payload,format='json').status_code,201)
        self.assertEqual(list(EntregaFCMSeguridad.objects.values_list('dispositivo_id', flat=True)), [good.pk])
        reservation = reservar_entrega()
        self.app.project_id = 'otro-proyecto'
        self.assertEqual(procesar_reserva(*reservation), 'PROCEDENCIA_NO_DISPONIBLE')
        self.assertEqual(EntregaFCMSeguridad.objects.get().estado, 'EN_PROCESO')
        self.send.assert_not_called()

    def test_procedencia_no_disponible_no_reserva_cola_previa(self):
        from seguridad_IA.fcm_delivery import reservar_entrega
        good = FCMDevice.objects.create(user=self.guard, registration_id='bueno', type='android', active=True)
        self.proof(good)
        payload={'id':str(uuid.uuid4()), 'categoria':'Prueba','descripcion':'Prueba', 'fecha_evento':'2026-01-01T12:00:00Z'}
        self.assertEqual(self.client.post('/api/eventos-seguridad/',payload,format='json').status_code,201)
        with override_settings(FCM_PROCEDENCIA_ACTIVA=False):
            self.assertIsNone(reservar_entrega())
        delivery = EntregaFCMSeguridad.objects.get()
        self.assertEqual(delivery.estado, 'PENDIENTE')
        self.assertEqual(delivery.intentos, 0)

    def test_procedencia_cola_cancela_si_cambia_huella(self):
        from seguridad_IA.fcm_delivery import reservar_entrega, procesar_reserva
        device = FCMDevice.objects.create(user=self.guard, registration_id='bueno', type='android', active=True)
        proof = self.proof(device)
        payload={'id':str(uuid.uuid4()), 'categoria':'Prueba','descripcion':'Prueba', 'fecha_evento':'2026-01-01T12:00:00Z'}
        self.assertEqual(self.client.post('/api/eventos-seguridad/',payload,format='json').status_code,201)
        reservation = reservar_entrega()
        proof.token_hash=huella('otra'); proof.save(update_fields=['token_hash'])
        self.assertEqual(procesar_reserva(*reservation), 'CANCELADA')
        self.send.assert_not_called()

    def test_procedencia_cola_envia_al_guardia_y_notifica_admin_al_confirmar(self):
        from seguridad_IA.fcm_delivery import reservar_entrega, procesar_reserva
        from seguridad_IA.notificaciones import revisar_evento
        guard = FCMDevice.objects.create(user=self.guard, registration_id='guardia', type='android', active=True)
        admin = FCMDevice.objects.create(user=self.admin, registration_id='administrador', type='android', active=True)
        resident = FCMDevice.objects.create(user=self.owner, registration_id='residente', type='android', active=True)
        for device in (guard, admin, resident): self.proof(device)
        event_id=str(uuid.uuid4())
        payload={'id':event_id, 'categoria':'Prueba','descripcion':'Prueba', 'fecha_evento':'2026-01-01T12:00:00Z'}
        self.assertEqual(self.client.post('/api/eventos-seguridad/',payload,format='json').status_code,201)
        self.assertEqual(list(EntregaFCMSeguridad.objects.values_list('dispositivo_id',flat=True)),[guard.pk])
        self.assertEqual(procesar_reserva(*reservar_entrega()), 'ENVIADA')
        revisar_evento(self.guard, event_id, True)
        self.assertEqual(set(EntregaFCMSeguridad.objects.values_list('dispositivo_id',flat=True)),{guard.pk,admin.pk})
        self.assertEqual(procesar_reserva(*reservar_entrega()), 'ENVIADA')
        self.assertEqual(self.send.call_count, 2)
        self.assertFalse(EntregaFCMSeguridad.objects.filter(dispositivo=resident).exists())

    @override_settings(ENVIO_FCM_LEGADO_ACTIVO=True)
    def test_procedencia_envio_legado_expensa_filtra_desconocidos(self):
        from finanzas.models import expensa
        good = FCMDevice.objects.create(user=self.owner, registration_id='bueno', type='android', active=True)
        self.proof(good)
        FCMDevice.objects.create(user=self.owner, registration_id='desconocido', type='android', active=True)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message', autospec=True) as send:
            expensa.objects.create(unidad=self.unit, monto=3)
            send.assert_called_once()
            self.assertEqual(list(send.call_args.args[0].values_list('pk', flat=True)), [good.pk])

    @override_settings(ENVIO_FCM_LEGADO_ACTIVO=True)
    def test_procedencia_envio_legado_objeto_filtra_desconocidos(self):
        from finanzas.signals import notificar_objeto_encontrado
        good = FCMDevice.objects.create(user=self.owner, registration_id='bueno', type='android', active=True)
        self.proof(good)
        FCMDevice.objects.create(user=self.guard, registration_id='desconocido', type='android', active=True)
        fake = SimpleNamespace(estado='P', titulo='prueba', lugar_encontrado='prueba', id=1)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message', autospec=True) as send:
            notificar_objeto_encontrado(None, fake, True)
            send.assert_called_once()
            self.assertEqual(list(send.call_args.args[0].values_list('pk', flat=True)), [good.pk])


if __name__ == '__main__':
    unittest.main()
