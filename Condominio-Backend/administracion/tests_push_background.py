"""Pruebas del control de ensayo; no usan ADB, Firebase ni teléfonos reales."""
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import patch

from . import check_push_background as control
from .run_push_test_isolated import ExclusiveServer, QuietHandler


class ControlPushSegundoPlanoTests(TestCase):
    @patch.object(control.subprocess, 'run')
    def test_detecta_proceso_y_rechaza_errores_de_adb(self, run):
        run.return_value = SimpleNamespace(returncode=0, stdout=b'1234\n', stderr=b'')
        self.assertTrue(control.test_process_running('adb', 'ficticio'))
        run.return_value = SimpleNamespace(returncode=1, stdout=b'', stderr=b'')
        self.assertFalse(control.test_process_running('adb', 'ficticio'))
        run.return_value = SimpleNamespace(returncode=1, stdout=b'', stderr=b'device offline')
        with self.assertRaises(RuntimeError):
            control.test_process_running('adb', 'ficticio')

    @patch.object(control, 'top_activity', return_value=True)
    @patch.object(control.subprocess, 'run')
    def test_no_cierra_app_visible(self, run, top):
        with self.assertRaises(RuntimeError):
            control.close_background_process('adb', 'ficticio')
        run.assert_not_called()

    @patch.object(control.time, 'sleep')
    @patch.object(control, 'test_process_running', side_effect=[True, False])
    @patch.object(control, 'top_activity', return_value=False)
    @patch.object(control.subprocess, 'run')
    def test_cierra_solo_paquete_temporal_sin_force_stop(self, run, top, running, sleep):
        control.close_background_process('adb', 'ficticio')
        self.assertEqual(run.call_args.args[0],
            ['adb', '-s', 'ficticio', 'shell', 'am', 'kill', control.PACKAGE])
        self.assertEqual(running.call_count, 2)

    @patch.object(control.time, 'sleep')
    @patch.object(control, 'close_background_process', side_effect=RuntimeError('Proceso activo'))
    @patch.object(control.subprocess, 'run')
    @patch.object(control, 'top_activity', side_effect=[True, False])
    @patch.object(control, 'request')
    @patch('sys.argv', ['control', 'enviar-cerrada', '--dispositivo', 'ficticio'])
    @patch.dict(control.os.environ, {'LOCALAPPDATA': 'temporal'})
    def test_no_envia_si_no_puede_confirmar_proceso_cerrado(self, request, top, run, close, sleep):
        request.side_effect = [
            {'entorno': 'push-aislado', 'proyecto': 'condominio-seguridad'},
            {'access': 'ficticia'}, {'dispositivo_listo': True},
        ]
        with self.assertRaises(RuntimeError):
            control.main()
        self.assertEqual(request.call_count, 3)

    def test_puerto_de_prueba_no_puede_compartirse(self):
        with ExclusiveServer(('127.0.0.1', 0), QuietHandler) as first:
            with self.assertRaises(OSError):
                ExclusiveServer(first.server_address, QuietHandler)

    @patch.object(control.subprocess, 'run')
    def test_sin_actividad_visible_se_rechaza(self, run):
        run.return_value = SimpleNamespace(stdout=b'no activity')
        with self.assertRaises(RuntimeError):
            control.top_activity('adb', 'telefono-ficticio')

    @patch.object(control.subprocess, 'run')
    def test_detecta_actividad_de_la_app_de_prueba(self, run):
        run.return_value = SimpleNamespace(stdout=b'mResumedActivity com.condominiun.smart.pushprueba/.MainActivity')
        self.assertTrue(control.top_activity('adb', 'telefono-ficticio'))
        run.return_value = SimpleNamespace(stdout=b'mResumedActivity com.example.launcher/.Main')
        self.assertFalse(control.top_activity('adb', 'telefono-ficticio'))

    @patch.object(control.time, 'sleep')
    @patch.object(control.subprocess, 'run')
    @patch.object(control, 'top_activity', side_effect=[True, False])
    @patch.object(control, 'request')
    @patch('sys.argv', ['control', 'enviar', '--dispositivo', 'telefono-ficticio'])
    @patch.dict(control.os.environ, {'LOCALAPPDATA': 'temporal'})
    def test_envia_solo_tras_confirmar_segundo_plano(self, request, top, run, sleep):
        request.side_effect = [
            {'entorno': 'push-aislado', 'proyecto': 'condominio-seguridad'},
            {'access': 'credencial-ficticia'}, {'dispositivo_listo': True}, {'estado': 'ENVIADA'},
        ]
        control.main()
        self.assertEqual(top.call_count, 2)
        self.assertEqual(run.call_count, 1)
        self.assertEqual(request.call_args_list[-1].args[0], 'prueba-enviar/')

    @patch.object(control, 'top_activity', return_value=False)
    @patch.object(control, 'request')
    @patch('sys.argv', ['control', 'enviar', '--dispositivo', 'telefono-ficticio'])
    @patch.dict(control.os.environ, {'LOCALAPPDATA': 'temporal'})
    def test_no_envia_si_app_no_esta_inicialmente_visible(self, request, top):
        request.side_effect = [
            {'entorno': 'push-aislado', 'proyecto': 'condominio-seguridad'},
            {'access': 'credencial-ficticia'}, {'dispositivo_listo': True},
        ]
        with self.assertRaises(RuntimeError):
            control.main()
        self.assertEqual(request.call_count, 3)
