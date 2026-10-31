import unittest
import uuid
from datetime import date, timedelta
from types import SimpleNamespace
from unittest.mock import patch, MagicMock

from django.contrib.admin.models import LogEntry
from django.contrib import admin as django_admin
from django.contrib.auth.models import Group, User
from django.db import OperationalError, transaction
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings

from administracion.models import Cargo, Empleado, Persona
from residencial.models import Inquilino, ObjetoPerdido, Visita
from residencial.modelsVehiculo import Bloque, Unidad, Vehiculo, incidente
from finanzas.models import contrato, expensa
from fcm_django.models import FCMDevice
from seguridad_IA.models import EntregaFCMSeguridad, EventoSeguridad, NotificacionSeguridad


class AccessTests(unittest.TestCase):
    def setUp(self):
        self.atomic = transaction.atomic()
        self.atomic.__enter__()
        self.client = APIClient()
        self.groups = {name: Group.objects.create(name=name) for name in
                       ('administrador', 'Seguridad', 'propietario', 'inquilino')}
        def account(name, group):
            user = User.objects.create_user(username=name, password='Prueba1234')
            user.groups.add(self.groups[group])
            return user
        self.admin = account('admin', 'administrador')
        self.guard = account('guardia', 'Seguridad')
        self.owner = account('dueno', 'propietario')
        self.other = account('otro', 'propietario')
        self.tenant = account('inquilino', 'inquilino')
        self.owner_person = Persona.objects.create(nombre='Ana', apellido='Uno', sexo='F', tipo='P', CI='101', fecha_nacimiento=date(1990, 1, 1), user=self.owner)
        self.other_person = Persona.objects.create(nombre='Beto', apellido='Dos', sexo='M', tipo='P', CI='102', fecha_nacimiento=date(1990, 1, 1), user=self.other)
        self.tenant_person = Inquilino.objects.create(nombre='Cora', apellido='Tres', sexo='F', CI='103', fecha_nacimiento=date(1990, 1, 1), user=self.tenant, propietario=self.owner_person)
        cargo = Cargo.objects.create(nombre='Seguridad', salario_base=1)
        Empleado.objects.create(nombre='Guardia', apellido='Prueba', direccion='X', sexo='M', CI='201', sueldo=1, cargo=cargo, user=self.guard)
        block = Bloque.objects.create(nombre='A', direccion='X')
        self.unit = Unidad.objects.create(numero='1', codigo='A1', bloque=block)
        self.other_unit = Unidad.objects.create(numero='2', codigo='A2', bloque=block)
        contrato.objects.create(propietario=self.owner_person, unidad=self.unit, fecha_contrato=date(2025, 1, 1), estado='A')
        contrato.objects.create(propietario=self.other_person, unidad=self.other_unit, fecha_contrato=date(2025, 1, 1), estado='A')
        self.vehicle = Vehiculo.objects.create(persona=self.owner_person, placa='AA1', marca='A', modelo='B', color='C', tipo='Automóvil')
        self.other_vehicle = Vehiculo.objects.create(persona=self.other_person, placa='BB2', marca='A', modelo='B', color='C', tipo='Automóvil')
        self.expense = expensa.objects.create(unidad=self.unit, monto=30)
        self.other_expense = expensa.objects.create(unidad=self.other_unit, monto=50)
        self.incident = incidente.objects.create(descripcion='Prueba', fecha_incidente=timezone.now())

    def tearDown(self):
        transaction.set_rollback(True)
        self.atomic.__exit__(None, None, None)

    def auth(self, user):
        self.client.force_authenticate(user=user)

    def test_anonymous_sensitive_endpoints_are_denied(self):
        for path in ('users/', 'roles/', 'personas/', 'vehiculos/', 'visitas/',
                     'incidentes/', 'contratos/', 'multas/', 'expensas/', 'resumen/', 'devices/',
                     'eventos-seguridad/', 'notificaciones-seguridad/', 'reconocimiento/',
                     'enrolar/', 'probar-luxand/', 'verificar-luxand/'):
            with self.subTest(path=path):
                self.assertIn(self.client.get('/api/' + path).status_code, (401, 403))

    def test_admin_can_create_user_without_technical_privileges_and_audits(self):
        self.auth(self.admin)
        response = self.client.post('/api/users/', {'username': 'nuevo', 'email': 'nuevo@example.test',
             'password': 'Prueba1234', 'role_id': self.groups['propietario'].pk}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(username='nuevo')
        self.assertFalse(user.is_superuser)
        self.assertFalse(user.is_staff)
        self.assertTrue(LogEntry.objects.filter(user_id=self.admin.pk, object_id=str(user.pk)).exists())

    def test_provision_creates_guard_and_links_active_employee(self):
        cargo = Cargo.objects.first()
        employee = Empleado.objects.create(nombre='Nueva', apellido='Guardia', direccion='X', sexo='F', CI='901', sueldo=1, cargo=cargo)
        self.auth(self.admin)
        response = self.client.post('/api/provisionar-cuenta/', {'tipo': 'empleado', 'perfil_id': employee.pk,
            'modo': 'crear', 'username': 'nueva_guardia', 'email': 'guardia@example.test', 'password': 'Segura123'}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        employee.refresh_from_db()
        self.assertEqual(employee.user_id, response.data['id'])
        self.assertTrue(employee.user.check_password('Segura123'))
        self.assertFalse(employee.user.is_superuser)
        self.assertEqual(response.data['role'], 'guardia')
        self.assertNotIn('password', response.data)
        self.assertTrue(LogEntry.objects.filter(user_id=self.admin.pk, object_id=str(employee.pk)).exists())
        self.auth(employee.user)
        self.assertEqual(self.client.get('/api/me/').data['role'], 'guardia')

    def test_provision_resolves_role_name_instead_of_assuming_group_id(self):
        group = self.groups['Seguridad']
        group.name = 'grupo-anterior'
        group.save(update_fields=['name'])
        replacement = Group.objects.create(id=777, name='Seguridad')
        employee = Empleado.objects.create(nombre='Ejemplo', apellido='Guardia', direccion='X', sexo='M',
            CI='912', sueldo=1, cargo=Cargo.objects.first())
        self.auth(self.admin)
        response = self.client.post('/api/provisionar-cuenta/', {'tipo': 'empleado', 'perfil_id': employee.pk,
            'modo': 'crear', 'username': 'guardia_distinto', 'email': 'distinto@example.test', 'password': 'Segura123'}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        employee.refresh_from_db()
        self.assertEqual(list(employee.user.groups.values_list('pk', flat=True)), [replacement.pk])

    def test_employee_can_receive_explicit_administrator_role_without_technical_privileges(self):
        employee = Empleado.objects.create(nombre='Admin', apellido='Prueba', direccion='X', sexo='F', CI='920', sueldo=1, cargo=Cargo.objects.first())
        self.auth(self.admin)
        data = {'tipo': 'empleado', 'perfil_id': employee.pk, 'modo': 'crear', 'rol': 'administrador',
                'username': 'admin_empleado', 'email': 'admin_empleado@example.test', 'password': 'Segura123'}
        response = self.client.post('/api/provisionar-cuenta/', data, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        employee.refresh_from_db()
        self.assertFalse(employee.user.is_staff)
        self.assertFalse(employee.user.is_superuser)
        self.auth(employee.user)
        self.assertEqual(self.client.get('/api/me/').data['role'], 'administrador')

    def test_employee_resident_creation_requires_matching_active_profile(self):
        employee = Empleado.objects.create(nombre='Doble', apellido='Perfil', direccion='X', sexo='F', CI='921', sueldo=1, cargo=Cargo.objects.first())
        self.auth(self.admin)
        data = {'tipo': 'empleado', 'perfil_id': employee.pk, 'modo': 'crear', 'rol': 'propietario',
                'username': 'empleado_propietario', 'email': 'dual@example.test', 'password': 'Segura123'}
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', data, format='json').status_code, 400)
        self.assertFalse(User.objects.filter(username=data['username']).exists())
        persona = Persona.objects.create(nombre='Doble', apellido='Perfil', sexo='F', tipo='P', CI='921', fecha_nacimiento=date(1990, 1, 1))
        response = self.client.post('/api/provisionar-cuenta/', data, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        employee.refresh_from_db(); persona.refresh_from_db()
        self.assertEqual(employee.user_id, persona.user_id)
        self.assertTrue(LogEntry.objects.filter(user=self.admin, object_id=str(persona.pk), change_message='Vinculación de cuenta residencial').exists())
        self.auth(employee.user)
        self.assertEqual(self.client.get('/api/me/').data['role'], 'propietario')
        self.assertEqual(self.client.get('/api/users/').status_code, 403)

    def test_employee_can_link_admin_account_with_matching_resident_profile(self):
        employee = Empleado.objects.create(nombre='Admin', apellido='Residente', direccion='X', sexo='F', CI='925', sueldo=1, cargo=Cargo.objects.first())
        user = User.objects.create_user(username='admin_residente', password='Segura123')
        user.groups.add(self.groups['administrador'])
        Persona.objects.create(nombre='Admin', apellido='Residente', sexo='F', tipo='P', CI='925', fecha_nacimiento=date(1990, 1, 1), user=user)
        self.auth(self.admin)
        response = self.client.post('/api/provisionar-cuenta/', {'tipo': 'empleado', 'perfil_id': employee.pk,
            'modo': 'vincular', 'rol': 'administrador', 'usuario_id': user.pk}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        employee.refresh_from_db()
        self.assertEqual(employee.user_id, user.pk)
        self.assertFalse(user.is_superuser)

    def test_employee_may_link_existing_tenant_account_only_for_same_person(self):
        employee = Empleado.objects.create(nombre='Cora', apellido='Tres', direccion='X', sexo='F', CI=self.tenant_person.CI, sueldo=1, cargo=Cargo.objects.first())
        self.auth(self.admin)
        data = {'tipo': 'empleado', 'perfil_id': employee.pk, 'modo': 'vincular', 'rol': 'inquilino', 'usuario_id': self.tenant.pk}
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', {**data, 'usuario_id': self.owner.pk}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', data, format='json').status_code, 200)
        employee.refresh_from_db()
        self.assertEqual(employee.user_id, self.tenant.pk)
        self.auth(self.tenant)
        self.assertEqual(self.client.get('/api/me/').data['role'], 'inquilino')
        self.assertEqual(self.client.get('/api/eventos-seguridad/').status_code, 403)

    def test_direct_employee_link_enforces_resident_identity(self):
        self.auth(self.admin)
        data = {'nombre': 'Cora', 'apellido': 'Tres', 'sexo': 'F', 'CI': 'error-de-identidad',
                'direccion': 'X', 'sueldo': 1, 'cargo': Cargo.objects.first().pk, 'user': self.tenant.pk}
        self.assertEqual(self.client.post('/api/empleados/', data, format='json').status_code, 400)
        data['CI'] = self.tenant_person.CI
        response = self.client.post('/api/empleados/', data, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        employee = Empleado.objects.get(pk=response.data['id'])
        self.assertEqual(employee.user_id, self.tenant.pk)
        self.assertEqual(self.client.patch(f'/api/empleados/{employee.pk}/', {'CI': 'otra-cedula'}, format='json').status_code, 400)

    def test_employee_resident_profile_mismatch_and_inactive_are_rejected(self):
        employee = Empleado.objects.create(nombre='Empleado', apellido='Prueba', direccion='X', sexo='F', CI='922', sueldo=1, cargo=Cargo.objects.first())
        persona = Persona.objects.create(nombre='Inactivo', apellido='Prueba', sexo='F', tipo='P', CI='922', estado='I', fecha_nacimiento=date(1990, 1, 1))
        self.auth(self.admin)
        data = {'tipo': 'empleado', 'perfil_id': employee.pk, 'modo': 'crear', 'rol': 'propietario',
                'username': 'cuenta_inactiva', 'email': 'inactiva@example.test', 'password': 'Segura123'}
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', data, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', {**data, 'rol': 'inquilino'}, format='json').status_code, 400)
        employee.refresh_from_db()
        self.assertIsNone(employee.user_id)

    def test_employee_new_tenant_account_rolls_back_if_link_audit_fails(self):
        employee = Empleado.objects.create(nombre='Inquilino', apellido='Prueba', direccion='X', sexo='F', CI='924', sueldo=1, cargo=Cargo.objects.first())
        tenant = Inquilino.objects.create(nombre='Inquilino', apellido='Prueba', sexo='F', CI='924', fecha_nacimiento=date(1990, 1, 1), propietario=self.owner_person)
        self.auth(self.admin)
        data = {'tipo': 'empleado', 'perfil_id': employee.pk, 'modo': 'crear', 'rol': 'inquilino',
                'username': 'empleado_inquilino', 'email': 'inquilino_dual@example.test', 'password': 'Segura123'}
        with patch('administracion.provision.record_action', side_effect=[None, RuntimeError('fallo simulado')]):
            with self.assertRaises(RuntimeError):
                self.client.post('/api/provisionar-cuenta/', data, format='json')
        employee.refresh_from_db(); tenant.refresh_from_db()
        self.assertIsNone(employee.user_id)
        self.assertIsNone(tenant.user_id)
        self.assertFalse(User.objects.filter(username=data['username']).exists())
        response = self.client.post('/api/provisionar-cuenta/', data, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        employee.refresh_from_db(); tenant.refresh_from_db()
        self.assertEqual(employee.user_id, tenant.user_id)
        self.auth(employee.user)
        self.assertEqual(self.client.get('/api/me/').data['role'], 'inquilino')

    def test_provision_creates_and_links_owner_and_tenant(self):
        owner = Persona.objects.create(nombre='Dora', apellido='Ejemplo', sexo='F', tipo='P', CI='902', fecha_nacimiento=date(1990, 1, 1))
        tenant = Inquilino.objects.create(nombre='Elena', apellido='Ejemplo', sexo='F', CI='903', fecha_nacimiento=date(1990, 1, 1), propietario=owner)
        self.auth(self.admin)
        for tipo, profile, username in (('propietario', owner, 'duena_nueva'), ('inquilino', tenant, 'inquilina_nueva')):
            with self.subTest(tipo=tipo):
                response = self.client.post('/api/provisionar-cuenta/', {'tipo': tipo, 'perfil_id': profile.pk,
                    'modo': 'crear', 'username': username, 'email': username + '@example.test', 'password': 'Segura123'}, format='json')
                self.assertEqual(response.status_code, 201, response.data)
                profile.refresh_from_db()
                self.auth(profile.user)
                self.assertEqual(self.client.get('/api/me/').data['role'], tipo)
                self.auth(self.admin)

    def test_provision_existing_compatible_account_without_overwriting_links(self):
        profile = Persona.objects.create(nombre='Ficticia', apellido='Uno', sexo='F', tipo='P', CI='904', fecha_nacimiento=date(1990, 1, 1))
        account = User.objects.create_user(username='sin_perfil', password='Segura123')
        account.groups.add(self.groups['propietario'])
        self.auth(self.admin)
        data = {'tipo': 'propietario', 'perfil_id': profile.pk, 'modo': 'vincular', 'usuario_id': account.pk}
        response = self.client.post('/api/provisionar-cuenta/', data, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        profile.refresh_from_db()
        self.assertEqual(profile.user_id, account.pk)
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', data, format='json').status_code, 400)
        other = Persona.objects.create(nombre='Ficticia', apellido='Dos', sexo='F', tipo='P', CI='905', fecha_nacimiento=date(1990, 1, 1))
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', {**data, 'perfil_id': other.pk}, format='json').status_code, 400)
        other.refresh_from_db()
        self.assertIsNone(other.user_id)

    def test_provision_rejects_missing_duplicate_roles_and_rolls_back(self):
        profile = Persona.objects.create(nombre='Prueba', apellido='Vacia', sexo='F', tipo='P', CI='906', fecha_nacimiento=date(1990, 1, 1))
        self.auth(self.admin)
        data = {'tipo': 'propietario', 'perfil_id': profile.pk, 'modo': 'crear', 'username': 'cuenta_ficticia',
                'email': 'ficticia@example.test', 'password': 'Segura123'}
        duplicate = Group.objects.create(name='PROPIETARIO')
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', data, format='json').status_code, 400)
        duplicate.delete()
        group = self.groups['propietario']
        group.name = 'sin-rol-compatible'
        group.save(update_fields=['name'])
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', data, format='json').status_code, 400)
        group.name = 'propietario'
        group.save(update_fields=['name'])
        with patch('administracion.provision.record_action', side_effect=[None, RuntimeError('fallo simulado')]):
            with self.assertRaises(RuntimeError):
                self.client.post('/api/provisionar-cuenta/', data, format='json')
        self.assertFalse(User.objects.filter(username=data['username']).exists())
        profile.refresh_from_db()
        self.assertIsNone(profile.user_id)

    def test_provision_rejects_invalid_password_roles_profiles_and_nonadmins(self):
        owner = Persona.objects.create(nombre='Perfil', apellido='Prueba', sexo='F', tipo='P', CI='907', fecha_nacimiento=date(1990, 1, 1))
        visitor = Persona.objects.create(nombre='Visita', apellido='Prueba', sexo='F', tipo='V', CI='908', fecha_nacimiento=date(1990, 1, 1))
        self.auth(self.guard)
        data = {'tipo': 'propietario', 'perfil_id': owner.pk, 'modo': 'crear', 'username': 'una_cuenta', 'email': 'a@example.test', 'password': 'Segura123'}
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', data, format='json').status_code, 403)
        self.auth(self.admin)
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', {**data, 'password': '123'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', {**data, 'perfil_id': visitor.pk}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', {**data, 'tipo': 'inquilino'}, format='json').status_code, 400)
        account = User.objects.create_user(username='rol_errado', password='Segura123')
        account.groups.add(self.groups['inquilino'])
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', {'tipo': 'propietario', 'perfil_id': owner.pk, 'modo': 'vincular', 'usuario_id': account.pk}, format='json').status_code, 400)
        self.assertFalse(User.objects.filter(username='una_cuenta').exists())

    def test_provision_rejects_inactive_profile_and_technical_account(self):
        owner = Persona.objects.create(nombre='Perfil', apellido='Inactivo', sexo='F', tipo='P', CI='913',
            fecha_nacimiento=date(1990, 1, 1), estado='I')
        self.auth(self.admin)
        data = {'tipo': 'propietario', 'perfil_id': owner.pk, 'modo': 'crear', 'username': 'inactivo_nuevo',
                'email': 'inactivo@example.test', 'password': 'Segura123'}
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', data, format='json').status_code, 400)
        owner.estado = 'A'
        owner.save(update_fields=['estado'])
        technical = User.objects.create_superuser(username='cuenta_tecnica', password='Segura123')
        technical.groups.add(self.groups['propietario'])
        self.assertEqual(self.client.post('/api/provisionar-cuenta/', {'tipo': 'propietario', 'perfil_id': owner.pk,
            'modo': 'vincular', 'usuario_id': technical.pk}, format='json').status_code, 400)
        owner.refresh_from_db()
        self.assertIsNone(owner.user_id)

    def test_profile_creation_remains_possible_without_account(self):
        self.auth(self.admin)
        response = self.client.post('/api/propietarios/', {'nombre': 'Sin', 'apellido': 'Cuenta', 'sexo': 'F',
            'CI': '909', 'fecha_nacimiento': '1990-01-01'}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertIsNone(Persona.objects.get(pk=response.data['id']).user_id)
        response = self.client.post('/api/empleados/', {'nombre': 'Sin', 'apellido': 'Cuenta', 'sexo': 'M',
            'CI': '910', 'direccion': 'X', 'sueldo': 1, 'cargo': Cargo.objects.first().pk}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertIsNone(Empleado.objects.get(pk=response.data['id']).user_id)
        response = self.client.post('/api/inquilinos/', {'nombre': 'Sin', 'apellido': 'Cuenta', 'sexo': 'F',
            'CI': '911', 'fecha_nacimiento': '1990-01-01', 'propietario': self.owner_person.pk}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertIsNone(Inquilino.objects.get(pk=response.data['id']).user_id)

    def test_guard_cannot_access_users_roles_or_finances(self):
        self.auth(self.guard)
        for path in ('users/', 'roles/', 'permissions/', 'contratos/', 'expensas/', 'multas/', 'resumen/'):
            with self.subTest(path=path):
                self.assertEqual(self.client.get('/api/' + path).status_code, 403)
        self.assertEqual(self.client.get('/api/vehiculos/').status_code, 200)
        self.assertEqual(self.client.post('/api/visitantes/', {}, format='json').status_code, 403)

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
    def test_role_matrix_for_sensitive_lists(self):
        paths = ('users/', 'roles/', 'expensas/', 'incidentes/', 'eventos-seguridad/', 'notificaciones-seguridad/')
        expected = {
            self.admin.pk: (200, 200, 200, 200, 200, 200),
            self.guard.pk: (403, 403, 403, 200, 200, 200),
            self.owner.pk: (403, 403, 200, 403, 403, 403),
            self.tenant.pk: (403, 403, 200, 403, 403, 403),
        }
        for user in (self.admin, self.guard, self.owner, self.tenant):
            self.auth(user)
            for path, code in zip(paths, expected[user.pk]):
                with self.subTest(user=user.username, path=path):
                    self.assertEqual(self.client.get('/api/' + path).status_code, code)

    def test_residents_cannot_access_incidents_or_security(self):
        for user in (self.owner, self.tenant):
            self.auth(user)
            for path in ('incidentes/', 'alpr/', 'verificar-enrolamiento/'):
                with self.subTest(user=user.username, path=path):
                    self.assertEqual(self.client.get('/api/' + path).status_code, 403)

    def test_owner_data_scopes_and_reassignment(self):
        self.auth(self.owner)
        r = self.client.get('/api/vehiculos/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual([v['id'] for v in r.data], [self.vehicle.pk])
        self.assertEqual(self.client.get(f'/api/vehiculos/{self.other_vehicle.pk}/').status_code, 404)
        self.assertEqual(self.client.patch(f'/api/vehiculos/{self.vehicle.pk}/', {'persona': self.other_person.pk}, format='json').status_code, 400)
        r = self.client.get('/api/expensas/')
        self.assertEqual([e['id'] for e in r.data], [self.expense.pk])
        self.assertEqual(self.client.get(f'/api/expensas/{self.other_expense.pk}/').status_code, 404)
        self.assertEqual(self.client.get(f'/api/unidades/{self.other_unit.pk}/').status_code, 404)

    def test_owner_sees_only_active_tenants_with_verified_dates_and_minimal_fields(self):
        today = timezone.localdate()
        self.tenant_person.fecha_inicio = today - timedelta(days=10)
        self.tenant_person.fecha_fin = today + timedelta(days=10)
        self.tenant_person.save(update_fields=['fecha_inicio', 'fecha_fin'])
        self.auth(self.owner)
        response = self.client.get('/api/inquilinos/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.data], [self.tenant_person.pk])
        self.assertNotIn('CI', response.data[0])
        self.tenant_person.fecha_fin = today - timedelta(days=1)
        self.tenant_person.save(update_fields=['fecha_fin'])
        self.assertEqual(self.client.get('/api/inquilinos/').data, [])

    def test_application_roles_do_not_grant_django_admin_access(self):
        self.guard.is_staff = True
        self.owner.is_staff = True
        self.admin.is_staff = True
        for user in (self.guard, self.owner, self.admin):
            self.assertFalse(django_admin.site.has_permission(SimpleNamespace(user=user)))
        technical = User.objects.create_superuser(username='tecnico', password='Prueba1234')
        self.assertTrue(django_admin.site.has_permission(SimpleNamespace(user=technical)))
        technical.groups.add(self.groups['Seguridad'])
        self.assertFalse(django_admin.site.has_permission(SimpleNamespace(user=technical)))
        staff = User.objects.create_user(username='personal', password='Prueba1234', is_staff=True)
        self.assertFalse(django_admin.site.has_permission(SimpleNamespace(user=staff)))

    def test_tenant_has_no_ambiguous_unit_or_owner_debt(self):
        self.auth(self.tenant)
        profile = self.client.get(f'/api/inquilinos/{self.tenant_person.pk}/')
        self.assertEqual(profile.status_code, 200)
        self.assertNotIn('propietario_ci', profile.data)
        self.assertNotIn('luxand_uuid', profile.data)
        for path in ('unidades/', 'contratos/', 'expensas/', 'multas/'):
            with self.subTest(path=path):
                response = self.client.get('/api/' + path)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data, [])

    def test_guard_incident_hides_financial_fields_and_cannot_delete(self):
        self.auth(self.guard)
        response = self.client.get(f'/api/incidentes/{self.incident.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('multa', response.data)
        self.assertNotIn('multa_detalle', response.data)
        self.assertEqual(self.client.delete(f'/api/incidentes/{self.incident.pk}/').status_code, 403)

    def test_guard_manual_incident_is_audited(self):
        self.auth(self.guard)
        response = self.client.post('/api/incidentes/', {'descripcion': 'Prueba',
            'fecha_incidente': '2026-01-01T12:00:00Z'}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        obj = incidente.objects.get(pk=response.data['id'])
        self.assertIsNone(obj.multa_id)
        self.assertTrue(LogEntry.objects.filter(user_id=self.guard.pk, object_id=str(obj.pk)).exists())
        response = self.client.patch(f'/api/incidentes/{obj.pk}/', {'multa': 42}, format='json')
        self.assertEqual(response.status_code, 403)

    def test_role_and_inactive_account_are_checked_on_existing_access_token(self):
        token = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json').data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        self.assertEqual(self.client.get('/api/vehiculos/').status_code, 200)
        self.owner.groups.clear()
        self.assertEqual(self.client.get('/api/vehiculos/').status_code, 401)
        self.owner.groups.add(self.groups['propietario'])
        self.owner.is_active = False
        self.owner.save(update_fields=['is_active'])
        self.assertEqual(self.client.get('/api/vehiculos/').status_code, 401)

    def test_admin_cannot_change_own_role_or_delete_user(self):
        self.auth(self.admin)
        response = self.client.patch(f'/api/users/{self.admin.pk}/', {'role_id': self.groups['propietario'].pk}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.client.delete(f'/api/users/{self.other.pk}/').status_code, 405)
        self.assertTrue(Persona.objects.filter(pk=self.other_person.pk).exists())

    def test_admin_cannot_edit_own_group_or_create_duplicate_role(self):
        self.auth(self.admin)
        response = self.client.patch(f'/api/roles/{self.groups["administrador"].pk}/',
                                     {'permission_ids': []}, format='json')
        self.assertEqual(response.status_code, 403)
        response = self.client.post('/api/roles/', {'name': 'guardia de seguridad', 'permission_ids': []}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_admin_role_change_is_recorded_and_changes_authorization(self):
        self.auth(self.admin)
        response = self.client.patch(f'/api/users/{self.owner.pk}/',
            {'role_id': self.groups['Seguridad'].pk}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        audit = LogEntry.objects.filter(user_id=self.admin.pk, object_id=str(self.owner.pk)).latest('action_time')
        self.assertIn('propietario', audit.change_message)
        self.assertIn('Seguridad', audit.change_message)
        self.auth(self.owner)
        self.assertEqual(self.client.get('/api/expensas/').status_code, 403)

    def test_login_blocks_family_and_audits_success(self):
        response = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(LogEntry.objects.filter(user_id=self.owner.pk, change_message='Inicio de sesión').exists())
        self.owner_person.tipo = 'F'
        self.owner_person.save(update_fields=['tipo'])
        response = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_inactive_user_cannot_log_in(self):
        self.owner.is_active = False
        self.owner.save(update_fields=['is_active'])
        response = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_legacy_notifications_still_call_provider_for_expenses_and_lost_objects(self):
        FCMDevice.objects.create(user=self.owner, registration_id='token-legacy-ficticio', type='android', active=True)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message') as send:
            expensa.objects.create(unidad=self.unit, monto=99)
            self.assertEqual(send.call_count, 1)
            ObjetoPerdido.objects.create(titulo='Objeto de prueba', foto='https://example.test/imagen.jpg')
            self.assertEqual(send.call_count, 2)

    def test_expense_notification_skips_ambiguous_active_contracts(self):
        contrato.objects.create(propietario=self.other_person, unidad=self.unit,
                                fecha_contrato=date(2025, 1, 1), estado='A')
        FCMDevice.objects.create(user=self.owner, registration_id='token-primero-ficticio', type='android', active=True)
        FCMDevice.objects.create(user=self.other, registration_id='token-segundo-ficticio', type='android', active=True)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message', autospec=True) as send:
            expensa.objects.create(unidad=self.unit, monto=23)
        send.assert_not_called()

    def test_expense_notification_sends_only_to_authorized_current_owner_devices(self):
        active = FCMDevice.objects.create(user=self.owner, registration_id='propietario-activo-prueba', type='android', active=True)
        FCMDevice.objects.create(user=self.owner, registration_id='propietario-inactivo-prueba', type='android', active=False)
        FCMDevice.objects.create(user=self.other, registration_id='ajeno-prueba', type='android', active=True)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message', autospec=True) as send:
            new_expense = expensa.objects.create(unidad=self.unit, monto=25)
        self.assertEqual(send.call_count, 1)
        devices = send.call_args.args[0]
        self.assertEqual(list(devices.values_list('pk', flat=True)), [active.pk])
        self.assertEqual(send.call_args.args[1].data['expensa_id'], str(new_expense.pk))

    def test_expense_notification_requires_active_role_and_profile(self):
        FCMDevice.objects.create(user=self.owner, registration_id='propietario-prueba-rol', type='android', active=True)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message') as send:
            self.owner.is_active = False
            self.owner.save(update_fields=['is_active'])
            expensa.objects.create(unidad=self.unit, monto=1)
            self.owner.is_active = True
            self.owner.save(update_fields=['is_active'])
            self.owner_person.estado = 'I'
            self.owner_person.save(update_fields=['estado'])
            expensa.objects.create(unidad=self.unit, monto=2)
            self.owner_person.estado = 'A'
            self.owner_person.save(update_fields=['estado'])
            self.owner.groups.clear()
            expensa.objects.create(unidad=self.unit, monto=3)
            self.owner.groups.add(self.groups['Seguridad'])
            Empleado.objects.create(nombre='Guardia', apellido='No financiero', direccion='X', sexo='M',
                CI='914', sueldo=1, cargo=Cargo.objects.first(), user=self.owner)
            expensa.objects.create(unidad=self.unit, monto=4)
            send.assert_not_called()

    def test_expense_notification_admin_owner_requires_active_owner_profile(self):
        self.owner.groups.set([self.groups['administrador']])
        FCMDevice.objects.create(user=self.owner, registration_id='administrador-propietario-prueba', type='android', active=True)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message') as send:
            self.owner_person.estado = 'I'
            self.owner_person.save(update_fields=['estado'])
            expensa.objects.create(unidad=self.unit, monto=1)
            self.assertEqual(send.call_count, 0)
            self.owner_person.estado = 'A'
            self.owner_person.save(update_fields=['estado'])
            expensa.objects.create(unidad=self.unit, monto=2)
            self.assertEqual(send.call_count, 1)

    def test_expense_notification_skips_contracts_with_same_owner_and_future_start(self):
        FCMDevice.objects.create(user=self.owner, registration_id='propietario-doble-prueba', type='android', active=True)
        original = contrato.objects.get(unidad=self.unit, propietario=self.owner_person)
        second = contrato.objects.create(propietario=self.owner_person, unidad=self.unit, fecha_contrato=date(2025, 1, 1), estado='A')
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message') as send:
            expensa.objects.create(unidad=self.unit, monto=1)
            self.assertEqual(send.call_count, 0)
            second.estado = 'F'
            second.save(update_fields=['estado'])
            original.fecha_contrato = timezone.localdate() + timedelta(days=1)
            original.save(update_fields=['fecha_contrato'])
            expensa.objects.create(unidad=self.unit, monto=2)
            self.assertEqual(send.call_count, 0)

    def test_expense_notification_never_runs_when_existing_expense_is_updated(self):
        FCMDevice.objects.create(user=self.owner, registration_id='propietario-actualizacion-prueba', type='android', active=True)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message') as send:
            self.expense.descripcion = 'Actualizada'
            self.expense.save(update_fields=['descripcion'])
        send.assert_not_called()

    def test_expense_notification_skips_expenses_before_current_contract(self):
        from finanzas.signals import enviar_notificacion_expensa
        expensa.objects.filter(pk=self.expense.pk).update(fecha_emision=date(2024, 1, 1))
        self.expense.refresh_from_db()
        FCMDevice.objects.create(user=self.owner, registration_id='propietario-historial-prueba', type='android', active=True)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message') as send:
            enviar_notificacion_expensa(sender=expensa, instance=self.expense, created=True)
        send.assert_not_called()

    def test_expense_creation_survives_provider_failure(self):
        FCMDevice.objects.create(user=self.owner, registration_id='propietario-error-prueba', type='android', active=True)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message', side_effect=RuntimeError('error simulado')):
            new_expense = expensa.objects.create(unidad=self.unit, monto=25)
        self.assertTrue(expensa.objects.filter(pk=new_expense.pk).exists())

    def test_refresh_rechecks_role(self):
        response = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json')
        self.assertEqual(response.status_code, 200)
        refresh = response.data['refresh']
        self.owner.groups.clear()
        response = self.client.post('/api/refresh/', {'refresh': refresh}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_expired_access_and_blacklisted_refresh_are_rejected(self):
        token = AccessToken.for_user(self.owner)
        token.set_exp(lifetime=timedelta(seconds=-1))
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + str(token))
        self.assertEqual(self.client.get('/api/me/').status_code, 401)
        self.client.credentials()
        refresh = RefreshToken.for_user(self.owner)
        refresh.blacklist()
        self.assertEqual(self.client.post('/api/refresh/', {'refresh': str(refresh)}, format='json').status_code, 401)

    def test_manipulating_client_role_cannot_grant_admin_access(self):
        self.auth(self.owner)
        self.assertEqual(self.client.get('/api/users/', HTTP_X_USER_ROLE='administrador').status_code, 403)
        self.assertEqual(self.client.post('/api/roles/', {'name': 'administrador', 'is_superuser': True}, format='json').status_code, 403)
        self.owner.refresh_from_db()
        self.assertFalse(self.owner.is_superuser)

    def test_logout_revokes_access_and_refresh_immediately(self):
        response = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json')
        self.assertEqual(response.status_code, 200)
        access, refresh = response.data['access'], response.data['refresh']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
        self.assertEqual(self.client.post('/api/logout/', {'refresh': refresh}, format='json').status_code, 205)
        self.assertEqual(self.client.get('/api/me/').status_code, 401)
        self.client.credentials()
        self.assertEqual(self.client.post('/api/refresh/', {'refresh': refresh}, format='json').status_code, 401)

    def test_logout_rejects_other_users_refresh_without_revoking_it(self):
        foreign = self.client.post('/api/login/', {'username': self.other.username, 'password': 'Prueba1234'}, format='json').data['refresh']
        access = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json').data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
        response = self.client.post('/api/logout/', {'refresh': foreign}, format='json')
        self.assertEqual(response.status_code, 400)
        self.client.credentials()
        self.assertEqual(self.client.post('/api/refresh/', {'refresh': foreign}, format='json').status_code, 200)

    def test_logout_rejects_invalid_refresh_without_leaking_details(self):
        access = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json').data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
        response = self.client.post('/api/logout/', {'refresh': 'token-ficticio-invalido'}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertNotIn('token-ficticio-invalido', str(response.data))

    def test_sessions_are_independent_and_legacy_tokens_are_rejected(self):
        first = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json').data
        second = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json').data
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + first['access'])
        self.assertEqual(self.client.post('/api/logout/', {'refresh': second['refresh']}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/logout/', {'refresh': first['refresh']}, format='json').status_code, 205)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + second['access'])
        self.assertEqual(self.client.get('/api/me/').status_code, 200)
        self.client.credentials()
        self.assertEqual(self.client.post('/api/refresh/', {'refresh': second['refresh']}, format='json').status_code, 200)
        old = RefreshToken.for_user(self.owner)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + str(old.access_token))
        self.assertEqual(self.client.get('/api/me/').status_code, 401)
        self.client.credentials()
        self.assertEqual(self.client.post('/api/refresh/', {'refresh': str(old)}, format='json').status_code, 401)

    def test_logout_revokes_all_access_tokens_from_rotated_session(self):
        login = self.client.post('/api/login/', {'username': self.owner.username, 'password': 'Prueba1234'}, format='json').data
        rotation = self.client.post('/api/refresh/', {'refresh': login['refresh']}, format='json')
        self.assertEqual(rotation.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + rotation.data['access'])
        self.assertEqual(self.client.post('/api/logout/', {'refresh': rotation.data['refresh']}, format='json').status_code, 205)
        for access in (login['access'], rotation.data['access']):
            self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + access)
            self.assertEqual(self.client.get('/api/me/').status_code, 401)
        self.client.credentials()
        self.assertEqual(self.client.post('/api/refresh/', {'refresh': rotation.data['refresh']}, format='json').status_code, 401)

    def test_payment_checks_owner_before_contacting_provider(self):
        self.auth(self.owner)
        with patch('finanzas.views_payments.stripe.PaymentIntent.create') as create:
            response = self.client.post('/api/create-payment-intent/', {'expensa_id': self.other_expense.pk}, format='json')
        self.assertEqual(response.status_code, 404)
        create.assert_not_called()
        payment = MagicMock(id='pi_test', client_secret='test_secret')
        with patch('finanzas.views_payments.stripe.PaymentIntent.create', return_value=payment):
            response = self.client.post('/api/create-payment-intent/', {'expensa_id': self.expense.pk}, format='json')
        self.assertEqual(response.status_code, 201)

    def test_payment_verification_rejects_other_resident(self):
        self.auth(self.owner)
        self.other_expense.stripe_payment_intent_id = 'pi_otra'
        self.other_expense.save(update_fields=['stripe_payment_intent_id'])
        payment = {'status': 'succeeded', 'metadata': {'expensa_id': str(self.other_expense.pk)}}
        with patch('finanzas.views_payments.stripe.PaymentIntent.retrieve', return_value=payment) as retrieve:
            response = self.client.get('/api/verify-payment-intent/', {'payment_intent_id': 'pi_otra'})
        retrieve.assert_not_called()
        self.assertEqual(response.status_code, 404)
        self.other_expense.refresh_from_db()
        self.assertFalse(self.other_expense.pagada)

    def test_verify_own_payment_checks_metadata(self):
        self.auth(self.owner)
        self.expense.stripe_payment_intent_id = 'pi_propia'
        self.expense.save(update_fields=['stripe_payment_intent_id'])
        payment = {'status': 'succeeded', 'metadata': {'expensa_id': str(self.other_expense.pk)}}
        with patch('finanzas.views_payments.stripe.PaymentIntent.retrieve', return_value=payment):
            response = self.client.get('/api/verify-payment-intent/', {'payment_intent_id': 'pi_propia'})
        self.assertEqual(response.status_code, 404)
        self.expense.refresh_from_db()
        self.assertFalse(self.expense.pagada)
        payment['metadata']['expensa_id'] = str(self.expense.pk)
        with patch('finanzas.views_payments.stripe.PaymentIntent.retrieve', return_value=payment):
            response = self.client.get('/api/verify-payment-intent/', {'payment_intent_id': 'pi_propia'})
        self.assertEqual(response.status_code, 200)
        self.expense.refresh_from_db()
        self.assertTrue(self.expense.pagada)

    def test_former_and_ambiguous_contracts_do_not_expose_unit_or_expenses(self):
        self.auth(self.owner)
        own_contract = contrato.objects.get(unidad=self.unit, propietario=self.owner_person)
        own_contract.estado = 'F'
        own_contract.save(update_fields=['estado'])
        self.assertEqual(self.client.get(f'/api/unidades/{self.unit.pk}/').status_code, 404)
        self.assertEqual(self.client.get(f'/api/expensas/{self.expense.pk}/').status_code, 404)
        own_contract.estado = 'A'
        own_contract.save(update_fields=['estado'])
        contrato.objects.create(propietario=self.other_person, unidad=self.unit,
                                fecha_contrato=date(2025, 1, 1), estado='A')
        self.assertEqual(self.client.get(f'/api/unidades/{self.unit.pk}/').status_code, 404)
        self.assertEqual(self.client.get(f'/api/expensas/{self.expense.pk}/').status_code, 404)

    def test_expenses_before_current_contract_are_restricted(self):
        own_contract = contrato.objects.get(unidad=self.unit, propietario=self.owner_person)
        own_contract.fecha_contrato = timezone.localdate()
        own_contract.save(update_fields=['fecha_contrato'])
        expensa.objects.filter(pk=self.expense.pk).update(fecha_emision=timezone.localdate() - timedelta(days=1))
        self.auth(self.owner)
        self.assertEqual(self.client.get(f'/api/expensas/{self.expense.pk}/').status_code, 404)
        self.auth(self.admin)
        self.assertEqual(self.client.get(f'/api/expensas/{self.expense.pk}/').status_code, 200)

    def test_owner_can_access_multiple_unambiguous_units(self):
        unit = Unidad.objects.create(numero='3', codigo='A3', bloque=self.unit.bloque)
        contrato.objects.create(propietario=self.owner_person, unidad=unit,
                                fecha_contrato=date(2025, 1, 1), estado='A')
        self.auth(self.owner)
        self.assertEqual({item['id'] for item in self.client.get('/api/unidades/').data}, {self.unit.pk, unit.pk})

    def test_vehicle_upload_is_not_sent_before_authorization(self):
        self.auth(self.owner)
        upload = SimpleUploadedFile('imagen.jpg', b'prueba', content_type='image/jpeg')
        with patch('residencial.viewsVehiculo.requests.post') as external:
            response = self.client.patch(f'/api/vehiculos/{self.other_vehicle.pk}/', {'imagen': upload}, format='multipart')
        self.assertEqual(response.status_code, 404)
        external.assert_not_called()
        upload = SimpleUploadedFile('imagen.jpg', b'prueba', content_type='image/jpeg')
        with patch('residencial.viewsVehiculo.requests.post') as external:
            response = self.client.patch(f'/api/vehiculos/{self.vehicle.pk}/',
                {'imagen': upload, 'persona': self.other_person.pk}, format='multipart')
        self.assertEqual(response.status_code, 400)
        external.assert_not_called()

    def test_owner_cannot_search_related_tenant_by_hidden_identity_number(self):
        today = timezone.localdate()
        self.tenant_person.fecha_inicio = today - timedelta(days=1)
        self.tenant_person.fecha_fin = today + timedelta(days=1)
        self.tenant_person.save(update_fields=['fecha_inicio', 'fecha_fin'])
        self.auth(self.owner)
        self.assertEqual(self.client.get('/api/inquilinos/', {'search': self.tenant_person.CI}).data, [])
        self.assertEqual(len(self.client.get('/api/inquilinos/', {'search': self.tenant_person.nombre}).data), 1)

    def test_resident_visits_are_scoped_and_hide_identity_numbers(self):
        visitor = Persona.objects.create(nombre='Visita', apellido='Uno', sexo='F', tipo='V', CI='991', fecha_nacimiento=date(1990, 1, 1))
        mine = Visita.objects.create(visitante=visitor, recibe_persona=self.owner_person, fecha_hora_entrada=timezone.now())
        other = Visita.objects.create(visitante=visitor, recibe_persona=self.other_person, fecha_hora_entrada=timezone.now())
        self.auth(self.owner)
        response = self.client.get('/api/visitas/')
        self.assertEqual([item['id'] for item in response.data], [mine.pk])
        self.assertNotIn('visitante_ci', response.data[0])
        self.assertEqual(self.client.get('/api/visitas/', {'search': visitor.CI}).data, [])
        self.assertEqual(self.client.get(f'/api/visitas/{other.pk}/').status_code, 404)
        self.assertEqual(self.client.get('/api/visitas/', {'recibe_persona': self.other_person.pk}).data, [])
        Visita.objects.create(visitante=visitor, recibe_persona=self.tenant_person, fecha_hora_entrada=timezone.now())
        self.auth(self.tenant)
        for start, end in ((-1, 1), (-5, -1)):
            self.tenant_person.fecha_inicio = timezone.localdate() + timedelta(days=start)
            self.tenant_person.fecha_fin = timezone.localdate() + timedelta(days=end)
            self.tenant_person.save(update_fields=['fecha_inicio', 'fecha_fin'])
            self.assertEqual(self.client.get('/api/visitas/').data, [])

    def test_device_registration_cannot_reassign_other_users_device(self):
        device = FCMDevice.objects.create(user=self.other, registration_id='token-prueba-ajeno', type='android', active=True)
        self.auth(self.owner)
        response = self.client.post('/api/devices/', {'registration_id': device.registration_id, 'type': 'android'}, format='json')
        self.assertEqual(response.status_code, 400)
        device.refresh_from_db()
        self.assertEqual(device.user_id, self.other.pk)
        self.assertTrue(device.active)
        response = self.client.post('/api/devices/', {'registration_id': 'token-prueba-propio', 'type': 'android'}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        response = self.client.patch('/api/devices/token-prueba-propio/', {'registration_id': device.registration_id}, format='json')
        self.assertEqual(response.status_code, 400)
        device.refresh_from_db()
        self.assertTrue(device.active)

    def test_device_sync_rotates_safely_and_unregister_is_idempotent(self):
        self.auth(self.guard)
        body = {'registration_id': 'nuevo-ficticio', 'previous_registration_id': None, 'type': 'android'}
        self.assertEqual(self.client.post('/api/devices/sincronizar/', body, format='json').status_code, 204)
        old = FCMDevice.objects.get(registration_id='nuevo-ficticio')
        self.assertEqual(old.user_id, self.guard.pk)
        body = {'registration_id': 'rotado-ficticio', 'previous_registration_id': 'nuevo-ficticio', 'type': 'android'}
        self.assertEqual(self.client.post('/api/devices/sincronizar/', body, format='json').status_code, 204)
        self.assertEqual(self.client.post('/api/devices/sincronizar/', body, format='json').status_code, 204)
        old.refresh_from_db()
        self.assertFalse(old.active)
        self.assertTrue(FCMDevice.objects.get(registration_id='rotado-ficticio').active)
        for _ in range(2):
            self.assertEqual(self.client.post('/api/devices/desregistrar/', {'registration_id': 'rotado-ficticio'}, format='json').status_code, 204)
        self.assertFalse(FCMDevice.objects.get(registration_id='rotado-ficticio').active)

    def test_device_sync_cannot_claim_or_deactivate_another_users_tokens(self):
        foreign = FCMDevice.objects.create(user=self.other, registration_id='ajeno-ficticio', type='android', active=True)
        own = FCMDevice.objects.create(user=self.guard, registration_id='propio-ficticio', type='android', active=True)
        self.auth(self.guard)
        for body in [
            {'registration_id': 'ajeno-ficticio', 'previous_registration_id': 'propio-ficticio', 'type': 'android'},
            {'registration_id': 'otro-ficticio', 'previous_registration_id': 'ajeno-ficticio', 'type': 'android'},
        ]:
            response = self.client.post('/api/devices/sincronizar/', body, format='json')
            self.assertEqual(response.status_code, 400)
            self.assertNotIn('ajeno-ficticio', str(response.data))
        self.assertEqual(self.client.post('/api/devices/desregistrar/', {'registration_id': 'ajeno-ficticio'}, format='json').status_code, 400)
        foreign.refresh_from_db(); own.refresh_from_db()
        self.assertEqual(foreign.user_id, self.other.pk)
        self.assertTrue(foreign.active)
        self.assertTrue(own.active)
        self.assertFalse(FCMDevice.objects.filter(registration_id='otro-ficticio').exists())

    def test_device_audit_is_minimal_idempotent_and_atomic(self):
        from django.contrib.admin.models import LogEntry
        self.auth(self.guard)
        token = 'token-secreto-simulado'
        body = {'registration_id': token, 'type': 'android'}
        start = LogEntry.objects.count()
        self.assertEqual(self.client.post('/api/devices/sincronizar/', body, format='json').status_code, 204)
        self.assertEqual(self.client.post('/api/devices/sincronizar/', body, format='json').status_code, 204)
        self.assertEqual(self.client.post('/api/devices/desregistrar/', {'registration_id': token}, format='json').status_code, 204)
        self.assertEqual(self.client.post('/api/devices/desregistrar/', {'registration_id': token}, format='json').status_code, 204)
        entries = list(LogEntry.objects.order_by('pk')[start:])
        self.assertEqual(len(entries), 2)
        for entry in entries:
            self.assertEqual(entry.user_id, self.guard.pk)
            self.assertNotIn(token, str(entry.object_repr) + str(entry.change_message))
        with patch('finanzas.devices.record_action', side_effect=RuntimeError('simulated')):
            with self.assertRaises(RuntimeError):
                self.client.post('/api/devices/sincronizar/', {'registration_id': 'rollback-ficticio', 'type': 'android'}, format='json')
        self.assertFalse(FCMDevice.objects.filter(registration_id='rollback-ficticio').exists())

    def test_legacy_device_changes_are_audited_without_releasing_token(self):
        from django.contrib.admin.models import LogEntry
        self.auth(self.guard)
        token = 'token-legado-ficticio'
        initial = LogEntry.objects.count()
        self.assertEqual(self.client.post('/api/devices/', {'registration_id': token, 'type': 'android'}, format='json').status_code, 201)
        self.assertEqual(self.client.patch(f'/api/devices/{token}/', {'name': 'Prueba'}, format='json').status_code, 200)
        self.assertEqual(self.client.patch(f'/api/devices/{token}/', {'name': 'Prueba'}, format='json').status_code, 200)
        self.assertEqual(self.client.patch(f'/api/devices/{token}/', {'registration_id': 'otro-token'}, format='json').status_code, 400)
        self.assertEqual(self.client.delete(f'/api/devices/{token}/').status_code, 204)
        self.assertEqual(self.client.delete(f'/api/devices/{token}/').status_code, 204)
        entries = list(LogEntry.objects.order_by('pk')[initial:])
        self.assertEqual(len(entries), 3)
        self.assertTrue(all(token not in entry.object_repr + entry.change_message for entry in entries))
        device = FCMDevice.objects.get(registration_id=token)
        self.assertFalse(device.active)
        self.assertEqual(device.user_id, self.guard.pk)
        self.auth(self.owner)
        self.assertEqual(self.client.post('/api/devices/sincronizar/', {'registration_id': token, 'type': 'android'}, format='json').status_code, 400)
        device.refresh_from_db()
        self.assertEqual(device.user_id, self.guard.pk)
        self.assertFalse(device.active)

    def test_legacy_device_audit_failure_rolls_back_update_and_delete(self):
        device = FCMDevice.objects.create(user=self.guard, registration_id='rollback-legado', type='android', active=True)
        self.auth(self.guard)
        with patch('finanzas.devices.record_action', side_effect=RuntimeError('simulated')):
            with self.assertRaises(RuntimeError):
                self.client.patch('/api/devices/rollback-legado/', {'name': 'Prueba'}, format='json')
            with self.assertRaises(RuntimeError):
                self.client.delete('/api/devices/rollback-legado/')
        device.refresh_from_db()
        self.assertNotEqual(device.name, 'Prueba')
        self.assertTrue(device.active)

    def test_foreign_device_rejection_does_not_create_audit_or_change_owner(self):
        from django.contrib.admin.models import LogEntry
        device = FCMDevice.objects.create(user=self.other, registration_id='privado-ajeno', type='android', active=True)
        self.auth(self.guard)
        count = LogEntry.objects.count()
        self.assertEqual(self.client.post('/api/devices/desregistrar/', {'registration_id': device.registration_id}, format='json').status_code, 400)
        device.refresh_from_db()
        self.assertTrue(device.active)
        self.assertEqual(device.user_id, self.other.pk)
        self.assertEqual(LogEntry.objects.count(), count)

    def test_device_sync_requires_auth_and_valid_data(self):
        self.assertIn(self.client.post('/api/devices/sincronizar/', {}, format='json').status_code, (401, 403))
        self.auth(self.guard)
        self.assertEqual(self.client.post('/api/devices/sincronizar/', {'registration_id': '', 'type': 'android'}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/devices/sincronizar/', {'registration_id': 'prueba', 'type': 'desconocido'}, format='json').status_code, 400)

    def test_current_user_endpoint_does_not_expose_user_list(self):
        self.auth(self.owner)
        response = self.client.get('/api/me/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['role'], 'propietario')
        self.assertEqual(response.data['persona_id'], self.owner_person.pk)
        self.assertNotIn('password', response.data)
        self.assertEqual(self.client.get('/api/users/').status_code, 403)

    def test_admin_list_does_not_report_first_role_when_multiple_roles_exist(self):
        self.owner.groups.add(self.groups['Seguridad'])
        self.auth(self.admin)
        response = self.client.get(f'/api/users/{self.owner.pk}/')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.data['role'])

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=False)
    def test_security_notification_endpoints_are_disabled_by_default(self):
        self.auth(self.guard)
        self.assertEqual(self.client.get('/api/notificaciones-seguridad/').status_code, 503)

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
    def test_event_notification_review_and_idempotency(self):
        second = User.objects.create_user(username='guardia2', password='Prueba1234')
        second.groups.add(self.groups['Seguridad'])
        cargo = Cargo.objects.first()
        Empleado.objects.create(nombre='Otro', apellido='Guardia', direccion='X', sexo='M', CI='202', sueldo=1, cargo=cargo, user=second)
        inactive = User.objects.create_user(username='guardia_inactivo', password='Prueba1234', is_active=False)
        inactive.groups.add(self.groups['Seguridad'])
        Empleado.objects.create(nombre='Inactivo', apellido='Guardia', direccion='X', sexo='M', CI='203', sueldo=1, cargo=cargo, user=inactive)
        event_id = str(uuid.uuid4())
        payload = {'id': event_id, 'categoria': 'Vehículo', 'descripcion': 'Revisión manual', 'fecha_evento': '2026-01-01T12:00:00Z'}
        self.auth(self.guard)
        with patch('fcm_django.models.FCMDeviceQuerySet.send_message') as send:
            response = self.client.post('/api/eventos-seguridad/', payload, format='json')
            self.assertEqual(response.status_code, 201, response.data)
            response = self.client.post('/api/eventos-seguridad/', payload, format='json')
            self.assertEqual(response.status_code, 200, response.data)
            send.assert_not_called()
        notifications = NotificacionSeguridad.objects.filter(evento_id=event_id, tipo='REVISION')
        self.assertEqual(set(notifications.values_list('destinatario_id', flat=True)), {self.guard.pk, second.pk})
        self.assertFalse(NotificacionSeguridad.objects.filter(destinatario__in=[self.owner, self.tenant, self.admin, inactive]).exists())
        self.assertEqual(self.client.post('/api/eventos-seguridad/', {**payload, 'descripcion': 'Otro contenido'}, format='json').status_code, 400)
        self.auth(self.owner)
        self.assertEqual(self.client.get('/api/notificaciones-seguridad/').status_code, 403)
        self.assertEqual(self.client.get(f'/api/eventos-seguridad/{event_id}/').status_code, 403)
        self.auth(self.tenant)
        self.assertEqual(self.client.get('/api/notificaciones-seguridad/').status_code, 403)
        self.auth(self.admin)
        self.assertEqual(self.client.post(f'/api/eventos-seguridad/{event_id}/confirmar/').status_code, 403)
        self.auth(self.guard)
        response = self.client.post(f'/api/eventos-seguridad/{event_id}/confirmar/')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertIsNotNone(response.data['incidencia'])
        self.assertEqual(self.client.post(f'/api/eventos-seguridad/{event_id}/confirmar/').status_code, 400)
        self.assertEqual(NotificacionSeguridad.objects.filter(evento_id=event_id, tipo='CONFIRMADA', destinatario=self.admin).count(), 1)
        self.assertEqual(incidente.objects.filter(pk=response.data['incidencia']).count(), 1)
        self.assertEqual(self.client.post(f'/api/eventos-seguridad/{event_id}/resolver/', {'observacion': 'Cierre'}, format='json').status_code, 400)
        self.assertEqual(self.client.post(f'/api/eventos-seguridad/{event_id}/atender/', {'observacion': 'Revisando'}, format='json').data['estado'], 'EN_ATENCION')
        self.assertEqual(self.client.post(f'/api/eventos-seguridad/{event_id}/resolver/', {'observacion': ''}, format='json').status_code, 400)
        self.assertEqual(self.client.post(f'/api/eventos-seguridad/{event_id}/resolver/', {'observacion': 'Resuelto'}, format='json').data['estado'], 'RESUELTA')
        first_notification = notifications.get(destinatario=self.guard)
        second_notification = notifications.get(destinatario=second)
        self.assertEqual(self.client.post(f'/api/notificaciones-seguridad/{second_notification.pk}/leer/').status_code, 404)
        response = self.client.post(f'/api/notificaciones-seguridad/{first_notification.pk}/leer/')
        self.assertIsNotNone(response.data['leida_en'])
        self.assertEqual(response.data['mensaje'], 'Evento enviado a revisión')
        self.assertEqual(self.client.post(f'/api/notificaciones-seguridad/{first_notification.pk}/leer/').data['leida_en'], response.data['leida_en'])

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
    def test_event_without_guards_can_be_retried_and_false_positive_is_recorded(self):
        employee = Empleado.objects.get(user=self.guard)
        employee.estado = 'I'
        employee.save(update_fields=['estado'])
        self.auth(self.admin)
        event_id = str(uuid.uuid4())
        payload = {'id': event_id, 'categoria': 'Manual', 'descripcion': 'Prueba', 'fecha_evento': '2026-01-01T12:00:00Z'}
        response = self.client.post('/api/eventos-seguridad/', payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertTrue(response.data['sin_guardias'])
        self.assertFalse(NotificacionSeguridad.objects.filter(evento_id=event_id).exists())
        employee.estado = 'A'
        employee.save(update_fields=['estado'])
        self.assertEqual(self.client.post(f'/api/eventos-seguridad/{event_id}/redistribuir/').data['guardias_activos'], 1)
        self.assertEqual(self.client.post(f'/api/eventos-seguridad/{event_id}/redistribuir/').data['guardias_activos'], 1)
        self.assertEqual(NotificacionSeguridad.objects.filter(evento_id=event_id).count(), 1)
        self.auth(self.guard)
        self.assertEqual(self.client.post(f'/api/eventos-seguridad/{event_id}/descartar/', {'motivo': ''}, format='json').status_code, 400)
        response = self.client.post(f'/api/eventos-seguridad/{event_id}/descartar/', {'motivo': 'Lectura incorrecta'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['estado'], 'FALSO_POSITIVO')
        self.assertFalse(NotificacionSeguridad.objects.filter(evento_id=event_id, tipo='CONFIRMADA').exists())
        self.assertIsNone(EventoSeguridad.objects.get(pk=event_id).incidencia_id)
        history = self.client.get(f'/api/eventos-seguridad/{event_id}/historial/').data
        self.assertEqual(history[-1]['observacion'], 'Lectura incorrecta')

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
    def test_guard_manual_incident_notifies_administrator_once(self):
        self.auth(self.guard)
        response = self.client.post('/api/incidentes/', {'descripcion': 'Manual confirmado',
            'fecha_incidente': '2026-01-01T12:00:00Z'}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        evento = EventoSeguridad.objects.get(incidencia_id=response.data['id'])
        self.assertEqual(evento.origen, 'MANUAL')
        self.assertEqual(evento.estado, 'CONFIRMADA')
        self.assertEqual(evento.revisor_id, self.guard.pk)
        self.assertEqual(NotificacionSeguridad.objects.filter(evento=evento, destinatario=self.admin, tipo='CONFIRMADA').count(), 1)
        self.assertFalse(NotificacionSeguridad.objects.filter(evento=evento, destinatario__in=[self.owner, self.tenant]).exists())

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
    def test_manual_incident_edit_syncs_event_and_protects_history(self):
        self.auth(self.guard)
        response = self.client.post('/api/incidentes/', {'descripcion': 'Original', 'fecha_incidente': '2026-01-01T12:00:00Z'}, format='json')
        incident_id = response.data['id']
        evento = EventoSeguridad.objects.get(incidencia_id=incident_id)
        response = self.client.patch(f'/api/incidentes/{incident_id}/', {'descripcion': 'Corregido'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        evento.refresh_from_db()
        self.assertEqual(evento.descripcion, 'Corregido')
        history = self.client.get(f'/api/eventos-seguridad/{evento.pk}/historial/').data
        self.assertEqual(history[-1]['accion'], 'INCIDENCIA_EDITADA')
        self.assertIn('Original', history[-1]['observacion'])
        self.auth(self.admin)
        self.assertEqual(self.client.delete(f'/api/incidentes/{incident_id}/').status_code, 400)
        self.assertTrue(incidente.objects.filter(pk=incident_id).exists())

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=False)
    def test_incident_deletion_returns_clear_error_when_security_table_missing(self):
        self.auth(self.admin)
        with patch('residencial.viewsVehiculo.connection.introspection.table_names', return_value=[]):
            response = self.client.delete(f'/api/incidentes/{self.incident.pk}/')
        self.assertEqual(response.status_code, 503)
        self.assertTrue(incidente.objects.filter(pk=self.incident.pk).exists())

    def test_missing_security_table_can_block_person_cascade(self):
        self.incident.propietario = self.owner_person
        self.incident.save(update_fields=['propietario'])
        with patch.object(EventoSeguridad._meta, 'db_table', 'tabla_seguridad_no_migrada'):
            with self.assertRaises(OperationalError):
                with transaction.atomic():
                    self.owner_person.delete()
        self.assertTrue(Persona.objects.filter(pk=self.owner_person.pk).exists())

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
    def test_multiple_actions_are_audited_and_invalid_transitions_rejected(self):
        self.auth(self.guard)
        response = self.client.post('/api/incidentes/', {'descripcion': 'Atención', 'fecha_incidente': '2026-01-01T12:00:00Z'}, format='json')
        evento = EventoSeguridad.objects.get(incidencia_id=response.data['id'])
        base = f'/api/eventos-seguridad/{evento.pk}/'
        self.assertEqual(self.client.post(base + 'actuaciones/', {'observacion': 'Antes'}, format='json').status_code, 400)
        self.assertEqual(self.client.post(base + 'descartar/', {'motivo': 'Después de confirmar'}, format='json').status_code, 400)
        self.assertEqual(self.client.post(base + 'atender/', {'observacion': 'Inicio'}, format='json').status_code, 200)
        self.assertEqual(self.client.post(base + 'actuaciones/', {'observacion': ' '}, format='json').status_code, 400)
        for text in ('Primera actuación', 'Segunda actuación'):
            self.assertEqual(self.client.post(base + 'actuaciones/', {'observacion': text}, format='json').status_code, 200)
        self.assertEqual(self.client.post(base + 'resolver/', {'observacion': 'Cerrado'}, format='json').status_code, 200)
        self.assertEqual(self.client.post(base + 'actuaciones/', {'observacion': 'Después'}, format='json').status_code, 400)
        history = self.client.get(base + 'historial/').data
        self.assertEqual([entry['observacion'] for entry in history if entry['accion'] == 'ACTUACION'], ['Primera actuación', 'Segunda actuación'])
        self.auth(self.owner)
        self.assertEqual(self.client.get(base + 'historial/').status_code, 403)
        self.auth(self.tenant)
        self.assertEqual(self.client.get(base).status_code, 403)

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
    def test_future_ia_event_stays_pending_without_incident_or_fine(self):
        from seguridad_IA.notificaciones import registrar_evento
        event_id = uuid.uuid4()
        event, created = registrar_evento(self.guard, event_id, {'origen': 'IA', 'categoria': 'Vehículo',
            'descripcion': 'Evento simulado', 'fecha_evento': timezone.now()})
        self.assertTrue(created)
        self.assertEqual(event.estado, EventoSeguridad.PENDIENTE)
        self.assertIsNone(event.incidencia_id)
        self.assertEqual(NotificacionSeguridad.objects.filter(evento=event, tipo='REVISION', destinatario=self.guard).count(), 1)
        self.assertFalse(NotificacionSeguridad.objects.filter(evento=event, tipo='CONFIRMADA').exists())
        self.auth(self.guard)
        response = self.client.post(f'/api/eventos-seguridad/{event_id}/confirmar/')
        self.assertEqual(response.status_code, 200, response.data)
        created_incident = incidente.objects.get(pk=response.data['incidencia'])
        self.assertIsNone(created_incident.propietario_id)
        self.assertIsNone(created_incident.multa_id)

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True)
    def test_failed_admin_notification_rolls_back_confirmation(self):
        from seguridad_IA.notificaciones import revisar_evento
        self.auth(self.guard)
        event_id = str(uuid.uuid4())
        response = self.client.post('/api/eventos-seguridad/', {'id': event_id, 'categoria': 'Manual',
            'descripcion': 'Prueba', 'fecha_evento': '2026-01-01T12:00:00Z'}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        with patch('seguridad_IA.notificaciones.crear_notificaciones', side_effect=RuntimeError('fallo simulado')):
            with self.assertRaises(RuntimeError):
                revisar_evento(self.guard, event_id, True)
        evento = EventoSeguridad.objects.get(pk=event_id)
        self.assertEqual(evento.estado, 'PENDIENTE_REVISION')
        self.assertIsNone(evento.incidencia_id)

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=True)
    def test_fcm_queue_creates_one_delivery_for_each_valid_device(self):
        device = FCMDevice.objects.create(user=self.guard, registration_id='token-guardia-prueba', type='android', active=True)
        FCMDevice.objects.create(user=self.owner, registration_id='token-residente-prueba', type='android', active=True)
        FCMDevice.objects.create(user=self.guard, registration_id='token-inactivo-prueba', type='android', active=False)
        event_id = str(uuid.uuid4())
        payload = {'id': event_id, 'categoria': 'Manual', 'descripcion': 'Privado', 'fecha_evento': '2026-01-01T12:00:00Z'}
        self.auth(self.guard)
        with patch('seguridad_IA.fcm_delivery.messaging.send') as send:
            self.assertEqual(self.client.post('/api/eventos-seguridad/', payload, format='json').status_code, 201)
            self.assertEqual(self.client.post('/api/eventos-seguridad/', payload, format='json').status_code, 200)
            send.assert_not_called()
        deliveries = EntregaFCMSeguridad.objects.filter(notificacion__evento_id=event_id)
        self.assertEqual(deliveries.count(), 1)
        self.assertEqual(deliveries.get().dispositivo_id, device.pk)
        self.assertNotEqual(deliveries.get().token_hash, device.registration_id)

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=True)
    def test_simulated_push_flow_excludes_residents_and_sends_minimal_data(self):
        from seguridad_IA.fcm_delivery import reservar_entrega, procesar_reserva
        guard_device = FCMDevice.objects.create(user=self.guard, registration_id='guardia-ficticio', type='android', active=True)
        FCMDevice.objects.create(user=self.owner, registration_id='residente-ficticio', type='android', active=True)
        self.auth(self.guard)
        event_id = str(uuid.uuid4())
        payload = {'id': event_id, 'categoria': 'Prueba', 'descripcion': 'Detalle privado ficticio',
                   'fecha_evento': '2026-01-01T12:00:00Z'}
        with patch('seguridad_IA.fcm_delivery.messaging.send', return_value='aceptado-ficticio') as send:
            self.assertEqual(self.client.post('/api/eventos-seguridad/', payload, format='json').status_code, 201)
            deliveries = EntregaFCMSeguridad.objects.filter(notificacion__evento_id=event_id)
            self.assertEqual(deliveries.count(), 1)
            self.assertEqual(deliveries.get().dispositivo_id, guard_device.pk)
            self.assertEqual(procesar_reserva(*reservar_entrega()), 'ENVIADA')
            send.assert_called_once()
            message = send.call_args.args[0]
            self.assertEqual(message.data['tipo'], 'seguridad')
            self.assertEqual(message.data['evento_id'], event_id)
            self.assertEqual(set(message.data), {'tipo', 'evento_id', 'notificacion_id'})
            self.assertNotIn(payload['descripcion'], message.notification.body)
            self.assertEqual(deliveries.get().estado, 'ENVIADA')

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=True)
    def test_fcm_retry_role_revalidation_and_success(self):
        from seguridad_IA.fcm_delivery import reservar_entrega, procesar_reserva
        FCMDevice.objects.create(user=self.guard, registration_id='token-prueba-guardia', type='android', active=True)
        self.auth(self.guard)
        response = self.client.post('/api/eventos-seguridad/', {'id': str(uuid.uuid4()), 'categoria': 'Manual',
            'descripcion': 'Dato confidencial de prueba', 'fecha_evento': '2026-01-01T12:00:00Z'}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        delivery = EntregaFCMSeguridad.objects.get()
        reservation = reservar_entrega()
        with patch('seguridad_IA.fcm_delivery.messaging.send', side_effect=RuntimeError('token-confidencial')):
            self.assertEqual(procesar_reserva(*reservation), 'PENDIENTE')
        delivery.refresh_from_db()
        self.assertEqual(delivery.error_codigo, 'ERROR_ENVIO')
        self.assertGreater(delivery.siguiente_intento, timezone.now())
        self.assertEqual(NotificacionSeguridad.objects.count(), 1)
        self.assertIsNone(reservar_entrega())
        delivery.siguiente_intento = timezone.now() - timedelta(seconds=1)
        delivery.save(update_fields=['siguiente_intento'])
        reservation = reservar_entrega()
        with patch('seguridad_IA.fcm_delivery.messaging.send', return_value='mensaje-prueba') as send:
            self.assertEqual(procesar_reserva(*reservation), 'ENVIADA')
            message = send.call_args.args[0]
            self.assertNotIn('Dato confidencial', message.notification.body)
            self.assertNotIn('token', str(message.data))
        delivery.refresh_from_db()
        self.assertEqual(delivery.intentos, 2)
        self.assertIsNone(reservar_entrega())

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=True)
    def test_fcm_does_not_send_after_user_role_changes(self):
        from seguridad_IA.fcm_delivery import reservar_entrega, procesar_reserva
        FCMDevice.objects.create(user=self.guard, registration_id='token-prueba-cambio', type='android', active=True)
        self.auth(self.guard)
        self.client.post('/api/eventos-seguridad/', {'id': str(uuid.uuid4()), 'categoria': 'Manual',
            'descripcion': 'Prueba', 'fecha_evento': '2026-01-01T12:00:00Z'}, format='json')
        reservation = reservar_entrega()
        self.guard.groups.set([self.groups['propietario']])
        with patch('seguridad_IA.fcm_delivery.messaging.send') as send:
            self.assertEqual(procesar_reserva(*reservation), 'CANCELADA')
            send.assert_not_called()
        self.assertEqual(NotificacionSeguridad.objects.count(), 1)

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=True)
    def test_fcm_unregistered_token_deactivates_device(self):
        from firebase_admin.messaging import UnregisteredError
        from seguridad_IA.fcm_delivery import reservar_entrega, procesar_reserva
        device = FCMDevice.objects.create(user=self.guard, registration_id='token-invalido-prueba', type='android', active=True)
        self.auth(self.guard)
        self.client.post('/api/eventos-seguridad/', {'id': str(uuid.uuid4()), 'categoria': 'Manual',
            'descripcion': 'Prueba', 'fecha_evento': '2026-01-01T12:00:00Z'}, format='json')
        with patch('seguridad_IA.fcm_delivery.messaging.send', side_effect=UnregisteredError('invalido')):
            self.assertEqual(procesar_reserva(*reservar_entrega()), 'CANCELADA')
        device.refresh_from_db()
        self.assertFalse(device.active)
        self.assertEqual(NotificacionSeguridad.objects.count(), 1)

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=True)
    def test_fcm_stops_after_bounded_retries_and_keeps_internal_alert(self):
        from seguridad_IA.fcm_delivery import MAX_INTENTOS, reservar_entrega, procesar_reserva
        FCMDevice.objects.create(user=self.guard, registration_id='token-limite-prueba', type='android', active=True)
        self.auth(self.guard)
        self.client.post('/api/eventos-seguridad/', {'id': str(uuid.uuid4()), 'categoria': 'Manual',
            'descripcion': 'Prueba', 'fecha_evento': '2026-01-01T12:00:00Z'}, format='json')
        for attempt in range(MAX_INTENTOS):
            EntregaFCMSeguridad.objects.update(siguiente_intento=timezone.now() - timedelta(seconds=1))
            with patch('seguridad_IA.fcm_delivery.messaging.send', side_effect=RuntimeError('error')):
                result = procesar_reserva(*reservar_entrega())
            self.assertEqual(result, 'FALLIDA' if attempt == MAX_INTENTOS - 1 else 'PENDIENTE')
        self.assertEqual(EntregaFCMSeguridad.objects.get().intentos, MAX_INTENTOS)
        self.assertIsNone(reservar_entrega())
        self.assertEqual(NotificacionSeguridad.objects.count(), 1)

    @override_settings(NOTIFICACIONES_SEGURIDAD_ACTIVAS=True, COLA_FCM_SEGURIDAD_ACTIVA=True)
    def test_fcm_confirmed_incident_queues_administrator_only(self):
        admin_device = FCMDevice.objects.create(user=self.admin, registration_id='token-admin-prueba', type='android', active=True)
        FCMDevice.objects.create(user=self.owner, registration_id='token-propietario-prueba', type='android', active=True)
        FCMDevice.objects.create(user=self.tenant, registration_id='token-inquilino-prueba', type='android', active=True)
        self.auth(self.guard)
        response = self.client.post('/api/incidentes/', {'descripcion': 'Manual', 'fecha_incidente': '2026-01-01T12:00:00Z'}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        delivery = EntregaFCMSeguridad.objects.get()
        self.assertEqual(delivery.dispositivo_id, admin_device.pk)
        self.assertEqual(delivery.notificacion.tipo, 'CONFIRMADA')

    @override_settings(ENVIO_FCM_SEGURIDAD_ACTIVO=False)
    def test_fcm_worker_is_disabled_without_explicit_configuration(self):
        from django.core.management import call_command, CommandError
        with patch('seguridad_IA.fcm_delivery.messaging.send') as send:
            with self.assertRaises(CommandError):
                call_command('procesar_fcm_seguridad')
            send.assert_not_called()

    def test_recognition_permission_blocks_resident_before_external_call(self):
        self.auth(self.owner)
        with patch('seguridad_IA.views.requests.post') as external:
            response = self.client.post('/api/alpr/', {}, format='multipart')
        self.assertEqual(response.status_code, 403)
        external.assert_not_called()

    @override_settings(PLATE_TOKEN='test', PLATE_REGIONS='bo')
    def test_guard_plate_recognition_uses_mock_and_existing_vehicle(self):
        self.auth(self.guard)
        response_mock = MagicMock(status_code=200)
        response_mock.json.return_value = {'results': [{'plate': 'aa1', 'score': 0.9}]}
        upload = SimpleUploadedFile('imagen.jpg', b'fake-image', content_type='image/jpeg')
        with patch('seguridad_IA.views.requests.post', return_value=response_mock):
            response = self.client.post('/api/alpr/', {'upload': upload}, format='multipart')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['match'])
        self.assertEqual(response.data['vehiculo']['id'], self.vehicle.pk)

    def test_guard_face_recognition_uses_mock(self):
        self.auth(self.guard)
        self.owner_person.luxand_uuid = 'rostro-de-prueba'
        self.owner_person.save(update_fields=['luxand_uuid'])
        upload = SimpleUploadedFile('imagen.jpg', b'fake-image', content_type='image/jpeg')
        with patch('builtins.print') as output, patch('seguridad_IA.views.recognize', return_value=[{'uuid': 'rostro-de-prueba', 'probability': 0.9}]):
            response = self.client.post('/api/reconocimiento/', {'image_file': upload}, format='multipart')
        self.assertNotIn('rostro-de-prueba', str(output.call_args_list))
        self.assertNotIn(self.owner_person.nombre, str(output.call_args_list))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['ok'])
        self.assertEqual(response.data['id'], self.owner_person.pk)
