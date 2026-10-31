// ignore_for_file: avoid_relative_lib_imports, avoid_print
import '../lib/security/access_policy.dart';

void expect(bool condition, String message) {
  if (!condition) throw StateError(message);
}

void main() {
  for (final role in rolesConocidos) {
    expect(puedeAcceder(role, '/perfil'), 'Cada rol necesita acceso a su perfil');
  }
  for (final role in ['propietario', 'inquilino']) {
    expect(!puedeAcceder(role, '/reconocimiento-facial'), 'Residentes sin reconocimiento facial');
    expect(!puedeAcceder(role, '/dashboard'), 'Residentes sin dashboard financiero');
    expect(!puedeAcceder(role, '/eventos-seguridad'), 'Residentes sin eventos internos');
  }
  expect(puedeAcceder('guardia', '/reconocimiento-facial'), 'Guardia accede al reconocimiento');
  expect(!puedeAcceder('guardia', '/expensas'), 'Guardia sin expensas');
  expect(!puedeAcceder('guardia', '/dashboard'), 'Guardia sin dashboard financiero');
  expect(puedeAcceder('propietario', '/expensas'), 'Propietario consulta sus expensas');
  expect(!puedeAcceder('inquilino', '/expensas'), 'Inquilino sin expensas ambiguas');
  expect(puedeAcceder('administrador', '/dashboard'), 'Administrador accede al dashboard');
  expect(!puedeAcceder('administrador', '/ruta-no-registrada'), 'Rutas desconocidas rechazadas');
  expect(!puedeAcceder('otro', '/perfil'), 'Roles desconocidos rechazados');
  expect(!puedeAcceder(null, '/perfil'), 'Sin rol se rechaza el acceso');
  expect(validarUsuarioActual({'id': 7, 'username': 'ficticio', 'role': 'guardia'}) != null, 'Perfil válido');
  expect(validarUsuarioActual({'id': 7, 'username': 'ficticio', 'role': 'inventado'}) == null, 'Rol desconocido inválido');
  expect(validarUsuarioActual({'id': '7', 'username': 'ficticio', 'role': 'guardia'}) == null, 'ID incorrecto inválido');
  expect(validarUsuarioActual({'id': 7, 'username': '', 'role': 'guardia'}) == null, 'Usuario vacío inválido');
  expect(validarUsuarioActual(null) == null, 'Respuesta vacía inválida');
  print('Reglas de navegación y validación del perfil: OK');
}
