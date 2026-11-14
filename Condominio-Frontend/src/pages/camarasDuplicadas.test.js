import test from 'node:test';
import assert from 'node:assert/strict';
import { posibleDuplicada } from './camarasDuplicadas.js';

test('solo agrupa coincidencia de IP y puerto con la cámara vinculada', () => {
  const vinculada = { id: 1, tipo: 'RED', direccion_ip: '192.168.1.5', puerto_rtsp: 554, monitor_en_catalogo: true };
  const otra = { ...vinculada, id: 2, monitor_en_catalogo: false };
  assert.equal(posibleDuplicada(vinculada, [vinculada, otra]), false);
  assert.equal(posibleDuplicada(otra, [vinculada, otra]), true);
  assert.equal(posibleDuplicada({ ...otra, puerto_rtsp: 8554 }, [vinculada]), false);
  assert.equal(posibleDuplicada({ ...otra, direccion_ip: '' }, [vinculada]), false);
  assert.equal(posibleDuplicada(otra, [{ ...vinculada, monitor_en_catalogo: false }]), false);
});
