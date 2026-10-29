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

// ==================== CRUD VISITAS ====================

export const fetchAllVisitas = async () => {
  try {
    const response = await apiClient.get('visitas/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las visitas.');
  }
};

export const fetchVisitaById = async (id) => {
  try {
    const response = await apiClient.get(`visitas/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener la visita.');
  }
};

export const createVisita = async (visitaData) => {
  try {
    console.log('Datos recibidos para crear visita:', visitaData);
    
    // Estructura para Visita
    const dataToSend = {
      estado: visitaData.estado || 'PENDIENTE',
      fecha_hora_entrada: visitaData.fecha_hora_entrada || '',
      fecha_hora_salida: visitaData.fecha_hora_salida || null,
      visitante: visitaData.visitante || '',
      recibe_persona: visitaData.recibe_persona || ''
    };
    
    console.log('Enviando como JSON:', dataToSend);
    const response = await apiClient.post('visitas/', dataToSend);
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar la visita.');
  }
};

export const updateVisita = async (visitaId, visitaData) => {
  try {
    // Estructura para Visita
    const dataToSend = {
      estado: visitaData.estado || 'PENDIENTE',
      fecha_hora_entrada: visitaData.fecha_hora_entrada || '',
      fecha_hora_salida: visitaData.fecha_hora_salida || null,
      visitante: visitaData.visitante || '',
      recibe_persona: visitaData.recibe_persona || ''
    };
    
    console.log('Enviando como JSON:', dataToSend);
    const response = await apiClient.put(`visitas/${visitaId}/`, dataToSend);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar la visita.');
  }
};

export const deleteVisita = async (visitaId) => {
  try {
    await apiClient.delete(`visitas/${visitaId}/`);
  } catch (error) {
    throw new Error('Error al eliminar la visita.');
  }
};

// ==================== FUNCIONES AUXILIARES ====================

export const fetchVisitantesDisponibles = async () => {
  try {
    const response = await apiClient.get('visitas/visitantes_disponibles/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los visitantes.');
  }
};

export const fetchPersonasDisponibles = async () => {
  try {
    const response = await apiClient.get('visitas/personas_disponibles/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las personas.');
  }
};

export const finalizarVisita = async (visitaId, fechaHoraSalida) => {
  try {
    const response = await apiClient.post(`visitas/${visitaId}/finalizar_visita/`, {
      fecha_hora_salida: fechaHoraSalida
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al finalizar la visita.');
  }
};
