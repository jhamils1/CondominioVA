from unittest.mock import patch
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from .api_aviso_residente import AvisoResidenteViewSet
from .models import EventoSeguridad, EvidenciaEventoSeguridad, NotificacionSeguridad


@override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
class AvisoResidenteTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='residente-ficticio')
        self.otro = get_user_model().objects.create_user(username='otro-ficticio')
        evento = EventoSeguridad.objects.create(origen='IA', categoria='Estacionamiento', descripcion='Detalle interno', fecha_evento=timezone.now())
        EvidenciaEventoSeguridad.objects.create(evento=evento, imagen=b'\xff\xd8\xffficticia', sha256='a' * 64)
        self.aviso = NotificacionSeguridad.objects.create(evento=evento, destinatario=self.user, tipo='AVISO_RESIDENTE')
        NotificacionSeguridad.objects.create(evento=evento, destinatario=self.otro, tipo='AVISO_RESIDENTE')

    def llamar(self, accion, usuario, rol, metodo='get', pk=None):
        request = getattr(APIRequestFactory(), metodo)('/')
        force_authenticate(request, user=usuario)
        with patch('seguridad_IA.api_aviso_residente.effective_role', return_value=rol):
            return AvisoResidenteViewSet.as_view({metodo: accion})(request, **({'pk': pk} if pk else {}))

    def test_solo_propios_y_datos_limitados(self):
        response = self.llamar('list', self.user, 'propietario')
        self.assertEqual(len(response.data), 1)
        self.assertEqual(set(response.data[0]), {'id', 'categoria', 'fecha_evento', 'creada', 'leida_en', 'evidencia_disponible'})
        self.assertEqual(self.llamar('list', self.user, 'guardia').status_code, 403)

    def test_evidencia_y_lectura_no_acceden_a_ajenos(self):
        self.assertEqual(self.llamar('evidencia', self.user, 'propietario', pk=self.aviso.pk).status_code, 200)
        self.assertEqual(self.llamar('evidencia', self.otro, 'inquilino', pk=self.aviso.pk).status_code, 404)
        self.assertEqual(self.llamar('leer', self.otro, 'inquilino', metodo='post', pk=self.aviso.pk).status_code, 404)
        self.assertEqual(self.llamar('leer', self.user, 'propietario', metodo='post', pk=self.aviso.pk).status_code, 200)
        self.aviso.refresh_from_db()
        self.assertIsNotNone(self.aviso.leida_en)
