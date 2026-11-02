# Guía de roles, incidencias y notificaciones del condominio

## Estado de la entrega

Esta guía describe el código existente en `Condominio-Backend`, `Condominio-Frontend` y `condominio-movil` después de las etapas de implementación y revisión. **No es una autorización para desplegar ni una confirmación de que el sistema esté listo para producción.** Las migraciones de seguridad 0002 y 0003 se han probado en SQLite temporal, pero no se han aplicado a la base de datos del proyecto. Los indicadores de eventos y FCM están desactivados por defecto. No se ha enviado un push real como parte de estas pruebas.

No están implementados todavía RF-DETR, el procesamiento de cámaras, el almacenamiento y consulta protegidos de evidencia ni la vinculación inquilino-unidad con fechas. El informe `Condominio-Backend/SEGURIDAD_PRUEBAS_FASE8.md` contiene los hallazgos y límites detallados.

## Roles y relación con los datos

El backend usa grupos de Django como roles de aplicación. Debe existir exactamente un grupo reconocido para cada cuenta. Los nombres reconocidos, comparados sin distinguir mayúsculas y espacios extremos, son `administrador`, `Seguridad` o `guardia de seguridad`, `propietario` e `inquilino`. Los dos nombres de guardia son equivalentes; no deben coexistir como roles duplicados. El backend calcula el rol vigente en cada solicitud autenticada; un valor que envíe la interfaz no concede permisos.

- **Administrador de aplicación:** administra usuarios y funciones autorizadas del condominio. No se transforma automáticamente en superusuario de Django. El administrador técnico de Django es una cuenta distinta con privilegios de superusuario; no debe utilizarse como cuenta cotidiana.
- **Guardia:** la cuenta activa debe estar vinculada a un `Empleado` activo mediante `Empleado.user`. El cargo por sí solo no concede el rol. Puede consultar y operar las funciones de seguridad autorizadas, pero no administrar usuarios, roles ni finanzas.
- **Propietario:** la cuenta activa debe estar vinculada a una `Persona` activa de tipo `P`. Puede consultar sus datos y las relaciones que el backend pueda verificar.
- **Inquilino:** la cuenta activa debe estar vinculada a una `Persona` activa de tipo `I` que también tenga el registro `Inquilino`. La relación de `Inquilino` con propietario no identifica por sí sola la unidad ocupada.
- **Familiares y visitantes:** son tipos de `Persona`, no roles de acceso. Una persona de tipo `F` o `V` no obtiene acceso por asignarle un grupo. Otros empleados no reciben automáticamente el rol de guardia.

Una cuenta inactiva, con varios grupos, sin grupo reconocido o sin el perfil activo que exige su rol no obtiene acceso efectivo. La asignación del rol y la vinculación del perfil son pasos diferentes.

## Matriz de acceso

| Área | Administrador | Guardia | Propietario | Inquilino |
|---|---|---|---|---|
| Usuarios, roles y empleados | Gestión autorizada | Sin acceso | Sin acceso | Sin acceso |
| Unidades y bloques | Gestión | Consulta operativa | Consulta por contrato activo inequívoco | Restringido hasta vincular ocupación |
| Vehículos | Gestión | Consulta | Sus vehículos; API permite gestión propia | Sus vehículos; API permite gestión propia |
| Visitas | Gestión | Registrar y actualizar; no eliminar | Consultar visitas donde figura como receptor | Restringidas hasta vincular ocupación |
| Contratos y expensas | Gestión | Sin acceso | Sus contratos y expensas autorizadas | Restringidos por falta de relación inequívoca |
| Incidencias y eventos | Supervisión | Revisar y atender | Sin acceso | Sin acceso |
| Notificaciones de seguridad | Incidencias confirmadas | Alertas iniciales | No recibe | No recibe |
| Cámaras y evidencia | Pendiente de implementar | Pendiente de implementar | Sin acceso | Sin acceso |

Las vistas web de residentes son principalmente de consulta; no todas las operaciones permitidas por la API tienen formulario web. El móvil consulta `/api/me/` y adapta las rutas y el menú existentes al rol, pero todavía no tiene pantallas de eventos y notificaciones de seguridad. En expensas se usa provisionalmente la fecha del contrato activo y se restringen relaciones simultáneas ambiguas; esto no resuelve la atribución histórica definitiva.

