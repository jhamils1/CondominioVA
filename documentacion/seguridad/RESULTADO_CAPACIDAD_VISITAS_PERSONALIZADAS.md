# Primera capacidad de rol personalizado: consultas de visitas

Fecha: 2026-10-31. Etapa autorizada después de preparar almacenamiento. Se implementó y probó una primera capacidad web y backend en entorno aislado. La función permanece desactivada por defecto y las migraciones no se aplicaron a una base persistente.

## Funcionalidad preparada

- Solo el administrador de aplicación puede crear roles personalizados mediante `roles-personalizados/`. Nacen inactivos y sin permisos. La API impide nombres reservados o equivalentes y no acepta permisos al crear.
- El administrador puede activar/desactivar el rol y seleccionar la capacidad `visitas.consultar_operativas`. Por ahora es la única capacidad disponible. El cambio afecta a todas las cuentas asignadas y se consulta en cada petición; no depende de un dato enviado por el navegador.
- El administrador puede asignar el rol activo a una cuenta activa de empleado activo. Esta primera versión rechaza cuentas técnicas, administrativas, con perfil residencial o con cualquier dispositivo FCM registrado, incluso inactivo. La asignación sustituye los grupos previos de la cuenta y se registra en auditoría. La interfaz pide confirmación y no crea cuentas nuevas.
- La consulta autorizada es **solo lectura** de visitas con estado `PENDIENTE` o `ACTIVA`, en listado y detalle. Devuelve ID, estado, entrada, salida, nombre del visitante y nombre de quien recibe; no incluye cédulas, teléfonos, IDs de personas ni datos financieros. Búsquedas por cédula se deshabilitan para este rol. No puede crear, editar o finalizar visitas, ni acceder a seguridad, finanzas o gestión de roles por esta capacidad.
- Un rol activo sin capacidad puede iniciar sesión con su empleado activo, pero recibe 403 en visitas. Quitar la capacidad rechaza las consultas posteriores con el token existente. Desactivar el rol o empleado provoca rechazo de las solicitudes autenticadas posteriores y de la renovación; no interrumpe peticiones que ya superaron el control.
- `/api/me/` informa el rol y las capacidades implementadas para que React muestre los menús adecuados. Las validaciones de Django son la autoridad; los permisos mostrados por la interfaz no son una barrera de seguridad.
- La app móvil aún no reconoce este nuevo rol y lo rechaza; no fue modificada. Los avisos de seguridad siguen dirigidos a los guardias y administradores existentes.

La gestión de usuarios convencional puede sustituir el rol personalizado por uno predeterminado permitido y elimina la asignación personalizada en esa transacción. No se modifica la cuenta propia ni se afecta el último administrador a través de este flujo. La creación de una cuenta de empleado directamente con rol personalizado desde el formulario de alta, y la administración avanzada de roles, siguen pendientes.

## Dispositivos y notificaciones

La señal anterior de objetos perdidos consulta todos los dispositivos FCM. Para que este rol inicial no reciba mensajes ajenos por una integración heredada, la asignación se rechaza si la cuenta conserva **cualquier** registro de dispositivo; no se elimina ni reasigna ninguno. Además, los usuarios con rol personalizado no pueden acceder a las rutas de dispositivos FCM. Las operaciones de dispositivo comprueban de nuevo el rol tras bloquear la cuenta para reducir carreras con cambios de rol.

La resolución de dispositivos existentes, recepción móvil y política de notificaciones de roles personalizados son etapas futuras. No borrar registros de dispositivos existentes para eludir esta condición sin estudiar su titularidad y consecuencias. No se verificó concurrencia real de este cambio en PostgreSQL.

## Activación y migraciones

`ROLES_PERSONALIZADOS_ACTIVOS` es un interruptor de backend con valor predeterminado `False`. En ese estado, la sección web informa que la función no está habilitada; las rutas de gestión devuelven 503 y la autenticación mantiene el comportamiento previo. No se ha modificado ningún `.env`.

Se preparó `administracion/migrations/0006_asignacionrolpersonalizado.py`, dependiente de la `0005` de la etapa anterior. En la prueba se aplicaron solamente a SQLite en memoria. **Ninguna de las dos se ha aplicado en esta etapa a la base persistente.** No activar el interruptor sobre una base sin las tablas. Para una puesta en marcha se debe identificar la base, revisar historial y SQL, validar una copia, preparar y comprobar un respaldo, y obtener autorización específica antes de migrar y activar. No se ha realizado ese procedimiento aquí.

## Pruebas y alcance

- Backend: **99 pruebas aprobadas** con `administracion.run_migration_smoke`, SQLite en memoria y proveedores simulados. Se cubren rol vacío, nombres reservados, administración restringida, conversión de cuenta, auditoría y rollback, consulta por lista/detalle, campos reducidos, historial excluido, métodos denegados, búsqueda por CI, cambio de permiso con token y desactivación con access/refresh, dispositivos y regresión de roles existentes.
- Frontend: **7 pruebas aprobadas** con Node; incluyen los controles de navegación según capacidades y pruebas de renderizado de componentes previos. No incluyen una prueba interactiva en navegador del formulario nuevo ni una prueba completa de React contra la API.
- ESLint de archivos web afectados: correcto. `npm.cmd run build`: correcto; mantiene advertencia de tamaño superior a 500 kB.
- `makemigrations administracion --check --dry-run` con configuración aislada: sin cambios pendientes. No se probó PostgreSQL ni concurrencia de las nuevas rutas. La validación y normalización Unicode debe revisarse con la colación elegida.
- No se enviaron notificaciones, no se accedió a dispositivos, no se crearon cuentas reales, no se aplicaron migraciones persistentes ni se activó la opción del entorno.

Los resultados no prueban todas las rutas no relacionadas con visitas ni reemplazan una auditoría completa de seguridad. La siguiente etapa debe decidir si se realizará una prueba integrada aislada de la interfaz y PostgreSQL, y posteriormente cómo ampliar permisos y compatibilidad móvil.
