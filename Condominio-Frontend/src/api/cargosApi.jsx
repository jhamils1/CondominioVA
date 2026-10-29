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

export const fetchAllCargos = async () => {
  try {
    const response = await apiClient.get('cargos/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los cargos.');
  }
};

export const createCargo = async (cargoData) => {
  try {
    console.log('Datos recibidos para crear cargo:', cargoData);
    
    // Preparar los datos para el backend
    const cleanedData = {
      nombre: cargoData.nombre,
      descripcion: cargoData.descripcion || '',
      salario_base: parseFloat(cargoData.salario_base) || 0,
      estado: cargoData.estado === true || cargoData.estado === 'true' || cargoData.estado === 'A'
    };

    console.log('Enviando como JSON:', cleanedData);
    const response = await apiClient.post('cargos/', cleanedData);
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar el cargo.');
  }
};

export const updateCargo = async (cargoId, cargoData) => {
  try {
    console.log('Datos recibidos para actualizar cargo:', cargoId, cargoData);
    
    // Preparar los datos para el backend
    const cleanedData = {
      nombre: cargoData.nombre,
      descripcion: cargoData.descripcion || '',
      salario_base: parseFloat(cargoData.salario_base) || 0,
      estado: cargoData.estado === true || cargoData.estado === 'true' || cargoData.estado === 'A'
    };

    console.log('Enviando como JSON:', cleanedData);
    const response = await apiClient.put(`cargos/${cargoId}/`, cleanedData);
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el cargo.');
  }
};

export const deleteCargo = async (cargoId) => {
  try {
    await apiClient.delete(`cargos/${cargoId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el cargo.');
  }
};
