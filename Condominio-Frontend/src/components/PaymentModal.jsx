import React from 'react';
import StripePaymentForm from './StripePaymentForm.jsx';

const PaymentModal = ({ isOpen, onClose, expensa, onPaymentSuccess }) => {
  if (!isOpen) return null;

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Pago exitoso:', paymentIntent);
    onPaymentSuccess(paymentIntent);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Pagar Expensa
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <StripePaymentForm
            expensa={expensa}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
