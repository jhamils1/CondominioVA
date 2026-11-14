// Misma convención visual para el video y el análisis de cámara.
export function colorDeteccion(deteccion) {
  return deteccion.permanencia?.superaUmbral ? '#ff3030'
    : deteccion.permanencia ? '#ffc247' : '#00ff40';
}
