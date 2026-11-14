from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from datetime import date, timedelta
import json
from rest_framework.test import APIRequestFactory, force_authenticate

from .api_notificaciones import EventoViewSet
from .models import EventoSeguridad, EvidenciaEventoSeguridad, HistorialEventoSeguridad, LecturaPlaca
from rest_framework.response import Response
from administracion.models import Persona
from residencial.modelsVehiculo import Vehiculo


@override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
class PlacaEventoTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='guardia-ficticio')
        self.evento = EventoSeguridad.objects.create(origen='IA', categoria='Prueba', descripcion='Ficticia', fecha_evento=timezone.now())

    def registrar(self, rol, dato):
        request = APIRequestFactory().post('/', dato, format='json')
        force_authenticate(request, user=self.user)
        with (patch('administracion.access.effective_role', return_value=rol),
              patch('seguridad_IA.api_notificaciones.effective_role', return_value=rol)):
            return EventoViewSet.as_view({'post': 'registrar_placa'})(request, pk=self.evento.pk)

    def test_guardia_registra_placa_con_actor_y_evento(self):
        response = self.registrar('guardia', {'placa': ' abc-123 '})
        self.assertEqual(response.status_code, 201)
        historial = HistorialEventoSeguridad.objects.get(evento=self.evento)
        self.assertEqual((historial.accion, historial.observacion, historial.actor), ('PLACA_REVISADA', 'ABC-123', self.user))

    def test_otros_roles_y_datos_invalidos_no_escriben(self):
        for rol, datos in [('administrador', {'placa': 'ABC123'}), ('propietario', {'placa': 'ABC123'}),
                           ('guardia', {'placa': '<script>'}), ('guardia', {'placa': 'ABC', 'extra': 1})]:
            self.assertIn(self.registrar(rol, datos).status_code, (400, 403))
        self.assertFalse(HistorialEventoSeguridad.objects.exists())

    def test_evento_descartado_no_admite_nuevas_placas(self):
        self.evento.estado = EventoSeguridad.FALSO
        self.evento.save(update_fields=['estado'])
        self.assertEqual(self.registrar('guardia', {'placa': 'ABC123'}).status_code, 400)
        self.assertFalse(HistorialEventoSeguridad.objects.exists())

    def test_sugerencia_necesita_evidencia_y_no_es_confirmacion(self):
        def sugerir(rol, datos=None):
            request = APIRequestFactory().post('/', datos or {}, format='json')
            force_authenticate(request, user=self.user)
            with (patch('administracion.access.effective_role', return_value=rol),
                  patch('seguridad_IA.api_notificaciones.effective_role', return_value=rol)):
                return EventoViewSet.as_view({'post': 'reconocer_placa_evidencia'})(request, pk=self.evento.pk)
        self.assertEqual(sugerir('guardia').status_code, 404)
        EvidenciaEventoSeguridad.objects.create(evento=self.evento, imagen=b'\xff\xd8\xff', sha256='a' * 64)
        self.assertEqual(sugerir('propietario').status_code, 403)
        self.assertEqual(sugerir('guardia', {'lectura_id': 9}).status_code, 400)
        with patch('seguridad_IA.views.AlprScanView.procesar_imagen', return_value=Response({'plate': 'ABC123', 'lectura': {'id': 9}}, status=200)) as procesar:
            resultado = sugerir('guardia')
            self.assertEqual(resultado.status_code, 200)
            self.assertTrue(resultado.data['sugerencia_asociada'])
            self.assertEqual(procesar.call_args.args[0].read(), b'\xff\xd8\xff')
        self.assertEqual(HistorialEventoSeguridad.objects.filter(evento=self.evento, accion='PLACA_SUGERIDA').count(), 1)
        self.assertFalse(HistorialEventoSeguridad.objects.filter(evento=self.evento, accion='PLACA_REVISADA').exists())

    def test_no_asocia_si_el_evento_cambia_mientras_consulta(self):
        EvidenciaEventoSeguridad.objects.create(evento=self.evento, imagen=b'\xff\xd8\xff', sha256='a' * 64)
        request = APIRequestFactory().post('/', {}, format='json')
        force_authenticate(request, user=self.user)
        def responder(_imagen):
            EventoSeguridad.objects.filter(pk=self.evento.pk).update(estado=EventoSeguridad.FALSO)
            return Response({'plate': 'ABC123', 'lectura': {'id': 9}}, status=200)
        with (patch('administracion.access.effective_role', return_value='guardia'),
              patch('seguridad_IA.api_notificaciones.effective_role', return_value='guardia'),
              patch('seguridad_IA.views.AlprScanView.procesar_imagen', side_effect=responder)):
            response = EventoViewSet.as_view({'post': 'reconocer_placa_evidencia'})(request, pk=self.evento.pk)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(HistorialEventoSeguridad.objects.filter(evento=self.evento, accion='PLACA_SUGERIDA').exists())

    def test_lecturas_previas_son_orientativas_y_solo_para_guardia(self):
        HistorialEventoSeguridad.objects.create(evento=self.evento, actor=self.user, accion='PLACA_SUGERIDA',
            observacion=json.dumps({'placa': 'ABC123', 'lectura_id': 1, 'origen': 'evidencia_evento'}))
        previa = LecturaPlaca.objects.create(placa='ABC123', score=.9, camera_id='Imou', created_at=self.evento.fecha_evento - timedelta(minutes=3))
        LecturaPlaca.objects.create(placa='ABC123', score=.9, camera_id='Imou', created_at=self.evento.fecha_evento + timedelta(minutes=1))
        LecturaPlaca.objects.create(placa='ABC123', score=.9, camera_id='', created_at=self.evento.fecha_evento - timedelta(minutes=1))
        LecturaPlaca.objects.create(placa='OTRA', score=.9, camera_id='Imou', created_at=self.evento.fecha_evento - timedelta(minutes=1))
        def consultar(rol):
            request = APIRequestFactory().get('/')
            force_authenticate(request, user=self.user)
            with (patch('administracion.access.effective_role', return_value=rol),
                  patch('seguridad_IA.api_notificaciones.effective_role', return_value=rol)):
                return EventoViewSet.as_view({'get': 'posibles_lecturas_entrada'})(request, pk=self.evento.pk)
        self.assertEqual(consultar('propietario').status_code, 403)
        respuesta = consultar('guardia')
        self.assertEqual(respuesta.data['estado'], 'orientativo')
        self.assertEqual([x['id'] for x in respuesta.data['lecturas']], [previa.pk])

    def test_destinatario_requiere_residente_unico_y_confirmacion_humana(self):
        self.evento.estado = EventoSeguridad.CONFIRMADO
        self.evento.save(update_fields=['estado'])
        self.registrar('guardia', {'placa': 'ABC123'})
        residente = get_user_model().objects.create_user(username='residente-ficticio')
        persona = Persona.objects.create(nombre='Nombre', apellido='Ficticio', CI='ficticio', sexo='O', tipo='P', fecha_nacimiento=date(1990, 1, 1), user=residente)
        vehiculo = Vehiculo.objects.create(placa='ABC123', marca='X', modelo='X', color='X', tipo='Automóvil', persona=persona)
        def llamar(metodo, rol, datos=None):
            request = getattr(APIRequestFactory(), metodo)('/', datos or {}, format='json')
            force_authenticate(request, user=self.user)
            def rol_efectivo(user): return rol if user.pk == self.user.pk else ('propietario' if user.is_active else None)
            with (patch('administracion.access.effective_role', side_effect=rol_efectivo),
                  patch('seguridad_IA.api_notificaciones.effective_role', side_effect=rol_efectivo)):
                return EventoViewSet.as_view({metodo: 'destinatario_placa'})(request, pk=self.evento.pk)
        self.assertEqual(llamar('get', 'administrador').status_code, 403)
        self.assertTrue(llamar('get', 'guardia').data['cuenta_activa'])
        self.assertEqual(llamar('post', 'guardia', {'vehiculo_id': vehiculo.pk + 1}).status_code, 400)
        self.assertEqual(llamar('post', 'guardia', {'vehiculo_id': vehiculo.pk}).status_code, 201)
        self.assertEqual(HistorialEventoSeguridad.objects.filter(evento=self.evento, accion='DESTINATARIO_VERIFICADO').count(), 1)
        def preparar(rol):
            request = APIRequestFactory().post('/', {}, format='json')
            force_authenticate(request, user=self.user)
            def rol_efectivo(user): return rol if user.pk == self.user.pk else ('propietario' if user.is_active else None)
            with (patch('administracion.access.effective_role', side_effect=rol_efectivo),
                  patch('seguridad_IA.api_notificaciones.effective_role', side_effect=rol_efectivo)):
                return EventoViewSet.as_view({'post': 'preparar_aviso_residente'})(request, pk=self.evento.pk)
        self.assertEqual(preparar('administrador').status_code, 403)
        primero = preparar('guardia')
        self.assertEqual(primero.status_code, 201)
        self.assertFalse(primero.data['push_enviado'])
        segundo = preparar('guardia')
        self.assertEqual(segundo.status_code, 200)
        self.assertEqual(primero.data['id'], segundo.data['id'])
        from .aviso_residente_validacion import aviso_residente_valido
        from .models import NotificacionSeguridad
        aviso = NotificacionSeguridad.objects.select_related('evento', 'destinatario').get(pk=primero.data['id'])
        with patch('seguridad_IA.aviso_residente_validacion.effective_role', return_value='propietario'):
            self.assertTrue(aviso_residente_valido(aviso))
        request = APIRequestFactory().post('/', {}, format='json')
        force_authenticate(request, user=self.user)
        with (override_settings(COLA_FCM_SEGURIDAD_ACTIVA=True),
              patch('administracion.access.effective_role', return_value='guardia'),
              patch('seguridad_IA.api_notificaciones.effective_role', return_value='guardia'),
              patch('seguridad_IA.aviso_residente_validacion.effective_role', return_value='propietario'),
              patch('finanzas.procedencia_fcm.proyecto_configurado'),
              patch('seguridad_IA.fcm_delivery.encolar_notificacion')):
            resultado = EventoViewSet.as_view({'post': 'encolar_aviso_residente'})(request, pk=self.evento.pk)
        self.assertEqual(resultado.data['estado'], 'sin_dispositivos')
        residente.is_active = False
        residente.save(update_fields=['is_active'])
        self.assertFalse(llamar('get', 'guardia').data['cuenta_activa'])
        self.assertEqual(llamar('post', 'guardia', {'vehiculo_id': vehiculo.pk}).status_code, 400)
        self.assertEqual(preparar('guardia').status_code, 400)
        residente.is_active = True
        residente.save(update_fields=['is_active'])
        Vehiculo.objects.create(placa='abc123', marca='Y', modelo='Y', color='Y', tipo='Automóvil', persona=persona)
        with patch('seguridad_IA.aviso_residente_validacion.effective_role', return_value='propietario'):
            self.assertFalse(aviso_residente_valido(aviso))
        self.assertEqual(llamar('get', 'guardia').data['estado'], 'ambigua')
        self.assertEqual(llamar('post', 'guardia', {'vehiculo_id': vehiculo.pk}).status_code, 409)
