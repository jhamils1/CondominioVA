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

export const fetchAllFamiliares = async () => {
  try {
    const response = await apiClient.get('familiares/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los familiares.');
  }
};

export const fetchAllPersonas = async () => {
  try {
    const response = await apiClient.get('familiares/personas_disponibles/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener personas:', error);
    throw new Error('Error al obtener las personas.');
  }
};

export const createFamiliar = async (familiarData) => {
  try {
    console.log('Datos recibidos para crear familiar:', familiarData);
    
    // Estructura para Familiares con herencia de Persona
    const dataToSend = {
      // Atributos heredados de Persona
      nombre: familiarData.nombre || '',
      apellido: familiarData.apellido || '',
      telefono: familiarData.telefono || '',
      imagen: familiarData.imagen || null,
      sexo: familiarData.sexo || 'M',
      CI: familiarData.CI || '',
      fecha_nacimiento: familiarData.fecha_nacimiento || '',
      estado: familiarData.estado || 'A',
      // Atributos específicos de Familiares
      persona_relacionada: familiarData.persona_relacionada || '',
      parentesco: familiarData.parentesco || ''
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

      const response = await apiClient.post('familiares/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Usar JSON para datos sin archivos
      console.log('Enviando como JSON:', dataToSend);
      const response = await apiClient.post('familiares/', dataToSend);
      return response.data;
    }
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar el familiar.');
  }
};

export const updateFamiliar = async (familiarId, familiarData) => {
  try {
    // Estructura para Familiares con herencia de Persona
    const dataToSend = {
      // Atributos heredados de Persona
      nombre: familiarData.nombre || '',
      apellido: familiarData.apellido || '',
      telefono: familiarData.telefono || '',
      imagen: familiarData.imagen || null,
      sexo: familiarData.sexo || 'M',
      CI: familiarData.CI || '',
      fecha_nacimiento: familiarData.fecha_nacimiento || '',
      estado: familiarData.estado || 'A',
      // Atributos específicos de Familiares
      persona_relacionada: familiarData.persona_relacionada || '',
      parentesco: familiarData.parentesco || ''
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

      const response = await apiClient.put(`familiares/${familiarId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Usar JSON para datos sin archivos
      const response = await apiClient.put(`familiares/${familiarId}/`, dataToSend);
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el familiar.');
  }
};

export const deleteFamiliar = async (familiarId) => {
  try {
    await apiClient.delete(`familiares/${familiarId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el familiar.');
  }
};