## Crear y vincular un guardia

Solo un administrador autorizado puede realizar estos pasos. Antes de operar con datos reales, resuelve los riesgos de la sección de limitaciones y verifica el flujo en un entorno no productivo.

1. Crea o identifica un `Cargo` y un registro `Empleado` activo. Es posible guardar al empleado sin crearle una cuenta.
2. Vuelve a editar el empleado guardado y utiliza **Cuenta de guardia**. Puedes crear una cuenta con un nombre, correo y contraseña elegidos, o seleccionar una cuenta existente compatible y sin otro perfil.
3. El backend localiza el grupo de guardia por su nombre, exige que sea único y crea o vincula la cuenta en una transacción. Si falta el grupo, hay duplicados o el perfil ya tiene cuenta, rechaza la operación sin sobrescribir vínculos.
4. Confirma que la cuenta y el empleado estén activos y prueba el acceso en un entorno de prueba. `GET /api/me/` devuelve el rol efectivo y `empleado_id` a la propia cuenta.

Los formularios de propietario e inquilino también permiten crear o vincular una cuenta después de guardar el perfil. Este nuevo flujo no utiliza contraseñas generadas a partir de datos personales ni IDs de rol fijos. Para registros existentes, el servidor comprueba el rol y si la cuenta ya está vinculada. La API `POST /api/provisionar-cuenta/` solo admite administradores. La selección de una cuenta en pantalla no garantiza que esté libre: el servidor hace la comprobación final. Este flujo aún necesita pruebas interactivas de navegador y no modifica cuentas creadas anteriormente.

## Asignar un rol y desactivar cuentas

En **Usuarios**, un administrador puede crear o editar una cuenta y seleccionar entre los grupos reconocidos; el backend valida el rol. No se permite cambiar el propio rol ni desactivar la propia cuenta. El backend protege contra la desactivación o degradación del último administrador activo. No se permite eliminar una cuenta desde este endpoint; se conserva el historial mediante desactivación.

Para desactivar, edita la cuenta y desmarca **Cuenta activa**, o usa `PATCH /api/users/{id}/` con `is_active` en `false`. Para reactivar, usa la misma operación con `true`, previa revisión del rol y perfil. Los cambios de cuenta y rol se registran en el historial administrativo existente. No se aplican automáticamente privilegios técnicos de Django.

## API y autorización

Las rutas se anteponen a `/api/`. El cliente presenta el JWT mediante el mecanismo de autenticación del proyecto; no lo incluya en capturas, informes ni registros. `POST /login/` emite tokens, `GET /me/` consulta la cuenta actual, `POST /refresh/` renueva y `POST /logout/` pone el refresh en lista negra. El access ya emitido puede seguir siendo válido hasta expirar; el cierre web actual solo limpia los tokens locales.

| Rutas representativas | Acceso y propósito |
|---|---|
| `/users/`, `/roles/`, `/groupsAux/`, `/permissions/`, `/empleados/`, `/cargos/` | Administrador autorizado |
| `/provisionar-cuenta/` | Administrador; crear o vincular una cuenta a un perfil compatible existente |
| `/personas/`, `/propietarios/`, `/inquilinos/`, `/familiares/`, `/vehiculos/`, `/unidades/`, `/visitas/` | Depende de rol, acción y filtros del usuario |
| `/contratos/`, `/expensas/`, `/multas/`, `/create-payment-intent/`, `/verify-payment-intent/` | Administrador o datos propios verificables; guardia denegado |
| `/incidentes/`, `/alpr/`, `/reconocimiento/` | Seguridad o administración, según la acción |
| `/enrolar/`, `/verificar-enrolamiento/`, `/verificar-luxand/`, `/probar-luxand/` | Administración según los permisos declarados en las vistas |
| `/eventos-seguridad/`, `/notificaciones-seguridad/` | Administrador y guardia; desactivadas hasta configurar el esquema |
| `/devices/` | Dispositivos del usuario autenticado; el servidor no permite reasignar silenciosamente un token ajeno |

Las listas anteriores son una guía, no una lista exhaustiva de rutas. La seguridad se aplica también al detalle y a las operaciones; una consulta de otro residente debe rechazarse aunque se modifique un ID. El proyecto aún tiene `AllowAny` como configuración general de DRF, por lo que cada nueva vista sensible debe declarar explícitamente su permiso y ser probada.

