# Protección propuesta de procedencia FCM — etapa aislada

**Actualización 2026-11-01:** existe una [corrección experimental de la carrera](CORRECCION_CARRERA_FCM_AISLADA.md) solo en la copia aislada. El archivo `.patch` de este informe permanece desactualizado y no debe aplicarse.

Fecha: 2026-10-31 (America/La_Paz). El usuario aprobó implementar y probar la protección en un entorno aislado, sin migrar la base habitual ni activar envíos.

Actualización posterior: se ejecutó una [validación real aislada](PRUEBA_VALIDACION_FCM_REAL_AISLADA.md) y se corrigió la clasificación de identificadores inválidos en la propuesta; el backend habitual continúa sin modificar.

**Bloqueo posterior:** la [revisión de tiempos y cierre](REVISION_TRANSICION_FCM_TIEMPOS_RESPALDO.md) reprodujo dos carreras que pueden dejar un dispositivo activo después del logout. No incorporar ni activar este parche hasta corregirlas y volver a probarlo.

## Estado y ubicación

La implementación se preparó en `Condominio-Backend/backups_locales/proveniencia_fcm_aislada_20261031/`. Esa carpeta está ignorada por Git y no es un respaldo versionado. El [parche revisable](PROPUESTA_PROCEDENCIA_FCM.patch) contiene los cambios propuestos contra el backend existente; `git apply --check --whitespace=error` lo aceptó sin aplicarlo.

El backend habitual estaba ejecutando `runserver` con recarga automática, por lo que no se sustituyeron sus archivos. Tampoco se cambió `.env`, se aplicó la migración a la base habitual, se modificaron cuentas/dispositivos, se instaló la app habitual ni se habilitaron envíos. El proyecto sigue con los cambios previos sin commit; esta etapa tampoco crea un commit.

## Comportamiento preparado

- `ProcedenciaFCM` enlaza un dispositivo existente con el identificador del proyecto validado y una huella del token. La migración nueva no atribuye proyecto a los dispositivos anteriores: permanecen desconocidos, activos o inactivos según ya estén, y no elegibles para envío hasta una validación posterior. No se guarda el token en la nueva tabla.
- La sincronización comprueba permisos y titularidad, valida el token en el servidor mediante Firebase Admin con `dry_run=True`, comprueba que la aplicación Firebase del servidor coincide con el proyecto configurado y vuelve a verificar cuenta y propiedad dentro de la transacción antes de guardar. Si Firebase rechaza el token o no está disponible, no se cambia la asignación ni se desactiva el dispositivo anterior. Repetir una sincronización exitosa es idempotente.
- Las rutas antiguas genéricas de creación y edición del dispositivo responden con error y no pueden reactivar un registro desconocido. La app Flutter actual utiliza la ruta de sincronización ya existente. Esto es un cambio deliberado de compatibilidad: clientes anteriores que dependan de esas rutas necesitarán actualización o un mecanismo aprobado; no se afirma que todos los clientes existentes ya sean compatibles.
- La cola de seguridad y los envíos existentes de expensas y objetos perdidos seleccionan solamente dispositivos activos cuyo proyecto y huella coinciden. Antes del envío de seguridad se vuelve a comprobar la elegibilidad y se mantienen las comprobaciones de usuario, rol y evento. Sin configuración de procedencia válida se bloquean los registros y envíos; la bandeja interna puede conservarse. Una cola pendiente no se reserva mientras el proyecto no está disponible y una reserva ya tomada se deja vencer para reintento. Con el control activo, un destinatario sin prueba válida se cancela de forma conservadora: revisar entregas previas y su recuperación antes de activar.
- `FCM_PROCEDENCIA_ACTIVA` se propone desactivado por defecto y `FCM_PROYECTO_ID` vacío. Con esa combinación **el código propuesto bloquea los registros nuevos y todos los envíos FCM cubiertos**, incluidos los heredados; no se trata de un modo de compatibilidad. Deben coordinarse código, migración, configuración y clientes antes de aplicarlo en otro entorno.

Firebase documenta que [el modo `dry_run` valida y simula el envío sin entregar el mensaje](https://firebase.google.com/docs/reference/admin/python/firebase_admin.messaging). Es una comprobación del proyecto FCM, no una demostración de quién posee físicamente el teléfono ni de que la instalación sea legítima. La [documentación de Firebase](https://firebase.google.com/docs/reference/admin/java/reference/com/google/firebase/messaging/FirebaseMessaging) indica además que `dryRun` no valida tokens APNs; esta etapa no valida la entrega en iOS. El proyecto y la plataforma declarada por el cliente no deben tratarse como prueba de titularidad.

## Pruebas

- **19 pruebas en PostgreSQL temporal**: 17 funcionales y dos carreras concurrentes entre cuentas; proveedores simulados. Cubren proyecto desconocido o distinto, huella alterada, token ajeno, respuesta perdida/reintento, desactivación de cuenta durante la validación, cambio de titular durante la red, proveedor caído, rutas antiguas, cola, preservación de bandeja, guardia y administrador, y filtros de expensas y objetos. No se conectaron a la base habitual.
- La migración se aplicó, revirtió y volvió a aplicar en ese PostgreSQL temporal. `makemigrations finanzas --check --dry-run` no detectó cambios faltantes en SQLite temporal. Los datos de la instancia temporal se retiraron al terminar.
- **17 pruebas funcionales** pasaron también en SQLite en memoria. Las **100 pruebas de acceso** existentes pasaron en SQLite aislado después de adaptar sus expectativas a las rutas bloqueadas, simular los dispositivos previamente validados y corregir el ejecutor para crear permisos de prueba y fijar indicadores. Esas simulaciones no sustituyen las pruebas de procedencia desconocida, cubiertas por el conjunto nuevo.
- Primera ejecución de regresiones de la copia sin adaptar: 10 fallos y cinco errores, coherentes con expectativas anteriores sobre registro y envío; se adaptaron las pruebas descritas y se reejecutó correctamente. La primera carga del conjunto nuevo también detectó y corrigió un uso incompatible de `override_settings` con `unittest.TestCase`.
- No se realizó una validación real contra FCM en esta etapa: todas las respuestas del proveedor fueron simuladas. El resultado no demuestra la recepción de una notificación ni la migración de teléfonos habituales.

## Antes de incorporar o activar

Revisar el parche y la compatibilidad de cada cliente, incluidos los procesos de envío que puedan existir fuera del repositorio. Evaluar límites de tiempo, reintentos y control de frecuencia: la validación propuesta realiza una petición de red síncrona por sincronización y el cliente actual usa un tiempo de espera de cinco segundos. Probar el servicio real con una app y cuenta ficticias separadas, sin usar registros ajenos; revisar errores FCM, caída de red y reintentos. Después preparar respaldo restaurable, plan de migración y reversión, verificación del servidor y de la cola, actualización gradual y monitoreo. La activación o migración de la base habitual requiere una etapa posterior aprobada.
