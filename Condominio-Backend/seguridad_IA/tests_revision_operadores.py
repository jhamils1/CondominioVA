from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from .api_notificaciones import EventoViewSet
from .models import EventoSeguridad, HistorialEventoSeguridad


@override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=False)
class RevisionOperadoresTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='operador-ficticio')
        self.evento = EventoSeguridad.objects.create(origen='IA', categoria='Prueba', descripcion='Prueba', fecha_evento=timezone.now())
        self.factory = APIRequestFactory()

    def llamar(self, action, role, metodo='post'):
        request = getattr(self.factory, metodo)('/eventos/', {}, format='json')
        force_authenticate(request, user=self.user)
        view = EventoViewSet.as_view({metodo: action})
        with patch('administracion.access.effective_role', return_value=role), \
             patch('seguridad_IA.api_notificaciones.effective_role', return_value=role), \
             patch('seguridad_IA.notificaciones.effective_role', return_value=role), \
             patch('seguridad_IA.notificaciones.crear_notificaciones'):
            return view(request, pk=self.evento.pk) if action != 'list' else view(request)

    def test_admin_confirma_y_guardia_retira_con_auditoria(self):
        self.assertEqual(self.llamar('retirar_historial', 'guardia').status_code, 400)
        self.assertEqual(self.llamar('confirmar', 'administrador').status_code, 200)
        self.evento.refresh_from_db()
        self.assertEqual(self.evento.estado, EventoSeguridad.CONFIRMADO)
        self.assertEqual(self.llamar('retirar_historial', 'guardia').status_code, 200)
        self.assertTrue(HistorialEventoSeguridad.objects.filter(evento=self.evento, actor=self.user, accion='RETIRADA_HISTORIAL').exists())
        self.assertFalse(any(item['id'] == str(self.evento.pk) for item in self.llamar('list', 'guardia', 'get').data))
        self.assertTrue(EventoSeguridad.objects.filter(pk=self.evento.pk).exists())

    def test_residente_no_puede_confirmar_ni_retirar(self):
        self.assertEqual(self.llamar('confirmar', 'propietario').status_code, 403)
        self.assertEqual(self.llamar('retirar_historial', 'propietario').status_code, 403)

    def test_admin_retira_y_no_puede_descartar(self):
        self.assertEqual(self.llamar('descartar', 'administrador').status_code, 403)
        self.assertEqual(self.llamar('confirmar', 'guardia').status_code, 200)
        self.assertEqual(self.llamar('retirar_historial', 'administrador').status_code, 200)
        self.assertEqual(self.llamar('retirar_historial', 'administrador').status_code, 200)
        self.assertEqual(HistorialEventoSeguridad.objects.filter(evento=self.evento, accion='RETIRADA_HISTORIAL').count(), 1)
