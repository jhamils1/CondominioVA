import test from 'node:test';
import assert from 'node:assert/strict';
import { crearSeguimientoPiscina } from './personaSolaPiscina.js';

const zona = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
const persona = { clase: 'person', confianza: .9, caja: [20, 20, 40, 60] };
const nueva = () => crearSeguimientoPiscina({ zona, ancho: 100, alto: 100, segundos: 10 });

test('avisa una sola vez después de 10 segundos y permite caminar', () => {
  const procesar = nueva();
  for (let t = 0; t < 10; t++) assert.equal(procesar([{ ...persona, caja: [20 + t, 20, 40 + t, 60] }], t).avisos.length, 0);
  assert.equal(procesar([persona], 10).avisos.length, 1);
  assert.equal(procesar([persona], 11).avisos.length, 0);
});

test('otra persona, falta de imagen y salida reinician el conteo', () => {
  const procesar = nueva();
  for (let t = 0; t <= 9; t++) procesar([persona], t);
  assert.equal(procesar([persona, { ...persona, confianza: .1, caja: [150, 20, 170, 60] }], 10).avisos.length, 0);
  for (let t = 11; t <= 20; t++) assert.equal(procesar([persona], t).avisos.length, 0);
  assert.equal(procesar([], 21).avisos.length, 0);
  for (let t = 22; t <= 31; t++) assert.equal(procesar([persona], t).avisos.length, 0);
  assert.equal(procesar([{ ...persona, caja: [110, 20, 130, 60] }], 32).avisos.length, 0);
  assert.equal(procesar([persona], 40).avisos.length, 0);
});
