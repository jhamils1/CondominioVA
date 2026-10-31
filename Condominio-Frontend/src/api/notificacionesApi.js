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
export async function atenderEvento(id, accion, observacion) { return (await client.post(`eventos-seguridad/${id}/${accion}/`, { observacion })).data; }
export async function listarEventos() { return (await client.get('eventos-seguridad/')).data; }
export async function crearEvento(datos) { return (await client.post('eventos-seguridad/', datos)).data; }
export async function redistribuirEvento(id) { return (await client.post(`eventos-seguridad/${id}/redistribuir/`)).data; }
export async function listarHistorialEvento(id) { return (await client.get(`eventos-seguridad/${id}/historial/`)).data; }
