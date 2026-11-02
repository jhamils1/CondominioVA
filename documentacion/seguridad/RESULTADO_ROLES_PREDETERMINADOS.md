# Resultado de la etapa de roles predeterminados

Fecha: 2026-10-31. Etapa aprobada por el usuario tras el [análisis](PLAN_ROLES_PREDETERMINADOS_PERSONALIZADOS.md). Esta etapa implementa visualización y protección de roles base; los roles personalizados siguen pendientes de diseño e implementación posterior.

## Comportamiento

La página web «Roles y accesos» muestra siempre Administrador, Guardia de seguridad, Propietario e Inquilino, con una explicación y estado. `Seguridad` y `guardia de seguridad` son alias del grupo de guardia existentes; no se renombra ningún grupo. La vista detecta grupos equivalentes duplicados y solicita revisión en vez de habilitar otro.

Si un rol falta, aparece «No configurado» y la acción explícita «Habilitar rol». Tras confirmación del administrador, la aplicación envía la solicitud para crear únicamente ese grupo, sin permisos técnicos adicionales y sin crear cuentas. Consultar la página no crea grupos. Si la llamada falla o su respuesta es incierta, se vuelve a consultar y se solicita revisar el estado antes de reintentar. Si la lista no puede cargarse, se muestra un error y se ocultan los estados para no presentar una ausencia supuesta.

El administrador puede seguir asignando grupos existentes mediante los flujos de usuarios y vinculación de cuentas. Las reglas de rol y perfil siguen siendo las mismas. El acceso del inquilino a una unidad todavía está pendiente de una relación de ocupación verificable.

En la API funcional, `PUT` y `PATCH` de cualquiera de los cuatro grupos se rechazan con 403. La eliminación ya se rechazaba con 405. La creación de un grupo predeterminado faltante rechaza permisos Django no vacíos; las capacidades de aplicación siguen definidas en el backend. Los permisos históricos de grupos existentes no se alteran. El administrador técnico de Django es una superficie separada: esta protección no sustituye la revisión y control de privilegios técnicos.

## Comprobaciones

- Backend: `DEBUG=False` y `env\Scripts\python.exe -B -m administracion.run_migration_smoke` desde `Condominio-Backend`: **91 pruebas aprobadas**. El ejecutor aplica migraciones únicamente en SQLite en memoria y simula proveedores. Las pruebas nuevas cubren PATCH/PUT/DELETE de los cuatro grupos, preservación de permisos históricos, rechazo de permisos técnicos al crear, alta explícita de grupo faltante, auditoría y asignación a un usuario inquilino con perfil válido. No usa base persistente.
- Frontend: `node --test --test-concurrency=1 src/pages/rol/RolList.test.js src/auth/access.test.js src/components/CuentaPerfil.test.js`: **6 pruebas aprobadas**. Incluyen renderizado con grupo ausente y duplicados, reglas de navegación y opciones de cuentas. No equivalen a prueba interactiva completa en navegador con una base real.
- ESLint en los cuatro archivos modificados/nuevos de la página de roles: correcto. `npm.cmd run build`: correcto, con advertencia de paquete mayor de 500 kB.
- La primera ejecución combinada de pruebas de interfaz dentro del entorno restringido falló por acceso de Vite/esbuild a dependencias y conflictos de puerto WebSocket; se detuvo y repitió en serie con acceso a las dependencias instaladas. La repetición pasó, aunque Vite siguió informando que el puerto WebSocket estaba ocupado; las pruebas SSR no dependen de él.
- `git diff --check`: correcto. No se hicieron migraciones en bases persistentes, no se consultaron ni alteraron grupos o usuarios reales y no se modificó el móvil.

## Limitaciones y siguiente etapa

La pantalla no ofrece todavía creación de roles personalizados. El usuario decidió que estos empiecen sin permisos; deberán definirse capacidades, alcances de datos y compatibilidad entre Django, React y Flutter antes de implementarlos. Se espera aprobación explícita para la siguiente etapa.

No se realizó un recorrido manual en el navegador con datos del proyecto. Antes de usar «Habilitar rol» en una base de desarrollo, comprobar que se trata del entorno correcto. La activación por el usuario crea un grupo nuevo si falta; no se ha ejecutado automáticamente en esta etapa.
