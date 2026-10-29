import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import Button from './button.jsx';
import { createPaymentIntent, verifyPaymentIntent } from '../api/paymentApi.jsx';

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const PaymentForm = ({ expensa, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  // Debug: mostrar información de Stripe
  useEffect(() => {
    console.log('=== DEBUG STRIPE ===');
    console.log('Stripe object:', stripe);
    console.log('Elements object:', elements);
    console.log('Client secret:', clientSecret);
    console.log('Stripe publishable key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    console.log('===================');
    
    setDebugInfo({
      stripeLoaded: !!stripe,
      elementsLoaded: !!elements,
      clientSecret: !!clientSecret,
      publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    });
  }, [stripe, elements, clientSecret]);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        const result = await createPaymentIntent(expensa.id);
        setClientSecret(result.client_secret);
      } catch (err) {
        setError('Error al inicializar el pago: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [expensa.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        setError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Verificar el pago en el backend
        try {
          await verifyPaymentIntent(paymentIntent.id);
          onSuccess(paymentIntent);
        } catch (verifyError) {
          console.error('Error al verificar pago:', verifyError);
          setError('Error al confirmar el pago');
        }
      } else {
        setError('El pago no se completó correctamente');
      }
    } catch (err) {
      setError('Error al procesar el pago: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (loading && !clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Inicializando pago...</span>
      </div>
    );
  }

  // Mostrar error si no hay clave pública
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-semibold mb-2">⚠️ Configuración Requerida</h3>
          <p className="text-red-700 text-sm mb-2">
            No se encontró la clave pública de Stripe. Necesitas configurar:
          </p>
          <div className="bg-white p-3 rounded border text-xs font-mono">
            VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
          </div>
          <p className="text-red-700 text-xs mt-2">
            Crea un archivo .env en la raíz del proyecto con esta variable.
          </p>
        </div>
        <Button variant="cancelar" onClick={onCancel} className="w-full mt-4">
          Cerrar
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Detalles del Pago</h3>
        <div className="space-y-2">
          <p><strong>Expensa ID:</strong> {expensa.id}</p>
          <p><strong>Monto:</strong> ${parseFloat(expensa.monto).toLocaleString()}</p>
          <p><strong>Descripción:</strong> {expensa.descripcion || 'Expensa de condominio'}</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Información de la Tarjeta
        </label>
        <div className="p-4 border border-gray-300 rounded-md bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="flex space-x-4">
        <Button
          type="submit"
          variant="guardar"
          disabled={!stripe || loading}
          className="flex-1"
        >
          {loading ? 'Procesando...' : `Pagar $${parseFloat(expensa.monto).toLocaleString()}`}
        </Button>
        <Button
          type="button"
          variant="cancelar"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>Tu información de pago está protegida por Stripe</p>
        <p>No almacenamos datos de tarjetas en nuestros servidores</p>
      </div>

      {/* Debug info - solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
          <h4 className="text-yellow-800 font-semibold text-xs mb-2">🔧 Debug Info</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>Stripe cargado: {debugInfo.stripeLoaded ? '✅' : '❌'}</p>
            <p>Elements cargado: {debugInfo.elementsLoaded ? '✅' : '❌'}</p>
            <p>Client Secret: {debugInfo.clientSecret ? '✅' : '❌'}</p>
            <p>Publishable Key: {debugInfo.publishableKey ? '✅' : '❌'}</p>
          </div>
        </div>
      )}
    </form>
  );
};

const StripePaymentForm = ({ expensa, onSuccess, onCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm expensa={expensa} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
};

export default StripePaymentForm;
