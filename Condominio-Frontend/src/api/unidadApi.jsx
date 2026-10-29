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

export const fetchAllUnidades = async () => {
  try {
    const response = await apiClient.get('unidades/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las unidades.');
  }
};

export const fetchUnidadById = async (unidadId) => {
  try {
    const response = await apiClient.get(`unidades/${unidadId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener la unidad.');
  }
};

export const createUnidad = async (unidadData) => {
  try {
    // Si hay archivo de imagen, enviar como multipart/form-data
    const hasFile = unidadData && unidadData.imagen instanceof File;
    if (hasFile) {
      const formData = new FormData();
      Object.entries(unidadData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const response = await apiClient.post('unidades/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.post('unidades/', unidadData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear la unidad.');
  }
};

export const updateUnidad = async (unidadId, unidadData) => {
  try {
    const hasFile = unidadData && unidadData.imagen instanceof File;
    if (hasFile) {
      const formData = new FormData();
      Object.entries(unidadData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const response = await apiClient.put(`unidades/${unidadId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.put(`unidades/${unidadId}/`, unidadData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar la unidad.');
  }
};

export const deleteUnidad = async (unidadId) => {
  try {
    await apiClient.delete(`unidades/${unidadId}/`);
  } catch (error) {
    throw new Error('Error al eliminar la unidad.');
  }
};

// API para obtener bloques auxiliares
export const fetchAllBloquesAux = async () => {
  try {
    const response = await apiClient.get('bloquesAux/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los bloques.');
  }
};
