from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from camaras.models import Camara
from .api_piscina import ConfiguracionPiscina
from .models import HistorialReglaPiscina


class PiscinaTests(TestCase):
    def setUp(self):
        self.usuario = get_user_model().objects.create_user(username='admin-piscina-ficticio')
        self.camara = Camara.objects.create(nombre='Prueba', tipo='RED', direccion_ip='192.168.1.6', puerto_rtsp=554)
        self.fabrica = APIRequestFactory()
        self.puntos = [{'x': .1, 'y': .1}, {'x': .9, 'y': .1}, {'x': .5, 'y': .9}]

    def llamar(self, metodo, rol, fuente, datos=None, ip='127.0.0.1'):
        request = getattr(self.fabrica, metodo)('/piscina/', data=datos, format='json', REMOTE_ADDR=ip)
        force_authenticate(request, user=self.usuario)
        with patch('administracion.access.effective_role', return_value=rol):
            return ConfiguracionPiscina.as_view()(request, fuente=fuente)

    def test_configuracion_independiente_y_permisos(self):
        datos = {'puntos': self.puntos, 'segundos': 10, 'automatico': True, 'version': None}
        self.assertEqual(self.llamar('put', 'guardia', 'imou', datos).status_code, 403)
        self.assertEqual(self.llamar('get', 'propietario', 'imou').status_code, 403)
        self.assertEqual(self.llamar('get', 'administrador', 'imou', ip='192.168.1.20').status_code, 403)
        guardada = self.llamar('put', 'administrador', 'imou', datos)
        self.assertEqual(guardada.status_code, 200)
        self.assertEqual(self.llamar('get', 'guardia', f'catalogo-{self.camara.pk}').data['puntos'], [])
        self.assertEqual(self.llamar('put', 'administrador', 'imou', datos).status_code, 409)
        self.assertEqual(HistorialReglaPiscina.objects.count(), 1)
        self.assertEqual(self.llamar('get', 'administrador', 'catalogo-999999').status_code, 404)
        segunda = self.llamar('put', 'administrador', f'catalogo-{self.camara.pk}', datos)
        self.assertEqual(segunda.status_code, 200)
        self.assertEqual(HistorialReglaPiscina.objects.count(), 2)

    def test_rechaza_zona_y_tiempo_invalidos(self):
        base = {'puntos': [], 'segundos': 10, 'automatico': True, 'version': None}
        self.assertEqual(self.llamar('put', 'administrador', 'imou', base).status_code, 400)
        base.update(puntos=self.puntos, segundos=True)
        self.assertEqual(self.llamar('put', 'administrador', 'imou', base).status_code, 400)
