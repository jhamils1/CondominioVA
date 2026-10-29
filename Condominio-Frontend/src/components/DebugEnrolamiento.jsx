import React, { useState, useEffect } from 'react';
import { verificarEnrolamiento, verificarLuxandAPI } from '../api/recognitionApi.jsx';
import Button from './button.jsx';

const DebugEnrolamiento = () => {
  const [enrolamientoData, setEnrolamientoData] = useState(null);
  const [luxandStatus, setLuxandStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [enrolamientoData, luxandData] = await Promise.all([
        verificarEnrolamiento(),
        verificarLuxandAPI()
      ]);
      setEnrolamientoData(enrolamientoData);
      setLuxandStatus(luxandData);
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Debug - Estado de Enrolamiento
        </h2>
        <Button variant="guardar" onClick={cargarDatos} disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="text-red-800 font-semibold mb-2">Error:</h4>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {enrolamientoData && (
        <div className="space-y-6">
          {/* Estado de Luxand API */}
          {luxandStatus && (
            <div className={`border rounded-lg p-4 ${
              luxandStatus.status === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                luxandStatus.status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {luxandStatus.status === 'success' ? '✅ Luxand API' : '❌ Luxand API'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Estado:</strong> {luxandStatus.status}
                </div>
                <div>
                  <strong>Código HTTP:</strong> {luxandStatus.luxand_status_code || 'N/A'}
                </div>
                <div>
                  <strong>Token configurado:</strong> {luxandStatus.token_configured ? '✅ Sí' : '❌ No'}
                </div>
                <div>
                  <strong>Collection configurada:</strong> {luxandStatus.collection_configured || 'No configurado'}
                </div>
                {luxandStatus.message && (
                  <div className="md:col-span-2">
                    <strong>Mensaje:</strong> {luxandStatus.message}
                  </div>
                )}
                {luxandStatus.luxand_response && (
                  <div className="md:col-span-2">
                    <strong>Respuesta Luxand:</strong> 
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {luxandStatus.luxand_response}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resumen */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Resumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {enrolamientoData.total_personas}
                </div>
                <div className="text-sm text-blue-800">Personas Enroladas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {enrolamientoData.total_empleados}
                </div>
                <div className="text-sm text-blue-800">Empleados Enrolados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {enrolamientoData.total_personas + enrolamientoData.total_empleados}
                </div>
                <div className="text-sm text-blue-800">Total Enrolados</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-blue-700">
              <strong>Gallery Config:</strong> {enrolamientoData.gallery_config || 'No configurado'}
            </div>
          </div>

          {/* Personas Enroladas */}
          {enrolamientoData.personas_enroladas.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                Personas Enroladas ({enrolamientoData.personas_enroladas.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Nombre</th>
                      <th className="px-3 py-2 text-left">Tipo</th>
                      <th className="px-3 py-2 text-left">UUID Luxand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolamientoData.personas_enroladas.map((persona, index) => (
                      <tr key={index} className="border-b border-green-200">
                        <td className="px-3 py-2">{persona.id}</td>
                        <td className="px-3 py-2">{persona.nombre} {persona.apellido}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {persona.tipo}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{persona.luxand_uuid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empleados Enrolados */}
          {enrolamientoData.empleados_enrolados.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">
                Empleados Enrolados ({enrolamientoData.empleados_enrolados.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Nombre</th>
                      <th className="px-3 py-2 text-left">Cargo</th>
                      <th className="px-3 py-2 text-left">UUID Luxand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolamientoData.empleados_enrolados.map((empleado, index) => (
                      <tr key={index} className="border-b border-purple-200">
                        <td className="px-3 py-2">{empleado.id}</td>
                        <td className="px-3 py-2">{empleado.nombre} {empleado.apellido}</td>
                        <td className="px-3 py-2">{empleado.cargo__nombre}</td>
                        <td className="px-3 py-2 font-mono text-xs">{empleado.luxand_uuid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sin datos */}
          {enrolamientoData.personas_enroladas.length === 0 && 
           enrolamientoData.empleados_enrolados.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                ⚠️ No hay personas enroladas
              </h3>
              <p className="text-yellow-700 text-sm">
                No se encontraron personas o empleados enrolados en el sistema de reconocimiento facial.
                Debes enrolar personas primero antes de poder reconocerlas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugEnrolamiento;
