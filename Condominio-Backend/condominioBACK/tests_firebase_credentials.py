"""Comprobaciones sin red ni credenciales reales."""
from pathlib import Path
from unittest import TestCase
from unittest.mock import Mock

from .firebase_credentials import seleccionar_credencial


class SeleccionCredencialTests(TestCase):
    def setUp(self):
        self.provider = Mock()
        self.provider.Certificate.return_value = object()
        self.base = Path('servidor')

    @staticmethod
    def config(values):
        return lambda key, default=None: values.get(key, default)

    def test_json_tiene_prioridad_sobre_ruta(self):
        config = self.config({'FIREBASE_CREDENTIALS_JSON': '{"type":"example"}',
                              'FIREBASE_CREDENTIALS_PATH': 'no-usar.json'})
        seleccionar_credencial(config, self.provider, self.base)
        self.provider.Certificate.assert_called_once_with({'type': 'example'})

    def test_ruta_relativa_desde_backend(self):
        seleccionar_credencial(self.config({'FIREBASE_CREDENTIALS_PATH': 'privado.json'}),
                                self.provider, self.base)
        self.provider.Certificate.assert_called_once_with(str(self.base / 'privado.json'))

    def test_ruta_absoluta(self):
        path = Path.cwd() / 'privado.json'
        seleccionar_credencial(self.config({'FIREBASE_CREDENTIALS_PATH': str(path)}),
                                self.provider, self.base)
        self.provider.Certificate.assert_called_once_with(str(path))

    def test_sin_configuracion_mantiene_la_ruta_previa(self):
        seleccionar_credencial(self.config({}), self.provider, self.base)
        self.provider.Certificate.assert_called_once_with('smart-condominiun-firebase-adminsdk-fbsvc-30dd8b557d.json')

    def test_json_invalido_no_recurre_silenciosamente_a_otra_credencial(self):
        with self.assertRaises(ValueError):
            seleccionar_credencial(self.config({'FIREBASE_CREDENTIALS_JSON': '{incorrecto',
                                                  'FIREBASE_CREDENTIALS_PATH': 'privado.json'}),
                                    self.provider, self.base)
        self.provider.Certificate.assert_not_called()
