const nombres = { car: 'automóvil', motorcycle: 'motocicleta', bus: 'autobús', truck: 'camión' };

// El identificador y contenido se conservan sin cambios para reintentar.
export function crearEventoImou(hallazgo, id, fecha) {
  return {
    id,
    categoria: 'Posible estacionamiento en zona prohibida',
    camara: 'Imou (vista local)',
    descripcion: `Detección automática desde la vista local Imou: ${nombres[hallazgo.clase] || 'vehículo'}, aproximadamente ${Math.floor(hallazgo.duracion)} segundos detenido en la zona temporal. La ubicación no está verificada. Requiere revisión. Se adjunta el fotograma analizado.`,
    fecha_evento: fecha,
  };
}
