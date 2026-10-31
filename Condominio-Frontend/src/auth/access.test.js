import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccess, roleKey } from './access.js';

test('el administrador accede a las funciones administrativas', () => {
  for (const path of ['usuarios', 'roles', 'expensas', 'incidentes', 'notificaciones']) assert.equal(canAccess('administrador', path), true);
});
test('el guardia accede a seguridad y visitas sin acceder a finanzas o usuarios', () => {
  for (const path of ['incidentes', 'visitas', 'vehiculos', 'reconocimiento-vehicular', 'notificaciones']) assert.equal(canAccess('guardia', path), true);
  for (const path of ['usuarios', 'roles', 'expensas', 'contratos']) assert.equal(canAccess('guardia', path), false);
});
test('los residentes no acceden a seguridad y el inquilino no accede a expensas', () => {
  for (const role of ['propietario', 'inquilino']) {
    for (const path of ['incidentes', 'eventos-seguridad', 'reconocimiento-facial', 'usuarios', 'notificaciones']) assert.equal(canAccess(role, path), false);
    for (const path of ['perfil', 'vehiculos', 'unidades']) assert.equal(canAccess(role, path), true);
  }
  assert.equal(canAccess('propietario', 'expensas'), true);
  assert.equal(canAccess('inquilino', 'expensas'), false);
});
test('roles desconocidos y rutas inexistentes se rechazan', () => {
  assert.equal(canAccess('desconocido', 'dashboard'), false);
  assert.equal(canAccess('administrador', 'no-existe'), false);
  assert.equal(roleKey(' Seguridad '), 'guardia');
  assert.equal(roleKey('Guardia de seguridad'), 'guardia');
});
