import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PagoDebugPage = () => {
  const [searchParams] = useSearchParams();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const expensaId = searchParams.get('expensa_id');
    const sessionId = searchParams.get('session_id');
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    
    setDebugInfo({
      expensaId,
      sessionId,
      paymentIntent,
      paymentIntentClientSecret,
      allParams: Object.fromEntries(searchParams.entries()),
      currentUrl: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🔍 Debug de Pago</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Información de Redirección</h3>
            <p><strong>URL Actual:</strong> {debugInfo.currentUrl}</p>
            <p><strong>Referrer:</strong> {debugInfo.referrer || 'No disponible'}</p>
            <p><strong>Timestamp:</strong> {debugInfo.timestamp}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Parámetros de URL</h3>
            <p><strong>Expensa ID:</strong> {debugInfo.expensaId || 'No encontrado'}</p>
            <p><strong>Session ID:</strong> {debugInfo.sessionId || 'No encontrado'}</p>
            <p><strong>Payment Intent:</strong> {debugInfo.paymentIntent || 'No encontrado'}</p>
            <p><strong>Payment Intent Client Secret:</strong> {debugInfo.paymentIntentClientSecret || 'No encontrado'}</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Todos los Parámetros</h3>
            <pre className="text-sm bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(debugInfo.allParams, null, 2)}
            </pre>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Información del Navegador</h3>
            <p className="text-sm break-all"><strong>User Agent:</strong> {debugInfo.userAgent}</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Próximos Pasos</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Verifica que <code>expensa_id</code> y <code>session_id</code> estén presentes</li>
              <li>Si faltan parámetros, revisa la configuración de Stripe en el backend</li>
              <li>Verifica que <code>FRONTEND_URL</code> esté configurado correctamente</li>
              <li>Revisa la consola del navegador para errores de JavaScript</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.href = '/admin/expensas'}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Volver a Expensas
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoDebugPage;
