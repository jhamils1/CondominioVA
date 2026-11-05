"""Validación de una imagen privada sin confiar en nombre, MIME o metadatos."""
import hashlib
import io

from PIL import Image, UnidentifiedImageError
from rest_framework.exceptions import ValidationError

MAX_BYTES = 1024 * 1024
MAX_LADO = 1280


def procesar_evidencia(archivo):
    if not 0 < archivo.size <= MAX_BYTES:
        raise ValidationError({'evidencia': 'La imagen debe tener un tamaño máximo de 1 MB.'})
    contenido = archivo.read(MAX_BYTES + 1)
    if len(contenido) > MAX_BYTES:
        raise ValidationError({'evidencia': 'La imagen debe tener un tamaño máximo de 1 MB.'})
    try:
        with Image.open(io.BytesIO(contenido)) as imagen:
            if imagen.format != 'JPEG' or not all(0 < lado <= MAX_LADO for lado in imagen.size):
                raise ValueError
            imagen.load()
            # Crear una imagen nueva elimina EXIF y metadatos de la entrada.
            limpia = Image.new('RGB', imagen.size)
            limpia.paste(imagen.convert('RGB'))
            salida = io.BytesIO()
            limpia.save(salida, format='JPEG', quality=85)
            datos = salida.getvalue()
    except (OSError, ValueError, UnidentifiedImageError, Image.DecompressionBombError):
        raise ValidationError({'evidencia': 'La evidencia debe ser una imagen JPEG válida de hasta 1280 píxeles por lado.'}) from None
    if len(datos) > MAX_BYTES:
        raise ValidationError({'evidencia': 'La imagen procesada supera 1 MB.'})
    return datos, hashlib.sha256(datos).hexdigest()
