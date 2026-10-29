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

export const fetchAllExpensas = async () => {
  try {
    const response = await apiClient.get('expensas/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las expensas.');
  }
};

export const createExpensa = async (expensaData) => {
  try {
    console.log('Datos recibidos para crear expensa:', expensaData);
    
    const dataToSend = {
      unidad: expensaData.unidad || '',
      monto: expensaData.monto || '',
      fecha_vencimiento: expensaData.fecha_vencimiento || '',
      pagada: expensaData.pagada || false,
      descripcion: expensaData.descripcion || 'Expensa de condominio',
      currency: expensaData.currency || 'usd',
    };
    
    console.log('Enviando como JSON:', dataToSend);
    const response = await apiClient.post('expensas/', dataToSend);
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar la expensa.');
  }
};

export const updateExpensa = async (expensaId, expensaData) => {
  try {
    const dataToSend = {
      unidad: expensaData.unidad || '',
      monto: expensaData.monto || '',
      fecha_vencimiento: expensaData.fecha_vencimiento || '',
      pagada: expensaData.pagada || false,
      descripcion: expensaData.descripcion || 'Expensa de condominio',
      currency: expensaData.currency || 'usd',
    };
    
    const response = await apiClient.put(`expensas/${expensaId}/`, dataToSend);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar la expensa.');
  }
};

export const deleteExpensa = async (expensaId) => {
  try {
    await apiClient.delete(`expensas/${expensaId}/`);
  } catch (error) {
    throw new Error('Error al eliminar la expensa.');
  }
};
