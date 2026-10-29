import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Configuración de axios con autenticación
const getAuthConfig = () => {
  const token = localStorage.getItem('access');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

// Resumen financiero general del dashboard
export const obtenerResumenFinanciero = async () => {
  try {
    const response = await axios.get(`${API_URL}resumen/`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen financiero:', error);
    throw error;
  }
};

// Gráfico de estado de expensas (Pagadas vs Pendientes) - Dona/Pie
export const obtenerGraficoExpensasEstado = async () => {
  try {
    const response = await axios.get(`${API_URL}grafico-expensas/`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error al obtener gráfico de expensas:', error);
    throw error;
  }
};

// Gráfico de ingresos mensuales - Barras/Líneas
export const obtenerGraficoIngresosMensuales = async (año = null) => {
  try {
    const params = año ? { año } : {};
    const response = await axios.get(`${API_URL}grafico-ingresos/`, {
      ...getAuthConfig(),
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener gráfico de ingresos:', error);
    throw error;
  }
};

// Gráfico de ranking de morosos - Barras horizontal
export const obtenerGraficoMorososRanking = async (limite = 10) => {
  try {
    const response = await axios.get(`${API_URL}grafico-morosos/`, {
      ...getAuthConfig(),
      params: { limite },
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener gráfico de morosos:', error);
    throw error;
  }
};

// Gráfico comparativo anual - Líneas
export const obtenerGraficoComparativoAnual = async () => {
  try {
    const response = await axios.get(`${API_URL}grafico-comparativo/`, getAuthConfig());
    return response.data;
  } catch (error) {
    console.error('Error al obtener gráfico comparativo:', error);
    throw error;
  }
};
