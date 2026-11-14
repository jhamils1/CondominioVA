// Una coincidencia de dirección sugiere duplicación; no certifica identidad.
export function posibleDuplicada(camara, lista) {
  return !camara.monitor_en_catalogo && camara.tipo === 'RED' && !!camara.direccion_ip && !!camara.puerto_rtsp && lista.some(otra =>
    otra.id !== camara.id && otra.monitor_en_catalogo && otra.tipo === 'RED' &&
    otra.direccion_ip === camara.direccion_ip && Number(otra.puerto_rtsp) === Number(camara.puerto_rtsp));
}
