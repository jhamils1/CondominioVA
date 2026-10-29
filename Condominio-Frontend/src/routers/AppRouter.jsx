import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
  const isLoggedIn = !!localStorage.getItem("access");
  return isLoggedIn ? <Layout /> : <Navigate to="/login" replace />;
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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="roles" element={<Roles />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="cargos" element={<Cargos />} />
          <Route path="propietarios" element={<Propietarios />} />
          <Route path="inquilinos" element={<Inquilinos />} />
          <Route path="familiares" element={<Familiares />} />
          <Route path="visitantes" element={<Visitantes />} />
          <Route path="mascotas" element={<Mascotas />} />
          <Route path="visitas" element={<Visitas />} />
          <Route path="vehiculos" element={<Vehiculos />} />
          <Route path="bloques" element={<Bloques />} />
          <Route path="unidades" element={<Unidades />} />
          <Route path="reconocimiento-vehicular" element={<ReconocimientoVehicular />} />
          <Route path="reconocimiento-facial" element={<ReconocimientoFacial />} />
          <Route path="enrolar-persona" element={<EnrolarPersona />} />
          <Route path="debug-enrolamiento" element={<DebugEnrolamiento />} />
          <Route path="contratos" element={<Contratos />} />
          <Route path="incidentes" element={<Incidentes />} />
          <Route path="multas" element={<Multas />} />
          <Route path="expensas" element={<Expensas />} />
          <Route path="objetos-perdidos" element={<ObjetosPerdidos />} />
          <Route path="areas-comunes" element={<AreasComunes />} />
          <Route path="reservas" element={<Reservas />} />
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