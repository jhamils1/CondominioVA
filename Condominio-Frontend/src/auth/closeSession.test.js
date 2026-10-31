import test from 'node:test';
import assert from 'node:assert/strict';
import { closeSession } from './closeSession.js';

test('el cierre consulta al servidor y limpia la sesión local', async () => {
  const calls = [];
  const ok = await closeSession({ access: 'access-ficticio', refresh: 'refresh-ficticio',
    revoke: async (access, refresh) => calls.push([access, refresh]),
    clear: () => calls.push('limpiar') });
  assert.equal(ok, true);
  assert.deepEqual(calls, [['access-ficticio', 'refresh-ficticio'], 'limpiar']);
});

test('si falla la red se limpia la sesión y se comunica la falta de confirmación', async () => {
  let cleared = false;
  const ok = await closeSession({ access: 'access-ficticio', refresh: 'refresh-ficticio',
    revoke: async () => { throw new Error('fallo simulado'); }, clear: () => { cleared = true; } });
  assert.equal(ok, false);
  assert.equal(cleared, true);
});

test('sin tokens se evita la solicitud y se limpia la sesión', async () => {
  let called = false;
  let cleared = false;
  const ok = await closeSession({ access: null, refresh: null,
    revoke: async () => { called = true; }, clear: () => { cleared = true; } });
  assert.equal(ok, false);
  assert.equal(called, false);
  assert.equal(cleared, true);
});
