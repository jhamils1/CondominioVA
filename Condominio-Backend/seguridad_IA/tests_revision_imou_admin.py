import uuid
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from fcm_django.models import FCMDevice

from .models import EntregaFCMSeguridad, EventoSeguridad, NotificacionSeguridad
from .fcm_delivery import procesar_reserva, token_hash
from .notificaciones import registrar_evento, distribuir_revision


@override_settings(COLA_FCM_SEGURIDAD_ACTIVA=False)
class RevisionImouAdminTests(TestCase):
    def test_avisa_guardia_y_admin_sin_confirmar_y_sin_duplicados(self):
        usuario = get_user_model()
        guardia = usuario.objects.create_user(username='guardia-prueba')
        admin = usuario.objects.create_user(username='admin-prueba')
        datos = {'origen': 'IA', 'camara': 'Imou (vista local)',
                 'categoria': 'Posible estacionamiento en zona prohibida',
                 'descripcion': 'Prueba', 'fecha_evento': timezone.now()}
        with patch('seguridad_IA.notificaciones.destinatarios', side_effect=lambda rol: [guardia] if rol == 'guardia' else [admin]):
            evento, creado = registrar_evento(None, uuid.uuid4(), datos)
            distribuir_revision(evento.pk)
        self.assertTrue(creado)
        self.assertEqual(evento.estado, EventoSeguridad.PENDIENTE)
        self.assertEqual(set(NotificacionSeguridad.objects.values_list('destinatario_id', 'tipo')),
                         {(guardia.pk, 'REVISION'), (admin.pk, 'REVISION')})

    def test_otro_evento_conserva_distribucion_anterior(self):
        guardia = get_user_model().objects.create_user(username='guardia-otro')
        datos = {'origen': 'MANUAL', 'camara': '', 'categoria': 'Otro',
                 'descripcion': 'Prueba', 'fecha_evento': timezone.now()}
        with patch('seguridad_IA.notificaciones.destinatarios', return_value=[guardia]) as destinatarios:
            registrar_evento(None, uuid.uuid4(), datos)
        destinatarios.assert_called_once_with('guardia')

    def test_camara_adicional_avisa_guardia_una_sola_vez(self):
        guardia = get_user_model().objects.create_user(username='guardia-camara-ficticia')
        datos = {'origen': 'MANUAL', 'camara': 'Cámara A (#2)',
                 'categoria': 'Posible estacionamiento en zona prohibida',
                 'descripcion': 'Detección de prueba', 'fecha_evento': timezone.now()}
        identificador = uuid.uuid4()
        with patch('seguridad_IA.notificaciones.destinatarios', return_value=[guardia]):
            evento, creado = registrar_evento(None, identificador, datos)
            _, repetido = registrar_evento(None, identificador, datos)
        self.assertTrue(creado)
        self.assertFalse(repetido)
        self.assertEqual(evento.estado, EventoSeguridad.PENDIENTE)
        self.assertEqual(NotificacionSeguridad.objects.filter(evento=evento, destinatario=guardia, tipo='REVISION').count(), 1)

    def test_entrega_admin_pendiente_admitida(self):
        admin = get_user_model().objects.create_user(username='admin-movil-prueba')
        evento = EventoSeguridad.objects.create(origen='IA', categoria='Prueba', descripcion='Prueba', fecha_evento=timezone.now())
        aviso = NotificacionSeguridad.objects.create(evento=evento, destinatario=admin, tipo='REVISION')
        device = FCMDevice.objects.create(user=admin, registration_id='token-ficticio', type='android', active=True)
        reserva = uuid.uuid4()
        entrega = EntregaFCMSeguridad.objects.create(notificacion=aviso, dispositivo=device,
            token_hash=token_hash('token-ficticio'), estado='EN_PROCESO', reserva_id=reserva,
            reserva_hasta=timezone.now() + timedelta(minutes=1))
        with (patch('seguridad_IA.fcm_delivery.proyecto_configurado'),
              patch('seguridad_IA.fcm_delivery.elegible', return_value=True),
              patch('seguridad_IA.fcm_delivery.effective_role', return_value='administrador'),
              patch('seguridad_IA.fcm_delivery.messaging.send') as enviar):
            self.assertEqual(procesar_reserva(entrega.pk, reserva), 'ENVIADA')
            enviar.assert_called_once()

    def test_push_guardia_diferencia_piscina_y_estacionamiento(self):
        guardia = get_user_model().objects.create_user(username='guardia-push-ficticio')
        device = FCMDevice.objects.create(user=guardia, registration_id='token-ficticio', type='android', active=True)
        for categoria, titulo in (
            ('Posible persona sola cerca de piscina', 'Alerta de piscina'),
            ('Posible estacionamiento en zona prohibida', 'Alerta de estacionamiento'),
            ('Otra categoria', 'Seguridad del condominio'),
        ):
            with self.subTest(categoria=categoria):
                evento = EventoSeguridad.objects.create(origen='IA', categoria=categoria, descripcion='dato privado', fecha_evento=timezone.now())
                aviso = NotificacionSeguridad.objects.create(evento=evento, destinatario=guardia, tipo='REVISION')
                reserva = uuid.uuid4()
                entrega = EntregaFCMSeguridad.objects.create(notificacion=aviso, dispositivo=device,
                    token_hash=token_hash('token-ficticio'), estado='EN_PROCESO', reserva_id=reserva,
                    reserva_hasta=timezone.now() + timedelta(minutes=1))
                with (patch('seguridad_IA.fcm_delivery.proyecto_configurado'),
                      patch('seguridad_IA.fcm_delivery.elegible', return_value=True),
                      patch('seguridad_IA.fcm_delivery.effective_role', return_value='guardia'),
                      patch('seguridad_IA.fcm_delivery.messaging.send') as enviar):
                    self.assertEqual(procesar_reserva(entrega.pk, reserva), 'ENVIADA')
                    mensaje = enviar.call_args.args[0]
                    self.assertEqual(mensaje.notification.title, titulo)
                    self.assertNotIn('dato privado', mensaje.notification.body)
                    self.assertEqual(set(mensaje.data), {'tipo', 'notificacion_id', 'evento_id'})
