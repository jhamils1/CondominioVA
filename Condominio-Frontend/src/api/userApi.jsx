// src/api/userApi.jsx
import axios from './client.js';

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

export const fetchAllUsers = async () => {
  try {
    const response = await apiClient.get('users/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los usuarios.');
  }
};

export const fetchCurrentUser = async () => {
  try {
    const response = await apiClient.get('me/');
    const currentUser = response.data;
    
    if (!currentUser) {
      throw new Error('Usuario no encontrado');
    }
    
    return currentUser;
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    throw error;
  }
};

export const fetchAllRoles = async () => {
  try {
    const response = await apiClient.get('groupsAux/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los roles.');
  }
};

export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('users/', userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar el usuario.');
  }
};

export const provisionarCuenta = async (data) => {
  try {
    return (await apiClient.post('provisionar-cuenta/', data)).data;
  } catch (error) {
    const detail = error.response?.data;
    if (detail) throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    throw new Error('No se pudo conectar con el servidor.');
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.patch(`users/${userId}/`, userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el usuario.');
  }
};

export const deleteUser = async (userId) => {
  try {
    await apiClient.delete(`users/${userId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el usuario.');
  }
};
