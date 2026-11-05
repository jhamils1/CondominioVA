import test from 'node:test';
import assert from 'node:assert/strict';
import { crearEventoVideo } from './eventoVideo.js';

test('el evento describe video grabado y conserva identificador y fecha para reintentos', () => {
  const e = crearEventoVideo({ clase: 'car', tiempo: 70.5, duracion: 5 }, 'id-estable', '2026-11-04T12:00:00Z');
  assert.equal(e.id, 'id-estable');
  assert.equal(e.fecha_evento, '2026-11-04T12:00:00Z');
  assert.match(e.descripcion, /video grabado/);
  assert.match(e.descripcion, /1:10/);
  assert.match(e.descripcion, /no están verificadas/);
  assert.match(e.descripcion, /No se adjunta/);
});
