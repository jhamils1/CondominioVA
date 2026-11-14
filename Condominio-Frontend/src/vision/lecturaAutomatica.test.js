import test from 'node:test';
import assert from 'node:assert/strict';
import { crearControlLectura } from './lecturaAutomatica.js';

const coche = { clase: 'car', confianza: .8, caja: [1, 1, 5, 5] };
test('consulta una vez por presencia y limita frecuencia', () => {
  const observar = crearControlLectura();
  assert.equal(observar([coche], 0), true);
  assert.equal(observar([coche], 1), false);
  assert.equal(observar([], 7), false);
  assert.equal(observar([coche], 8), false);
  assert.equal(observar([], 14), false);
  assert.equal(observar([coche], 31), true);
});
test('rechaza muestras ambiguas y detecciones incompletas', () => {
  const observar = crearControlLectura();
  assert.equal(observar([coche, coche], 0), false);
  assert.equal(observar([coche], 1), false);
  assert.equal(observar([], 7), false);
  assert.equal(observar([{ ...coche, caja: [0, 0, 0, 0] }], 8), false);
  assert.equal(observar([coche], 9), true);
});
