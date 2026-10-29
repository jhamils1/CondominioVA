// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronRight,
  FaUserCog,
  FaMoneyBillWave,
  FaHome,
  FaSignOutAlt,
  FaUserCircle,
  FaRobot,
  FaBuilding,
} from "react-icons/fa"; 
import logo from "../assets/images/logo.jpg";

const Sidebar = ({ sidebarOpen }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(localStorage.getItem("username") || "Usuario");
  const [userRole, setUserRole] = useState("Invitado");

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  React.useEffect(() => {
    if (!sidebarOpen) {
      setOpenMenu(null);
    }
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserRole = localStorage.getItem("userRole");
    setUsername(storedUsername || "Usuario");
    setUserRole(storedUserRole || "Invitado");
  }, [location.pathname]);

  const menuItems = [
    { title: "Dashboard", icon: <FaHome />, key: "dashboard", path: "/admin/dashboard" },
    {
      title: "Autenticación",
      icon: <FaUserCog />,
      key: "autenticacion",
      subItems: [
        { name: "Usuarios", path: "/admin/usuarios" },
        { name: "Roles", path: "/admin/roles" },
        { name: "Empleados", path: "/admin/empleados" },
        { name: "Cargos", path: "/admin/cargos" },
        { name: "Propietarios", path: "/admin/propietarios" },
        { name: "Inquilinos", path: "/admin/inquilinos" },
        { name: "Familiares", path: "/admin/familiares" },
        { name: "Vehículos", path: "/admin/vehiculos" },
        { name: "Unidades", path: "/admin/unidades" },
        { name: "Bloques", path: "/admin/bloques" },
        { name: "Mascotas", path: "/admin/mascotas" },
      ],
    },
    {
      title: "Seguridad",
      icon: <FaRobot />,
      key: "seguridad",
      subItems: [
        { name: "Objetos Perdidos", path: "/admin/objetos-perdidos" },
        { name: "Reconocimiento Facial", path: "/admin/reconocimiento-facial" },
        { name: "Reconocimiento Vehicular", path: "/admin/reconocimiento-vehicular" },
        { name: "Enrolar Persona", path: "/admin/enrolar-persona" },
        { name: "Detectar Problemas", path: "/admin/detectar-problemas" },
        { name: "Visitantes", path: "/admin/visitantes" },
        { name: "Visitas", path: "/admin/visitas" },
        { name: "Incidentes", path: "/admin/incidentes" },
        { name: "Servicios", path: "/admin/servicios" },
      ],
    },
    {
      title: "Finanzas",
      icon: <FaMoneyBillWave />,
      key: "finanzas",
      subItems: [
        { name: "Expensas", path: "/admin/expensas" },
        { name: "Contratos", path: "/admin/contratos" },
        { name: "Nóminas", path: "/admin/nominas" },
        { name: "Multas", path: "/admin/multas" },
      ],
    },
    {
      title: "Áreas Comunes",
      icon: <FaBuilding />,
      key: "areas-comunes",
      subItems: [
        { name: "Áreas Comunes", path: "/admin/areas-comunes" },
        { name: "Reservas", path: "/admin/reservas" },
      ],
    },
    {
      title: "Comunicación",
      icon: <FaHome />,
      key: "comunicacion",
      subItems: [
        { name: "Reportes", path: "/admin/reportes" },
      ],
    },
  ];

  const NavItem = ({ to, icon, children }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-3 flex items-center space-x-4 rounded-xl transition-all duration-300 ${
          isActive
            ? "text-white bg-gradient-to-r from-slate-600 to-slate-700 shadow-md"
            : "text-gray-300 hover:text-white hover:bg-gray-700/50"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{children}</span>
    </NavLink>
  );

  return (
    <aside
      className={`h-screen flex flex-col transition-all duration-500 ease-in-out ${
        sidebarOpen 
          ? "w-64 flex-shrink-0" 
          : "w-0 overflow-hidden"
      }`}
      style={{ 
        background: 'linear-gradient(180deg, #1a1f2e 0%, #0f1419 100%)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-700/50">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="logo" className={`h-12 w-auto transition-opacity duration-500 ease-in-out ${
            sidebarOpen ? "opacity-100 delay-100" : "opacity-0 delay-0"
          }`} />
        </Link>
      </div>

      <nav className={`flex-1 overflow-y-auto p-4 space-y-1.5 transition-opacity duration-500 ease-in-out ${
        sidebarOpen ? "opacity-100 delay-100" : "opacity-0 delay-0"
      }`} style={{ minWidth: sidebarOpen ? '256px' : '0px' }}>
        {menuItems.map((menu) => (
          <div key={menu.key}>
            {menu.subItems ? (
              <>
                <div
                  className="px-4 py-3 flex items-center justify-between space-x-4 rounded-xl text-gray-300 group cursor-pointer hover:bg-gray-700/50 hover:text-white transition-all duration-300"
                  onClick={() => toggleMenu(menu.key)}
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <span className="text-lg">{menu.icon}</span>
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis font-medium">{menu.title}</span>
                  </div>
                  {openMenu === menu.key ? (
                    <FaChevronDown className="text-xs flex-shrink-0 transition-transform duration-300" />
                  ) : (
                    <FaChevronRight className="text-xs flex-shrink-0 transition-transform duration-300" />
                  )}
                </div>
                {openMenu === menu.key && (
                  <ul className="ml-6 mt-1.5 space-y-1 transition-all duration-300 ease-in-out border-l-2 border-gray-700/50 pl-4">
                    {menu.subItems.map((sub, idx) => (
                      <li key={idx}>
                        <NavLink
                          to={sub.path}
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                              isActive
                                ? "text-blue-400 bg-gray-700/60 font-medium shadow-sm"
                                : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/30"
                            }`
                          }
                        >
                          {sub.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <NavItem to={menu.path} icon={menu.icon}>
                {menu.title}
              </NavItem>
            )}
          </div>
        ))}
      </nav>

      <div className={`p-4 border-t border-gray-700/50 transition-opacity duration-500 ease-in-out ${
        sidebarOpen ? "opacity-100 delay-100" : "opacity-0 delay-0"
      }`}>
        <div className="flex items-center mb-3 min-w-0 p-3 rounded-xl bg-gray-700/30">
          <div className="relative">
            <FaUserCircle className="text-3xl text-blue-400 mr-3 flex-shrink-0" />
            <div className="absolute bottom-0 right-3 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-800"></div>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-white truncate whitespace-nowrap">
              {username}
            </span>
            <span className="text-xs text-gray-400 capitalize truncate whitespace-nowrap">{userRole}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2.5 flex items-center space-x-3 rounded-xl text-gray-300 group w-full hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/30 min-w-0"
        >
          <FaSignOutAlt className="flex-shrink-0 text-lg" />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
