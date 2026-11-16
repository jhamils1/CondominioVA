import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearBufferFotogramas, ventanaClip } from './clipIncidencia.js';

test('ventana centra el instante y respeta límites de grabación', () => {
  assert.deepEqual(ventanaClip(8, 20), { inicio: 6, fin: 10 });
  assert.deepEqual(ventanaClip(1, 20), { inicio: 0, fin: 4 });
  assert.deepEqual(ventanaClip(19, 20), { inicio: 16, fin: 20 });
  assert.deepEqual(ventanaClip(1, 3), { inicio: 0, fin: 3 });
});

test('búfer conserva fotogramas de una fuente con límite temporal y de cantidad', () => {
  const buffer = crearBufferFotogramas({ maxSegundos: 4, maxFotogramas: 3 });
  const blob = new Blob(['imagen']);
  for (let i = 1; i <= 5; i += 1) buffer.agregar(blob, i);
  buffer.agregar(blob, 4);
  assert.deepEqual(buffer.obtener(0, 10).map(x => x.tiempo), [3, 4, 5]);
  assert.deepEqual(buffer.obtener(4, 5).map(x => x.tiempo), [4, 5]);
  buffer.limpiar();
  assert.deepEqual(buffer.obtener(0, 10), []);
});
