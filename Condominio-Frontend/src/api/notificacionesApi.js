import axios from './client.js';
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });
client.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('access')}`;
  return config;
});
export async function listarNotificaciones() { return (await client.get('notificaciones-seguridad/')).data; }
export async function leerNotificacion(id) { return (await client.post(`notificaciones-seguridad/${id}/leer/`)).data; }
export async function obtenerEvento(id) { return (await client.get(`eventos-seguridad/${id}/`)).data; }
export async function revisarEvento(id, accion, motivo) { return (await client.post(`eventos-seguridad/${id}/${accion}/`, { motivo })).data; }
export async function retirarHistorialEvento(id) { await client.post(`eventos-seguridad/${id}/retirar-historial/`); }
export async function registrarPlacaEvento(id, placa) { return (await client.post(`eventos-seguridad/${id}/registrar-placa/`, { placa })).data; }
export async function reconocerPlacaEvidencia(id) { return (await client.post(`eventos-seguridad/${id}/reconocer-placa-evidencia/`, {}, { timeout: 45000 })).data; }
export async function posiblesLecturasEntrada(id) { return (await client.get(`eventos-seguridad/${id}/posibles-lecturas-entrada/`)).data; }
export async function consultarDestinatarioPlaca(id) { return (await client.get(`eventos-seguridad/${id}/destinatario-placa/`)).data; }
export async function confirmarDestinatarioPlaca(id, vehiculoId) { return (await client.post(`eventos-seguridad/${id}/destinatario-placa/`, { vehiculo_id: vehiculoId })).data; }
export async function prepararAvisoResidente(id) { return (await client.post(`eventos-seguridad/${id}/preparar-aviso-residente/`, {})).data; }
export async function encolarAvisoResidente(id) { return (await client.post(`eventos-seguridad/${id}/encolar-aviso-residente/`, {})).data; }
export async function atenderEvento(id, accion, observacion) { return (await client.post(`eventos-seguridad/${id}/${accion}/`, { observacion })).data; }
export async function listarEventos() { return (await client.get('eventos-seguridad/')).data; }
export async function crearEvento(datos, configuracion) {
  if (datos.evidencia instanceof Blob) {
    const cuerpo = new FormData();
    for (const [clave, valor] of Object.entries(datos)) {
      if (clave === 'evidencia') cuerpo.append(clave, valor, 'evidencia.jpg');
      else cuerpo.append(clave, valor);
    }
    return (await client.post('eventos-seguridad/', cuerpo, configuracion)).data;
  }
  return (await client.post('eventos-seguridad/', datos, configuracion)).data;
}
export async function obtenerEvidencia(id, signal) {
  const respuesta = await client.get(`eventos-seguridad/${id}/evidencia/`, { signal, responseType: 'blob', timeout: 10000 });
  if (respuesta.data.type !== 'image/jpeg' || respuesta.data.size > 1024 * 1024) throw new Error('Evidencia inválida');
  return respuesta.data;
}
export async function redistribuirEvento(id) { return (await client.post(`eventos-seguridad/${id}/redistribuir/`)).data; }
export async function listarHistorialEvento(id) { return (await client.get(`eventos-seguridad/${id}/historial/`)).data; }
