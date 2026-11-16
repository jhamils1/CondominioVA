import test from 'node:test';
import assert from 'node:assert/strict';
import { crearEventoCamara } from './eventoCamara.js';

test('describe la cámara local, la evidencia y la revisión pendiente', () => {
  const e = crearEventoCamara({ clase: 'car', duracion: 5.1 }, 'id-estable', '2026-11-04T12:00:00Z');
  assert.equal(e.id, 'id-estable');
  assert.equal(e.fecha_evento, '2026-11-04T12:00:00Z');
  assert.equal(e.camara, 'Cámara local (laptop o USB)');
  assert.match(e.descripcion, /cámara local/);
  assert.match(e.descripcion, /5 segundos/);
  assert.match(e.descripcion, /ubicación no está verificada/);
  assert.match(e.descripcion, /Se adjunta el fotograma/);
});
