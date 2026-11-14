import json
from datetime import date
from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from fcm_django.models import FCMDevice
from rest_framework.test import APIRequestFactory, force_authenticate
from administracion.models import Persona
from residencial.modelsVehiculo import Vehiculo
from .api_aviso_residente import AvisoResidenteViewSet
from .api_notificaciones import EventoViewSet
from .fcm_delivery import procesar_reserva, reservar_entrega
from .models import EventoSeguridad, EvidenciaEventoSeguridad, HistorialEventoSeguridad


@override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=True)
class FlujoResidenteTests(TestCase):
    def test_flujo_integrado_sin_enviar_a_firebase(self):
        guardia = get_user_model().objects.create_user(username='guardia-ficticio')
        residente = get_user_model().objects.create_user(username='residente-ficticio')
        otro = get_user_model().objects.create_user(username='otro-ficticio')
        persona = Persona.objects.create(nombre='Prueba', apellido='Ficticia', CI='id-ficticio', sexo='O', tipo='P', fecha_nacimiento=date(1990, 1, 1), user=residente)
        vehiculo = Vehiculo.objects.create(placa='ABC123', marca='X', modelo='X', color='X', tipo='Automóvil', persona=persona)
        evento = EventoSeguridad.objects.create(origen='IA', categoria='Estacionamiento', descripcion='Ficticio', fecha_evento=timezone.now(), estado=EventoSeguridad.CONFIRMADO)
        EvidenciaEventoSeguridad.objects.create(evento=evento, imagen=b'\xff\xd8\xffficticia', sha256='a' * 64)
        HistorialEventoSeguridad.objects.create(evento=evento, actor=guardia, accion='PLACA_REVISADA', observacion='ABC123')
        HistorialEventoSeguridad.objects.create(evento=evento, actor=guardia, accion='DESTINATARIO_VERIFICADO', observacion=json.dumps({'placa':'ABC123','vehiculo_id':vehiculo.pk,'persona_id':persona.pk,'usuario_id':residente.pk}))
        FCMDevice.objects.create(user=residente, registration_id='token-ficticio', type='android', active=True)
        factory = APIRequestFactory()
        def rol(user): return 'guardia' if user.pk == guardia.pk else 'propietario'
        def ejecutar(accion):
            request = factory.post('/', {}, format='json')
            force_authenticate(request, user=guardia)
            return EventoViewSet.as_view({'post': accion})(request, pk=evento.pk)
        with (patch('administracion.access.effective_role', side_effect=rol),
              patch('seguridad_IA.api_notificaciones.effective_role', side_effect=rol),
              patch('seguridad_IA.aviso_residente_validacion.effective_role', side_effect=rol),
              patch('seguridad_IA.fcm_delivery.effective_role', side_effect=rol),
              patch('finanzas.procedencia_fcm.proyecto_configurado'),
              patch('seguridad_IA.fcm_delivery.proyecto_configurado'),
              patch('seguridad_IA.fcm_delivery.dispositivos_elegibles', side_effect=lambda qs: qs),
              patch('seguridad_IA.fcm_delivery.elegible', return_value=True),
              patch('seguridad_IA.fcm_delivery.messaging.send', return_value='ficticio') as enviar):
            preparado = ejecutar('preparar_aviso_residente')
            self.assertEqual(preparado.status_code, 201)
            self.assertEqual(ejecutar('encolar_aviso_residente').data['estado'], 'encolado')
            enviar.assert_not_called()
            self.assertEqual(procesar_reserva(*reservar_entrega()), 'ENVIADA')
            self.assertEqual(enviar.call_args.args[0].data['tipo'], 'aviso_residente')
        request = factory.get('/')
        force_authenticate(request, user=residente)
        with patch('seguridad_IA.api_aviso_residente.effective_role', return_value='propietario'):
            response = AvisoResidenteViewSet.as_view({'get': 'list'})(request)
            self.assertEqual(len(response.data), 1)
            request = factory.get('/')
            force_authenticate(request, user=otro)
            response = AvisoResidenteViewSet.as_view({'get': 'evidencia'})(request, pk=preparado.data['id'])
            self.assertEqual(response.status_code, 404)
