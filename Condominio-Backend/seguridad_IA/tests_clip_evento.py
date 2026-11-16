from unittest.mock import patch
import io

import av
from PIL import Image

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from .api_notificaciones import EventoViewSet
from .models import ClipEventoSeguridad, EventoSeguridad
from .clip_en_vivo import codificar_muestras


def clip_ficticio(color=(32, 32, 32), frames=40):
    salida = io.BytesIO()
    with av.open(salida, mode='w', format='webm') as archivo:
        stream = archivo.add_stream('libvpx', rate=10)
        stream.width = 64
        stream.height = 64
        stream.pix_fmt = 'yuv420p'
        for _ in range(frames):
            cuadro = av.VideoFrame.from_image(Image.new('RGB', (64, 64), color))
            for paquete in stream.encode(cuadro):
                archivo.mux(paquete)
        for paquete in stream.encode():
            archivo.mux(paquete)
    return salida.getvalue()


class ClipMonitorTests(TestCase):
    def test_clip_contiene_imagenes_antes_y_despues(self):
        muestras = []
        for i in range(23):
            imagen = io.BytesIO()
            Image.new('RGB', (64, 64), 'red' if i < 11 else 'blue').save(imagen, 'JPEG')
            muestras.append((i / 5, imagen.getvalue()))
        video, _ = codificar_muestras(muestras, 2.2)
        with av.open(io.BytesIO(video), format='webm') as archivo:
            frames = list(archivo.decode(video=0))
        self.assertEqual(len(frames), 48)
        primero = frames[0].to_image().getpixel((32, 32))
        ultimo = frames[-1].to_image().getpixel((32, 32))
        self.assertGreater(primero[0], primero[2])
        self.assertGreater(ultimo[2], ultimo[0])


@override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
class ClipEventoTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='clip-ficticio')
        self.evento = EventoSeguridad.objects.create(origen='IA', categoria='Prueba', descripcion='Prueba', fecha_evento=timezone.now())
        self.factory = APIRequestFactory()

    def llamar(self, method, role, video=None):
        data = {'clip': SimpleUploadedFile('clip.webm', video, content_type='video/webm')} if video is not None else {}
        request = getattr(self.factory, method)('/clip/', data, format='multipart')
        force_authenticate(request, self.user)
        with patch('administracion.access.effective_role', return_value=role), patch('seguridad_IA.api_notificaciones.effective_role', return_value=role):
            return EventoViewSet.as_view({method: 'clip'})(request, pk=self.evento.pk)

    def test_autorizacion_y_idempotencia(self):
        data = clip_ficticio()
        self.assertEqual(self.llamar('post', 'guardia', data).status_code, 403)
        self.assertEqual(self.llamar('post', 'administrador', data).status_code, 201)
        self.assertEqual(self.llamar('post', 'administrador', data).status_code, 200)
        self.assertEqual(self.llamar('post', 'administrador', clip_ficticio((64, 64, 64))).status_code, 409)
        self.assertEqual(self.llamar('get', 'propietario').status_code, 403)
        respuesta = self.llamar('get', 'guardia')
        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.content, data)
        self.assertEqual(respuesta['Cache-Control'], 'private, no-store, max-age=0')
        self.assertEqual(ClipEventoSeguridad.objects.count(), 1)

    def test_rechaza_no_webm_y_tamano_excesivo(self):
        self.assertEqual(self.llamar('post', 'administrador', b'no-es-video').status_code, 400)
        self.assertEqual(self.llamar('post', 'administrador', b'\x1a\x45\xdf\xa3falso').status_code, 400)
        self.assertEqual(self.llamar('post', 'administrador', clip_ficticio(frames=70)).status_code, 400)
        self.assertEqual(self.llamar('post', 'administrador', b'\x1a\x45\xdf\xa3' + b'x' * (2 * 1024 * 1024)).status_code, 400)
        self.assertFalse(ClipEventoSeguridad.objects.exists())
