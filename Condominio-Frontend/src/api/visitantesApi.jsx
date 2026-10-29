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

// ==================== CRUD VISITANTES ====================

export const fetchAllVisitantes = async () => {
  try {
    const response = await apiClient.get('visitantes/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los visitantes.');
  }
};

export const fetchVisitanteById = async (id) => {
  try {
    const response = await apiClient.get(`visitantes/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el visitante.');
  }
};

export const createVisitante = async (visitanteData) => {
  try {
    console.log('Datos recibidos para crear visitante:', visitanteData);
    
    // Estructura simplificada para Persona (tipo 'V' se asigna automáticamente)
    const dataToSend = {
      nombre: visitanteData.nombre || '',
      apellido: visitanteData.apellido || '',
      telefono: visitanteData.telefono || '',
      imagen: visitanteData.imagen || null,
      sexo: visitanteData.sexo || '',
      CI: visitanteData.CI || '',
      fecha_nacimiento: visitanteData.fecha_nacimiento || '',
      estado: visitanteData.estado || 'A'
    };
    
    // Si hay archivo, usar FormData, si no, usar JSON
    const hasFile = dataToSend.imagen;
    
    if (hasFile) {
      // Crear FormData para manejar archivos
      const formData = new FormData();
      
      // Agregar todos los campos directamente
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
          formData.append(key, dataToSend[key]);
          console.log(`Agregando ${key}:`, dataToSend[key]);
        }
      });

      // Log de todos los datos en FormData
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await apiClient.post('visitantes/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Usar JSON para datos sin archivos
      console.log('Enviando como JSON:', dataToSend);
      const response = await apiClient.post('visitantes/', dataToSend);
      return response.data;
    }
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar el visitante.');
  }
};

export const updateVisitante = async (visitanteId, visitanteData) => {
  try {
    // Estructura simplificada para Persona (tipo 'V' se mantiene automáticamente)
    const dataToSend = {
      nombre: visitanteData.nombre || '',
      apellido: visitanteData.apellido || '',
      telefono: visitanteData.telefono || '',
      imagen: visitanteData.imagen || null,
      sexo: visitanteData.sexo || '',
      CI: visitanteData.CI || '',
      fecha_nacimiento: visitanteData.fecha_nacimiento || '',
      estado: visitanteData.estado || 'A'
    };
    
    // Si hay archivo, usar FormData, si no, usar JSON
    const hasFile = dataToSend.imagen;
    
    if (hasFile) {
      // Crear FormData para manejar archivos
      const formData = new FormData();
      
      // Agregar todos los campos directamente
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
          formData.append(key, dataToSend[key]);
        }
      });

      const response = await apiClient.put(`visitantes/${visitanteId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Usar JSON para datos sin archivos
      const response = await apiClient.put(`visitantes/${visitanteId}/`, dataToSend);
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el visitante.');
  }
};

export const deleteVisitante = async (visitanteId) => {
  try {
    await apiClient.delete(`visitantes/${visitanteId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el visitante.');
  }
};