## Eventos, incidencias y notificaciones

El diseño separa el evento potencial, la incidencia y la notificación de cada destinatario. El servicio interno admite un evento de origen `IA` para una futura integración; la API actual de creación crea eventos `MANUAL`. Un evento no genera multa ni asigna automáticamente un responsable.

1. Un evento pendiente crea notificaciones internas para **todos los guardias activos** con rol efectivo. Si no hay guardias, se conserva y se marca sin destinatarios; el administrador puede reintentar la distribución manualmente.
2. Un guardia revisa el evento y lo confirma o lo descarta con motivo. Solo al confirmar se crea una incidencia y una notificación interna para cada administrador autorizado. Ni propietarios ni inquilinos reciben estas alertas.
3. El guardia puede iniciar atención, registrar actuaciones y resolver con observación. El historial conserva actor, fecha y cambios. Los estados son `PENDIENTE_REVISION`, `CONFIRMADA`, `FALSO_POSITIVO`, `EN_ATENCION` y `RESUELTA`; no se aceptan transiciones arbitrarias.
4. Una incidencia manual registrada por un guardia se trata como confirmada por ese guardia cuando la función está habilitada; no requiere segunda revisión artificial.

En el panel web, **Eventos e incidencias** muestra la lista y el historial a guardias y administradores; **Notificaciones** muestra el historial individual y permite marcar lectura. Mientras `NOTIFICACIONES_SEGURIDAD_ACTIVAS` sea falso, las rutas nuevas responden que el servicio no está habilitado.

Rutas principales: `GET/POST /eventos-seguridad/`, `GET /eventos-seguridad/{uuid}/`, `GET .../historial/`, `POST .../confirmar/`, `POST .../descartar/` con `motivo`, `POST .../atender/`, `POST .../actuaciones/` y `POST .../resolver/` con `observacion`, `POST .../redistribuir/` para administrador, `GET /notificaciones-seguridad/` y `POST /notificaciones-seguridad/{uuid}/leer/`. El UUID debe mantenerse estable al reintentar el mismo evento; el contenido diferente con el mismo UUID se rechaza.

## Firebase y funcionamiento sin conexión

FCM es un canal adicional que requiere internet; la notificación interna no depende de que Firebase acepte el envío. La cola por dispositivo registra intentos y errores genéricos sin registrar el token. Un proceso separado puede ejecutar `python manage.py procesar_fcm_seguridad --limite 50` por lotes; no hay un servicio o programador instalado automáticamente. Tras cinco intentos fallidos se puede revisar y reencolar una entrega concreta mediante `python manage.py reintentar_fcm_seguridad <id>`.

El estado `ENVIADA` significa que Firebase aceptó la solicitud, no que el teléfono mostró la alerta. Una interrupción después de la aceptación puede causar un reintento duplicado. Los dispositivos registrados después de crear una notificación no reciben retrospectivamente ese push. El móvil requiere pruebas reales y todavía no navega al historial de seguridad al pulsar la alerta.

Para una configuración futura de prueba: usar credenciales Firebase propias y protegidas, comprobar registro de dispositivos y permisos, aplicar las migraciones solo después de respaldo y aprobación, habilitar explícitamente los indicadores adecuados, ejecutar el procesador supervisado y verificar la recepción en dispositivos de prueba. No activar con datos reales antes de resolver los hallazgos de seguridad. No exponer credenciales en el cliente, documentación o repositorio.

## Configuración por entorno

Los nombres siguientes se obtienen del código; no se incluyen valores de secretos:

