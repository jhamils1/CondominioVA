"""Pruebas con modelo e imágenes simuladas; no usa cámaras ni servicios externos."""
import http.client
import json
import threading
import unittest
from types import SimpleNamespace

import cv2
import numpy as np

from camara_remota import ProcesadorRemoto, ServidorLocal


class ServicioRemotoTests(unittest.TestCase):
    def setUp(self):
        self.servidor = ServidorLocal(('127.0.0.1', 0), ProcesadorRemoto)
        self.servidor.token = 'a' * 43
        salida = SimpleNamespace(xyxy=[[1, 2, 15, 18]], data={'class_name': ['person']}, confidence=[0.9])
        self.servidor.modelo = SimpleNamespace(predict=lambda imagen, threshold: salida)
        self.hilo = threading.Thread(target=self.servidor.serve_forever, daemon=True)
        self.hilo.start()

    def tearDown(self):
        self.servidor.shutdown()
        self.hilo.join(timeout=5)
        self.servidor.server_close()

    def llamar(self, metodo, ruta, cuerpo=None, autorizado=True):
        conexion = http.client.HTTPConnection('127.0.0.1', self.servidor.server_port, timeout=5)
        cabeceras = {'Authorization': 'Bearer ' + ('a' * 43 if autorizado else 'b' * 43)}
        try:
            conexion.request(metodo, ruta, body=cuerpo, headers=cabeceras)
            respuesta = conexion.getresponse()
            return respuesta.status, json.loads(respuesta.read())
        finally:
            conexion.close()

    def test_autenticacion_y_deteccion(self):
        self.assertEqual(self.llamar('GET', '/estado', autorizado=False)[0], 403)
        status, estado = self.llamar('GET', '/estado')
        self.assertEqual(status, 200)
        self.assertEqual(estado['modelo'], 'RF-DETR Nano')
        ok, imagen = cv2.imencode('.jpg', np.zeros((24, 24, 3), dtype=np.uint8))
        self.assertTrue(ok)
        self.assertEqual(self.llamar('POST', '/detectar', imagen.tobytes(), autorizado=False)[0], 403)
        status, resultado = self.llamar('POST', '/detectar', imagen.tobytes())
        self.assertEqual(status, 200)
        self.assertEqual(resultado['detecciones'][0]['clase'], 'person')
        self.assertEqual(self.llamar('POST', '/detectar', b'no-es-imagen')[0], 400)


if __name__ == '__main__':
    unittest.main()
