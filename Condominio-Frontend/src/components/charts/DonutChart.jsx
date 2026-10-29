import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Registrar elementos necesarios para Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ titulo, labels, datasets, montos, porcentajes }) => {
  const chartData = {
    labels: labels,
    datasets: datasets.map(dataset => ({
      ...dataset,
      borderWidth: 2,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = porcentajes ? 
              (label === 'Pagadas' ? porcentajes.pagado : porcentajes.pendiente) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{titulo}</h3>
      <div className="h-64">
        <Doughnut data={chartData} options={options} />
      </div>
      {montos && (
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Pagado</p>
            <p className="text-xl font-bold text-green-600">Bs. {montos.pagado.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Pendiente</p>
            <p className="text-xl font-bold text-red-600">Bs. {montos.pendiente.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold text-blue-600">Bs. {montos.total.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonutChart;
