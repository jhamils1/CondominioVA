# Revocación inmediata de sesiones

> Actualización: la migración de sesiones se aplicó posteriormente a la base local `condominio` con autorización expresa. El resultado y la copia de seguridad están documentados en `PREPARACION_MIGRACION_SESIONES.md`. Las notas de preparación siguientes describen el estado previo a esa operación.

Cada inicio de sesión crea un registro con identificador aleatorio vinculado al usuario. Este identificador acompaña tanto al token de acceso como al de renovación, incluso después de rotar este último. No se guardan los valores de los tokens en la nueva tabla. El backend verifica que la sesión exista, pertenezca al usuario y no esté revocada, además de las comprobaciones existentes del usuario y su rol.

El cierre exige un token de renovación de la misma sesión y cuenta; marca la sesión revocada y pone el token de renovación en la lista negra en una transacción. Al finalizar el cierre, las solicitudes posteriores que utilicen cualquiera de los tokens de acceso de esa sesión o intenten renovarla se rechazan. Las otras sesiones de la cuenta siguen activas. Una petición que ya haya superado la autenticación antes de la revocación puede terminar; no se cancelan operaciones en curso. El bloqueo por fila coordina las operaciones de renovación y cierre cuando la base de datos lo soporta.

Por decisión del usuario, los tokens antiguos sin identificador se rechazan al activar la nueva versión; las personas deben volver a iniciar sesión. Los nombres de los campos de respuesta de inicio y renovación permanecen iguales.

## Migración y operación

Se creó `administracion/migrations/0004_sesionaplicacion.py`: añade una tabla independiente con UUID, usuario, fecha de creación y fecha de revocación. No modifica ni borra registros existentes. Se comprobó la migración exclusivamente en SQLite en memoria; **no se aplicó a la base de datos del proyecto ni a producción**. El backend modificado necesita esa tabla antes de utilizar los endpoints de autenticación. Antes de aplicarla a una base real se debe identificar el entorno, revisar sus migraciones previas, disponer de copia de seguridad y obtener la aprobación específica correspondiente. El despliegue debe coordinar migración y código, y avisar de que las sesiones existentes se cerrarán.

La verificación de sesión consulta la base en las solicitudes autenticadas: si la base no está disponible, no hay acceso y se requiere evaluar el impacto de rendimiento. El registro de sesiones puede crecer con el tiempo; todavía no hay una política ni tarea de limpieza. No se ha probado la coordinación concurrente con PostgreSQL ni en múltiples procesos; SQLite no valida los bloqueos de fila de PostgreSQL. La revocación no desregistra por sí sola dispositivos FCM si falla la solicitud específica del móvil.

## Comprobaciones

Se aplicaron las migraciones en una base SQLite temporal en memoria y pasaron 74 pruebas de backend. Entre ellas: cierre de acceso y renovación, rotación, separación de sesiones de una cuenta, rechazo de token ajeno y rechazo de tokens anteriores sin identificador. `makemigrations --check --dry-run` no detectó cambios faltantes. Los proveedores externos fueron simulados y no se utilizaron credenciales ni datos reales. No se ha ejecutado una prueba de concurrencia PostgreSQL ni una prueba con aplicaciones y servicios reales.
