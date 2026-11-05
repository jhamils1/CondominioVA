// Seguimiento simple para la demostración de un único video, no identificación real.
const VEHICULOS = new Set(['car', 'motorcycle', 'bus', 'truck']);
const MAX_DESPLAZAMIENTO = 0.03;

export function intervaloNoConfiable(anterior, actual) {
  return anterior !== null && (actual <= anterior || actual - anterior > 2);
}

export function puntoEnZona(punto, zona) {
  if (zona.length < 3) return false;
  let dentro = false;
  for (let i = 0, j = zona.length - 1; i < zona.length; j = i++) {
    const a = zona[j], b = zona[i];
    const cruz = (punto.x - a.x) * (b.y - a.y) - (punto.y - a.y) * (b.x - a.x);
    if (Math.abs(cruz) < 1e-9 && punto.x >= Math.min(a.x, b.x) && punto.x <= Math.max(a.x, b.x)
        && punto.y >= Math.min(a.y, b.y) && punto.y <= Math.max(a.y, b.y)) return true;
    if ((a.y > punto.y) !== (b.y > punto.y)
        && punto.x < (b.x - a.x) * (punto.y - a.y) / (b.y - a.y) + a.x) dentro = !dentro;
  }
  return dentro;
}

function centro(caja, ancho, alto) {
  return { x: (caja[0] + caja[2]) / (2 * ancho), y: caja[3] / alto };
}

function solapamiento(a, b) {
  const inter = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]))
    * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const area = c => (c[2] - c[0]) * (c[3] - c[1]);
  return inter / (area(a) + area(b) - inter || 1);
}

export function crearSeguimiento({ zona, ancho, alto, segundos }) {
  let pistas = [], siguienteId = 1;
  return function procesar(detecciones, tiempo) {
    const vehiculos = detecciones.map((d, indice) => ({ ...d, indice }))
      .filter(d => VEHICULOS.has(d.clase) && Array.isArray(d.caja) && d.caja.length === 4
        && d.caja.every(Number.isFinite) && d.caja[2] > d.caja[0] && d.caja[3] > d.caja[1]);
    // Las asociaciones usan únicamente el fotograma anterior; una pérdida reinicia el contador.
    const candidatos = [];
    for (const pista of pistas) for (const d of vehiculos) {
      if (pista.clase !== d.clase) continue;
      const actual = centro(d.caja, ancho, alto);
      const distancia = Math.hypot(actual.x - pista.ultimo.x, actual.y - pista.ultimo.y);
      const iou = solapamiento(pista.caja, d.caja);
      if (distancia <= 0.08 && iou >= 0.15) candidatos.push({ pista, d, iou });
    }
    candidatos.sort((a, b) => b.iou - a.iou);
    const asignados = new Map(), usados = new Set();
    for (const { pista, d } of candidatos) {
      if (!asignados.has(d.indice) && !usados.has(pista.id)) {
        asignados.set(d.indice, pista); usados.add(pista.id);
      }
    }
    const resultado = detecciones.map(d => ({ ...d })), nuevas = [], avisos = [];
    for (const d of vehiculos) {
      const punto = centro(d.caja, ancho, alto);
      const pista = asignados.get(d.indice) || { id: siguienteId++, clase: d.clase, inicio: null, avisado: false };
      const dentro = puntoEnZona(punto, zona);
      if (!dentro) { pista.inicio = null; pista.ancla = null; pista.avisado = false; }
      else if (pista.inicio === null || Math.hypot(punto.x - pista.ancla.x, punto.y - pista.ancla.y) > MAX_DESPLAZAMIENTO) {
        pista.inicio = tiempo; pista.ancla = punto; pista.avisado = false;
      }
      const duracion = dentro ? Math.max(0, tiempo - pista.inicio) : 0;
      const superaUmbral = dentro && duracion >= segundos;
      if (superaUmbral && !pista.avisado) {
        avisos.push({ id: pista.id, clase: d.clase, tiempo, duracion });
        pista.avisado = true;
      }
      resultado[d.indice].permanencia = dentro ? { segundos: duracion, superaUmbral } : null;
      pista.caja = d.caja; pista.ultimo = punto;
      nuevas.push(pista);
    }
    pistas = nuevas;
    return { detecciones: resultado, avisos };
  };
}
