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

export const fetchAllInquilinos = async () => {
  try {
    const response = await apiClient.get('inquilinos/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los inquilinos.');
  }
};

export const fetchAllPropietarios = async () => {
  try {
    const response = await apiClient.get('propietarios/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los propietarios.');
  }
};

export const createInquilino = async (inquilinoData) => {
  try {
    console.log('Datos recibidos para crear inquilino:', inquilinoData);
    
    // Crear FormData para manejar archivos
    const formData = new FormData();
    
    // Atributos heredados de Persona
    formData.append('nombre', inquilinoData.nombre || '');
    formData.append('apellido', inquilinoData.apellido || '');
    formData.append('CI', inquilinoData.CI || '');
    formData.append('telefono', inquilinoData.telefono || '');
    formData.append('fecha_nacimiento', inquilinoData.fecha_nacimiento || '');
    formData.append('sexo', inquilinoData.sexo || 'M');
    formData.append('estado', inquilinoData.estado || 'A');
    
    // Atributos específicos de Inquilino
    formData.append('propietario', inquilinoData.propietario || '');
    formData.append('fecha_inicio', inquilinoData.fecha_inicio || '');
    formData.append('fecha_fin', inquilinoData.fecha_fin || '');
    formData.append('estado_inquilino', inquilinoData.estado_inquilino || 'A');
    
    // Manejar imagen si existe
    if (inquilinoData.imagen && inquilinoData.imagen instanceof File) {
      formData.append('imagen', inquilinoData.imagen);
    }
    
    console.log('Enviando FormData:', formData);
    const response = await apiClient.post('inquilinos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar el inquilino.');
  }
};

export const updateInquilino = async (inquilinoId, inquilinoData) => {
  try {
    console.log('Datos recibidos para actualizar inquilino:', inquilinoData);
    
    // Crear FormData para manejar archivos
    const formData = new FormData();
    
    // Atributos heredados de Persona
    formData.append('nombre', inquilinoData.nombre || '');
    formData.append('apellido', inquilinoData.apellido || '');
    formData.append('CI', inquilinoData.CI || '');
    formData.append('telefono', inquilinoData.telefono || '');
    formData.append('fecha_nacimiento', inquilinoData.fecha_nacimiento || '');
    formData.append('sexo', inquilinoData.sexo || 'M');
    formData.append('estado', inquilinoData.estado || 'A');
    
    // Atributos específicos de Inquilino
    formData.append('propietario', inquilinoData.propietario || '');
    formData.append('fecha_inicio', inquilinoData.fecha_inicio || '');
    formData.append('fecha_fin', inquilinoData.fecha_fin || '');
    formData.append('estado_inquilino', inquilinoData.estado_inquilino || 'A');
    
    // Manejar imagen si existe
    if (inquilinoData.imagen && inquilinoData.imagen instanceof File) {
      formData.append('imagen', inquilinoData.imagen);
    } else if (inquilinoData.imagen && typeof inquilinoData.imagen === 'string') {
      // Si es una URL existente, mantenerla
      formData.append('imagen', inquilinoData.imagen);
    }
    
    console.log('Enviando FormData:', formData);
    const response = await apiClient.put(`inquilinos/${inquilinoId}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el inquilino.');
  }
};

export const deleteInquilino = async (inquilinoId) => {
  try {
    await apiClient.delete(`inquilinos/${inquilinoId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el inquilino.');
  }
};
