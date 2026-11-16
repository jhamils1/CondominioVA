// Misma convención visual para el video y el análisis de cámara.
export function colorDeteccion(deteccion) {
  return deteccion.permanencia?.superaUmbral ? '#ff3030'
    : deteccion.permanencia?.segundos >= 5 ? '#ffc247' : '#00ff40';
}

// Monitor Imou: al detectar entra en verde y durante la espera pasa a amarillo.
export function colorDeteccionMonitor(deteccion) {
  if (deteccion.permanencia?.superaUmbral) return '#ff3030';
  return deteccion.permanencia?.segundos > 0 ? '#ffc247' : '#00ff40';
}

const vehiculos = new Set(['car', 'motorcycle', 'bus', 'truck']);
export function esVehiculo(deteccion) { return vehiculos.has(deteccion.clase); }
export function filtrarDetecciones(detecciones, modo, tipo = 'vehiculos') {
  const clase = tipo === 'personas' ? deteccion => deteccion.clase === 'person' : esVehiculo;
  if (modo === 'zona') return detecciones.filter(deteccion => clase(deteccion) && deteccion.permanencia != null);
  return modo === 'vehiculos' ? detecciones.filter(clase) : detecciones;
}
