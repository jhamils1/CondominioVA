from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from seguridad_IA.models import EntregaFCMSeguridad


class Command(BaseCommand):
    help = 'Reencola una entrega FCM fallida concreta después de revisar su causa.'

    def add_arguments(self, parser):
        parser.add_argument('entrega_id', type=int)

    @transaction.atomic
    def handle(self, *args, **options):
        if not getattr(settings, 'COLA_FCM_SEGURIDAD_ACTIVA', False):
            raise CommandError('La cola FCM de seguridad no está habilitada.')
        delivery = EntregaFCMSeguridad.objects.select_for_update().filter(pk=options['entrega_id'], estado='FALLIDA').first()
        if not delivery:
            raise CommandError('No existe una entrega fallida con ese identificador.')
        delivery.estado = 'PENDIENTE'
        delivery.intentos = 0
        delivery.siguiente_intento = timezone.now()
        delivery.error_codigo = ''
        delivery.save(update_fields=['estado', 'intentos', 'siguiente_intento', 'error_codigo'])
        self.stdout.write('Entrega reencolada; se aplicarán nuevamente los controles de rol y dispositivo.')
