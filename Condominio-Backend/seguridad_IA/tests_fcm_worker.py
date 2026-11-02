"""Pruebas del procesador sin base ni llamadas a Firebase."""
from io import StringIO
from unittest.mock import patch
from django.core.management import call_command
from django.core.management.base import CommandError
from django.db import DatabaseError
from django.test import SimpleTestCase, override_settings


@override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True,
                   COLA_FCM_SEGURIDAD_ACTIVA=True, ENVIO_FCM_SEGURIDAD_ACTIVO=True)
class ProcesadorFCMTests(SimpleTestCase):
    @patch('seguridad_IA.management.commands.procesar_fcm_seguridad.procesar_reserva')
    @patch('seguridad_IA.management.commands.procesar_fcm_seguridad.reservar_entrega',
           side_effect=[(1, 'reserva'), None])
    def test_lote_sigue_siendo_compatible(self, reservar, procesar):
        output = StringIO()
        call_command('procesar_fcm_seguridad', limite=3, stdout=output)
        procesar.assert_called_once_with(1, 'reserva')
        self.assertIn('Entregas procesadas: 1', output.getvalue())

    @patch('seguridad_IA.management.commands.procesar_fcm_seguridad.close_old_connections')
    @patch('seguridad_IA.management.commands.procesar_fcm_seguridad.time.sleep',
           side_effect=[None, KeyboardInterrupt])
    @patch('seguridad_IA.management.commands.procesar_fcm_seguridad.reservar_entrega',
           side_effect=[DatabaseError('ficticio'), None])
    def test_continuo_reintenta_error_de_base(self, reservar, dormir, cerrar):
        output, errors = StringIO(), StringIO()
        call_command('procesar_fcm_seguridad', continuo=True, intervalo=1, stdout=output, stderr=errors)
        self.assertEqual(reservar.call_count, 2)
        self.assertIn('se reintentará', errors.getvalue())
        self.assertIn('detenido', output.getvalue())
        self.assertGreaterEqual(cerrar.call_count, 3)

    def test_intervalo_fuera_de_rango_se_rechaza(self):
        with self.assertRaises(CommandError):
            call_command('procesar_fcm_seguridad', continuo=True, intervalo=0)

    @override_settings(ENVIO_FCM_SEGURIDAD_ACTIVO=False)
    def test_envio_pausado_bloquea_procesador(self):
        with self.assertRaises(CommandError):
            call_command('procesar_fcm_seguridad', continuo=True)
