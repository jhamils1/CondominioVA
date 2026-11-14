import http.client
import json
import threading
import unittest
from unittest.mock import patch

import camaras_catalogo as puente


class FuenteFicticia:
    def __init__(self, cv):
        self.ultima_peticion, self.hilo = 0, None

    def solicitar(self, url):
        import time
        self.ultima_peticion = time.monotonic()
        return 200, b'\xff\xd8\xff' + url.encode()

    def cerrar(self):
        pass


class PuenteCatalogoTests(unittest.TestCase):
    def test_autenticacion_y_fuentes_separadas(self):
        servidor = puente.Servidor(('127.0.0.1', 0), puente.Peticion)
        servidor.clave, servidor.cv, servidor.fuentes = 'token-ficticio', None, {}
        hilo = threading.Thread(target=servidor.serve_forever, daemon=True)
        hilo.start()
        fuente = {'ip': '192.168.1.8', 'puerto': 554, 'ruta': '/video', 'usuario': 'user', 'clave': 'pass'}
        def peticion(pk, token):
            conn = http.client.HTTPConnection('127.0.0.1', servidor.server_port, timeout=3)
            try:
                conn.request('POST', '/fotograma', json.dumps({'id': pk, 'fuente': fuente}),
                             {'Authorization': 'Bearer ' + token})
                respuesta = conn.getresponse()
                return respuesta.status, respuesta.read()
            finally:
                conn.close()
        try:
            with patch.object(puente, 'FuenteImou', FuenteFicticia):
                self.assertEqual(peticion(1, 'malo')[0], 403)
                self.assertEqual(peticion(1, 'token-ficticio')[0], 200)
                self.assertEqual(peticion(2, 'token-ficticio')[0], 200)
                self.assertIsNot(servidor.fuentes[1], servidor.fuentes[2])
        finally:
            servidor.shutdown()
            servidor.server_close()
            hilo.join()


if __name__ == '__main__':
    unittest.main()
