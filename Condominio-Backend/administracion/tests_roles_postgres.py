"""Scenarios run exclusively through the temporary PostgreSQL runner."""
import threading
import unittest
import uuid
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch
from datetime import date

from django.contrib.auth.models import Group, User
from django.db import IntegrityError, close_old_connections, connection, transaction
from django.test import override_settings
from fcm_django.models import FCMDevice
from rest_framework.test import APIClient

from administracion.models import AsignacionRolPersonalizado, Cargo, Empleado, RolPersonalizado


class CustomRolePostgresTests(unittest.TestCase):
    def setUp(self):
        if connection.vendor != 'postgresql' or connection.settings_dict['USER'] != 'prueba_aislada':
            raise RuntimeError('Esta prueba requiere la instancia PostgreSQL temporal.')
        setting_override = override_settings(ROLES_PERSONALIZADOS_ACTIVOS=True)
        setting_override.enable()
        self.addCleanup(setting_override.disable)
        suffix = uuid.uuid4().hex
        admin_group, _ = Group.objects.get_or_create(name='administrador')
        guard_group, _ = Group.objects.get_or_create(name='Seguridad')
        self.admin = User.objects.create_user(username='admin_' + suffix)
        self.admin.groups.add(admin_group)
        self.guard = User.objects.create_user(username='guardia_' + suffix)
        self.guard.groups.add(guard_group)
        cargo = Cargo.objects.create(nombre='Cargo ' + suffix, salario_base=1)
        Empleado.objects.create(nombre='Prueba', apellido='Ficticia', direccion='X', sexo='M',
            CI=suffix[:20], fecha_nacimiento=date(1990, 1, 1), sueldo=1, cargo=cargo, user=self.guard)
        self.role = RolPersonalizado.objects.create(nombre='Rol ' + suffix, activo=True)
        self.token = 'token_ficticio_' + suffix

    def test_name_uniqueness_enforced_by_postgres(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            RolPersonalizado.objects.create(nombre='  ' + self.role.nombre.upper() + '  ')

    def test_assignment_and_device_registration_cannot_both_succeed(self):
        from administracion.models import SesionAplicacion
        from rest_framework_simplejwt.tokens import AccessToken
        session = SesionAplicacion.objects.create(usuario=self.guard)
        token = AccessToken.for_user(self.guard)
        token['session_id'] = str(session.pk)
        start = threading.Barrier(2, timeout=10)

        def invoke(kind):
            close_old_connections()
            try:
                client = APIClient()
                if kind == 'assign':
                    client.force_authenticate(user=self.admin)
                else:
                    client.force_authenticate(user=self.guard, token=token)
                start.wait()
                if kind == 'assign':
                    response = client.post(f'/api/roles-personalizados/{self.role.pk}/asignar/',
                                           {'usuario_id': self.guard.pk}, format='json')
                else:
                    response = client.post('/api/devices/sincronizar/',
                                           {'registration_id': self.token, 'type': 'android'}, format='json')
                return response.status_code
            finally:
                connection.close()

        with patch('finanzas.devices.validar_token', return_value='proyecto-ficticio'), \
             patch('finanzas.devices.proyecto_configurado', return_value=('proyecto-ficticio', None)), \
             ThreadPoolExecutor(max_workers=2) as pool:
            assignment = pool.submit(invoke, 'assign')
            device = pool.submit(invoke, 'device')
            results = (assignment.result(timeout=20), device.result(timeout=20))
        self.assertIn(results, ((200, 401), (200, 403), (400, 204)))
        self.assertFalse(AsignacionRolPersonalizado.objects.filter(usuario=self.guard).exists() and
                         FCMDevice.objects.filter(user=self.guard).exists())

    def test_assignment_and_deletion_are_serialized(self):
        start = threading.Barrier(2, timeout=10)
        role_id, guard_id, admin_id = self.role.pk, self.guard.pk, self.admin.pk

        def invoke(kind):
            close_old_connections()
            try:
                client = APIClient()
                client.force_authenticate(user=User.objects.get(pk=admin_id))
                start.wait()
                path = f'/api/roles-personalizados/{role_id}/'
                if kind == 'delete':
                    return client.delete(path).status_code
                return client.post(path + 'asignar/', {'usuario_id': guard_id}, format='json').status_code
            finally:
                connection.close()

        with ThreadPoolExecutor(max_workers=2) as pool:
            delete = pool.submit(invoke, 'delete')
            assign = pool.submit(invoke, 'assign')
            outcomes = delete.result(timeout=20), assign.result(timeout=20)
        self.assertIn(outcomes, ((204, 400), (409, 200)))
        if outcomes == (204, 400):
            self.assertFalse(RolPersonalizado.objects.filter(pk=role_id).exists())
            self.assertFalse(AsignacionRolPersonalizado.objects.filter(usuario_id=guard_id).exists())
        else:
            self.assertTrue(RolPersonalizado.objects.filter(pk=role_id).exists())
            self.assertTrue(AsignacionRolPersonalizado.objects.filter(usuario_id=guard_id, rol_id=role_id).exists())
