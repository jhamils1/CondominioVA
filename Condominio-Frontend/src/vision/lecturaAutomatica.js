// Control por presencia: no identifica ni vincula vehículos entre cámaras.
const CLASES = new Set(['car', 'motorcycle', 'bus', 'truck']);
export function crearControlLectura({ ausencia = 5, intervalo = 30 } = {}) {
  let presente = false, ultimaPresencia = null, ultimaConsulta = -Infinity;
  return function observar(detecciones, tiempo) {
    if (!Number.isFinite(tiempo) || !Array.isArray(detecciones)) return false;
    const vehiculos = detecciones.filter(d => CLASES.has(d.clase) && Number.isFinite(d.confianza) && d.confianza >= 0.5 &&
      Array.isArray(d.caja) && d.caja.length === 4 && d.caja.every(Number.isFinite) && d.caja[2] > d.caja[0] && d.caja[3] > d.caja[1]);
    if (!vehiculos.length) {
      if (ultimaPresencia !== null && tiempo - ultimaPresencia >= ausencia) presente = false;
      return false;
    }
    ultimaPresencia = tiempo;
    if (presente) return false;
    presente = true;
    if (vehiculos.length !== 1 || tiempo - ultimaConsulta < intervalo) return false;
    ultimaConsulta = tiempo;
    return true;
  };
}
