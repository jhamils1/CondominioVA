from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.test import SimpleTestCase, override_settings
from rest_framework.test import APIRequestFactory, force_authenticate

from .api_imou_local import (ExclusionImouRemota, ImouFotogramaLocal, PuenteImouInterno,
                             exclusion_remota, obtener_fotograma, obtener_fotograma_remoto)


class ImouLocalTests(SimpleTestCase):
    def test_solicitud_sin_clave_no_depende_de_archivo_del_puente(self):
        with patch.object(Path, 'read_text', side_effect=OSError('sin archivo')) as lectura:
            request = APIRequestFactory().get('/', REMOTE_ADDR='127.0.0.1')
            self.assertEqual(PuenteImouInterno.as_view()(request).status_code, 403)
            lectura.assert_not_called()

    @override_settings(IMOU_REMOTA_ACTIVA=True, VISION_PC_URL='https://example.test', VISION_PC_TOKEN='x' * 43)
    def test_exclusion_remota_rechaza_sesion_invalida_sin_llamar_pasarela(self):
        request = APIRequestFactory().post('/', REMOTE_ADDR='192.0.2.4', HTTP_X_IMOU_SESSION='invalida')
        request.user = SimpleNamespace(pk=91)
        with patch('seguridad_IA.api_imou_local.requests.post') as peticion:
            self.assertFalse(exclusion_remota(request, 'adquirir'))
            peticion.assert_not_called()

    @override_settings(IMOU_REMOTA_ACTIVA=True, VISION_PC_URL='https://example.test', VISION_PC_TOKEN='x' * 43)
    def test_exclusion_remota_envia_titular_vinculado_al_usuario(self):
        request = APIRequestFactory().post('/', REMOTE_ADDR='192.0.2.4', HTTP_X_IMOU_SESSION='a' * 32)
        request.user = SimpleNamespace(pk=91)
        with patch('seguridad_IA.api_imou_local.requests.post') as peticion:
            respuesta = peticion.return_value.__enter__.return_value
            respuesta.status_code = 200
            respuesta.iter_content.return_value = [b'{"concedido":true}']
            self.assertTrue(exclusion_remota(request, 'adquirir'))
            primer_titular = peticion.call_args.kwargs['json']['titular']
            request.user.pk = 92
            self.assertTrue(exclusion_remota(request, 'adquirir'))
            self.assertNotEqual(primer_titular, peticion.call_args.kwargs['json']['titular'])
            self.assertFalse(peticion.call_args.kwargs['allow_redirects'])

    @override_settings(IMOU_REMOTA_ACTIVA=True)
    def test_control_remoto_solo_administrador(self):
        for role, esperado in [('administrador', 200), ('guardia', 403), ('propietario', 403)]:
            with self.subTest(role=role), patch('administracion.access.effective_role', return_value=role), \
                 patch('seguridad_IA.api_imou_local.exclusion_remota', return_value=True) as control:
                request = APIRequestFactory().post('/', {'accion': 'adquirir'}, format='json', REMOTE_ADDR='192.0.2.4')
                force_authenticate(request, user=SimpleNamespace(is_authenticated=True, pk=91))
                response = ExclusionImouRemota.as_view()(request)
                self.assertEqual(response.status_code, esperado)
                self.assertEqual(control.called, esperado == 200)
    def test_puente_interno_exige_loopback_y_clave(self):
        for direccion, clave, esperado in [('127.0.0.1', 'x' * 43, 200),
                                           ('127.0.0.1', 'incorrecta', 403),
                                           ('192.0.2.4', 'x' * 43, 403)]:
            with self.subTest(direccion=direccion, esperado=esperado), \
                 patch.object(Path, 'read_text', return_value='x' * 43), \
                 patch('seguridad_IA.api_imou_local.obtener_fotograma', return_value=(200, b'\xff\xd8\xffimagen')) as captura:
                request = APIRequestFactory().get('/', REMOTE_ADDR=direccion, HTTP_AUTHORIZATION='Bearer ' + clave)
                response = PuenteImouInterno.as_view()(request)
                self.assertEqual(response.status_code, esperado)
                self.assertEqual(captura.called, esperado == 200)

    @override_settings(IMOU_REMOTA_ACTIVA=True)
    def test_remoto_exige_administrador(self):
        for role, expected in [('administrador', 200), ('guardia', 403), ('propietario', 403)]:
            with self.subTest(role=role), \
                 patch('administracion.access.effective_role', return_value=role), \
                 patch('seguridad_IA.api_imou_local.obtener_fotograma_remoto', return_value=(200, b'\xff\xd8\xffimagen')) as captura:
                request = APIRequestFactory().post('/', REMOTE_ADDR='192.0.2.4')
                force_authenticate(request, user=SimpleNamespace(is_authenticated=True, pk=91))
                response = ImouFotogramaLocal.as_view()(request)
                self.assertEqual(response.status_code, expected)
                self.assertEqual(captura.called, expected == 200)

    @override_settings(VISION_PC_URL='http://example.test', VISION_PC_TOKEN='x' * 43)
    def test_remoto_exige_https(self):
        with patch('seguridad_IA.api_imou_local.requests.get') as solicitud:
            self.assertEqual(obtener_fotograma_remoto(), (503, b''))
            solicitud.assert_not_called()

    @override_settings(VISION_PC_URL='https://example.test', VISION_PC_TOKEN='x' * 43)
    def test_remoto_rechaza_error_html_y_respuesta_grande(self):
        for contenido in (b'<html>error</html>', b'\xff\xd8\xff' + b'x' * (1024 * 1024)):
            with self.subTest(tamano=len(contenido)), patch('seguridad_IA.api_imou_local.requests.get') as solicitud:
                respuesta = solicitud.return_value.__enter__.return_value
                respuesta.status_code = 200
                respuesta.iter_content.return_value = [contenido]
                self.assertEqual(obtener_fotograma_remoto(), (503, b''))
                self.assertFalse(solicitud.call_args.kwargs['allow_redirects'])

    @override_settings(VISION_PC_URL='https://example.test', VISION_PC_TOKEN='x' * 43)
    def test_remoto_acepta_imagen_y_no_guarda_cache(self):
        with patch('seguridad_IA.api_imou_local.requests.get') as solicitud:
            respuesta = solicitud.return_value.__enter__.return_value
            respuesta.status_code = 200
            respuesta.iter_content.return_value = [b'\xff\xd8\xffimagen']
            self.assertEqual(obtener_fotograma_remoto(), (200, b'\xff\xd8\xffimagen'))

    def test_roles_y_conexion_local(self):
        for role, ip, expected in [
            ('administrador', '127.0.0.1', 200), ('guardia', '::1', 403),
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
                 patch('seguridad_IA.api_imou_local.fuente_monitor', return_value=None), \
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

    def test_fuente_catalogo_exige_puente_nuevo_y_no_filtra_clave(self):
        datos = {'ip': '192.168.10.9', 'puerto': 554, 'ruta': '/video', 'usuario': 'usuario', 'clave': 'clave-ficticia'}
        with (patch.object(Path, 'read_text', return_value='x' * 43),
              patch('seguridad_IA.api_imou_local.fuente_monitor', return_value=datos),
              patch('seguridad_IA.api_imou_local.http.client.HTTPConnection') as connect):
            conn = connect.return_value
            conn.getresponse.return_value = SimpleNamespace(status=404, read=MagicMock(return_value=b''))
            self.assertEqual(obtener_fotograma(), (503, b''))
            self.assertEqual(conn.request.call_args.args[1], '/fotograma-catalogo')
