from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from camaras.models import Camara
from .api_piscina import ConfiguracionMascota, ConfiguracionPiscina
from .models import HistorialReglaMascota


class MascotaTests(TestCase):
    def setUp(self):
        self.usuario = get_user_model().objects.create_user(username='admin-mascota-ficticio')
        self.camara = Camara.objects.create(nombre='Prueba', tipo='RED', direccion_ip='192.168.1.6', puerto_rtsp=554)
        self.fabrica = APIRequestFactory()
        self.puntos = [{'x': .1, 'y': .1}, {'x': .9, 'y': .1}, {'x': .5, 'y': .9}]

    def llamar(self, metodo, rol, fuente, datos=None, vista=ConfiguracionMascota):
        request = getattr(self.fabrica, metodo)('/regla/', data=datos, format='json', REMOTE_ADDR='127.0.0.1')
        force_authenticate(request, user=self.usuario)
        with patch('administracion.access.effective_role', return_value=rol):
            return vista.as_view()(request, fuente=fuente)

    def test_independencia_camara_regla_y_permisos(self):
        datos = {'puntos': self.puntos, 'segundos': 0, 'automatico': True, 'version': None}
        self.assertEqual(self.llamar('put', 'guardia', 'imou', datos).status_code, 403)
        self.assertEqual(self.llamar('get', 'propietario', 'imou').status_code, 403)
        self.assertEqual(self.llamar('get', 'administrador', 'imou').data['segundos'], 0)
        self.assertEqual(self.llamar('put', 'administrador', 'imou', datos).status_code, 200)
        self.assertEqual(self.llamar('get', 'administrador', f'catalogo-{self.camara.pk}').data['puntos'], [])
        self.assertEqual(self.llamar('get', 'administrador', 'imou', vista=ConfiguracionPiscina).data['puntos'], [])
        self.assertEqual(self.llamar('put', 'administrador', 'imou', datos).status_code, 409)
        self.assertEqual(HistorialReglaMascota.objects.count(), 1)

    def test_rechaza_datos_invalidos(self):
        base = {'puntos': [], 'segundos': 0, 'automatico': True, 'version': None}
        self.assertEqual(self.llamar('put', 'administrador', 'imou', base).status_code, 400)
        base.update(puntos=self.puntos, segundos=True)
        self.assertEqual(self.llamar('put', 'administrador', 'imou', base).status_code, 400)
