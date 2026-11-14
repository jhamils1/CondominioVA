const nombres = { car: 'automóvil', motorcycle: 'motocicleta', bus: 'autobús', truck: 'camión' };

// El mismo objeto debe reutilizarse en cada reintento; Django valida id y contenido.
export function crearEventoVideo(hallazgo, id, fecha) {
  const minuto = `${Math.floor(hallazgo.tiempo / 60)}:${String(Math.floor(hallazgo.tiempo % 60)).padStart(2, '0')}`;
  return {
    id,
    categoria: 'Posible estacionamiento en zona prohibida',
    descripcion: `Registro automático desde análisis de video grabado: ${nombres[hallazgo.clase] || 'vehículo'}, aproximadamente ${Math.floor(hallazgo.duracion)} segundos detenido en la zona marcada, en el minuto ${minuto} del video. La fecha y ubicación de grabación no están verificadas. Requiere revisión. Se adjunta el fotograma del hallazgo, no el video completo.`,
    fecha_evento: fecha,
  };
}
