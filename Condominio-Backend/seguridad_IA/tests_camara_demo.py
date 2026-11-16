from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, override_settings
from rest_framework.test import APIRequestFactory, force_authenticate
from seguridad_IA.api_camara_demo import CamaraAnalizarDemo, CamaraEstadoDemo, solicitar_remoto


class CamaraDemoTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def request(self, role, data=None):
        request = (self.factory.get("/estado/") if data is None else
                   self.factory.post("/analizar/", data, format="multipart"))
        if role:
            force_authenticate(request, user=SimpleNamespace(is_authenticated=True))
        return request

    def test_permisos_y_estado(self):
        with patch("administracion.access.effective_role", return_value="propietario"), \
             patch("seguridad_IA.api_camara_demo.solicitar_local") as local:
            response = CamaraEstadoDemo.as_view()(self.request("propietario"))
            self.assertEqual(response.status_code, 403)
            local.assert_not_called()
        with patch("administracion.access.effective_role", return_value="guardia"), \
             patch("seguridad_IA.api_camara_demo.solicitar_local", return_value={"disponible": True}):
            response = CamaraEstadoDemo.as_view()(self.request("guardia"))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response["Cache-Control"], "no-store")

    def test_imagen_valida_e_invalida(self):
        with patch("administracion.access.effective_role", return_value="administrador"), \
             patch("seguridad_IA.api_camara_demo.solicitar_local", return_value={"detecciones": []}) as local:
            bad = SimpleUploadedFile("foto.jpg", b"no es jpeg", content_type="image/jpeg")
            response = CamaraAnalizarDemo.as_view()(self.request("administrador", {"imagen": bad}))
            self.assertEqual(response.status_code, 400)
            local.assert_not_called()
            good = SimpleUploadedFile("foto.jpg", b"\xff\xd8\xfffake", content_type="image/jpeg")
            response = CamaraAnalizarDemo.as_view()(self.request("administrador", {"imagen": good}))
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response["Cache-Control"], "no-store")

    def test_rechaza_cliente_no_local(self):
        request = self.request("administrador")
        request.META["REMOTE_ADDR"] = "192.0.2.10"
        with patch("administracion.access.effective_role", return_value="administrador"), \
             patch("seguridad_IA.api_camara_demo.solicitar_local") as local:
            response = CamaraEstadoDemo.as_view()(request)
            self.assertEqual(response.status_code, 403)
            local.assert_not_called()

    def test_seleccion_remota_permisos_y_sin_fallback(self):
        request = self.factory.get('/estado/?procesador=remoto')
        force_authenticate(request, user=SimpleNamespace(is_authenticated=True))
        with patch('administracion.access.effective_role', return_value='guardia'), \
             patch('seguridad_IA.api_camara_demo.solicitar_remoto') as remoto:
            self.assertEqual(CamaraEstadoDemo.as_view()(request).status_code, 403)
            remoto.assert_not_called()
        with patch('administracion.access.effective_role', return_value='administrador'), \
             patch('seguridad_IA.api_camara_demo.solicitar_remoto', return_value=None), \
             patch('seguridad_IA.api_camara_demo.solicitar_local') as local:
            self.assertEqual(CamaraEstadoDemo.as_view()(request).status_code, 503)
            local.assert_not_called()
        with patch('administracion.access.effective_role', return_value='administrador'), \
             patch('seguridad_IA.api_camara_demo.solicitar_remoto', return_value={'disponible': True}):
            self.assertEqual(CamaraEstadoDemo.as_view()(request).data['procesador'], 'remoto')
        archivo = SimpleUploadedFile('foto.jpg', b'\xff\xd8\xfffake', content_type='image/jpeg')
        request = self.factory.post('/analizar/?procesador=remoto', {'imagen': archivo}, format='multipart')
        force_authenticate(request, user=SimpleNamespace(is_authenticated=True))
        with patch('administracion.access.effective_role', return_value='administrador'), \
             patch('seguridad_IA.api_camara_demo.solicitar_remoto', return_value={'detecciones': []}) as remoto, \
             patch('seguridad_IA.api_camara_demo.solicitar_local') as local:
            self.assertEqual(CamaraAnalizarDemo.as_view()(request).status_code, 200)
            remoto.assert_called_once_with('/detectar', b'\xff\xd8\xfffake')
            local.assert_not_called()

    @override_settings(VISION_REMOTA_PROVEEDOR='propio', VISION_REMOTA_URL='https://ia.example.test', VISION_REMOTA_TOKEN='a' * 43)
    def test_contrato_remoto_autenticado_y_acotado(self):
        respuesta = MagicMock(status_code=200)
        respuesta.__enter__.return_value = respuesta
        respuesta.iter_content.return_value = [b'{"disponible":true,"contrato":"condominio-vision-v1","modelo":"RF-DETR Nano"}']
        with patch('seguridad_IA.api_camara_demo.requests.request', return_value=respuesta) as llamada:
            self.assertTrue(solicitar_remoto('/estado')['disponible'])
            self.assertFalse(llamada.call_args.kwargs['allow_redirects'])
            self.assertEqual(llamada.call_args.kwargs['timeout'], (5, 20))
        respuesta.iter_content.return_value = [b'{"detecciones":[{"clase":"person","confianza":0.9,"caja":[10,20,30,40]}]}']
        with patch('seguridad_IA.api_camara_demo.requests.request', return_value=respuesta):
            self.assertEqual(solicitar_remoto('/detectar', b'imagen')['detecciones'][0]['clase'], 'person')
        respuesta.iter_content.return_value = [b'{"detecciones":[{"clase":"person","confianza":9,"caja":[10,20,30,40]}]}']
        with patch('seguridad_IA.api_camara_demo.requests.request', return_value=respuesta):
            self.assertIsNone(solicitar_remoto('/detectar', b'imagen'))
        respuesta.iter_content.return_value = [b'x' * 65537]
        with patch('seguridad_IA.api_camara_demo.requests.request', return_value=respuesta):
            self.assertIsNone(solicitar_remoto('/estado'))

    @override_settings(VISION_REMOTA_PROVEEDOR='propio', VISION_REMOTA_URL='http://ia.example.test', VISION_REMOTA_TOKEN='a' * 43)
    def test_rechaza_destino_sin_https(self):
        with patch('seguridad_IA.api_camara_demo.requests.request') as solicitud:
            self.assertIsNone(solicitar_remoto('/estado'))
            solicitud.assert_not_called()

    @override_settings(VISION_REMOTA_PROVEEDOR='roboflow', ROBOFLOW_API_KEY='clave-prueba')
    def test_roboflow_conversion_y_autenticacion(self):
        respuesta = MagicMock(status_code=200)
        respuesta.__enter__.return_value = respuesta
        respuesta.iter_content.return_value = [b'{"predictions":[{"class":"person","confidence":0.9,"x":30,"y":40,"width":20,"height":10}]}']
        with patch('seguridad_IA.api_camara_demo.requests.post', return_value=respuesta) as post:
            self.assertFalse(solicitar_remoto('/estado')['verificado'])
            resultado = solicitar_remoto('/detectar', b'foto')
            self.assertEqual(resultado['detecciones'][0]['caja'], [20, 35, 40, 45])
            self.assertEqual(resultado['detecciones'][0]['clase'], 'person')
            self.assertEqual(post.call_args.kwargs['headers']['Authorization'], 'Bearer clave-prueba')
            self.assertFalse(post.call_args.kwargs['allow_redirects'])
            self.assertEqual(post.call_args.args[0], 'https://detect.roboflow.com/coco/38')
        respuesta.iter_content.return_value = [b'{"predictions":[{"class":"person","confidence":0.9,"x":0,"y":0,"width":-1,"height":1}]}']
        with patch('seguridad_IA.api_camara_demo.requests.post', return_value=respuesta):
            self.assertIsNone(solicitar_remoto('/detectar', b'foto'))

    @override_settings(VISION_REMOTA_PROVEEDOR='roboflow', ROBOFLOW_API_KEY='')
    def test_roboflow_sin_clave_no_conecta(self):
        with patch('seguridad_IA.api_camara_demo.requests.post') as post:
            self.assertIsNone(solicitar_remoto('/estado'))
            self.assertIsNone(solicitar_remoto('/detectar', b'foto'))
            post.assert_not_called()
