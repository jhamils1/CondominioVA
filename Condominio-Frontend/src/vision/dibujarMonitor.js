import { colorDeteccionMonitor, esVehiculo, filtrarDetecciones } from './coloresDeteccion.js';

const nombres = { person: 'persona', car: 'automóvil', motorcycle: 'motocicleta',
  bus: 'autobús', truck: 'camión', cat: 'gato', dog: 'perro' };
const vehiculos = new Set(['car', 'motorcycle', 'bus', 'truck']);

export function dibujar(canvas, imagen, detecciones, config, modo) {
  canvas.width = imagen.width;
  canvas.height = imagen.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imagen, 0, 0);
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.lineWidth = 2;
  for (const deteccion of filtrarDetecciones(detecciones, modo)) {
    if (!Array.isArray(deteccion.caja) || deteccion.caja.length !== 4 ||
        !deteccion.caja.every(Number.isFinite) || !Number.isFinite(deteccion.confianza)) continue;
    const [x1, y1, x2, y2] = deteccion.caja;
    const advertencia = deteccion.permanencia?.superaUmbral;
    const permanencia = deteccion.permanencia;
    const detalle = advertencia ? ' · revisar'
      : permanencia ? ` · ${permanencia.segundos.toFixed(1)}/${config.segundos} s en zona` : '';
    const color = colorDeteccionMonitor(deteccion);
    const nombre = modo !== 'todas' && esVehiculo(deteccion) ? 'Vehículo detectado' : nombres[deteccion.clase] || deteccion.clase;
    const texto = `${nombre} ${Math.round(deteccion.confianza * 100)}%${detalle}`;
    const y = Math.max(19, y1);
    ctx.strokeStyle = color;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    if (config.zona.length && vehiculos.has(deteccion.clase)) {
      // Punto que la regla comprueba sobre el suelo; no es el centro de toda la caja.
      ctx.beginPath(); ctx.arc((x1 + x2) / 2, y2, 4, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.stroke();
    }
    ctx.fillStyle = 'rgba(5, 20, 36, 0.88)';
    ctx.fillRect(x1, y - 19, ctx.measureText(texto).width + 10, 20);
    ctx.fillStyle = '#fff';
    ctx.fillText(texto, x1 + 4, y - 4);
  }
}

