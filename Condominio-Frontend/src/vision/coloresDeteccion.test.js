import test from 'node:test';
import assert from 'node:assert/strict';
import { colorDeteccion } from './coloresDeteccion.js';

test('distingue detección fuera de zona, tolerancia y tiempo cumplido', () => {
  assert.equal(colorDeteccion({ permanencia: null }), '#00ff40');
  assert.equal(colorDeteccion({ permanencia: { segundos: 1, superaUmbral: false } }), '#ffc247');
  assert.equal(colorDeteccion({ permanencia: { segundos: 5, superaUmbral: true } }), '#ff3030');
});
