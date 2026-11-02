"""HTTP scenario for run_roles_web_isolated --check; fictional accounts only."""
import json
import unittest
from urllib.error import HTTPError
from urllib.request import ProxyHandler, Request, build_opener


def check_roles_http(port):
    checks = unittest.TestCase()
    opener = build_opener(ProxyHandler({}))
    requests = 0

    def request(method, path, expected, data=None, token=None):
        nonlocal requests
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = 'Bearer ' + token
        req = Request(f'http://127.0.0.1:{port}/api/{path}', method=method,
                      headers=headers, data=json.dumps(data).encode() if data is not None else None)
        try:
            response = opener.open(req, timeout=10)
        except HTTPError as error:
            response = error
        with response:
            requests += 1
            checks.assertEqual(response.status, expected, f'{method} {path}: estado inesperado')
            body = response.read()
        return json.loads(body) if body else None

    def login(name):
        return request('POST', 'login/', 200, {'username': name, 'password': 'PruebaTemporal2026'})

    request('GET', 'roles-personalizados/', 401)
    admin = login('admin_ficticio')['access']
    guard = login('empleado_ficticio')['access']
    request('POST', 'roles-personalizados/', 403, {'nombre': 'No permitido'}, guard)
    request('POST', 'roles-personalizados/', 400, {'nombre': 'administrador'}, admin)
    request('POST', 'roles-personalizados/', 400,
            {'nombre': 'No permitido', 'consultar_visitas': True}, admin)
    role = request('POST', 'roles-personalizados/', 201, {'nombre': 'Recepcion ficticia'}, admin)
    checks.assertFalse(role['activo'])
    checks.assertFalse(role['consultar_visitas'])
    role_url = f'roles-personalizados/{role["id"]}/'
    users = request('GET', 'users/', 200, token=admin)
    users = users['results'] if isinstance(users, dict) else users
    employee_id = next(user['id'] for user in users if user['username'] == 'empleado_ficticio')
    request('POST', role_url + 'asignar/', 400, {'usuario_id': employee_id}, admin)
    request('PATCH', role_url, 200, {'activo': True}, admin)
    request('POST', role_url + 'asignar/', 200, {'usuario_id': employee_id}, admin)
    credentials = login('empleado_ficticio')
    employee = credentials['access']
    profile = request('GET', 'me/', 200, token=employee)
    checks.assertEqual(profile['role'], 'personalizado')
    checks.assertEqual(profile['capacidades'], [])
    request('GET', 'visitas/', 403, token=employee)
    request('GET', 'users/', 403, token=employee)
    request('GET', 'roles-personalizados/', 403, token=employee)
    request('POST', 'devices/sincronizar/', 403,
            {'registration_id': 'dispositivo-ficticio', 'type': 'android'}, employee)
    request('PATCH', role_url, 200, {'consultar_visitas': True}, admin)
    profile = request('GET', 'me/', 200, token=employee)
    checks.assertEqual(profile['capacidades'], ['visitas.consultar_operativas'])
    visits = request('GET', 'visitas/', 200, token=employee)
    visits = visits['results'] if isinstance(visits, dict) else visits
    checks.assertEqual(len(visits), 1)
    checks.assertEqual(set(visits[0]), {'id', 'estado', 'fecha_hora_entrada',
                                     'fecha_hora_salida', 'visitante_nombre', 'recibe_persona_nombre'})
    checks.assertEqual(visits[0]['estado'], 'ACTIVA')
    request('POST', 'visitas/', 403, {}, employee)
    request('PATCH', role_url, 200, {'consultar_visitas': False}, admin)
    request('GET', 'visitas/', 403, token=employee)
    request('PATCH', role_url, 200, {'activo': False}, admin)
    request('GET', 'me/', 401, token=employee)
    request('POST', 'refresh/', 401, {'refresh': credentials['refresh']})
    from fcm_django.models import FCMDevice
    from django.contrib.admin.models import LogEntry
    checks.assertEqual(FCMDevice.objects.count(), 0)
    checks.assertTrue(LogEntry.objects.filter(change_message__contains='Asignación de rol personalizado').exists())
    print(f'Escenario HTTP correcto: {requests} solicitudes; permisos, revocación, auditoría y FCM comprobados.')
