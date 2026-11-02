# Roles personalizados: móvil y verificación aislada

Fecha: 2026-10-31. Continuación autorizada de la [primera capacidad](RESULTADO_CAPACIDAD_VISITAS_PERSONALIZADAS.md).

**Estado: implementación y verificación automatizada completadas; recorrido visual web pendiente.** No activar todavía en la base habitual. No se aplicaron allí las migraciones `0005`/`0006`, no se modificó `.env`, no se operaron cuentas reales ni se utilizó el teléfono. No se hizo commit ni respaldo remoto.

## Comportamiento implementado

Flutter reconoce `personalizado` y valida el nombre y la lista de capacidades devueltos por `/api/me/`. El perfil muestra el nombre del rol. La ruta y el menú de visitas operativas requieren `visitas.consultar_operativas`; la pantalla consulta visitas pendientes/activas en modo lectura, con estados de carga, vacío, error y actualización. No concede acceso a cámaras, incidencias, finanzas ni gestión de usuarios. Los cuatro roles predeterminados conservan su navegación previa.

La autorización sigue en Django: ocultar un menú no reemplaza sus comprobaciones. Quitar una capacidad deniega la siguiente consulta; desactivar el rol rechaza el acceso y la renovación del token. Una pantalla ya cargada puede conservar los datos previamente recibidos hasta actualizarla o salir: no se implementó borrado remoto ni actualización en tiempo real de la interfaz.

La creación/asignación continúa en web, limitada a empleados activos compatibles. El alta de empleado no crea directamente una cuenta con rol personalizado. La única capacidad personalizada disponible en esta etapa es consultar visitas operativas; no es todavía un catálogo general de todos los permisos del sistema.

## Firebase y cuentas móviles

El inicio de sesión personalizado omite el registro FCM. Antes de registrar un dispositivo, `FCMService` consulta el perfil y comprueba que no cambió la sesión; solo admite roles predeterminados. Al cerrar una sesión personalizada, no intenta borrar ni reasignar referencias FCM guardadas. El backend también deniega sus rutas de dispositivos y rechaza asignar este rol a cuentas que tengan registros FCM, incluso inactivos.

Para roles predeterminados, registrar o desregistrar ahora requiere consultar el perfil. Si falla esa consulta o cambia la sesión, la operación devuelve fallo; no se afirma que la baja esté confirmada. La regresión automatizada pasó, pero esta consulta adicional y el comportamiento de plugins necesitan una prueba Android integral aislada.

**Esto no garantiza que un teléfono previamente asociado a otra cuenta deje de recibir mensajes antiguos.** No se transfieren tokens de titular desconocido ni se resuelve aquí ese flujo heredado. Tampoco se certifica recepción push, permisos Android o entrega en segundo plano. Mantener pendiente el proyecto Firebase separado y la revisión de dispositivos existentes.

## Verificación ejecutada

| Componente | Resultado | Alcance |
| --- | --- | --- |
| Backend SQLite | 99 pruebas correctas | Migraciones en memoria, roles/perfiles, filtros, revocación, auditoría y regresiones |
| PostgreSQL 17 temporal | 8 pruebas correctas | Seis escenarios previos de dispositivos; unicidad del nombre; carrera entre asignación personalizada y registro FCM |
| HTTP local | Un escenario de 26 solicitudes correcto | Login JWT real, rol inicialmente vacío/inactivo, asignación, lectura mínima, prohibición de escritura/usuarios/FCM, revocación con el mismo token, rechazo de refresh y auditoría |
| Web Node | 7 pruebas correctas, en dos ejecuciones de 6 y 1 | Accesos y renderizado de roles/cuentas; no interacción completa en navegador |
| Flutter | 71 pruebas correctas, 2 omitidas por configuración | Servicios simulados, navegación, widgets y regresiones existentes |
| Variantes Flutter | Comprobadas por separado | API aislada válida y rechazo de API incorrecta; en cada variante se omite el caso incompatible |
| Análisis Flutter | Sin problemas en 10 archivos afectados | Archivos de aplicación y pruebas de esta etapa |

La concurrencia PostgreSQL comprueba que asignación y registro FCM no puedan quedar ambos confirmados para la misma cuenta. Es una ejecución de escenarios concretos, no una prueba exhaustiva de todas las carreras, cargas o colaciones Unicode.

El runner HTTP usa SQLite en un directorio temporal, puerto loopback asignado por el sistema en modo `--check`, Firebase deshabilitado y conexiones salientes bloqueadas fuera de loopback. Su salida confirmó cierre del servidor y eliminación de su directorio. PostgreSQL usa otro directorio y servidor temporales, con cierre en `finally`; la ejecución terminó correctamente. No se conectaron a la base habitual.

