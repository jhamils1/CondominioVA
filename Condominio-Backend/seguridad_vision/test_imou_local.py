"""Pruebas de ciclo de vida sin cámara real ni credenciales."""
import threading
import time
from types import SimpleNamespace
import unittest
from unittest.mock import patch

from imou_local import FuenteImou


class Jpeg(bytes):
    def tobytes(self):
        return bytes(self)


class CapturaFalsa:
    def __init__(self, falla=False):
        self.liberada = threading.Event()
        self.falla = falla

    def isOpened(self):
        return not self.falla

    def read(self):
        time.sleep(.01)
        return True, SimpleNamespace(shape=(480, 640, 3))

    def release(self):
        self.liberada.set()


def cv_falso(captura):
    return SimpleNamespace(VideoCapture=lambda *args: captura, CAP_FFMPEG=0,
                           CAP_PROP_OPEN_TIMEOUT_MSEC=1, CAP_PROP_READ_TIMEOUT_MSEC=2,
                           IMWRITE_JPEG_QUALITY=3,
                           imencode=lambda *args: (True, Jpeg(b'\xff\xd8\xfffake')))


class FuenteTests(unittest.TestCase):
    def test_no_abre_hasta_solicitud_y_libera_por_inactividad(self):
        captura = CapturaFalsa()
        fuente = FuenteImou(cv_falso(captura), lambda: 'rtsp://ficticio')
        self.assertIsNone(fuente.hilo)
        with patch('imou_local.INACTIVIDAD', .15):
            try:
                self.assertEqual(fuente.solicitar()[0], 202)
                time.sleep(.05)
                self.assertEqual(fuente.solicitar(), (200, b'\xff\xd8\xfffake'))
                self.assertTrue(captura.liberada.wait(2))
                fuente.hilo.join(1)
                self.assertIsNone(fuente.imagen)
            finally:
                fuente.cerrar()

    def test_fallo_de_conexion_no_entrega_imagen(self):
        captura = CapturaFalsa(falla=True)
        fuente = FuenteImou(cv_falso(captura), lambda: 'rtsp://ficticio')
        try:
            fuente.solicitar()
            fuente.hilo.join(1)
            self.assertEqual(fuente.solicitar(), (503, b''))
            self.assertTrue(captura.liberada.is_set())
        finally:
            fuente.cerrar()
