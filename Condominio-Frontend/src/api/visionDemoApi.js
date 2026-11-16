import axios from './client.js';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });
client.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('access')}`;
  return config;
});

export function procesadorVision() {
  try { return sessionStorage.getItem('vision-procesador') === 'remoto' ? 'remoto' : 'local'; }
  catch { return 'local'; }
}

export function guardarProcesadorVision(modo) {
  if (!['local', 'remoto'].includes(modo)) throw new Error('Procesador inválido');
  sessionStorage.setItem('vision-procesador', modo);
}

export async function estadoCamaraDemo(signal, procesador = procesadorVision()) {
  return (await client.get('vision-camara/estado/', { signal, params: { procesador } })).data;
}

export async function camarasMonitor(signal) {
  return (await client.get('camaras/disponibles-monitor/', { signal })).data;
}

export async function obtenerZonaCamara(id, signal) {
  return (await client.get(`vision-camaras/${id}/zona/`, { signal })).data;
}

export async function guardarZonaCamara(id, datos) {
  return (await client.put(`vision-camaras/${id}/zona/`, datos)).data;
}

export async function obtenerReglaPiscina(fuente, signal) {
  return (await client.get(`vision-piscina/${fuente}/`, { signal })).data;
}

export async function guardarReglaPiscina(fuente, datos) {
  return (await client.put(`vision-piscina/${fuente}/`, datos)).data;
}

export async function fotogramaCamara(id, signal) {
  const response = await client.post(`camaras/${id}/fotograma-monitor/`, null, {
    signal, responseType: 'blob', timeout: 6000,
  });
  if (response.status === 202) return null;
  if (response.status !== 200 || response.data.type !== 'image/jpeg') throw new Error('Imagen inválida');
  return response.data;
}

export async function obtenerZonaImou(signal) {
  return (await client.get('vision-imou/zona/', { signal })).data;
}

export async function guardarZonaImou(datos) {
  return (await client.put('vision-imou/zona/', datos)).data;
}

export async function estadoMonitoreoImou(signal) {
  return (await client.get('vision-imou/monitoreo/', { signal, timeout: 4000 })).data;
}

export async function fotogramaImou(signal) {
  const response = await client.post('vision-imou/fotograma/', null, {
    signal, responseType: 'blob', timeout: 6000,
  });
  if (response.status === 202) return null;
  if (response.status !== 200 || response.data.type !== 'image/jpeg') {
    throw new Error('Respuesta de cámara inválida.');
  }
  return response.data;
}

export async function analizarFotograma(imagen, signal) {
  const datos = new FormData();
  datos.append('imagen', imagen, 'fotograma.jpg');
  return (await client.post('vision-camara/analizar/', datos, { signal, params: { procesador: procesadorVision() } })).data;
}
