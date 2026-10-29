import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../../components/button.jsx';
import { verifyPaymentIntent } from '../../api/paymentApi.jsx';

const PagoSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  const expensaId = searchParams.get('expensa_id');
  const paymentIntentId = searchParams.get('payment_intent_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentIntentId) {
        setError('No se encontró el ID del PaymentIntent');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await verifyPaymentIntent(paymentIntentId);
        setPaymentStatus(result);
        
        if (result.status === 'succeeded') {
          // El pago fue exitoso, la expensa ya fue marcada como pagada en el backend
          console.log('Pago verificado exitosamente');
        }
      } catch (err) {
        console.error('Error al verificar el pago:', err);
        setError('Error al verificar el estado del pago');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [paymentIntentId]);

  const handleGoToExpensas = () => {
    navigate('/admin/expensas');
  };

  const handleGoToDashboard = () => {
    navigate('/admin/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verificando Pago...</h2>
          <p className="text-gray-600">Por favor espera mientras confirmamos tu pago</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error en el Pago</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-4 justify-center">
            <Button variant="cancelar" onClick={handleGoToExpensas}>
              Ver Expensas
            </Button>
            <Button variant="guardar" onClick={handleGoToDashboard}>
              Ir al Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-semibold text-green-600 mb-4">¡Pago Exitoso!</h2>
        <p className="text-gray-600 mb-4">
          Tu pago ha sido procesado correctamente
        </p>
        
        {expensaId && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-green-800">
              <strong>Expensa ID:</strong> {expensaId}
            </p>
            <p className="text-sm text-green-800">
              <strong>Estado:</strong> {paymentStatus?.status === 'succeeded' ? 'Pagada' : 'Procesando'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button variant="guardar" onClick={handleGoToExpensas} className="w-full">
            Ver Mis Expensas
          </Button>
          <Button variant="cancelar" onClick={handleGoToDashboard} className="w-full">
            Ir al Dashboard
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Recibirás un comprobante por correo electrónico</p>
          <p>Si tienes alguna pregunta, contacta al administrador</p>
        </div>
      </div>
    </div>
  );
};

export default PagoSuccessPage;
