import { puntoEnZona } from './permanencia.js';

// Seguimiento aproximado por clase y cercanía; no identifica animales ni dueños.
export function crearSeguimientoMascota({ zona, ancho, alto, segundos = 0, clases = ['dog', 'cat'] }) {
  const permitidas = new Set(clases);
  let pistas = [], siguiente = 1, anterior = null;
  return (detecciones, tiempo) => {
    if (anterior !== null && tiempo <= anterior) pistas = [];
    else if (anterior !== null && tiempo - anterior > 2) pistas = pistas.filter(p => p.avisado && tiempo - p.visto <= 5);
    anterior = tiempo;
    const resultado = detecciones.map(d => ({ ...d }));
    const candidatos = detecciones.map((d, indice) => ({ ...d, indice })).filter(d =>
      permitidas.has(d.clase) && Number.isFinite(d.confianza) && d.confianza >= 0.5 &&
      Array.isArray(d.caja) && d.caja.length === 4 && d.caja.every(Number.isFinite) &&
      d.caja[2] > d.caja[0] && d.caja[3] > d.caja[1]);
    const pares = [];
    for (const d of candidatos) {
      d.punto = { x: (d.caja[0] + d.caja[2]) / (2 * ancho), y: d.caja[3] / alto };
      for (const p of pistas) {
        if (p.clase !== d.clase) continue;
        const distancia = Math.hypot(d.punto.x - p.punto.x, d.punto.y - p.punto.y);
        if (distancia <= 0.12) pares.push({ d, p, distancia });
      }
    }
    pares.sort((a, b) => a.distancia - b.distancia);
    const asignadas = new Map(), usadas = new Set();
    for (const { d, p } of pares) if (!asignadas.has(d.indice) && !usadas.has(p.id)) {
      asignadas.set(d.indice, p); usadas.add(p.id);
    }
    const nuevas = [], avisos = [];
    for (const d of candidatos) {
      const pista = asignadas.get(d.indice) || { id: siguiente++, clase: d.clase, inicio: null, avisado: false };
      const dentro = puntoEnZona(d.punto, zona);
      if (!dentro) { pista.inicio = null; pista.avisado = false; }
      else {
        if (pista.inicio === null) pista.inicio = tiempo;
        const duracion = tiempo - pista.inicio;
        const superaUmbral = duracion >= segundos;
        resultado[d.indice].permanencia = { segundos: duracion, superaUmbral };
        if (superaUmbral && !pista.avisado) {
          avisos.push({ id: pista.id, clase: d.clase, tiempo, duracion, tipo: 'mascota' });
          pista.avisado = true;
        }
      }
      pista.punto = d.punto; pista.visto = tiempo;
      nuevas.push(pista);
    }
    // Una pérdida breve no debe producir una alerta repetida del mismo animal.
    for (const pista of pistas) {
      const claseAmbigua = candidatos.some(d => d.clase === pista.clase && !asignadas.has(d.indice));
      if (pista.avisado && !usadas.has(pista.id) && !claseAmbigua && tiempo - pista.visto <= 2) nuevas.push(pista);
    }
    pistas = nuevas;
    return { detecciones: resultado, avisos };
  };
}
