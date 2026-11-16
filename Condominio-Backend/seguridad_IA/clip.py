"""Validación acotada de clips de incidencia suministrados por operadores."""
import hashlib
import io

import av
from rest_framework.exceptions import ValidationError

MAX_CLIP_BYTES = 2 * 1024 * 1024


def procesar_clip(archivo):
    if not 0 < archivo.size <= MAX_CLIP_BYTES:
        raise ValidationError('El clip debe ocupar como máximo 2 MB.')
    datos = archivo.read(MAX_CLIP_BYTES + 1)
    if len(datos) > MAX_CLIP_BYTES or not datos.startswith(b'\x1a\x45\xdf\xa3'):
        raise ValidationError('El clip debe estar en formato WebM.')
    try:
        with av.open(io.BytesIO(datos), mode='r', format='webm') as entrada:
            if len(entrada.streams.video) != 1 or len(entrada.streams.audio) != 0:
                raise ValueError('Se requiere un video sin audio.')
            stream = entrada.streams.video[0]
            if stream.codec_context.name not in ('vp8', 'vp9') or not (0 < stream.width <= 1280 and 0 < stream.height <= 1280):
                raise ValueError('Códec o dimensiones incompatibles.')
            tiempos = []
            for frame in entrada.decode(video=0):
                if frame.time is None or len(tiempos) >= 100:
                    raise ValueError('Demasiados fotogramas o tiempo inválido.')
                tiempos.append(frame.time)
            if len(tiempos) < 2 or tiempos != sorted(tiempos) or tiempos[-1] - tiempos[0] > 5:
                raise ValueError('Duración o fotogramas inválidos.')
    except (av.FFmpegError, ValueError, OSError, OverflowError):
        raise ValidationError('El archivo no es un clip WebM compatible de hasta cinco segundos.') from None
    return datos, hashlib.sha256(datos).hexdigest()
