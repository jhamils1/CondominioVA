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

export const fetchAllBloques = async () => {
  try {
    const response = await apiClient.get('bloques/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los bloques.');
  }
};

export const fetchBloqueById = async (bloqueId) => {
  try {
    const response = await apiClient.get(`bloques/${bloqueId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el bloque.');
  }
};

export const createBloque = async (bloqueData) => {
  try {
    const response = await apiClient.post('bloques/', bloqueData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el bloque.');
  }
};

export const updateBloque = async (bloqueId, bloqueData) => {
  try {
    const response = await apiClient.put(`bloques/${bloqueId}/`, bloqueData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el bloque.');
  }
};

export const deleteBloque = async (bloqueId) => {
  try {
    await apiClient.delete(`bloques/${bloqueId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el bloque.');
  }
};
