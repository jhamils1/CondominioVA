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

export const fetchAllIncidentes = async () => {
  try {
    const response = await apiClient.get('incidentes/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los incidentes.');
  }
};

export const createIncidente = async (incidenteData) => {
  try {
    console.log('Datos recibidos para crear incidente:', incidenteData);
    
    const dataToSend = {
      propietario: incidenteData.propietario || null,
      multa: incidenteData.multa || null,
      descripcion: incidenteData.descripcion || '',
      fecha_incidente: incidenteData.fecha_incidente || '',
    };
    
    console.log('Enviando como JSON:', dataToSend);
    const response = await apiClient.post('incidentes/', dataToSend);
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar el incidente.');
  }
};

export const updateIncidente = async (incidenteId, incidenteData) => {
  try {
    const dataToSend = {
      propietario: incidenteData.propietario || null,
      multa: incidenteData.multa || null,
      descripcion: incidenteData.descripcion || '',
      fecha_incidente: incidenteData.fecha_incidente || '',
    };
    
    const response = await apiClient.put(`incidentes/${incidenteId}/`, dataToSend);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el incidente.');
  }
};

export const deleteIncidente = async (incidenteId) => {
  try {
    await apiClient.delete(`incidentes/${incidenteId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el incidente.');
  }
};
