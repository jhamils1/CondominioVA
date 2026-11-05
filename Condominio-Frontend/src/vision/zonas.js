// Las coordenadas se guardan como proporciones de la imagen, entre 0 y 1.
export function normalizarPunto(x, y, rectangulo) {
  if (!rectangulo.width || !rectangulo.height) return null;
  return {
    x: Math.min(1, Math.max(0, (x - rectangulo.left) / rectangulo.width)),
    y: Math.min(1, Math.max(0, (y - rectangulo.top) / rectangulo.height)),
  };
}

function orientacion(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function sobreSegmento(a, b, p) {
  const epsilon = 1e-9;
  return Math.abs(orientacion(a, b, p)) < epsilon
    && p.x >= Math.min(a.x, b.x) - epsilon && p.x <= Math.max(a.x, b.x) + epsilon
    && p.y >= Math.min(a.y, b.y) - epsilon && p.y <= Math.max(a.y, b.y) + epsilon;
}

function seCruzan(a, b, c, d) {
  const abC = orientacion(a, b, c), abD = orientacion(a, b, d);
  const cdA = orientacion(c, d, a), cdB = orientacion(c, d, b);
  return (abC * abD < 0 && cdA * cdB < 0)
    || sobreSegmento(a, b, c) || sobreSegmento(a, b, d)
    || sobreSegmento(c, d, a) || sobreSegmento(c, d, b);
}

export function zonaValida(puntos) {
  if (!Array.isArray(puntos) || puntos.length < 3 || puntos.length > 30) return false;
  if (puntos.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y)
    || p.x < 0 || p.x > 1 || p.y < 0 || p.y > 1)) return false;
  const cantidad = puntos.length;
  let areaDoble = 0;
  for (let i = 0; i < cantidad; i += 1) {
    const a = puntos[i], b = puntos[(i + 1) % cantidad];
    if (Math.hypot(a.x - b.x, a.y - b.y) < 0.001) return false;
    areaDoble += a.x * b.y - b.x * a.y;
    for (let j = i + 1; j < cantidad; j += 1) {
      if (j === i + 1 || (i === 0 && j === cantidad - 1)) continue;
      if (seCruzan(a, b, puntos[j], puntos[(j + 1) % cantidad])) return false;
    }
  }
  return Math.abs(areaDoble) >= 0.0002;
}
