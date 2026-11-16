from unittest import TestCase
from unittest.mock import MagicMock, patch

from camaras.supervisor_puentes import SupervisorPuentes


class SupervisorPuentesTests(TestCase):
    @patch('camaras.supervisor_puentes.Path.is_file', return_value=True)
    @patch('camaras.supervisor_puentes.subprocess.Popen')
    @patch('camaras.supervisor_puentes.puerto_en_uso', return_value=False)
    def test_inicia_una_vez_y_reinicia_solo_el_que_termino(self, disponible, popen, archivo):
        imou, catalogo, reemplazo = MagicMock(), MagicMock(), MagicMock()
        imou.poll.return_value = catalogo.poll.return_value = reemplazo.poll.return_value = None
        popen.side_effect = [imou, catalogo, reemplazo]
        supervisor = SupervisorPuentes()
        supervisor._revisar()
        supervisor._revisar()
        self.assertEqual(popen.call_count, 2)
        imou.poll.return_value = 1
        supervisor._revisar()
        self.assertEqual(popen.call_count, 3)
        self.assertIs(supervisor.procesos[28766], reemplazo)
        self.assertIs(supervisor.procesos[28768], catalogo)

    @patch('camaras.supervisor_puentes.subprocess.Popen')
    @patch('camaras.supervisor_puentes.puerto_en_uso', return_value=True)
    def test_no_inicia_si_el_puerto_ya_esta_en_uso(self, ocupado, popen):
        SupervisorPuentes()._revisar()
        popen.assert_not_called()

    @patch('camaras.supervisor_puentes.Path.read_text', side_effect=OSError)
    def test_cierra_solo_procesos_que_inicio(self, archivo):
        proceso = MagicMock()
        proceso.poll.return_value = None
        supervisor = SupervisorPuentes()
        supervisor.procesos[28766] = proceso
        supervisor.cerrar()
        proceso.terminate.assert_called_once()
        proceso.wait.assert_called_once()
