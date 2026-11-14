from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, override_settings
from rest_framework.test import APIRequestFactory, force_authenticate

from .views import AlprScanView


@override_settings(PLATE_TOKEN='ficticio', PLATE_REGIONS='bo')
class CoincidenciasPlacaTests(SimpleTestCase):
    def consultar(self, candidatos):
        imagen = SimpleUploadedFile('prueba.jpg', b'imagen-ficticia', content_type='image/jpeg')
        request = APIRequestFactory().post('/alpr/', {'upload': imagen}, format='multipart')
        force_authenticate(request, user=SimpleNamespace(is_authenticated=True))
        respuesta_externa = SimpleNamespace(status_code=200, json=lambda: {'results': [{'plate': 'abc123', 'score': .9}]})
        consulta = MagicMock()
        consulta.select_related.return_value.__getitem__.return_value = candidatos
        with (patch('administracion.access.effective_role', return_value='guardia'),
              patch('seguridad_IA.views.requests.post', return_value=respuesta_externa),
              patch('seguridad_IA.views.Vehiculo.objects.filter', return_value=consulta),
              patch('seguridad_IA.views.LecturaPlaca.objects.create') as crear,
              patch('seguridad_IA.views.LecturaPlacaSerializer') as lectura,
              patch('residencial.serializers.serializersVehiculo.VehiculoSerializer') as vehiculo):
            lectura.return_value.data = {}
            vehiculo.return_value.data = {'id': 1}
            response = AlprScanView.as_view()(request)
            return response.data, crear.call_args.kwargs

    def test_unica_coincidencia(self):
        candidato = object()
        respuesta, guardado = self.consultar([candidato])
        self.assertTrue(respuesta['match'])
        self.assertFalse(respuesta['coincidencia_ambigua'])
        self.assertIs(guardado['vehiculo'], candidato)

    def test_duplicados_no_identifican_persona(self):
        respuesta, guardado = self.consultar([object(), object()])
        self.assertFalse(respuesta['match'])
        self.assertTrue(respuesta['coincidencia_ambigua'])
        self.assertIsNone(guardado['vehiculo'])

    def test_sin_coincidencia(self):
        respuesta, guardado = self.consultar([])
        self.assertFalse(respuesta['match'])
        self.assertFalse(respuesta['coincidencia_ambigua'])
        self.assertIsNone(guardado['vehiculo'])
