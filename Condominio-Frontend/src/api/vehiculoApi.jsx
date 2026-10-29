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

export const fetchAllVehiculos = async () => {
  try {
    const response = await apiClient.get('vehiculos/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los vehículos.');
  }
};

export const fetchVehiculoById = async (vehiculoId) => {
  try {
    const response = await apiClient.get(`vehiculos/${vehiculoId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el vehículo.');
  }
};

export const createVehiculo = async (vehiculoData) => {
  try {
    // Si hay archivo de imagen, enviar como multipart/form-data
    const hasFile = vehiculoData && vehiculoData.imagen instanceof File;
    if (hasFile) {
      const formData = new FormData();
      Object.entries(vehiculoData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const response = await apiClient.post('vehiculos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.post('vehiculos/', vehiculoData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el vehículo.');
  }
};

export const updateVehiculo = async (vehiculoId, vehiculoData) => {
  try {
    const hasFile = vehiculoData && vehiculoData.imagen instanceof File;
    if (hasFile) {
      const formData = new FormData();
      Object.entries(vehiculoData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      const response = await apiClient.put(`vehiculos/${vehiculoId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.put(`vehiculos/${vehiculoId}/`, vehiculoData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el vehículo.');
  }
};

export const deleteVehiculo = async (vehiculoId) => {
  try {
    await apiClient.delete(`vehiculos/${vehiculoId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el vehículo.');
  }
};