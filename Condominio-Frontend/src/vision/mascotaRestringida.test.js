import test from 'node:test';
import assert from 'node:assert/strict';
import { crearSeguimientoMascota } from './mascotaRestringida.js';

const zona = [{x: 0, y: 0}, {x: 0.8, y: 0}, {x: 0.8, y: 1}, {x: 0, y: 1}];
const dog = { clase: 'dog', confianza: .9, caja: [20, 20, 30, 40] };
const cat = { clase: 'cat', confianza: .9, caja: [50, 20, 60, 40] };
const nueva = () => crearSeguimientoMascota({ zona, ancho: 100, alto: 100, segundos: 2 });

test('avisa inmediatamente en zona y no por otras clases o fuera', () => {
  const procesar = crearSeguimientoMascota({ zona, ancho: 100, alto: 100 });
  assert.equal(procesar([{...dog, clase: 'person'}], 0).avisos.length, 0);
  assert.equal(procesar([{...dog, caja: [85, 20, 95, 40]}], 1).avisos.length, 0);
  assert.equal(procesar([dog], 2).avisos.length, 1);
  assert.equal(procesar([dog], 3).avisos.length, 0);
});

test('perros y gatos cuentan independientemente y no repiten aviso', () => {
  const procesar = nueva();
  assert.equal(procesar([dog, cat], 0).avisos.length, 0);
  assert.equal(procesar([dog, cat], 1).avisos.length, 0);
  assert.deepEqual(procesar([dog, cat], 2).avisos.map(a => a.clase), ['dog', 'cat']);
  assert.equal(procesar([dog, cat], 3).avisos.length, 0);
});

test('una pérdida breve no repite un aviso inmediato', () => {
  const procesar = crearSeguimientoMascota({ zona, ancho: 100, alto: 100 });
  assert.equal(procesar([dog], 0).avisos.length, 1);
  assert.equal(procesar([], 1).avisos.length, 0);
  assert.equal(procesar([dog], 1.5).avisos.length, 0);
});

test('sin detección o fuera de la zona se reinicia el conteo', () => {
  const procesar = nueva();
  procesar([dog], 0); procesar([dog], 1); procesar([], 2);
  assert.equal(procesar([dog], 3).avisos.length, 0);
  assert.equal(procesar([dog], 4).avisos.length, 0);
  assert.equal(procesar([{...dog, caja: [85, 20, 95, 40]}], 5).avisos.length, 0);
  assert.equal(procesar([dog], 6).avisos.length, 0);
});
