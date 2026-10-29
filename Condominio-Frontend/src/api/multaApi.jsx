import axios from 'axios';

// Creamos una instancia de Axios que se usará para todas las llamadas a la API.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para añadir el token de autenticación a cada solicitud.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchAllMultas = async () => {
  try {
    const response = await apiClient.get('multas/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las multas.');
  }
};

export const createMulta = async (multaData) => {
  try {
    console.log('Datos recibidos para crear multa:', multaData);
    
    const dataToSend = {
      expensa: multaData.expensa || '',
      monto: multaData.monto || '',
      tipo: multaData.tipo || 'I',
    };
    
    console.log('Enviando como JSON:', dataToSend);
    const response = await apiClient.post('multas/', dataToSend);
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar la multa.');
  }
};

export const updateMulta = async (multaId, multaData) => {
  try {
    const dataToSend = {
      expensa: multaData.expensa || '',
      monto: multaData.monto || '',
      tipo: multaData.tipo || 'I',
    };
    
    const response = await apiClient.put(`multas/${multaId}/`, dataToSend);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar la multa.');
  }
};

export const deleteMulta = async (multaId) => {
  try {
    await apiClient.delete(`multas/${multaId}/`);
  } catch (error) {
    throw new Error('Error al eliminar la multa.');
  }
};
