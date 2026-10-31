# Registro y baja de dispositivos móviles

## Cambios

La aplicación sincroniza el dispositivo con `POST /api/devices/sincronizar/` y solicita su baja con `POST /api/devices/desregistrar/`. Ambos requieren autenticación y reciben los identificadores en el cuerpo, sin incluirlos en la URL. El servidor comprueba que los registros existentes pertenezcan al usuario y rechaza la reasignación o baja de un dispositivo de otra cuenta. La sincronización es repetible: activa el identificador nuevo y desactiva el anterior propio dentro de una transacción. Otros dispositivos del mismo usuario permanecen activos. Las rutas anteriores siguen disponibles para compatibilidad; los clientes antiguos que todavía usen identificadores en URL pueden seguir exponiéndolos en sus registros de servidor.

El móvil conserva en almacenamiento seguro el último identificador confirmado y guarda un candidato pendiente antes de enviar el registro. Solo sustituye el confirmado después de recibir respuesta satisfactoria. Si se pierde la respuesta, el cierre intenta dar de baja tanto el anterior como el pendiente. El registro y la baja se serializan en el proceso de la app, y el cierre pausa nuevas altas hasta el próximo inicio de sesión. Si el registro falla, el inicio de sesión continúa y se muestra un aviso. Si la baja no se confirma, se conserva la información necesaria y se advierte al usuario.

En los logs Flutter se dejaron mensajes genéricos: ya no se imprimen títulos, cuerpos ni datos del aviso. No se cambió el contenido de las notificaciones mostradas al usuario.

## Límites importantes

- Si no hay conexión al cerrar sesión, el servidor podría seguir considerando activo un dispositivo. El aviso no equivale a una baja remota y no existe un reintento en segundo plano después de cerrar la sesión. Al volver a entrar con la cuenta propietaria se puede reconciliar; no se ha implementado transferencia automática entre cuentas.
- Los nuevos endpoints deben estar disponibles en el backend antes de usar esta versión de Flutter. No hay migraciones nuevas. La instancia temporal de prueba que se había iniciado con `--noreload` debe reiniciarse para cargar el backend actualizado.
- El manejo de permisos del sistema, rotación real de Firebase, cambios de cuenta, cierre sin conexión y recepción push todavía no se han probado en un dispositivo físico. No se ha hecho una prueba concurrente multiproceso en PostgreSQL. La cola, la navegación al tocar push y el envío real siguen pendientes de las etapas posteriores.
- El identificador pendiente se conserva de forma segura en el teléfono para poder recuperar solicitudes inciertas; no se guarda en el historial de auditoría ni se escribe en logs de la nueva ruta.

## Verificación

Pasaron 77 pruebas del backend en SQLite temporal y 23 pruebas Flutter con solicitudes simuladas. Cubren alta, rotación, reintento, protección de tokens ajenos, baja idempotente, errores de red, respuesta perdida, cambio de sesión y cierre sin dispositivo. El análisis Flutter de los archivos modificados terminó sin observaciones.

Se probó también en la base PostgreSQL local dentro de una transacción revertida, con identificadores ficticios y envío simulado: alta, rotación, repetición, separación de cuentas y baja. No quedaron filas de prueba; las secuencias de PostgreSQL pueden avanzar. No se cambió el esquema, la configuración de Firebase ni se enviaron mensajes reales.
