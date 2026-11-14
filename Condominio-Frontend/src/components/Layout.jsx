import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaShieldAlt, FaUserCircle } from 'react-icons/fa';
import Sidebar from '../components/sidebar.jsx';
import { useSession } from '../auth/sessionContext.js';
import { roleLabel } from '../auth/access.js';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, notice, setNotice } = useSession();
  const pantallaSeguridad = ['/admin/eventos-seguridad', '/admin/monitor-camaras'].includes(useLocation().pathname);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={pantallaSeguridad ? { background: '#041225' } : undefined}>
      <Sidebar sidebarOpen={sidebarOpen} />
      <main className="flex-1 overflow-y-auto transition-all duration-500 ease-in-out">
        {/* Header con botón toggle */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(90deg, #06182e 0%, #031126 100%)', boxShadow: '0 3px 12px rgba(0, 0, 0, 0.25)', borderBottom: '1px solid #174365' }}>
          <button
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
          >
            {sidebarOpen ? (
              <FaTimes className="w-5 h-5 text-gray-300" />
            ) : (
              <FaBars className="w-5 h-5 text-gray-300" />
            )}
          </button>
          <h1 className="text-xl font-semibold text-white tracking-wide">
            <FaShieldAlt className="inline mr-2 text-sky-400" aria-hidden="true" /> Panel de {user.rol_nombre || roleLabel[user.role]}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-white text-xs"><FaUserCircle className="text-2xl text-sky-400" /><span><strong className="block">{user.username}</strong><span className="text-slate-400">{user.rol_nombre || roleLabel[user.role]}</span></span></div>
        </div>
        
        {/* Contenido principal */}
        <div className="p-6">
          {notice && <div role="alert" className="mb-4 bg-red-100 text-red-800 p-3 rounded">{notice} <button onClick={() => setNotice('')} aria-label="Cerrar">×</button></div>}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
