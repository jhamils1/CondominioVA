const nombres = { car: 'automóvil', motorcycle: 'motocicleta', bus: 'autobús', truck: 'camión' };

export function crearEventoCamara(hallazgo, id, fecha) {
  return {
    id,
    categoria: 'Posible estacionamiento en zona prohibida',
    descripcion: `Registro automático desde la prueba de cámara local: ${nombres[hallazgo.clase] || 'vehículo'}, aproximadamente ${Math.floor(hallazgo.duracion)} segundos detenido en la zona temporal. La cámara y la ubicación no están identificadas. Requiere revisión. No se adjunta evidencia.`,
    fecha_evento: fecha,
  };
}
