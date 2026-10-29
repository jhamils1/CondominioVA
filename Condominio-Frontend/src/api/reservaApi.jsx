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

export const fetchAllReservas = async () => {
  try {
    const response = await apiClient.get('reservas/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las reservas.');
  }
};

export const fetchReservaById = async (reservaId) => {
  try {
    const response = await apiClient.get(`reservas/${reservaId}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener la reserva.');
  }
};

export const createReserva = async (reservaData) => {
  try {
    const response = await apiClient.post('reservas/', reservaData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear la reserva.');
  }
};

export const updateReserva = async (reservaId, reservaData) => {
  try {
    const response = await apiClient.put(`reservas/${reservaId}/`, reservaData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar la reserva.');
  }
};

export const deleteReserva = async (reservaId) => {
  try {
    await apiClient.delete(`reservas/${reservaId}/`);
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al eliminar la reserva.');
  }
};

// Obtener todas las áreas comunes activas
export const fetchAreasComunes = async () => {
  try {
    const response = await apiClient.get('areas/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las áreas comunes.');
  }
};

// Obtener propietarios e inquilinos para el selector de persona
export const fetchPersonasDisponibles = async () => {
  try {
    const [propietariosResponse, inquilinosResponse] = await Promise.all([
      apiClient.get('propietarios/'),
      apiClient.get('inquilinos/')
    ]);
    
    const propietarios = (propietariosResponse.data.results || propietariosResponse.data)
      .filter(p => p.id || p.persona) // Filtrar que tengan ID o persona
      .map(p => ({
        id: p.persona || p.id, // Usar persona si existe, sino usar id
        nombre_completo: `${p.nombre} ${p.apellido} (Propietario)`,
        tipo: 'P',
        ci: p.CI || p.ci || ''
      }));
    
    const inquilinos = (inquilinosResponse.data.results || inquilinosResponse.data)
      .filter(i => i.id || i.persona) // Filtrar que tengan ID o persona
      .map(i => ({
        id: i.persona || i.id, // Usar persona si existe, sino usar id
        nombre_completo: `${i.nombre} ${i.apellido} (Inquilino)`,
        tipo: 'I',
        ci: i.CI || i.ci || ''
      }));
    
    console.log('Propietarios cargados:', propietarios.length);
    console.log('Inquilinos cargados:', inquilinos.length);
    console.log('Ejemplo de persona:', propietarios[0] || inquilinos[0]);
    
    return [...propietarios, ...inquilinos];
  } catch (error) {
    console.error('Error detallado al obtener personas:', error);
    throw new Error('Error al obtener las personas disponibles.');
  }
};
