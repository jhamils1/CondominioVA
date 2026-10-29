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

export const fetchAllAreasComunes = async () => {
  try {
    const response = await apiClient.get('areas/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las áreas comunes.');
  }
};

export const fetchAreaComunById = async (areaId) => {
  try {
    const response = await apiClient.get(`areas/${areaId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el área común.');
  }
};

export const createAreaComun = async (areaData) => {
  try {
    const response = await apiClient.post('areas/', areaData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el área común.');
  }
};

export const updateAreaComun = async (areaId, areaData) => {
  try {
    const response = await apiClient.put(`areas/${areaId}/`, areaData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el área común.');
  }
};

export const deleteAreaComun = async (areaId) => {
  try {
    await apiClient.delete(`areas/${areaId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el área común.');
  }
};
