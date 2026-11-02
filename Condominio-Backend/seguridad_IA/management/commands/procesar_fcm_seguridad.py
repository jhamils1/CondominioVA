from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import close_old_connections, DatabaseError
from seguridad_IA.fcm_delivery import procesar_reserva, reservar_entrega
import time


class Command(BaseCommand):
    help = 'Procesa un lote limitado de entregas FCM de seguridad pendientes.'

    def add_arguments(self, parser):
        parser.add_argument('--limite', type=int, default=50)
        parser.add_argument('--continuo', action='store_true', help='Procesa lotes hasta detener el proceso.')
        parser.add_argument('--intervalo', type=int, default=5, help='Segundos entre consultas en modo continuo.')

    def handle(self, *args, **options):
        if not (getattr(settings, 'NOTIFICACIONES_SEGURIDAD_ACTIVAS', False) and
                getattr(settings, 'COLA_FCM_SEGURIDAD_ACTIVA', False) and
                getattr(settings, 'ENVIO_FCM_SEGURIDAD_ACTIVO', False)):
            raise CommandError('El procesamiento FCM de seguridad no está habilitado.')
        limit = options['limite']
        if not 1 <= limit <= 500:
            raise CommandError('El límite debe estar entre 1 y 500.')
        interval = options['intervalo']
        if not 1 <= interval <= 60:
            raise CommandError('El intervalo debe estar entre 1 y 60 segundos.')
        if not options['continuo']:
            count = self.procesar_lote(limit)
            self.stdout.write(f'Entregas procesadas: {count}')
            return
        self.stdout.write('Procesador FCM de seguridad iniciado.')
        try:
            while True:
                close_old_connections()
                try:
                    count = self.procesar_lote(limit)
                    if count:
                        self.stdout.write(f'Entregas procesadas: {count}')
                except DatabaseError:
                    self.stderr.write('No se pudo consultar la cola; se reintentará.')
                    close_old_connections()
                time.sleep(interval)
        except KeyboardInterrupt:
            self.stdout.write('Procesador FCM de seguridad detenido.')
        finally:
            close_old_connections()

    def procesar_lote(self, limit):
        count = 0
        for _ in range(limit):
            reservation = reservar_entrega()
            if not reservation:
                break
            procesar_reserva(*reservation)
            count += 1
        return count
