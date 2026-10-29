import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Sidebar from '../components/sidebar.jsx';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} />
      <main className="flex-1 overflow-y-auto transition-all duration-500 ease-in-out">
        {/* Header con botón toggle */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(90deg, #1a1f2e 0%, #0f1419 100%)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
          >
            {sidebarOpen ? (
              <FaTimes className="w-5 h-5 text-gray-300" />
            ) : (
              <FaBars className="w-5 h-5 text-gray-300" />
            )}
          </button>
          <h1 className="text-xl font-semibold text-white tracking-wide">
            Panel de Administración
          </h1>
          <div className="w-10"></div> {/* Spacer para centrar el título */}
        </div>
        
        {/* Contenido principal */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;