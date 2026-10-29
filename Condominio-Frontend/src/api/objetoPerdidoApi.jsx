import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

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

export const fetchAllObjetosPerdidos = async () => {
  try {
    const response = await apiClient.get('objetosPerdidos/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los objetos perdidos.');
  }
};

export const fetchObjetoPerdidoById = async (objetoId) => {
  try {
    const response = await apiClient.get(`objetosPerdidos/${objetoId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el objeto perdido.');
  }
};

export const createObjetoPerdido = async (objetoData) => {
  try {
    // Si hay archivo de imagen, enviar como multipart/form-data
    const hasFile = objetoData && objetoData.foto instanceof File;
    
    if (hasFile) {
      const formData = new FormData();
      Object.entries(objetoData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      
      const response = await apiClient.post('objetosPerdidos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      // Enviar como JSON si no hay archivo
      const response = await apiClient.post('objetosPerdidos/', objetoData);
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el objeto perdido.');
  }
};

export const updateObjetoPerdido = async (objetoId, objetoData) => {
  try {
    const hasFile = objetoData && objetoData.foto instanceof File;
    
    if (hasFile) {
      const formData = new FormData();
      Object.entries(objetoData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      
      const response = await apiClient.put(`objetosPerdidos/${objetoId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } else {
      const response = await apiClient.put(`objetosPerdidos/${objetoId}/`, objetoData);
      return response.data;
    }
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el objeto perdido.');
  }
};

export const deleteObjetoPerdido = async (objetoId) => {
  try {
    await apiClient.delete(`objetosPerdidos/${objetoId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el objeto perdido.');
  }
};

// Función para obtener personas (para seleccionar "entregado_a")
export const fetchAllPersonas = async () => {
  try {
    const response = await apiClient.get('personasAux/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las personas.');
  }
};
