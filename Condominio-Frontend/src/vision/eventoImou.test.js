import test from 'node:test';
import assert from 'node:assert/strict';
import { crearEventoImou } from './eventoImou.js';

test('identifica la vista Imou sin atribuir identidad ni confirmar una infracción', () => {
  const evento = crearEventoImou({ clase: 'car', duracion: 5.4 }, 'id-estable', '2026-11-05T12:00:00Z');
  assert.equal(evento.id, 'id-estable');
  assert.equal(evento.fecha_evento, '2026-11-05T12:00:00Z');
  assert.equal(evento.camara, 'Imou (vista local)');
  assert.match(evento.descripcion, /5 segundos/);
  assert.match(evento.descripcion, /ubicación no está verificada/);
  assert.match(evento.descripcion, /Requiere revisión/);
  assert.match(evento.descripcion, /Se adjunta el fotograma analizado/);
});
