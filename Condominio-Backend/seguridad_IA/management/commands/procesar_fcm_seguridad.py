from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from seguridad_IA.fcm_delivery import procesar_reserva, reservar_entrega


class Command(BaseCommand):
    help = 'Procesa un lote limitado de entregas FCM de seguridad pendientes.'

    def add_arguments(self, parser):
        parser.add_argument('--limite', type=int, default=50)

    def handle(self, *args, **options):
        if not (getattr(settings, 'NOTIFICACIONES_SEGURIDAD_ACTIVAS', False) and
                getattr(settings, 'COLA_FCM_SEGURIDAD_ACTIVA', False) and
                getattr(settings, 'ENVIO_FCM_SEGURIDAD_ACTIVO', False)):
            raise CommandError('El procesamiento FCM de seguridad no está habilitado.')
        limit = options['limite']
        if not 1 <= limit <= 500:
            raise CommandError('El límite debe estar entre 1 y 500.')
        count = 0
        for _ in range(limit):
            reservation = reservar_entrega()
            if not reservation:
                break
            procesar_reserva(*reservation)
            count += 1
        self.stdout.write(f'Entregas procesadas: {count}')
