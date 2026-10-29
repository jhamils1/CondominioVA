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

export const fetchAllContratos = async () => {
  try {
    const response = await apiClient.get('contratos/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los contratos.');
  }
};

export const createContrato = async (contratoData) => {
  try {
    console.log('Datos recibidos para crear contrato:', contratoData);
    
    const dataToSend = {
      propietario: contratoData.propietario || '',
      unidad: contratoData.unidad || '',
      fecha_contrato: contratoData.fecha_contrato || '',
      cuota_mensual: contratoData.cuota_mensual || null,
      estado: contratoData.estado || 'P',
      costo_compra: contratoData.costo_compra || null,
    };
    
    console.log('Enviando como JSON:', dataToSend);
    const response = await apiClient.post('contratos/', dataToSend);
    return response.data;
  } catch (error) {
    console.error('Error completo:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar el contrato.');
  }
};

export const updateContrato = async (contratoId, contratoData) => {
  try {
    const dataToSend = {
      propietario: contratoData.propietario || '',
      unidad: contratoData.unidad || '',
      fecha_contrato: contratoData.fecha_contrato || '',
      cuota_mensual: contratoData.cuota_mensual || null,
      estado: contratoData.estado || 'P',
      costo_compra: contratoData.costo_compra || null,
    };
    
    const response = await apiClient.put(`contratos/${contratoId}/`, dataToSend);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el contrato.');
  }
};

export const deleteContrato = async (contratoId) => {
  try {
    await apiClient.delete(`contratos/${contratoId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el contrato.');
  }
};

export const generarPDFContrato = async (contratoId) => {
  try {
    const response = await apiClient.post(`contratos/${contratoId}/generar_pdf/`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al generar el PDF del contrato.');
  }
};

export const descargarPDFContrato = async (pdfUrl) => {
  try {
    const response = await apiClient.get(pdfUrl, {
      responseType: 'blob',
    });
    
    // Crear un blob y descargarlo
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contrato-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    throw new Error('Error al descargar el PDF del contrato.');
  }
};


