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

const BarChart = ({ titulo, labels, datasets, estadisticas }) => {
  const chartData = {
    labels: labels,
    datasets: datasets,
  };

  const options = {
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
            const value = context.parsed.y || 0;
            return `${label}: Bs. ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
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
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      {estadisticas && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {estadisticas.total_año !== undefined && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Año</p>
              <p className="text-lg font-bold text-blue-600">
                Bs. {estadisticas.total_año.toLocaleString()}
              </p>
            </div>
          )}
          {estadisticas.promedio_mensual !== undefined && (
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Promedio Mensual</p>
              <p className="text-lg font-bold text-purple-600">
                Bs. {estadisticas.promedio_mensual.toLocaleString()}
              </p>
            </div>
          )}
          {estadisticas.mes_mayor_ingreso && (
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Mejor Mes</p>
              <p className="text-lg font-bold text-green-600">
                {estadisticas.mes_mayor_ingreso}
              </p>
            </div>
          )}
          {estadisticas.monto_mayor !== undefined && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Monto Mayor</p>
              <p className="text-lg font-bold text-yellow-600">
                Bs. {estadisticas.monto_mayor.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BarChart;
