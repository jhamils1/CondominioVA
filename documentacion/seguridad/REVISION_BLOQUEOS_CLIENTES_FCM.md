# Revisión aislada de bloqueos, esperas y clientes FCM

Fecha: 2026-11-01 (America/La Paz). Etapa aprobada: revisión y correcciones en copia aislada; sin despliegue.

## Bloqueos y cliente heredado

Se comprobó con PostgreSQL temporal y JWT ficticio que un registro se rechaza si el JWT vence mientras espera, por separado, el bloqueo de sesión, usuario o dispositivo. La validación de Firebase permanece fuera de la transacción. En los flujos examinados de registro, baja y cierre se bloquea primero la sesión, luego el usuario y después el dispositivo; el refresco bloquea la sesión. No se ha demostrado ausencia de interbloqueos en todo el sistema ni con todos los cambios administrativos.

Se reprodujo una carrera de la ruta antigua `DELETE /api/devices/.../`: una baja respondía 204 y una sincronización anterior, retenida en la validación, reactivaba el dispositivo. La primera prueba diagnóstica esperaba esa conducta y pasó al reproducir el defecto. Se modificó solo la copia para que DELETE bloquee sesión y usuario y actualice la versión FCM como las otras bajas. La prueba se invirtió y ahora exige que la sincronización pendiente se rechace y el dispositivo siga inactivo. Otra prueba comprueba que DELETE no retire el dispositivo vinculado a otra sesión activa y que la baja propia repetida responda 204. Esto no prueba todas las versiones antiguas ni las solicitudes DELETE de un dispositivo que todavía no existe.

## Esperas y compatibilidad

El Flutter revisado usa `sincronizar` y `desregistrar` con espera de cinco segundos. El backend inicializa Firebase sin `httpTimeout` explícito; el SDK instalado indica 120 segundos predeterminados y reintentos ante ciertos errores, por lo que esa cifra no garantiza un límite total de toda la operación. La espera agotada en el cliente no cancela necesariamente la operación del servidor. No se cambiaron esos valores ni se midió la red real; hacen falta un límite coordinado y pruebas de disponibilidad antes de establecerlos.

El inicio móvil configura los manejadores después de solicitar permisos, obtener el token y posiblemente sincronizar; una espera en esas operaciones puede retrasar su instalación. Esto es una observación de código, no una demostración de pérdida de avisos. Se debe probar y corregir de forma aislada antes de activar la transición.

La propuesta sigue rechazando las rutas genéricas antiguas de alta y edición que no validan procedencia; una app que dependa de ellas necesitará actualizarse o una transición compatible segura. El código Flutter disponible usa las rutas específicas; una inspección anterior de cadenas de la APK habitual no demuestra las rutas efectivamente ejecutadas. No se verificaron todos los clientes, iOS, una reinstalación ni los datos de personas reales.

## Pruebas y límites

En PostgreSQL temporal se ejecutaron 17 pruebas de cierre, incluido el diagnóstico corregido y tres subcasos de bloqueo; pasaron. Otras 19 pruebas de procedencia PostgreSQL y 100 regresiones SQLite pasaron. Firebase fue simulado; no se enviaron notificaciones ni se usaron teléfono, base o credenciales reales. Las migraciones de la propuesta se ensayaron solo en PostgreSQL temporal. El código y las pruebas siguen en una carpeta ignorada por Git; no existe commit.

La ruta DELETE que intenta dar de baja un identificador aún inexistente responde según el comportamiento heredado de consulta y no instala necesariamente una barrera; la app actual usa `desregistrar`, que sí instala la barrera incluso para un identificador ausente. Falta revisar qué versiones anteriores usan DELETE, el manejo de 404 y su combinación con cierre. También faltan pruebas de expiración durante los bloqueos del propio cierre, operaciones administrativas concurrentes, inicialización con red lenta, tiempos medidos y cambios seguros de entorno.

El [parche anterior](PROPUESTA_PROCEDENCIA_FCM.patch) sigue **desactualizado** y no debe aplicarse. Antes de preparar uno actualizado se deben resolver o aceptar con criterios explícitos los límites pendientes; antes de incorporarlo, identificar servidor y base, realizar respaldo actualizado y acordar transición de clientes. No se modificaron el backend ni la base habituales.
