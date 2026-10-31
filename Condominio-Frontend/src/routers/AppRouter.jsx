import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSession } from '../auth/sessionContext.js';
import { canAccess } from '../auth/access.js';
import ConsultaPage from '../pages/ConsultaPage.jsx';
import IncidentesGuardia from '../pages/IncidentesGuardia.jsx';
import NotificacionesPage from '../pages/NotificacionesPage.jsx';
import EventosSeguridadPage from '../pages/EventosSeguridadPage.jsx';
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/login/LoginPage.jsx";
import Layout from "../components/Layout.jsx";
import Dashboard from "../pages/dashboard/dashboard.jsx";
import Usuarios from "../pages/usuario/UserPage.jsx";
import Roles from "../pages/rol/RolPage.jsx";
import Empleados from "../pages/empleados/EmpleadoPage.jsx";
import Cargos from "../pages/cargos/CargoPage.jsx";
import Propietarios from "../pages/propietarios/PropietarioPage.jsx";
import Inquilinos from "../pages/inquilinos/InquilinoPage.jsx";
import Familiares from "../pages/familiares/FamiliarPage.jsx";
import Visitantes from "../pages/visitantes/VisitantePage.jsx";
import Mascotas from "../pages/mascotas/MascotaPage.jsx";
import Visitas from "../pages/visitas/VisitaPage.jsx";
import Vehiculos from "../pages/vehiculos/VehiculoPage.jsx";
import Bloques from "../pages/bloques/BloquePage.jsx";
import Unidades from "../pages/unidades/UnidadPage.jsx";
import ReconocimientoVehicular from "../pages/reconocimiento/ReconocimientoPage.jsx";
import ReconocimientoFacial from "../pages/reconocimiento/ReconocimientoFacialPage.jsx";
import EnrolarPersona from "../pages/reconocimiento/EnrolarPersonaPage.jsx";
import DebugEnrolamiento from "../components/DebugEnrolamiento.jsx";
import Contratos from "../pages/contratos/ContratoPage.jsx";
import Incidentes from "../pages/incidentes/IncidentePage.jsx";
import Multas from "../pages/multas/MultaPage.jsx";
import Expensas from "../pages/expensas/ExpensaPage.jsx";
import ObjetosPerdidos from "../pages/objetosPerdidos/ObjetoPerdidoPage.jsx";
import AreasComunes from "../pages/areasComunes/AreaComunPage.jsx";
import Reservas from "../pages/reservas/ReservaPage.jsx";
import PagoSuccessPage from "../pages/pago/PagoSuccessPage.jsx";
import PagoCancelPage from "../pages/pago/PagoCancelPage.jsx";
import PagoDebugPage from "../pages/pago/PagoDebugPage.jsx";




// Componente para proteger rutas
const ProtectedRoute = () => {
  const { status, logout } = useSession();
  if (status === 'loading') return <p>Cargando sesión…</p>;
  if (status === 'error') return <div><p>No se pudo verificar la sesión con el servidor.</p><button onClick={() => window.location.reload()}>Reintentar</button><button onClick={logout}>Cerrar sesión</button></div>;
  return status === 'authenticated' ? <Layout /> : <Navigate to="/login" replace />;
};

const RolePage = ({ path, children }) => {
  const { user } = useSession();
  if (!canAccess(user.role, path)) return <div role="alert">No tienes permiso para acceder a esta página.</div>;
  if (path === 'dashboard' && user.role !== 'administrador') return <div className="bg-white p-6 rounded-lg shadow"><h2 className="text-2xl font-semibold">Bienvenido, {user.username}</h2><p>Selecciona una opción del menú.</p></div>;
  if (path === 'perfil' || (['propietario', 'inquilino'].includes(user.role) && ['unidades','vehiculos','contratos','expensas','visitas'].includes(path)) || (user.role === 'guardia' && path === 'vehiculos')) return <ConsultaPage resource={path} />;
  if (path === 'incidentes' && user.role === 'guardia') return <IncidentesGuardia />;
  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública para la homepage */}
        <Route path="/" element={<HomePage />} />
        
        {/* Ruta pública para el login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas públicas para pagos */}
        <Route path="/pago/success" element={<PagoSuccessPage />} />
        <Route path="/pago/cancel" element={<PagoCancelPage />} />
        <Route path="/pago/debug" element={<PagoDebugPage />} />

        {/* Rutas protegidas del panel de administración */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="perfil" element={<RolePage path="perfil" />} />
          <Route path="notificaciones" element={<RolePage path="notificaciones"><NotificacionesPage /></RolePage>} />
          <Route path="eventos-seguridad" element={<RolePage path="eventos-seguridad"><EventosSeguridadPage /></RolePage>} />
          <Route path="dashboard" element={<RolePage path="dashboard"><Dashboard /></RolePage>} />
          <Route path="usuarios" element={<RolePage path="usuarios"><Usuarios /></RolePage>} />
          <Route path="roles" element={<RolePage path="roles"><Roles /></RolePage>} />
          <Route path="empleados" element={<RolePage path="empleados"><Empleados /></RolePage>} />
          <Route path="cargos" element={<RolePage path="cargos"><Cargos /></RolePage>} />
          <Route path="propietarios" element={<RolePage path="propietarios"><Propietarios /></RolePage>} />
          <Route path="inquilinos" element={<RolePage path="inquilinos"><Inquilinos /></RolePage>} />
          <Route path="familiares" element={<RolePage path="familiares"><Familiares /></RolePage>} />
          <Route path="visitantes" element={<RolePage path="visitantes"><Visitantes /></RolePage>} />
          <Route path="mascotas" element={<RolePage path="mascotas"><Mascotas /></RolePage>} />
          <Route path="visitas" element={<RolePage path="visitas"><Visitas /></RolePage>} />
          <Route path="vehiculos" element={<RolePage path="vehiculos"><Vehiculos /></RolePage>} />
          <Route path="bloques" element={<RolePage path="bloques"><Bloques /></RolePage>} />
          <Route path="unidades" element={<RolePage path="unidades"><Unidades /></RolePage>} />
          <Route path="reconocimiento-vehicular" element={<RolePage path="reconocimiento-vehicular"><ReconocimientoVehicular /></RolePage>} />
          <Route path="reconocimiento-facial" element={<RolePage path="reconocimiento-facial"><ReconocimientoFacial /></RolePage>} />
          <Route path="enrolar-persona" element={<RolePage path="enrolar-persona"><EnrolarPersona /></RolePage>} />
          <Route path="debug-enrolamiento" element={<RolePage path="debug-enrolamiento"><DebugEnrolamiento /></RolePage>} />
          <Route path="contratos" element={<RolePage path="contratos"><Contratos /></RolePage>} />
          <Route path="incidentes" element={<RolePage path="incidentes"><Incidentes /></RolePage>} />
          <Route path="multas" element={<RolePage path="multas"><Multas /></RolePage>} />
          <Route path="expensas" element={<RolePage path="expensas"><Expensas /></RolePage>} />
          <Route path="objetos-perdidos" element={<RolePage path="objetos-perdidos"><ObjetosPerdidos /></RolePage>} />
          <Route path="areas-comunes" element={<RolePage path="areas-comunes"><AreasComunes /></RolePage>} />
          <Route path="reservas" element={<RolePage path="reservas"><Reservas /></RolePage>} />
        </Route>

        {/* Redirección por defecto */}
        <Route 
          path="*" 
          element={<Navigate to={localStorage.getItem("access") ? "/admin/dashboard" : "/"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
