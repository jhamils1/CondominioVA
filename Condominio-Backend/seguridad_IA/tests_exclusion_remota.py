import socket
import threading
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch

from seguridad_vision.exclusion_imou import ExclusionImou
from seguridad_IA.monitoreo_imou import PUERTO_MONITOR, adquirir_exclusion


class ExclusionImouTests(TestCase):
    def test_mismo_puerto_que_el_monitor_local(self):
        self.assertEqual(ExclusionImou().puerto, PUERTO_MONITOR)

    def setUp(self):
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            self.puerto = sock.getsockname()[1]
        carpeta = TemporaryDirectory()
        self.addCleanup(carpeta.cleanup)
        self.marca = Path(carpeta.name) / 'bloqueo'
        self.bloqueo = ExclusionImou(self.puerto, marca=self.marca)
        self.addCleanup(self.bloqueo.cerrar)

    def test_solo_un_titular_y_liberacion(self):
        a, b = 'a' * 43, 'b' * 43
        self.assertTrue(self.bloqueo.adquirir(a))
        self.assertTrue(self.bloqueo.adquirir(a))
        self.assertFalse(self.bloqueo.adquirir(b))
        self.assertFalse(self.bloqueo.liberar(b))
        self.assertTrue(self.bloqueo.pertenece(a))
        with socket.socket() as competidor:
            if hasattr(socket, 'SO_EXCLUSIVEADDRUSE'):
                competidor.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
            with self.assertRaises(OSError):
                competidor.bind(('127.0.0.1', self.puerto))
        self.assertTrue(self.bloqueo.liberar(a))
        self.assertTrue(self.bloqueo.adquirir(b))

    def test_rechaza_identificadores_invalidos(self):
        for titular in ('', 'corto', 'x' * 129, None, 'á' * 43):
            with self.subTest(titular=titular):
                self.assertFalse(self.bloqueo.adquirir(titular))
                self.assertFalse(self.bloqueo.pertenece(titular))
                self.assertFalse(self.bloqueo.liberar(titular))

    def test_no_libera_mientras_hay_eventos_en_curso(self):
        a, b = 'a' * 43, 'b' * 43
        self.assertTrue(self.bloqueo.adquirir(a))
        self.assertTrue(self.bloqueo.iniciar(a))
        self.assertTrue(self.bloqueo.liberar(a))
        self.assertFalse(self.bloqueo.adquirir(b))
        self.assertFalse(self.bloqueo.iniciar(a))
        self.assertTrue(self.bloqueo.terminar(a))
        self.assertTrue(self.bloqueo.adquirir(b))

    def test_al_perder_el_proceso_conserva_marca_preventiva(self):
        a, b = 'a' * 43, 'b' * 43
        self.assertTrue(self.bloqueo.adquirir(a))
        self.bloqueo.cerrar(conservar_marca=True)
        self.assertTrue(self.marca.exists())
        segundo = ExclusionImou(self.puerto, marca=self.marca)
        self.addCleanup(segundo.cerrar)
        self.assertFalse(segundo.adquirir(b))
        with patch('seguridad_IA.monitoreo_imou.MARCA_REMOTA', self.marca), \
             patch('seguridad_IA.monitoreo_imou.PUERTO_MONITOR', self.puerto):
            self.assertIsNone(adquirir_exclusion())
        self.assertTrue(segundo.recuperar())
        self.assertTrue(segundo.adquirir(b))

    def test_reinicio_con_evento_pendiente_no_libera_control(self):
        a = 'a' * 43
        self.assertTrue(self.bloqueo.adquirir(a))
        self.assertTrue(self.bloqueo.iniciar(a))
        self.bloqueo.cerrar(conservar_marca=True)
        segundo = ExclusionImou(self.puerto, marca=self.marca)
        self.addCleanup(segundo.cerrar)
        self.assertFalse(segundo.recuperar())
        self.assertFalse(segundo.adquirir('b' * 43))

    def test_marca_corrupta_no_se_recupera_automaticamente(self):
        self.marca.write_bytes(b'incompleto')
        self.assertFalse(self.bloqueo.recuperar())
        self.assertFalse(self.bloqueo.adquirir('a' * 43))

    def test_recuperacion_no_interrumpe_eventos_en_curso(self):
        a, b = 'a' * 43, 'b' * 43
        self.assertTrue(self.bloqueo.adquirir(a))
        self.assertTrue(self.bloqueo.iniciar(a))
        self.assertFalse(self.bloqueo.recuperar())
        self.assertTrue(self.bloqueo.terminar(a))
        self.assertTrue(self.bloqueo.recuperar())
        self.assertTrue(self.bloqueo.adquirir(b))
        self.assertFalse(self.bloqueo.iniciar(a))

    def test_otro_proceso_no_recupera_un_control_vivo(self):
        self.assertTrue(self.bloqueo.adquirir('a' * 43))
        segundo = ExclusionImou(self.puerto, marca=self.marca)
        self.addCleanup(segundo.cerrar)
        self.assertFalse(segundo.recuperar())
        self.assertTrue(self.bloqueo.pertenece('a' * 43))

    def test_fallo_al_persistir_operacion_no_autoriza_evento(self):
        a = 'a' * 43
        self.assertTrue(self.bloqueo.adquirir(a))
        with patch.object(Path, 'open', side_effect=OSError('fallo ficticio')):
            self.assertFalse(self.bloqueo.iniciar(a))
        self.assertTrue(self.bloqueo.liberar(a))

    def test_solicitudes_simultaneas_tienen_un_ganador(self):
        barrera = threading.Barrier(3)
        resultados = []
        def intentar(titular):
            barrera.wait()
            resultados.append(self.bloqueo.adquirir(titular))
        hilos = [threading.Thread(target=intentar, args=(x * 43,)) for x in ('a', 'b')]
        for hilo in hilos:
            hilo.start()
        barrera.wait()
        for hilo in hilos:
            hilo.join(timeout=3)
        self.assertEqual(sorted(resultados), [False, True])
