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

// ==================== CRUD MASCOTAS ====================

export const fetchAllMascotas = async () => {
  try {
    const response = await apiClient.get('mascotas/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las mascotas.');
  }
};

export const fetchMascotaById = async (id) => {
  try {
    const response = await apiClient.get(`mascotas/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener la mascota.');
  }
};

export const createMascota = async (mascotaData) => {
  try {
    console.log('Datos recibidos para crear mascota:', mascotaData);
    
    // Estructura simplificada para Mascota
    const dataToSend = {
      nombre: mascotaData.nombre || '',
      especie: mascotaData.especie || 'PERRO',
      tipo: mascotaData.tipo || 'MACHO',
      foto: mascotaData.foto || null,
      raza: mascotaData.raza || '',
      fecha_nacimiento: mascotaData.fecha_nacimiento || '',
      observaciones: mascotaData.observaciones || '',
      persona: mascotaData.persona || ''
    };
    
    // Si hay archivo, usar FormData, si no, usar JSON
    const hasFile = dataToSend.foto;
    
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

      const response = await apiClient.post('mascotas/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Usar JSON para datos sin archivos
      console.log('Enviando como JSON:', dataToSend);
      const response = await apiClient.post('mascotas/', dataToSend);
      return response.data;
    }
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar la mascota.');
  }
};

export const updateMascota = async (mascotaId, mascotaData) => {
  try {
    // Estructura simplificada para Mascota
    const dataToSend = {
      nombre: mascotaData.nombre || '',
      especie: mascotaData.especie || 'PERRO',
      tipo: mascotaData.tipo || 'MACHO',
      foto: mascotaData.foto || null,
      raza: mascotaData.raza || '',
      fecha_nacimiento: mascotaData.fecha_nacimiento || '',
      observaciones: mascotaData.observaciones || '',
      persona: mascotaData.persona || ''
    };
    
    // Si hay archivo, usar FormData, si no, usar JSON
    const hasFile = dataToSend.foto;
    
    if (hasFile) {
      // Crear FormData para manejar archivos
      const formData = new FormData();
      
      // Agregar todos los campos directamente
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
          formData.append(key, dataToSend[key]);
        }
      });

      const response = await apiClient.put(`mascotas/${mascotaId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Usar JSON para datos sin archivos
      const response = await apiClient.put(`mascotas/${mascotaId}/`, dataToSend);
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar la mascota.');
  }
};

export const deleteMascota = async (mascotaId) => {
  try {
    await apiClient.delete(`mascotas/${mascotaId}/`);
  } catch (error) {
    throw new Error('Error al eliminar la mascota.');
  }
};

// ==================== FUNCIONES AUXILIARES ====================

export const fetchAllPersonas = async () => {
  try {
    const response = await apiClient.get('personas/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las personas.');
  }
};
