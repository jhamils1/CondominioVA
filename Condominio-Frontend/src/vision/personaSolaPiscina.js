import { puntoEnZona } from './permanencia.js';

// Observa la imagen completa: una segunda persona, incluso fuera de la zona,
// interrumpe la condición. La ausencia de detección nunca suma tiempo.
export function crearSeguimientoPiscina({ zona, ancho, alto, segundos = 10 }) {
  let inicio = null, anterior = null, puntoAnterior = null, avisado = false;
  return (detecciones, tiempo) => {
    const personas = detecciones.map((d, indice) => ({ ...d, indice })).filter(d =>
      d.clase === 'person' && Array.isArray(d.caja) && d.caja.length === 4 &&
      d.caja.every(Number.isFinite) && d.caja[2] > d.caja[0] && d.caja[3] > d.caja[1]);
    const persona = personas.length === 1 ? personas[0] : null;
    const punto = persona ? { x: (persona.caja[0] + persona.caja[2]) / (2 * ancho), y: persona.caja[3] / alto } : null;
    const valida = persona && Number.isFinite(persona.confianza) && persona.confianza >= 0.5 && puntoEnZona(punto, zona);
    if (!valida || (anterior !== null && (tiempo <= anterior || tiempo - anterior > 2)) ||
        (punto && puntoAnterior && Math.hypot(punto.x - puntoAnterior.x, punto.y - puntoAnterior.y) > 0.2)) {
      inicio = null; avisado = false; puntoAnterior = null;
    }
    const resultado = detecciones.map(d => ({ ...d }));
    const avisos = [];
    if (valida) {
      if (inicio === null) inicio = tiempo;
      const duracion = tiempo - inicio;
      const superaUmbral = duracion >= segundos;
      resultado[persona.indice].permanencia = { segundos: duracion, superaUmbral };
      if (superaUmbral && !avisado) {
        avisos.push({ id: 1, clase: 'person', tiempo, duracion, tipo: 'piscina' });
        avisado = true;
      }
      puntoAnterior = punto;
    }
    anterior = tiempo;
    return { detecciones: resultado, avisos };
  };
}
