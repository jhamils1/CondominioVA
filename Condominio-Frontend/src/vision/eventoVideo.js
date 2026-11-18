const nombres = { car: 'automóvil', motorcycle: 'motocicleta', bus: 'autobús', truck: 'camión' };

// El mismo objeto debe reutilizarse en cada reintento; Django valida id y contenido.
export function crearEventoVideo(hallazgo, id, fecha) {
  const minuto = `${Math.floor(hallazgo.tiempo / 60)}:${String(Math.floor(hallazgo.tiempo % 60)).padStart(2, '0')}`;
  if (hallazgo.tipo === 'mascota') return {
    id, categoria: 'Posible mascota en área restringida',
    descripcion: `Análisis de video grabado: posible ${hallazgo.clase === 'dog' ? 'perro' : 'gato'} en área restringida en el minuto ${minuto}. La fecha y ubicación originales no están verificadas. Requiere revisión del guardia.`,
    fecha_evento: fecha,
  };
  if (hallazgo.tipo === 'piscina') return {
    id, categoria: 'Posible persona sola cerca de piscina',
    descripcion: `Análisis de video grabado: se detectó una sola persona en la imagen, dentro de la zona de piscina, durante aproximadamente ${Math.floor(hallazgo.duracion)} segundos, en el minuto ${minuto}. La fecha y ubicación de la grabación no están verificadas. Requiere revisión del guardia. Se adjunta el fotograma analizado, no el video completo.`,
    fecha_evento: fecha,
  };
  return {
    id,
    categoria: 'Posible estacionamiento en zona prohibida',
    descripcion: `Registro automático desde análisis de video grabado: ${nombres[hallazgo.clase] || 'vehículo'}, aproximadamente ${Math.floor(hallazgo.duracion)} segundos detenido en la zona marcada, en el minuto ${minuto} del video. La fecha y ubicación de grabación no están verificadas. Requiere revisión. Se adjunta el fotograma del hallazgo, no el video completo.`,
    fecha_evento: fecha,
  };
}
