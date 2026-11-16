from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from camaras.models import Camara, MonitorImou
from .api_zona_camara import ConfiguracionZonaCamara
from .models import HistorialZonaCamara, ZonaCamara, ZonaImou


class ZonaCamaraTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='zona-ficticia')
        self.factory = APIRequestFactory()
        self.a = Camara.objects.create(nombre='A', tipo='RED', direccion_ip='192.168.1.3', puerto_rtsp=554)
        self.b = Camara.objects.create(nombre='B', tipo='RED', direccion_ip='192.168.1.4', puerto_rtsp=554)
        self.puntos = [{'x': .1, 'y': .1}, {'x': .8, 'y': .1}, {'x': .5, 'y': .8}]

    def llamar(self, metodo, rol, pk, datos=None, ip='127.0.0.1'):
        request = getattr(self.factory, metodo)('/zona/', data=datos, format='json', REMOTE_ADDR=ip)
        force_authenticate(request, user=self.user)
        with patch('administracion.access.effective_role', return_value=rol):
            return ConfiguracionZonaCamara.as_view()(request, pk=pk)

    def test_separacion_permisos_y_auditoria(self):
        datos = {'puntos': self.puntos, 'segundos': 5, 'version': None}
        self.assertEqual(self.llamar('put', 'guardia', self.a.pk, datos).status_code, 403)
        self.assertEqual(self.llamar('get', 'propietario', self.a.pk).status_code, 403)
        self.assertEqual(self.llamar('get', 'guardia', self.a.pk, ip='192.168.1.2').status_code, 403)
        guardada = self.llamar('put', 'administrador', self.a.pk, datos)
        self.assertEqual(guardada.status_code, 200)
        self.assertEqual(self.llamar('get', 'guardia', self.a.pk).data['puntos'], self.puntos)
        self.assertEqual(self.llamar('get', 'guardia', self.b.pk).data['puntos'], [])
        self.assertEqual(HistorialZonaCamara.objects.count(), 1)
        self.assertEqual(self.llamar('put', 'administrador', self.a.pk, datos).status_code, 409)
        self.assertEqual(self.llamar('put', 'administrador', self.a.pk, {'puntos': [], 'segundos': 5, 'version': guardada.data['version']}).status_code, 200)
        self.assertEqual(ZonaCamara.objects.get(camara=self.a).puntos, [])
        self.assertEqual(HistorialZonaCamara.objects.count(), 2)

    def test_validacion_y_preservacion_imou(self):
        self.assertEqual(self.llamar('put', 'administrador', self.b.pk, {'puntos': self.puntos, 'segundos': True, 'version': None}).status_code, 400)
        self.assertEqual(self.llamar('put', 'administrador', self.b.pk, {'puntos': [{'x': 0, 'y': 0}] * 3, 'segundos': 5, 'version': None}).status_code, 400)
        ZonaImou.objects.create(pk=1, puntos=self.puntos, segundos=5, automatico=True, actualizado_por=self.user)
        MonitorImou.objects.create(pk=1, camara=self.a)
        self.assertEqual(self.llamar('put', 'administrador', self.a.pk, {'puntos': [], 'segundos': 5, 'version': None}).status_code, 409)
        self.assertEqual(ZonaImou.objects.get(pk=1).puntos, self.puntos)
        self.assertFalse(ZonaCamara.objects.exists())

    def test_registro_automatico_independiente_y_auditado(self):
        datos = {'puntos': self.puntos, 'segundos': 5, 'version': None, 'automatico': True}
        self.assertEqual(self.llamar('put', 'guardia', self.a.pk, datos).status_code, 403)
        guardada = self.llamar('put', 'administrador', self.a.pk, datos)
        self.assertEqual(guardada.status_code, 200)
        self.assertTrue(guardada.data['automatico'])
        self.assertTrue(HistorialZonaCamara.objects.get(camara=self.a).automatico)
        self.assertFalse(self.llamar('get', 'administrador', self.b.pk).data['automatico'])
        invalida = {'puntos': [], 'segundos': 5, 'version': guardada.data['version'], 'automatico': True}
        self.assertEqual(self.llamar('put', 'administrador', self.a.pk, invalida).status_code, 400)
        antigua = {'puntos': self.puntos, 'segundos': 8, 'version': guardada.data['version']}
        self.assertTrue(self.llamar('put', 'administrador', self.a.pk, antigua).data['automatico'])
