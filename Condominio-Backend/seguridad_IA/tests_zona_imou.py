from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from .api_zona_imou import ConfiguracionZonaImou
from .models import HistorialZonaImou, ZonaImou


class ZonaImouTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='operador-ficticio')
        self.factory = APIRequestFactory()
        self.puntos = [{'x': .1, 'y': .1}, {'x': .8, 'y': .1}, {'x': .5, 'y': .8}]

    def llamar(self, metodo, rol, datos=None):
        request = getattr(self.factory, metodo)('/zona/', data=datos, format='json')
        force_authenticate(request, user=self.user)
        with patch('administracion.access.effective_role', return_value=rol):
            return ConfiguracionZonaImou.as_view()(request)

    def test_admin_guarda_guardia_lee_y_no_modifica(self):
        resultado = self.llamar('put', 'administrador', {'puntos': self.puntos, 'segundos': 5, 'automatico': True})
        self.assertEqual(resultado.status_code, 200)
        self.assertEqual(self.llamar('get', 'guardia').data['puntos'], self.puntos)
        self.assertEqual(self.llamar('put', 'guardia', {'puntos': [], 'segundos': 5}).status_code, 403)
        self.assertEqual(self.llamar('get', 'propietario').status_code, 403)
        self.assertEqual(self.llamar('get', None).status_code, 403)
        self.assertEqual(self.llamar('put', 'inquilino', {'puntos': [], 'segundos': 5, 'automatico': False}).status_code, 403)
        self.assertEqual(ZonaImou.objects.get(pk=1).puntos, self.puntos)
        self.assertEqual(HistorialZonaImou.objects.count(), 1)
        self.assertEqual(self.llamar('put', 'administrador', {'puntos': [], 'segundos': 5, 'automatico': False}).status_code, 200)
        self.assertEqual(HistorialZonaImou.objects.count(), 2)

    def test_valida_poligono_y_tiempo(self):
        for puntos, segundos in [([], True), (self.puntos, 1), (self.puntos, 2.5),
                                  ([{'x': 0, 'y': 0}] * 3, 5),
                                  ([{'x': 0, 'y': 0}, {'x': 1, 'y': 1},
                                    {'x': 0, 'y': 1}, {'x': 1, 'y': 0}], 5)]:
            self.assertEqual(self.llamar('put', 'administrador', {'puntos': puntos, 'segundos': segundos, 'automatico': False}).status_code, 400)
        self.assertFalse(ZonaImou.objects.exists())
        self.assertFalse(HistorialZonaImou.objects.exists())

    def test_no_permite_activar_sin_zona(self):
        self.assertEqual(self.llamar('put', 'administrador', {'puntos': [], 'segundos': 5, 'automatico': True}).status_code, 400)
        self.assertFalse(HistorialZonaImou.objects.exists())