| Componente | Variables o configuración | Finalidad |
|---|---|---|
| Django | `SECRET_KEY`, `DEBUG`, `DATABASE_URL` | Clave, modo y base de datos |
| Django | `NOTIFICACIONES_SEGURIDAD_ACTIVAS`, `COLA_FCM_SEGURIDAD_ACTIVA`, `ENVIO_FCM_SEGURIDAD_ACTIVO` | Activaciones separadas; por defecto falsas |
| Django | `FIREBASE_CREDENTIALS_JSON`, `FCM_SERVER_KEY` | Configuración existente de Firebase; mantener protegida |
| Django | `PLATE_TOKEN`, `PLATE_REGIONS`, `LUXAND_TOKEN`, `LUXAND_COLLECTION`, `LUXAND_COLLECTION_EMPLEADOS` | Reconocimiento en la nube existente |
| Django | `IMGBB_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Imágenes y documentos existentes |
| Django | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `FRONTEND_URL` | Pagos y redirección |
| Vite | `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_IMGBB_API_KEY` | API y configuración pública del navegador |
| Flutter | `lib/config/api_config.dart`, configuración Firebase de la aplicación | URL y configuración actuales; requieren revisión por entorno |

En Vite, las variables `VITE_` quedan expuestas al navegador: no deben contener secretos. El código actual incluye `CORS_ALLOW_ALL_ORIGINS=True` y `ALLOWED_HOSTS` con `*`; antes de producción deben revisarse para los orígenes y hosts reales, tras evaluar compatibilidad con los clientes. La app Flutter contiene una URL de backend configurada en código; no se ha validado para todos los entornos.

## Pruebas reproducibles

Desde `Condominio-Backend`, con el entorno virtual ya instalado:

```powershell
.\env\Scripts\python.exe -B -m administracion.run_migration_smoke
```

El script fuerza SQLite en memoria, comprueba que no apunta a otra base, aplica las migraciones a esa base efímera y ejecuta las pruebas con servicios externos simulados. La prueba más reciente ejecutó 70 casos. Algunas pruebas verifican problemas conocidos, por lo que un resultado correcto no implica cumplimiento total. Desde `Condominio-Frontend` se ejecutaron `node --test src/auth/access.test.js` y `npm run build`. En Flutter pasaron pruebas de widgets y servicios con HTTP simulado; faltan pruebas en teléfonos. El lint global web sigue fallando y las pruebas de navegador siguen pendientes.

Antes de aplicar migraciones a una base persistente, identificar el entorno y su historial, revisar dependencias y SQL, respaldar y verificar restauración, probar en una copia no productiva y obtener autorización específica. No ejecutar migraciones en producción con este procedimiento de prueba.

## Integración futura con RF-DETR Nano

El procesador de video debe ser un servicio separado de las peticiones web. Deberá cargar el modelo localmente cuando corresponda, agrupar detecciones de un episodio antes de generar un evento y asignar un identificador estable para que los reintentos sean idempotentes. La selección de guardias y la creación de notificaciones pertenecen al backend, no al cliente o al detector. Debe definirse un contrato autenticado para eventos IA, además de cámara, zona y evidencia protegida; la API actual no ofrece ingestión IA autenticada ni flujo de evidencia. La sincronización y el uso sin internet del trabajador todavía no están implementados.

## Riesgos y decisiones pendientes

- Si se utilizaron anteriormente los formularios con contraseñas previsibles e IDs de rol fijos para cuentas reales, evaluar cambios de contraseña y verificar roles y vínculos mediante un administrador autorizado. El nuevo flujo no cambia automáticamente esas cuentas.
- Probar el perfil y los menús móviles en dispositivos reales; implementar las pantallas móviles de seguridad y notificaciones pendientes. La edición de perfil existente es una simulación y la pantalla anterior de cambio de contraseña no está conectada a una ruta verificada del backend.
- Definir titularidad histórica de expensas y la recuperación de avisos omitidos: la señal ya omite contratos ambiguos, pero no encola esos avisos y aún se ejecuta antes del cierre de la transacción. Revisar también la difusión general de objetos perdidos.
- Definir el ciclo de vida de sesiones, revocación de access tokens y almacenamiento web; revisar registros y el campo `raw` del reconocimiento.
- Corregir o proteger la eliminación en cascada cuando aún no existe la tabla de eventos; no desplegar con migraciones pendientes sin una prueba sobre copia.
- Implementar evidencias privadas y auditar su consulta antes de permitir revisión visual.
- Revisar CORS y hosts por entorno, calidad global, pruebas de concurrencia y recepción real FCM, y configurar un proceso supervisado de entrega.

Informes de las etapas: `Condominio-Backend/SEGURIDAD_ROLES_FASE2.md`, `SEGURIDAD_DATOS_FASE3.md`, `SEGURIDAD_NOTIFICACIONES_FASE5.md`, `SEGURIDAD_FCM_FASE6.md`, `SEGURIDAD_INCIDENCIAS_FASE7.md`, `SEGURIDAD_PRUEBAS_FASE8.md` y `Condominio-Frontend/SEGURIDAD_FRONTEND_FASE4.md`.
