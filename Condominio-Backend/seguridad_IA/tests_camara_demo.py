from types import SimpleNamespace
from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from seguridad_IA.api_camara_demo import CamaraAnalizarDemo, CamaraEstadoDemo


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
