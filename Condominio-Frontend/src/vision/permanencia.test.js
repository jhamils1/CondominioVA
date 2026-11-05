import test from 'node:test';
import assert from 'node:assert/strict';
import { crearSeguimiento, intervaloNoConfiable, puntoEnZona } from './permanencia.js';

const zona = [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.9, y: 0.9 }, { x: 0.1, y: 0.9 }];
const coche = (x = 30, clase = 'car') => ({ clase, confianza: 0.9, caja: [x, 20, x + 20, 40] });
const seguimiento = () => crearSeguimiento({ zona, ancho: 100, alto: 100, segundos: 2 });

test('reinicia la cámara si las muestras están demasiado separadas o el reloj retrocede', () => {
  assert.equal(intervaloNoConfiable(null, 5), false);
  assert.equal(intervaloNoConfiable(5, 6.5), false);
  assert.equal(intervaloNoConfiable(5, 7.1), true);
  assert.equal(intervaloNoConfiable(5, 5), true);
});

test('comprueba el punto de contacto en el interior o borde del polígono', () => {
  assert.equal(puntoEnZona({ x: 0.5, y: 0.5 }, zona), true);
  assert.equal(puntoEnZona({ x: 0.1, y: 0.5 }, zona), true);
  assert.equal(puntoEnZona({ x: 0.95, y: 0.5 }, zona), false);
});

test('genera un solo resultado para un vehículo quieto y usa el tiempo del video', () => {
  const procesar = seguimiento();
  for (const t of [0, 0.5, 1, 1.5]) assert.equal(procesar([coche()], t).avisos.length, 0);
  assert.equal(procesar([coche()], 2).avisos.length, 1);
  assert.equal(procesar([coche()], 2.5).avisos.length, 0);
});

test('movimiento acumulado, salida y detección perdida reinician el tiempo', () => {
  const procesar = seguimiento();
  procesar([coche()], 0); procesar([coche(32)], 0.5);
  assert.equal(procesar([coche(34)], 1).detecciones[0].permanencia.segundos, 0);
  procesar([], 1.5);
  assert.equal(procesar([coche(34)], 2).detecciones[0].permanencia.segundos, 0);
  assert.equal(procesar([coche(85)], 2.5).detecciones[0].permanencia, null);
});

test('no cuenta personas, ni vehículos fuera de zona', () => {
  const procesar = seguimiento();
  for (let t = 0; t <= 3; t += 0.5) {
    const resultado = procesar([coche(30, 'person'), coche(85)], t);
    assert.equal(resultado.avisos.length, 0);
  }
});

test('lleva por separado dos vehículos simultáneos', () => {
  const procesar = seguimiento();
  for (let t = 0; t < 2; t += 0.5) procesar([coche(20), coche(60, 'truck')], t);
  const avisos = procesar([coche(20), coche(60, 'truck')], 2).avisos;
  assert.equal(avisos.length, 2);
  assert.notEqual(avisos[0].id, avisos[1].id);
});
