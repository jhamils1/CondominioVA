const nombres = { car: 'automóvil', motorcycle: 'motocicleta', bus: 'autobús', truck: 'camión' };

export function crearEventoCamara(hallazgo, id, fecha) {
  return {
    id,
    categoria: 'Posible estacionamiento en zona prohibida',
    camara: 'Cámara local (laptop o USB)',
    descripcion: `Registro automático desde cámara local: ${nombres[hallazgo.clase] || 'vehículo'}, aproximadamente ${Math.floor(hallazgo.duracion)} segundos detenido en la zona configurada. La ubicación no está verificada. Requiere revisión. Se adjunta el fotograma analizado.`,
    fecha_evento: fecha,
  };
}
