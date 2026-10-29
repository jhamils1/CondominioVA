import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrar elementos necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const HorizontalBarChart = ({ titulo, labels, datasets, detalles, estadisticas }) => {
  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  const options = {
    indexAxis: 'y', // Esto hace que las barras sean horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.x || 0;
            return `${label}: Bs. ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'Bs. ' + value.toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{titulo}</h3>
      <div className="h-96">
        <Bar data={chartData} options={options} />
      </div>
      {estadisticas && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Morosos</p>
            <p className="text-lg font-bold text-orange-600">
              {estadisticas.total_morosos}
            </p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Deuda Total</p>
            <p className="text-lg font-bold text-red-600">
              Bs. {estadisticas.deuda_total.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Promedio Deuda</p>
            <p className="text-lg font-bold text-yellow-600">
              Bs. {estadisticas.promedio_deuda.toLocaleString()}
            </p>
          </div>
        </div>
      )}
      {detalles && detalles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-3 text-gray-700">Detalles</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Propietario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Unidad
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detalles.map((detalle, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{detalle.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{detalle.unidad}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {detalle.cantidad_pendiente}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      Bs. {detalle.monto_pendiente.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalBarChart;
