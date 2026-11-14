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

const imou = (segundos = 3) => crearSeguimiento({ zona, ancho: 100, alto: 100, segundos, toleranciaPerdida: 2 });

test('Imou conserva el tiempo ante una pérdida breve sin contar ni dibujar la ausencia', () => {
  const procesar = imou();
  procesar([coche()], 0); procesar([coche()], 1); procesar([coche()], 2);
  assert.deepEqual(procesar([], 2.5), { detecciones: [], avisos: [] });
  const recuperado = procesar([coche()], 3);
  assert.equal(recuperado.detecciones[0].permanencia.segundos, 2);
  assert.equal(recuperado.avisos.length, 0);
  assert.equal(procesar([coche()], 4).avisos.length, 1);
});

test('Imou recupera el rojo sin repetir el aviso después de una ausencia breve', () => {
  const procesar = imou(2);
  procesar([coche()], 0); procesar([coche()], 1);
  assert.equal(procesar([coche()], 2).avisos.length, 1);
  procesar([], 2.5);
  const resultado = procesar([coche()], 3);
  assert.equal(resultado.detecciones[0].permanencia.superaUmbral, true);
  assert.equal(resultado.avisos.length, 0);
});

test('Imou conserva el aviso durante una interrupción de análisis sin sumar tiempo', () => {
  const procesar = imou(2);
  procesar([coche()], 0); procesar([coche()], 1);
  assert.equal(procesar([coche()], 2).avisos.length, 1);
  assert.equal(procesar([coche()], 6).avisos.length, 0);
  assert.equal(procesar([coche()], 7).avisos.length, 0);
});

test('Imou permite otro aviso tras salir y otro vehículo dentro de la zona', () => {
  const procesar = imou(2);
  procesar([coche(20)], 0); procesar([coche(20)], 1);
  assert.equal(procesar([coche(20)], 2).avisos.length, 1);
  procesar([coche(20), coche(60)], 3);
  procesar([coche(20), coche(60)], 4);
  assert.equal(procesar([coche(20), coche(60)], 5).avisos.length, 1);
  procesar([coche(85)], 6);
  procesar([coche(85)], 7);
  procesar([coche(20)], 18); procesar([coche(20)], 19);
  assert.equal(procesar([coche(20)], 20).avisos.length, 1);
});

test('Imou vuelve a avisar si observa que el vehículo sale y regresa', () => {
  const procesar = imou(2);
  procesar([coche(78)], 0); procesar([coche(78)], 1);
  assert.equal(procesar([coche(78)], 2).avisos.length, 1);
  procesar([coche(81)], 3);
  procesar([coche(78)], 4); procesar([coche(78)], 5);
  assert.equal(procesar([coche(78)], 6).avisos.length, 1);
});

test('Imou no conserva una pista perdida demasiado tiempo o reemplazada por otro vehículo', () => {
  for (const [tiempo, x] of [[4.1, 30], [2.5, 60]]) {
    const procesar = imou();
    procesar([coche()], 0); procesar([coche()], 1); procesar([], 1.5);
    const resultado = procesar([coche(x)], tiempo);
    assert.equal(resultado.detecciones[0].permanencia.segundos, 0);
    assert.equal(resultado.avisos.length, 0);
  }
});

test('Imou reinicia por salida, movimiento o salto atrás del reloj aun con tolerancia', () => {
  const procesar = imou(2);
  procesar([coche()], 0); procesar([coche()], 1); procesar([coche()], 2);
  assert.equal(procesar([coche(85)], 2.5).detecciones[0].permanencia, null);
  assert.equal(procesar([coche()], 3).detecciones[0].permanencia.segundos, 0);
  procesar([coche()], 4);
  assert.equal(procesar([coche(34)], 4.5).detecciones[0].permanencia.segundos, 0);
  assert.equal(procesar([coche(34)], 1).detecciones[0].permanencia.segundos, 0);
});
