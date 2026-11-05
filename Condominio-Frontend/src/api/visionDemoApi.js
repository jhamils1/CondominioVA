import axios from './client.js';

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });
client.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('access')}`;
  return config;
});

export async function estadoCamaraDemo(signal) {
  return (await client.get('vision-camara/estado/', { signal })).data;
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
  return (await client.post('vision-camara/analizar/', datos, { signal })).data;
}
