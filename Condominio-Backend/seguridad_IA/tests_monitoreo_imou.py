import io
import uuid
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import SimpleTestCase, TestCase, override_settings
from django.utils import timezone
from PIL import Image
from rest_framework.test import APIRequestFactory, force_authenticate

from .management.commands.monitorear_imou import registrar_hallazgo
from .api_notificaciones import EventoViewSet
from .models import EventoSeguridad, EvidenciaEventoSeguridad, NotificacionSeguridad, ZonaImou
from .monitoreo_imou import PUERTO_MONITOR, Seguimiento, adquirir_exclusion


class SeguimientoImouTests(SimpleTestCase):
    def setUp(self):
        self.zona = [{'x': .1, 'y': .1}, {'x': .8, 'y': .1}, {'x': .8, 'y': .8}, {'x': .1, 'y': .8}]
        self.auto = {'clase': 'car', 'caja': [100, 100, 200, 200]}

    def test_permanencia_perdida_salida_y_reinicio(self):
        regla = Seguimiento(self.zona, 2, 640, 480)
        self.assertEqual(regla.procesar([self.auto], 0), [])
        self.assertEqual(regla.procesar([self.auto], 1), [])
        self.assertEqual(regla.procesar([], 1.5), [])
        self.assertEqual(regla.procesar([self.auto], 2), [])
        self.assertEqual(len(regla.procesar([self.auto], 3)), 1)
        self.assertEqual(regla.procesar([self.auto], 4), [])
        self.assertEqual(regla.procesar([self.auto], 8), [])
        fuera = {'clase': 'car', 'caja': [550, 100, 630, 200]}
        self.assertEqual(regla.procesar([fuera], 9), [])

    def test_solo_una_instancia(self):
        primero = adquirir_exclusion()
        self.assertIsNotNone(primero)
        try:
            self.assertIsNone(adquirir_exclusion())
        finally:
            primero.close()
        segundo = adquirir_exclusion()
        self.assertIsNotNone(segundo)
        segundo.close()

    def test_exclusion_no_usa_puerto_de_ia_remota(self):
        self.assertNotEqual(PUERTO_MONITOR, 28767)

    def test_no_repite_tras_interrupcion_y_avisa_otro_vehiculo(self):
        regla = Seguimiento(self.zona, 2, 640, 480)
        otro = {'clase': 'car', 'caja': [300, 100, 400, 200]}
        regla.procesar([self.auto], 0)
        regla.procesar([self.auto], 1)
        self.assertEqual(len(regla.procesar([self.auto], 2)), 1)
        self.assertEqual(regla.procesar([self.auto], 6), [])
        regla.procesar([self.auto, otro], 7)
        regla.procesar([self.auto, otro], 8)
        self.assertEqual(len(regla.procesar([self.auto, otro], 9)), 1)
        regla.procesar([], 20)
        regla.procesar([self.auto], 21)
        regla.procesar([self.auto], 22)
        self.assertEqual(len(regla.procesar([self.auto], 23)), 1)


