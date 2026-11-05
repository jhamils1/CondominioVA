import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarPunto, zonaValida } from './zonas.js';

test('normaliza y limita puntos a la imagen mostrada', () => {
  const rect = { left: 20, top: 10, width: 200, height: 100 };
  assert.deepEqual(normalizarPunto(120, 60, rect), { x: 0.5, y: 0.5 });
  assert.deepEqual(normalizarPunto(500, -5, rect), { x: 1, y: 0 });
  assert.equal(normalizarPunto(0, 0, { ...rect, width: 0 }), null);
});

test('valida contornos cerrados sin líneas cruzadas', () => {
  const rect = [{ x: .1, y: .1 }, { x: .9, y: .1 }, { x: .9, y: .9 }, { x: .1, y: .9 }];
  assert.equal(zonaValida(rect), true);
  assert.equal(zonaValida([rect[0], rect[2], rect[1], rect[3]]), false);
  assert.equal(zonaValida([{ x: .1, y: .1 }, { x: .5, y: .5 }, { x: .9, y: .9 }]), false);
  assert.equal(zonaValida([rect[0], rect[1], rect[1], rect[3]]), false);
  assert.equal(zonaValida([{ x: 0, y: 0 }, { x: 1, y: 0 }]), false);
});
