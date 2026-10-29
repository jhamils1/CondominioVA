import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaUser, FaBuilding, FaHome, FaKey, FaUsers, FaCar, FaShieldAlt, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import logo from '../assets/images/logo.jpg';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src={logo} alt="Smart Condominium" className="h-10 w-auto mr-3" />
              <span className="text-2xl font-bold text-gray-800">
                Smart <span className="text-blue-600">Condominium</span>
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#servicios" className="text-gray-700 hover:text-blue-600 transition-colors">
                Servicios
              </a>
              <a href="#noticias" className="text-gray-700 hover:text-blue-600 transition-colors">
                Noticias
              </a>
              <a href="#contacto" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contacto
              </a>
              <a href="#admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                Administración
              </a>
            </nav>

            {/* Login Button */}
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300"
              >
                <FaBuilding className="w-4 h-4" />
                <span>Panel Admin</span>
              </Link>
              <Link
                to="/login"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300"
              >
                <FaUser className="w-4 h-4" />
                <span>Ingresar</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8 leading-tight">
            Bienvenidos a
            <br />
            <span className="text-blue-600">Smart Condominium</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Tu hogar inteligente donde la tecnología se encuentra con la comodidad.
            Gestionamos todos los aspectos de tu condominio para brindarte la mejor experiencia de vida.
          </p>

          {/* Quick Access */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Acceso Rápido</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/admin/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300"
              >
                <FaBuilding className="w-5 h-5" />
                <span>Panel Administrativo</span>
              </Link>
              <Link
                to="/login"
                className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300"
              >
                <FaUser className="w-5 h-5" />
                <span>Iniciar Sesión</span>
              </Link>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300">
                <FaSearch className="w-5 h-5" />
                <span>Buscar Información</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-16">
            Nuestros Servicios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Administración */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-blue-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaUser className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Administración</h3>
              <p className="text-gray-600 mb-4">
                Gestión completa de usuarios, empleados y permisos del condominio.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Control de acceso</li>
                <li>• Gestión de empleados</li>
                <li>• Roles y permisos</li>
              </ul>
            </div>

            {/* Residencial */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-blue-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaBuilding className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Residencial</h3>
              <p className="text-gray-600 mb-4">
                Administración de propietarios, residentes y vehículos del condominio.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Propietarios y residentes</li>
                <li>• Control vehicular</li>
                <li>• Gestión de visitantes</li>
              </ul>
            </div>

            {/* Finanzas */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-blue-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaKey className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Finanzas</h3>
              <p className="text-gray-600 mb-4">
                Control financiero, contratos y reportes del condominio.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Gestión de contratos</li>
                <li>• Reportes financieros</li>
                <li>• Control de pagos</li>
              </ul>
            </div>

            {/* Seguridad IA */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group">
              <div className="bg-blue-600 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShieldAlt className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Seguridad IA</h3>
              <p className="text-gray-600 mb-4">
                Tecnología avanzada de reconocimiento para máxima seguridad.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Reconocimiento facial</li>
                <li>• Control vehicular</li>
                <li>• Monitoreo inteligente</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-16">
            Noticias y Avisos
          </h2>
          <div className="text-center">
            <p className="text-xl text-gray-600">
              Mantente informado sobre las últimas noticias y avisos del condominio
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">
            ¿Necesitas ayuda?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Nuestro equipo está aquí para ayudarte con cualquier consulta sobre el condominio
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaPhone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Teléfono</h3>
              <p className="text-gray-600">+591 4 123-4567</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaEnvelope className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Email</h3>
              <p className="text-gray-600">admin@smartcondominium.com</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Dirección</h3>
              <p className="text-gray-600">Av. Principal #123, Cochabamba</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/admin/dashboard"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <FaBuilding className="w-5 h-5" />
              <span>Panel Administrativo</span>
            </Link>
            <Link
              to="/login"
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <FaUser className="w-5 h-5" />
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src={logo} alt="Smart Condominium" className="h-8 w-auto mr-3" />
              <span className="text-xl font-bold text-white">
                Smart <span className="text-blue-400">Condominium</span>
              </span>
            </div>
            <div className="text-gray-300 text-center md:text-right">
              <p>&copy; 2025 Smart Condominium. Todos los derechos reservados.</p>
              <p className="text-sm mt-1">Tu hogar inteligente</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
