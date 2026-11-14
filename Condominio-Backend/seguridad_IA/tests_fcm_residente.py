from datetime import timedelta
from unittest.mock import patch
import uuid
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from fcm_django.models import FCMDevice
from .fcm_delivery import procesar_reserva, token_hash
from .models import EntregaFCMSeguridad, EventoSeguridad, NotificacionSeguridad


class EntregaResidenteTests(TestCase):
    def setUp(self):
        usuario = get_user_model().objects.create_user(username='residente-ficticio')
        evento = EventoSeguridad.objects.create(origen='IA', categoria='Prueba', descripcion='Privada', fecha_evento=timezone.now(), estado=EventoSeguridad.CONFIRMADO)
        aviso = NotificacionSeguridad.objects.create(evento=evento, destinatario=usuario, tipo='AVISO_RESIDENTE')
        device = FCMDevice.objects.create(user=usuario, registration_id='token-ficticio', type='android', active=True)
        self.reserva = uuid.uuid4()
        self.entrega = EntregaFCMSeguridad.objects.create(notificacion=aviso, dispositivo=device,
            token_hash=token_hash('token-ficticio'), estado='EN_PROCESO', reserva_id=self.reserva,
            reserva_hasta=timezone.now() + timedelta(minutes=1))

    def procesar(self, valido):
        with (patch('seguridad_IA.fcm_delivery.proyecto_configurado'),
              patch('seguridad_IA.fcm_delivery.elegible', return_value=True),
              patch('seguridad_IA.fcm_delivery.effective_role', return_value='propietario'),
              patch('seguridad_IA.fcm_delivery.aviso_residente_valido', return_value=valido),
              patch('seguridad_IA.fcm_delivery.messaging.send') as enviar):
            estado = procesar_reserva(self.entrega.pk, self.reserva)
            return estado, enviar

    def test_envio_simulado_solo_datos_minimos(self):
        estado, enviar = self.procesar(True)
        self.assertEqual(estado, 'ENVIADA')
        self.assertEqual(set(enviar.call_args.args[0].data), {'tipo', 'notificacion_id'})
        self.assertEqual(enviar.call_args.args[0].data['tipo'], 'aviso_residente')

    def test_destinatario_no_valido_no_envia(self):
        estado, enviar = self.procesar(False)
        self.assertEqual(estado, 'CANCELADA')
        enviar.assert_not_called()
