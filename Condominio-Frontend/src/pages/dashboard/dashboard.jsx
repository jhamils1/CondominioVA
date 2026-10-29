import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCheckCircle, FaExclamationCircle, FaFileInvoiceDollar, FaHome, FaChartLine } from 'react-icons/fa';
import {
  obtenerResumenFinanciero,
  obtenerGraficoExpensasEstado,
  obtenerGraficoIngresosMensuales,
  obtenerGraficoMorososRanking,
  obtenerGraficoComparativoAnual,
} from '../../api/dashboardApi';
import DonutChart from '../../components/charts/DonutChart';
import BarChart from '../../components/charts/BarChart';
import HorizontalBarChart from '../../components/charts/HorizontalBarChart';
import LineChart from '../../components/charts/LineChart';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState(null);
  const [graficoExpensas, setGraficoExpensas] = useState(null);
  const [graficoIngresos, setGraficoIngresos] = useState(null);
  const [graficoMorosos, setGraficoMorosos] = useState(null);
  const [graficoComparativo, setGraficoComparativo] = useState(null);
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  useEffect(() => {
    cargarGraficoIngresos();
  }, [añoSeleccionado]);

  const cargarDatosDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todos los datos en paralelo
      const [
        resumenData,
        expensasData,
        ingresosData,
        morososData,
        comparativoData,
      ] = await Promise.all([
        obtenerResumenFinanciero(),
        obtenerGraficoExpensasEstado(),
        obtenerGraficoIngresosMensuales(añoSeleccionado),
        obtenerGraficoMorososRanking(10),
        obtenerGraficoComparativoAnual(),
      ]);

      setResumen(resumenData.resumen);
      setGraficoExpensas(expensasData);
      setGraficoIngresos(ingresosData);
      setGraficoMorosos(morososData);
      setGraficoComparativo(comparativoData);
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      setError('No se pudieron cargar los datos del dashboard. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const cargarGraficoIngresos = async () => {
    try {
      const ingresosData = await obtenerGraficoIngresosMensuales(añoSeleccionado);
      setGraficoIngresos(ingresosData);
    } catch (err) {
      console.error('Error al cargar gráfico de ingresos:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
          <p className="font-bold mb-2">Error</p>
          <p>{error}</p>
          <button
            onClick={cargarDatosDashboard}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Financiero</h1>
        <p className="text-gray-600">Resumen general y análisis de expensas del condominio</p>
      </div>

      {/* Tarjetas de Resumen */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Expensas */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Expensas</p>
                <p className="text-3xl font-bold text-gray-800">{resumen.total_expensas}</p>
                <p className="text-sm text-green-600 mt-2">
                  {resumen.porcentaje_pagado}% pagado
                </p>
              </div>
              <FaFileInvoiceDollar className="text-4xl text-blue-500" />
            </div>
          </div>

          {/* Expensas Pagadas */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Expensas Pagadas</p>
                <p className="text-3xl font-bold text-gray-800">{resumen.expensas_pagadas}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Bs. {resumen.monto_total_recaudado.toLocaleString()}
                </p>
              </div>
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
          </div>

          {/* Expensas Pendientes */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Expensas Pendientes</p>
                <p className="text-3xl font-bold text-gray-800">{resumen.expensas_pendientes}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Bs. {resumen.monto_pendiente.toLocaleString()}
                </p>
              </div>
              <FaExclamationCircle className="text-4xl text-red-500" />
            </div>
          </div>

          {/* Contratos Activos */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Contratos Activos</p>
                <p className="text-3xl font-bold text-gray-800">{resumen.contratos_activos}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {resumen.unidades_ocupadas} unidades ocupadas
                </p>
              </div>
              <FaHome className="text-4xl text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de Estadísticas de Unidades */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Monto Total Recaudado */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-2 opacity-90">Monto Total Recaudado</p>
                <p className="text-4xl font-bold">Bs. {resumen.monto_total_recaudado.toLocaleString()}</p>
              </div>
              <FaMoneyBillWave className="text-5xl opacity-50" />
            </div>
          </div>

          {/* Monto Pendiente */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-2 opacity-90">Monto Pendiente de Cobro</p>
                <p className="text-4xl font-bold">Bs. {resumen.monto_pendiente.toLocaleString()}</p>
              </div>
              <FaChartLine className="text-5xl opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Gráficos - Primera Fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Estado de Expensas */}
        {graficoExpensas && (
          <DonutChart
            titulo={graficoExpensas.titulo}
            labels={graficoExpensas.labels}
            datasets={graficoExpensas.datasets}
            montos={graficoExpensas.montos}
            porcentajes={graficoExpensas.porcentajes}
          />
        )}

        {/* Gráfico de Ingresos Mensuales */}
        {graficoIngresos && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{graficoIngresos.titulo}</h3>
              <select
                value={añoSeleccionado}
                onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2022, 2023, 2024, 2025].map((año) => (
                  <option key={año} value={año}>
                    {año}
                  </option>
                ))}
              </select>
            </div>
            <BarChart
              titulo=""
              labels={graficoIngresos.labels}
              datasets={graficoIngresos.datasets}
              estadisticas={graficoIngresos.estadisticas}
            />
          </div>
        )}
      </div>

      {/* Gráficos - Segunda Fila */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Gráfico de Morosos */}
        {graficoMorosos && (
          <HorizontalBarChart
            titulo={graficoMorosos.titulo}
            labels={graficoMorosos.labels}
            datasets={graficoMorosos.datasets}
            detalles={graficoMorosos.detalles}
            estadisticas={graficoMorosos.estadisticas}
          />
        )}
      </div>

      {/* Gráficos - Tercera Fila */}
      <div className="grid grid-cols-1 gap-6">
        {/* Gráfico Comparativo Anual */}
        {graficoComparativo && (
          <LineChart
            titulo={graficoComparativo.titulo}
            labels={graficoComparativo.labels}
            datasets={graficoComparativo.datasets}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
