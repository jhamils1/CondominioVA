# Pruebas adicionales de cierre y dispositivos FCM

**Actualización:** la [revisión posterior](REVISION_BLOQUEOS_CLIENTES_FCM.md) probó tres bloqueos y corrigió una carrera en DELETE heredado, solo en la copia aislada.

Fecha: 2026-11-01 (America/La Paz). Etapa aprobada en copia aislada, sin despliegue.

## Resultados

Al probar una solicitud cuyo token JWT venció durante la espera simulada del proveedor se observó un defecto: la comprobación repetía la hora almacenada al construir el token y aceptaba el registro. La primera prueba terminó con 204 cuando se esperaba 401. Se ajustó la copia para comprobar la hora actual tras la espera de red y después de adquirir los bloqueos relevantes; la prueba pasó. La prueba usa una espera simulada de tres segundos, no una medición de Firebase real. Todavía no se ha probado explícitamente la expiración durante cada bloqueo por separado.

Una prueba de rotación con sesión anterior cerrada encontró que la propuesta rechazaba el identificador nuevo. Se ajustó la copia para permitir la limpieza o rotación de un vínculo cuya sesión ya está revocada. Una prueba separada confirma que se rechaza la rotación cuando el identificador anterior corresponde a otra sesión activa de la misma cuenta. Se mantiene el rechazo de identificadores de otra cuenta. Esto no verifica todas las variantes de reinstalación o dispositivos reales.

Un dispositivo ficticio previo sin procedencia no fue elegible para envío hasta que se simuló una validación satisfactoria del proyecto; tras registrarlo en la sesión y cerrarla quedó inactivo. Se probó una repetición idempotente que representa la pérdida de la respuesta, sin simular una interrupción real de red. Dos solicitudes concurrentes de cierre sobre una misma sesión produjeron un cierre exitoso y un rechazo. Una revocación directa de la sesión durante la validación impidió el registro; no se ensayó una operación administrativa completa de revocación ni la desactivación automática de un dispositivo previamente registrado en ese caso.

## Verificaciones

- 14 pruebas en PostgreSQL temporal con JWT y Firebase simulado, incluidas las siete anteriores; todas pasaron. La migración aislada de procedencia se aplicó, revirtió y reaplicó.
- 19 pruebas de procedencia en otro PostgreSQL temporal y 100 regresiones de acceso en SQLite aislado; todas pasaron. No se usaron cuentas, base, Firebase o dispositivos habituales.
- La primera ejecución del caso de vencimiento falló y permitió identificar el defecto antes de corregirlo. Las pruebas de compatibilidad con sesión cerrada registraron primero el rechazo, que se corrigió; las pruebas finales verifican el comportamiento corregido.

Siguen pendientes la revisión completa del orden de bloqueos, expiración mientras espera cada bloqueo, fallos de red reales, clientes antiguos y iOS, configuración y medición de timeouts, recepción bajo red lenta, y transición y respaldo del servidor efectivo. El [parche previo](PROPUESTA_PROCEDENCIA_FCM.patch) no contiene estos cambios y **no debe aplicarse**. La copia está ignorada por Git; no hay commit ni actualización del sistema habitual.