@override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=False)
class MonitorImouTests(TestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_user(username='admin-ficticio')
        self.guardias = [get_user_model().objects.create_user(username=f'guardia-ficticio-{n}') for n in range(2)]
        self.zona = ZonaImou.objects.create(puntos=[{'x': .1, 'y': .1}, {'x': .8, 'y': .1},
                                                   {'x': .8, 'y': .8}, {'x': .1, 'y': .8}],
                                             segundos=2, automatico=True, actualizado_por=self.admin)
        imagen = io.BytesIO()
        Image.new('RGB', (640, 480), 'black').save(imagen, 'JPEG')
        self.imagen = imagen.getvalue()

    def test_evento_con_evidencia_idempotente_y_guardias(self):
        pendiente = {'id': uuid.uuid4(), 'version': self.zona.actualizado, 'imagen': self.imagen,
                     'fecha': timezone.now(), 'descripcion': 'Detección ficticia.'}
        with patch('seguridad_IA.notificaciones.destinatarios', return_value=self.guardias):
            self.assertTrue(registrar_hallazgo(pendiente))
            self.assertTrue(registrar_hallazgo(pendiente))
        self.assertEqual(EventoSeguridad.objects.count(), 1)
        self.assertEqual(EventoSeguridad.objects.get().origen, 'IA')
        self.assertEqual(EvidenciaEventoSeguridad.objects.count(), 1)
        self.assertEqual(NotificacionSeguridad.objects.count(), 2)
        self.zona.automatico = False
        self.zona.save()
        pendiente['id'] = uuid.uuid4()
        self.assertFalse(registrar_hallazgo(pendiente))
        self.assertEqual(EventoSeguridad.objects.count(), 1)

    def test_web_no_registra_imou_si_monitor_esta_activo(self):
        request = APIRequestFactory().post('/eventos-seguridad/', {
            'id': str(uuid.uuid4()), 'categoria': 'Posible estacionamiento',
            'descripcion': 'Prueba ficticia', 'camara': 'Imou (vista local)',
            'fecha_evento': timezone.now().isoformat(),
        }, format='json')
        force_authenticate(request, user=self.admin)
        with (patch('administracion.access.effective_role', return_value='administrador'),
              patch('seguridad_IA.api_notificaciones.adquirir_exclusion', return_value=None)):
            response = EventoViewSet.as_view({'post': 'create'})(request)
        self.assertEqual(response.status_code, 409)
        self.assertEqual(EventoSeguridad.objects.count(), 0)

    @override_settings(IMOU_REMOTA_ACTIVA=True)
    def test_registro_remoto_exige_exclusion_y_libera_al_terminar(self):
        def solicitud():
            request = APIRequestFactory().post('/eventos-seguridad/', {
                'id': str(uuid.uuid4()), 'categoria': 'Posible estacionamiento',
                'descripcion': 'Prueba ficticia', 'camara': 'Imou (vista local)',
                'fecha_evento': timezone.now().isoformat(),
            }, format='json')
            force_authenticate(request, user=self.admin)
            return request
        with patch('administracion.access.effective_role', return_value='administrador'), \
             patch('seguridad_IA.api_imou_local.exclusion_remota', return_value=False):
            response = EventoViewSet.as_view({'post': 'create'})(solicitud())
            self.assertEqual(response.status_code, 409)
            self.assertEqual(EventoSeguridad.objects.count(), 0)
        with patch('administracion.access.effective_role', return_value='administrador'), \
             patch('seguridad_IA.api_imou_local.exclusion_remota', return_value=True) as control, \
             patch('seguridad_IA.notificaciones.destinatarios', return_value=[]):
            response = EventoViewSet.as_view({'post': 'create'})(solicitud())
            self.assertEqual(response.status_code, 201)
            self.assertEqual([call.args[1] for call in control.call_args_list], ['iniciar', 'terminar'])
            self.assertEqual(EventoSeguridad.objects.count(), 1)

    @override_settings(IMOU_REMOTA_ACTIVA=True)
    def test_error_al_registrar_no_deja_operacion_abierta(self):
        from .notificaciones import TransicionInvalida
        request = APIRequestFactory().post('/eventos-seguridad/', {
            'id': str(uuid.uuid4()), 'categoria': 'Prueba', 'descripcion': 'Prueba ficticia',
            'camara': 'Imou', 'fecha_evento': timezone.now().isoformat(),
        }, format='json')
        force_authenticate(request, user=self.admin)
        with patch('administracion.access.effective_role', return_value='administrador'), \
             patch('seguridad_IA.api_imou_local.exclusion_remota', return_value=True) as control, \
             patch('seguridad_IA.api_notificaciones.registrar_evento', side_effect=TransicionInvalida('Ficticio')):
            response = EventoViewSet.as_view({'post': 'create'})(request)
        self.assertEqual(response.status_code, 400)
        self.assertEqual([call.args[1] for call in control.call_args_list], ['iniciar', 'terminar'])

    def test_proceso_funciona_sin_navegador(self):
        deteccion = {'detecciones': [{'clase': 'car', 'caja': [100, 100, 200, 200], 'confianza': .9}]}
        reloj = iter([0, .5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5])
        ciclos = iter(range(20))
        def dormir(_):
            if next(ciclos) == 8:
                raise KeyboardInterrupt
        with (patch('seguridad_IA.notificaciones.destinatarios', return_value=self.guardias),
              patch('seguridad_IA.management.commands.monitorear_imou.obtener_fotograma', return_value=(200, self.imagen)),
              patch('seguridad_IA.management.commands.monitorear_imou.solicitar_local', return_value=deteccion),
              patch('seguridad_IA.management.commands.monitorear_imou.time.monotonic', side_effect=lambda: next(reloj)),
              patch('seguridad_IA.management.commands.monitorear_imou.time.sleep', side_effect=dormir),
              patch('seguridad_IA.management.commands.monitorear_imou.GestorClipsImou') as clips,
              patch('seguridad_IA.management.commands.monitorear_imou.close_old_connections')):
            call_command('monitorear_imou', stdout=io.StringIO(), stderr=io.StringIO())
        clips.return_value.iniciar.assert_called_once()
        clips.return_value.programar.assert_called_once()
        clips.return_value.cerrar.assert_called_once()
        self.assertEqual(EventoSeguridad.objects.count(), 1)
        self.assertEqual(NotificacionSeguridad.objects.count(), 2)
        self.assertEqual(EvidenciaEventoSeguridad.objects.count(), 1)
