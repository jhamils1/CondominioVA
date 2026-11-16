"""Monitor Imou local ejecutado fuera del servidor web y del navegador."""
import io
import time
import uuid

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import close_old_connections, transaction
from django.utils import timezone
from PIL import Image

from seguridad_IA.api_camara_demo import solicitar_local
from seguridad_IA.api_imou_local import obtener_fotograma
from seguridad_IA.evidencia import procesar_evidencia
from seguridad_IA.clip_en_vivo import GestorClipsImou
from seguridad_IA.models import EvidenciaEventoSeguridad, ZonaImou
from seguridad_IA.monitoreo_imou import Seguimiento, adquirir_exclusion
from seguridad_IA.notificaciones import TransicionInvalida, registrar_evento

NOMBRES = {'car': 'automóvil', 'motorcycle': 'motocicleta', 'bus': 'autobús', 'truck': 'camión'}


def registrar_hallazgo(pendiente):
    """No persiste una detección si se cambió o desactivó la regla compartida."""
    with transaction.atomic():
        zona = ZonaImou.objects.select_for_update().filter(pk=1).first()
        if not zona or not zona.automatico or not zona.puntos or zona.actualizado != pendiente['version']:
            return False
        datos = {'origen': 'IA', 'categoria': 'Posible estacionamiento en zona prohibida',
                 'camara': 'Imou (vista local)', 'ubicacion': '', 'prioridad': '',
                 'descripcion': pendiente['descripcion'], 'fecha_evento': pendiente['fecha']}
        evento, creado = registrar_evento(None, pendiente['id'], datos)
        imagen, huella = procesar_evidencia(ContentFile(pendiente['imagen']))
        if creado:
            EvidenciaEventoSeguridad.objects.create(evento=evento, imagen=imagen, sha256=huella)
        elif EvidenciaEventoSeguridad.objects.filter(evento=evento, sha256=huella).count() != 1:
            raise TransicionInvalida('Evidencia distinta para el evento existente.')
        return True


class Command(BaseCommand):
    help = 'Monitorea la Imou configurada sin navegador; requiere los servicios locales existentes.'

    def handle(self, *args, **options):
        if not getattr(settings, 'NOTIFICACIONES_SEGURIDAD_ACTIVAS', False):
            raise CommandError('El módulo de notificaciones de seguridad está desactivado.')
        bloqueo = adquirir_exclusion()
        if bloqueo is None:
            raise CommandError('Ya hay un monitor Imou activo o su puerto está ocupado.')
        self.stdout.write('Monitor Imou iniciado. Ctrl+C lo detiene. Se requiere cámara e IA locales.')
        version = None
        seguimiento = None
        dimensiones = None
        pendientes = []
        estado_anterior = None
        clips = GestorClipsImou(obtener_fotograma)
        try:
            clips.iniciar()
            while True:
                try:
                    close_old_connections()
                    zona = ZonaImou.objects.filter(pk=1).first()
                    if not zona or not zona.automatico or not zona.puntos:
                        seguimiento, version, dimensiones = None, None, None
                        pendientes.clear()
                        estado = 'Esperando una zona con registro automático activado.'
                    elif pendientes:
                        if registrar_hallazgo(pendientes[0]):
                            clips.programar(pendientes[0]['id'], pendientes[0]['instante'])
                        pendientes.pop(0)
                        estado = 'Procesando eventos pendientes.'
                    else:
                        if zona.actualizado != version:
                            version, seguimiento, dimensiones = zona.actualizado, None, None
                        codigo, imagen = obtener_fotograma()
                        instante = time.monotonic()
                        if codigo != 200:
                            estado = 'Esperando el servicio local de cámara Imou.'
                        else:
                            resultado = solicitar_local('/detectar', imagen)
                            if not isinstance(resultado, dict) or not isinstance(resultado.get('detecciones'), list):
                                estado = 'Esperando el procesador local de IA.'
                            else:
                                with Image.open(io.BytesIO(imagen)) as foto:
                                    ancho, alto = foto.size
                                if not (0 < ancho <= 1280 and 0 < alto <= 1280):
                                    raise ValueError('Imagen fuera de límites')
                                if seguimiento is None or dimensiones != (ancho, alto):
                                    seguimiento = Seguimiento(zona.puntos, zona.segundos, ancho, alto)
                                    dimensiones = (ancho, alto)
                                for hallazgo in seguimiento.procesar(resultado['detecciones'], instante):
                                    clase = NOMBRES.get(hallazgo['clase'], 'vehículo')
                                    pendientes.append({'id': uuid.uuid4(), 'version': version, 'imagen': imagen, 'instante': instante,
                                        'fecha': timezone.now(), 'descripcion': (
                                            f'Detección automática Imou: {clase}, aproximadamente '
                                            f'{int(hallazgo["duracion"])} segundos detenido en zona prohibida. '
                                            'La ubicación no está verificada. Requiere revisión. Se adjunta el fotograma analizado.')})
                                estado = 'Monitoreando la zona configurada.'
                    if estado != estado_anterior:
                        self.stdout.write(estado)
                        estado_anterior = estado
                except Exception:
                    estado = 'Servicio temporalmente no disponible; se reintentará.'
                    if estado != estado_anterior:
                        self.stderr.write(estado)
                        estado_anterior = estado
                    close_old_connections()
                    time.sleep(2)
                time.sleep(.5)
        except KeyboardInterrupt:
            self.stdout.write('Monitor Imou detenido.')
        finally:
            clips.cerrar()
            bloqueo.close()
