"""Captura acotada para el monitor independiente; no envía notificaciones."""
from bisect import bisect_left
from collections import deque
from concurrent.futures import ThreadPoolExecutor
from threading import BoundedSemaphore, Event, Lock, Thread
import io
import logging
import time

import av
from django.core.files.base import ContentFile
from django.db import close_old_connections
from PIL import Image

from .clip import procesar_clip
from .models import ClipEventoSeguridad

logger = logging.getLogger(__name__)


def codificar_muestras(muestras, instante):
    seleccion = [(t, imagen) for t, imagen in muestras if instante - 2.3 <= t <= instante + 2.3]
    if len(seleccion) < 4 or seleccion[0][0] > instante - 1.5 or seleccion[-1][0] < instante + 1.5:
        raise ValueError('No hay imágenes suficientes para el clip.')
    tiempos = [item[0] for item in seleccion]
    if any(b - a > 1 for a, b in zip(tiempos, tiempos[1:])):
        raise ValueError('Hay una interrupción en el video.')
    salida = io.BytesIO()
    with Image.open(io.BytesIO(seleccion[0][1])) as primera:
        if not (0 < primera.width <= 1280 and 0 < primera.height <= 1280):
            raise ValueError('Dimensiones de imagen no compatibles.')
        primera.load()
        escala = min(1, 640 / primera.width, 640 / primera.height)
        ancho = max(2, round(primera.width * escala / 2) * 2)
        alto = max(2, round(primera.height * escala / 2) * 2)
    with av.open(salida, mode='w', format='webm') as contenedor:
        stream = contenedor.add_stream('libvpx', rate=12)
        stream.width, stream.height, stream.pix_fmt = ancho, alto, 'yuv420p'
        stream.bit_rate = 600000
        stream.options = {'deadline': 'realtime', 'cpu-used': '5'}
        for i in range(48):
            objetivo = instante - 2 + i / 12
            pos = bisect_left(tiempos, objetivo)
            candidatos = [x for x in (pos - 1, pos) if 0 <= x < len(tiempos)]
            indice = min(candidatos, key=lambda x: abs(tiempos[x] - objetivo))
            with Image.open(io.BytesIO(seleccion[indice][1])) as imagen:
                if not (0 < imagen.width <= 1280 and 0 < imagen.height <= 1280):
                    raise ValueError('Dimensiones de imagen no compatibles.')
                imagen.load()
                frame = av.VideoFrame.from_image(imagen.convert('RGB').resize((ancho, alto)))
                for paquete in stream.encode(frame):
                    contenedor.mux(paquete)
        for paquete in stream.encode():
            contenedor.mux(paquete)
    datos = salida.getvalue()
    return procesar_clip(ContentFile(datos))


class GestorClipsImou:
    def __init__(self, obtener):
        self.obtener = obtener
        self.fotogramas = deque(maxlen=70)
        self.lock = Lock()
        self.detener = Event()
        self.capacidad = BoundedSemaphore(4)
        self.executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix='clip-imou')
        self.hilo = Thread(target=self._capturar, name='fotogramas-clip-imou', daemon=True)

    def iniciar(self):
        self.hilo.start()

    def _capturar(self):
        try:
            while not self.detener.is_set():
                try:
                    codigo, imagen = self.obtener()
                    if codigo == 200 and imagen and len(imagen) <= 1024 * 1024:
                        ahora = time.monotonic()
                        with self.lock:
                            self.fotogramas.append((ahora, imagen))
                except Exception:
                    close_old_connections()
                self.detener.wait(.2)
        finally:
            close_old_connections()

    def programar(self, evento_id, instante):
        if not self.capacidad.acquire(blocking=False):
            logger.warning('No se pudo preparar el clip: hay demasiados clips pendientes.')
            return
        self.executor.submit(self._guardar, evento_id, instante)

    def _guardar(self, evento_id, instante):
        try:
            if self.detener.wait(max(0, instante + 2.3 - time.monotonic())):
                return
            with self.lock:
                muestras = list(self.fotogramas)
            video, huella = codificar_muestras(muestras, instante)
            ClipEventoSeguridad.objects.get_or_create(evento_id=evento_id, defaults={'video': video, 'sha256': huella})
        except Exception:
            logger.warning('No se pudo preparar el clip de un evento; se conserva su imagen.')
        finally:
            close_old_connections()
            self.capacidad.release()

    def cerrar(self):
        self.detener.set()
        self.hilo.join(timeout=4)
        self.executor.shutdown(wait=False, cancel_futures=True)