### Comandos reproducibles

Desde `Condominio-Backend`, con las dependencias locales instaladas:

```powershell
$env:DEBUG='False'
$env:ROLES_PERSONALIZADOS_ACTIVOS='False'
.\env\Scripts\python.exe -B -m administracion.run_migration_smoke
.\env\Scripts\python.exe -B -m administracion.run_roles_postgres_isolated
.\env\Scripts\python.exe -B -m administracion.run_roles_web_isolated --check
```

Estos comandos aplican migraciones solamente dentro de sus bases temporales; no ejecutar `manage.py migrate` en la base habitual como sustituto.

Desde `Condominio-Frontend`:

```powershell
node --test --test-concurrency=1 src/auth/access.test.js src/pages/rol/RolList.test.js
node --test src/components/CuentaPerfil.test.js
```

Desde `condominio-movil`:

```powershell
flutter test --no-pub --reporter expanded
flutter test --no-pub --reporter expanded test/isolated_environment_test.dart --dart-define=CONDOMINIO_AISLADO=true --dart-define=API_BASE_URL=http://127.0.0.1:18080/api
flutter test --no-pub --reporter expanded test/isolated_environment_test.dart --dart-define=CONDOMINIO_AISLADO=true --dart-define=API_BASE_URL=http://127.0.0.1:8000/api
flutter analyze --no-pub lib/main.dart lib/pages/login_page.dart lib/pages/perfil_page.dart lib/pages/visitas_operativas_page.dart lib/security/access_policy.dart lib/security/protected_route.dart lib/services/fcm_service.dart lib/services/visitas_operativas_service.dart test/perfil_roles_test.dart test/visitas_operativas_test.dart
```

La última prueba de configuración utiliza deliberadamente una dirección incorrecta para verificar su rechazo; no conecta a ese servidor. No se instaló un APK ni se ejecutó el nuevo flujo en un teléfono o emulador.

### Problemas encontrados durante la verificación

- En la preparación anterior se corrigieron una expresión Dart inválida, el uso de `override_settings` sobre `unittest.TestCase` y una identidad ficticia demasiado larga para PostgreSQL.
- En esta continuación se corrigió un import del runner HTTP y se fijó explícitamente `DEBUG=False` y los interruptores de notificaciones del runner PostgreSQL para no heredar configuración ambiental inválida.
- El sandbox impidió iniciar PostgreSQL y leer dependencias web, y Flutter quedó sin salida. Se detuvieron las ejecuciones bloqueadas y las repeticiones con acceso autorizado al entorno local terminaron correctamente. No se debilitaron controles de la aplicación.
- Django avisó que falta `staticfiles/` en el entorno temporal; no impidió probar la API. Build/lint web pertenecen a la etapa anterior y no se presentan como una nueva compilación aquí.

## Pendiente: prueba visual web

La herramienta de navegador no estuvo disponible: `The browser access host is unavailable`. En el intento previo, Computer Use detuvo la operación porque no pudo verificar la URL de Windows. En esta continuación solo se comprobó disponibilidad; no se intentó eludir ese control. La prueba HTTP no reemplaza la interacción de React con la API ni la revisión visual.

Cuando el acceso esté disponible, usar exclusivamente el servidor ficticio `administracion.run_roles_web_isolated` y un Vite separado en `127.0.0.1:5178`, con `VITE_API_URL=http://127.0.0.1:18081/api/` fijado en la terminal de esa prueba. El runner expone solo rutas necesarias para roles y visitas; otras pantallas pueden fallar por diseño. Sus credenciales son ficticias, definidas en el script; no usar cuentas reales ni guardar contraseñas en el navegador.

Recorrido pendiente:

1. Entrar con el administrador ficticio y abrir `/admin/roles`; comprobar cuatro roles predeterminados protegidos y sección personalizada.
2. Crear un rol y comprobar que esté inactivo y sin permisos; activarlo y asignarlo al empleado ficticio compatible.
3. Entrar con ese empleado en una sesión separada; comprobar que no tenga visitas, seguridad ni gestión administrativa.
4. Habilitar consulta de visitas y recargar el perfil; verificar lista sin botones de edición ni datos de identidad.
5. Revocar la capacidad y actualizar la consulta; verificar rechazo. Desactivar el rol y comprobar rechazo de sesión/refresh.
6. Detener ambos servidores y comprobar limpieza de la base temporal.

La siguiente etapa funcional necesita aprobación expresa. La activación persistente requiere identificar entorno, validar una copia y comprobar respaldo antes de aprobar migraciones/activación; esta verificación no las autoriza.
