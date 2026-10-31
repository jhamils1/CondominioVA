# Revisión de recuperación, concurrencia y auditoría de dispositivos

## Cambios y pruebas

Las operaciones tradicionales de creación, edición y baja del endpoint de dispositivos registran los cambios efectivos con actor y descripción genérica, sin el token en el historial. El historial se guarda en la misma transacción y un fallo revierte el cambio. Repetir una operación sin cambios no genera otra entrada. También se bloquea el cambio de token por edición: la rotación debe utilizar `sincronizar`.

Para mantener la reserva de propiedad, la operación tradicional `DELETE` responde 204 y desactiva el registro en vez de borrarlo físicamente. Es un cambio de comportamiento: el registro inactivo permanece consultable para su propietario y no se puede reclamar desde otra cuenta. Estas medidas se aplican a las rutas de la API revisadas; no constituyen auditoría exhaustiva de cambios hechos directamente mediante Django admin, base de datos o procesos externos.

La coordinación móvil rechaza operaciones simultáneas de varias instancias dentro de un mismo isolate de Dart. El bloqueo no se comparte entre isolates, procesos, reinicios ni con clientes antiguos. La prueba ejecutada cubre exclusivamente varias instancias en un isolate simulado.

Se ejecutaron 82 pruebas del backend en SQLite en memoria y 22 pruebas Flutter con servicios simulados; pasaron todas. El análisis estático de cuatro archivos móviles no encontró problemas. No se hicieron cambios en bases reales, registros reales ni dispositivos.

## Invalidación con resultado incierto

La implementación actual persiste el estado incierto antes de solicitar la invalidación y bloquea tanto la repetición automática como el registro de la cuenta nueva. Esta es una detención segura, pero todavía no es una recuperación completa: no hay una acción que desbloquee el estado.

El SDK disponible expone `deleteToken()` para el token actual y `getToken()`, pero no se encontró en esa interfaz una operación atómica que compare e invalide un token específico. La renovación, un reinicio o una respuesta perdida pueden cambiar lo que se observa. Por eso comparar una vez y luego borrar no demuestra por sí solo que se invalide el token pretendido; tampoco basta con obtener un token diferente para demostrar qué ocurrió. No se ha implementado un adaptador real ni se recomienda habilitar este paso hasta resolver y probar esas garantías.

Una ruta de recuperación deberá exigir de nuevo identidad y consentimiento de la cuenta anterior, mantener las bajas verificadas, coordinar la renovación y determinar con evidencia qué token puede invalidarse. Si no se puede comprobar, se mantendrá bloqueado el push de la nueva cuenta y la bandeja interna seguirá disponible. No se debe liberar el registro anterior solo por tener acceso físico al teléfono.

## Concurrencia y pendientes

Las rutas modificadas bloquean primero la fila de la cuenta y luego los dispositivos existentes; la restricción única del modelo evita duplicar un token. Esto necesita pruebas concurrentes en PostgreSQL aislado para verificar carreras entre cuentas y entre rutas. Se detectó un servidor PostgreSQL local, pero no se usó porque no se había establecido una base de pruebas aislada: SQLite no demuestra esos bloqueos.

Las rutas tradicionales identifican el dispositivo por su token en la URL, que podría terminar en registros de infraestructura; el historial de auditoría agregado no lo contiene. Hay que migrar los clientes a rutas que no lo expongan y definir su compatibilidad antes de descontinuarlas. También hay que revisar el ciclo de vida de registros inactivos, cambios fuera de la API y el efecto de permisos de administración sobre el historial.

El almacén seguro sigue sin conectarse a la app. Es necesario probar persistencia y recuperación en un dispositivo de prueba autorizado y definir serialización compartida; no se ha validado la escritura atómica ni el bloqueo entre procesos. Ninguna de estas pruebas autoriza modificar el registro actual de Patricia ni enviar push reales.
