import test from 'node:test';
import assert from 'node:assert/strict';
import { colorDeteccion, colorDeteccionMonitor, filtrarDetecciones } from './coloresDeteccion.js';

test('monitor: verde al entrar, amarillo durante tolerancia y rojo al cumplirla', () => {
  assert.equal(colorDeteccionMonitor({ permanencia: { segundos: 0, superaUmbral: false } }), '#00ff40');
  assert.equal(colorDeteccionMonitor({ permanencia: { segundos: 0.5, superaUmbral: false } }), '#ffc247');
  assert.equal(colorDeteccionMonitor({ permanencia: { segundos: 5, superaUmbral: true } }), '#ff3030');
});

test('distingue detección fuera de zona, tolerancia y tiempo cumplido', () => {
  assert.equal(colorDeteccion({ permanencia: null }), '#00ff40');
  assert.equal(colorDeteccion({ permanencia: { segundos: 4.9, superaUmbral: false } }), '#00ff40');
  assert.equal(colorDeteccion({ permanencia: { segundos: 5, superaUmbral: false } }), '#ffc247');
  assert.equal(colorDeteccion({ permanencia: { segundos: 15, superaUmbral: true } }), '#ff3030');
  assert.equal(colorDeteccion({ permanencia: { segundos: 2, superaUmbral: true } }), '#ff3030');
});

test('la vista de zona muestra solo vehículos detectados dentro de ella', () => {
  const dentro = { clase: 'car', permanencia: { segundos: 0, superaUmbral: false } };
  const fuera = { clase: 'truck', permanencia: null };
  const persona = { clase: 'person', permanencia: { segundos: 10, superaUmbral: true } };
  assert.deepEqual(filtrarDetecciones([dentro, fuera, persona], 'zona'), [dentro]);
  assert.deepEqual(filtrarDetecciones([fuera, persona], 'zona'), []);
});

test('el filtro visual conserva todos los vehículos y no altera las detecciones originales', () => {
  const detecciones = [{ clase: 'person' }, { clase: 'car' }, { clase: 'truck' }, { clase: 'dog' }];
  assert.deepEqual(filtrarDetecciones(detecciones, 'vehiculos').map(d => d.clase), ['car', 'truck']);
  assert.equal(filtrarDetecciones(detecciones, 'todas').length, 4);
  assert.equal(detecciones.length, 4);
});
