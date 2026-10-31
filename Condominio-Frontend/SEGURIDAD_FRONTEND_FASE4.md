# Fase 4: frontend y administración de roles

## Archivos de esta fase

Creados: `src/api/client.js`, `src/auth/access.js`, `src/auth/access.test.js`, `src/auth/sessionContext.js`, `src/auth/Session.jsx`, `src/pages/ConsultaPage.jsx`, `src/pages/IncidentesGuardia.jsx` y este informe.

Modificados: `src/main.jsx`, `src/hooks/useAuth.jsx`, `src/routers/AppRouter.jsx`, `src/components/Layout.jsx`, `sidebar.jsx`, `table.jsx`, `StripePaymentForm.jsx`; `src/pages/login/LoginPage.jsx`, `reservas/ReservaPage.jsx`, `pago/PagoSuccessPage.jsx`, `visitas/VisitaPage.jsx`, `usuario/UserPage.jsx`, `UserList.jsx`, `UserForm.jsx`, `rol/RolPage.jsx`, `RolList.jsx` y `RolForm.jsx`.

Se adaptaron los servicios `src/api/areasComunesApi.jsx`, `bloqueApi.jsx`, `cargosApi.jsx`, `contratoApi.jsx`, `dashboardApi.jsx`, `empleadosApi.jsx`, `expensaApi.jsx`, `familiaresApi.jsx`, `incidenteApi.jsx`, `inquilinosApi.jsx`, `mascotasApi.jsx`, `multaApi.jsx`, `objetoPerdidoApi.jsx`, `paymentApi.jsx`, `propietariosApi.jsx`, `recognitionApi.jsx`, `reservaApi.jsx`, `rolApi.jsx`, `unidadApi.jsx`, `userApi.jsx`, `vehiculoApi.jsx`, `visitantesApi.jsx` y `visitasApi.jsx` para usar el cliente común. En backend se modificaron `administracion/serializers/serializersUser.py` y `administracion/tests_access.py`. No se eliminaron archivos.

La sesión obtiene el rol efectivo desde `GET /api/me/` después del inicio de sesión y al recargar. Si la sesión no puede verificarse por un error de conexión, el panel queda bloqueado y ofrece reintentar; un 401 o 403 durante esa verificación cierra la sesión local. El backend sigue siendo la autoridad para cada operación. El inicio de sesión distingue errores de credenciales de problemas de conexión. Si falta `VITE_API_URL`, el frontend usa `http://127.0.0.1:8000/api/` para desarrollo local; para otros entornos debe configurarse explícitamente.

Las rutas y menús reflejan los cuatro roles existentes. El administrador conserva las páginas administrativas; el guardia dispone de las funciones implementadas de visitas, reconocimiento, vehículos e incidencias; propietario e inquilino utilizan vistas de consulta para los recursos permitidos. Las vistas residentes omiten operaciones administrativas. El guardia puede registrar y editar incidencias sin enviar campos financieros y no ve la eliminación de visitas.

La gestión de usuarios muestra el estado de la cuenta, permite desactivarla o reactivarla y no ofrece eliminarla. El propio usuario no puede cambiar su rol ni su estado desde el formulario. Los roles se seleccionan entre los nombres reconocidos y la pantalla evita roles equivalentes duplicados; el backend también lo valida. La pantalla indica que los permisos de Django editables no definen por sí solos las reglas de acceso de la aplicación. Un usuario con varios grupos se muestra sin rol único, en vez de presentar arbitrariamente el primer grupo.

Los servicios existentes usan un cliente común que muestra un aviso ante respuestas 403. Los errores no invalidan la sesión por ese motivo. El pago de expensas conserva el formulario existente, corrige la detección del modo de desarrollo de Vite y deja de imprimir el secreto del pago.

## Límites y compatibilidad

- No existen aún interfaces ni APIs completas de cámaras, alertas, revisión de eventos o notificaciones persistentes; no se han presentado como funcionalidades disponibles. No se ha implementado RF-DETR.
- La relación inquilino-unidad y la atribución histórica de expensas siguen las restricciones documentadas en la fase 3. Sus listas pueden estar vacías y las visitas del inquilino continúan restringidas hasta implementar la ocupación.
- JWT y refresh siguen almacenados en `localStorage`, como en la aplicación original. Esto permite exposición ante XSS y el cierre de sesión solo limpia la sesión local; no se ha implementado una cookie HttpOnly ni revocación del token. El backend actual no ofrece ese contrato de cookie. El refresh automático tampoco se ha implementado; al expirar el token puede ser necesario iniciar sesión nuevamente.
- La fase no modifica Flutter, dependencias ni esquema. El archivo `package-lock.json` ya tenía cambios anteriores a esta etapa.
- Las pruebas frontend ejercitan las reglas de navegación, no sustituyen pruebas interactivas en navegador con cuentas y datos reales. Las pruebas backend usan SQLite en memoria y proveedores simulados. Se debe comprobar el flujo en PostgreSQL, dispositivos y Stripe de prueba antes de desplegar.

## Verificación

En frontend: `node --test src/auth/access.test.js`, `npm run build` y ESLint de los archivos de interfaz modificados. El `npm run lint` global presenta errores anteriores en módulos existentes; no se ha considerado aprobado. En backend: `.\env\Scripts\python.exe -B -m administracion.run_access_tests` y `manage.py check`. No se han ejecutado migraciones ni cambiado datos reales.
