from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from .api_imou_local import ImouFotogramaLocal, obtener_fotograma


class ImouLocalTests(SimpleTestCase):
    def test_roles_y_conexion_local(self):
        for role, ip, expected in [
            ('administrador', '127.0.0.1', 200), ('guardia', '::1', 200),
            ('propietario', '127.0.0.1', 403), ('inquilino', '127.0.0.1', 403),
            (None, '127.0.0.1', 403), ('administrador', '192.0.2.4', 403),
        ]:
            with self.subTest(role=role, ip=ip), \
                 patch('administracion.access.effective_role', return_value=role), \
                 patch('seguridad_IA.api_imou_local.obtener_fotograma', return_value=(200, b'\xff\xd8\xfffake')) as bridge:
                request = APIRequestFactory().post('/vision-imou/fotograma/', REMOTE_ADDR=ip)
                force_authenticate(request, user=SimpleNamespace(is_authenticated=True))
                response = ImouFotogramaLocal.as_view()(request)
                self.assertEqual(response.status_code, expected)
                if expected == 403:
                    bridge.assert_not_called()
                else:
                    self.assertEqual(response['Cache-Control'], 'no-store, private')

    def test_anonimo_no_abre_camara(self):
        with patch('seguridad_IA.api_imou_local.obtener_fotograma') as bridge:
            response = ImouFotogramaLocal.as_view()(APIRequestFactory().post('/'))
            self.assertIn(response.status_code, (401, 403))
            bridge.assert_not_called()

    def test_contrato_y_limite_de_respuesta(self):
        for status, data, expected in [(200, b'\xff\xd8\xfffoto', 200),
                                       (202, b'', 202), (403, b'privado', 503),
                                       (200, b'<html>error</html>', 503),
                                       (200, b'\xff\xd8\xff' + b'x' * 1024 * 1024, 503)]:
            with self.subTest(status=status, size=len(data)), \
                 patch.object(Path, 'read_text', return_value='x' * 43), \
                 patch('seguridad_IA.api_imou_local.http.client.HTTPConnection') as connect:
                conn = connect.return_value
                conn.getresponse.return_value = SimpleNamespace(status=status, read=MagicMock(return_value=data))
                result = obtener_fotograma()
                self.assertEqual(result[0], expected)
                if expected != 200:
                    self.assertEqual(result[1], b'')
                conn.close.assert_called_once()

    def test_sin_servicio_no_filtra_errores(self):
        with patch.object(Path, 'read_text', side_effect=OSError('dato privado')):
            self.assertEqual(obtener_fotograma(), (503, b''))
