import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../../components/button.jsx';

const PagoCancelPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const expensaId = searchParams.get('expensa_id');

  const handleGoToExpensas = () => {
    navigate('/admin/expensas');
  };

  const handleGoToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleRetryPayment = () => {
    if (expensaId) {
      navigate(`/admin/expensas?pay=${expensaId}`);
    } else {
      navigate('/admin/expensas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-semibold text-yellow-600 mb-4">Pago Cancelado</h2>
        <p className="text-gray-600 mb-4">
          El proceso de pago fue cancelado. No se ha realizado ningún cargo.
        </p>
        
        {expensaId && (
          <div className="bg-yellow-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Expensa ID:</strong> {expensaId}
            </p>
            <p className="text-sm text-yellow-800">
              <strong>Estado:</strong> Pendiente de pago
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button variant="guardar" onClick={handleRetryPayment} className="w-full">
            Intentar Pago Nuevamente
          </Button>
          <Button variant="cancelar" onClick={handleGoToExpensas} className="w-full">
            Ver Mis Expensas
          </Button>
          <Button variant="editar" onClick={handleGoToDashboard} className="w-full">
            Ir al Dashboard
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Puedes intentar el pago nuevamente en cualquier momento</p>
          <p>Si tienes problemas, contacta al administrador</p>
        </div>
      </div>
    </div>
  );
};

export default PagoCancelPage;
