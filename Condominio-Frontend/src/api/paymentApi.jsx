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

export const createPaymentIntent = async (expensaId) => {
  try {
    console.log('Creando PaymentIntent para expensa:', expensaId);
    
    const response = await apiClient.post('create-payment-intent/', {
      expensa_id: expensaId
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al crear PaymentIntent:', error);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el PaymentIntent.');
  }
};

export const verifyPaymentIntent = async (paymentIntentId) => {
  try {
    console.log('Verificando estado de PaymentIntent:', paymentIntentId);
    
    const response = await apiClient.get(`verify-payment-intent/?payment_intent_id=${paymentIntentId}`);
    
    return response.data;
  } catch (error) {
    console.error('Error al verificar PaymentIntent:', error);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al verificar el estado del pago.');
  }
};
