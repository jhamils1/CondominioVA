import test from 'node:test';
import assert from 'node:assert/strict';
import { crearEventoCamara } from './eventoCamara.js';

test('identifica la fuente de prueba sin atribuir identidad ni ubicación', () => {
  const e = crearEventoCamara({ clase: 'car', duracion: 5.1 }, 'id-estable', '2026-11-04T12:00:00Z');
  assert.equal(e.id, 'id-estable');
  assert.equal(e.fecha_evento, '2026-11-04T12:00:00Z');
  assert.match(e.descripcion, /prueba de cámara local/);
  assert.match(e.descripcion, /5 segundos/);
  assert.match(e.descripcion, /ubicación no están identificadas/);
  assert.match(e.descripcion, /No se adjunta evidencia/);
});
