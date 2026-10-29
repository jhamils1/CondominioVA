// src/api/rolApi.jsx
import axios from 'axios';

// Instancia de Axios con la base de tu backend
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para añadir token
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

// Obtener todos los roles (solo id y name - usa RolListSerializer)
export const fetchAllRoles = async () => {
  try {
    const response = await apiClient.get('roles/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los roles.');
  }
};

// Obtener un rol con sus permisos (usa RolSerializer)
export const fetchRolById = async (rolId) => {
  try {
    const response = await apiClient.get(`roles/${rolId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el rol.');
  }
};

// Crear un rol nuevo con permisos
export const createRol = async (rolData) => {
  try {
    // rolData debe tener: { name: "nombre", permission_ids: [1, 2, 3] }
    const response = await apiClient.post('roles/', rolData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el rol.');
  }
};

// Actualizar un rol
export const updateRol = async (rolId, rolData) => {
  try {
    const response = await apiClient.put(`roles/${rolId}/`, rolData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el rol.');
  }
};

// Eliminar un rol
export const deleteRol = async (rolId) => {
  try {
    await apiClient.delete(`roles/${rolId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el rol.');
  }
};

// Obtener todos los permisos
export const fetchAllPermissions = async () => {
  try {
    const response = await apiClient.get('permissions/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los permisos.');
  }
};