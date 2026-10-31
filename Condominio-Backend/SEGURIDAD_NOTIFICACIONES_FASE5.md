# Fase 5: notificaciones persistentes de seguridad

> Actualización: las migraciones 0002 y 0003 se aplicaron posteriormente a la base local de desarrollo con aprobación. Los indicadores continúan desactivados. Consulta `PREPARACION_MIGRACIONES_SEGURIDAD.md` para los resultados actuales; el estado descrito abajo corresponde a la fase inicial.

> Nota posterior: la selección ambigua de la señal de expensas descrita en la auditoría se corrigió; consulta `SEGURIDAD_AVISOS_EXPENSAS.md` para el comportamiento y sus límites actuales.

## Estado

El código está preparado y probado exclusivamente con SQLite en memoria. Se generó la migración `seguridad_IA/migrations/0002_eventoseguridad_historialeventoseguridad_and_more.py` y se aplicó correctamente en una base temporal en memoria; **no se ha aplicado a la base de datos del proyecto y la funcionalidad está desactivada por defecto.** Con `NOTIFICACIONES_SEGURIDAD_ACTIVAS=False`, los endpoints nuevos devuelven 503 y las incidencias manuales anteriores conservan su comportamiento. No activar hasta que el esquema haya sido revisado, aprobado y aplicado en la base correspondiente.

## Auditoría de lo existente

`finanzas/signals.py` envía FCM directamente al crear una expensa o un objeto perdido. Esas notificaciones no tienen historial persistente ni seguimiento de lectura o entrega. El cálculo del destinatario de expensa usa el primer contrato activo y puede ser ambiguo si hay varios contratos; el objeto perdido se difunde a todos los dispositivos. No se han alterado esos flujos. `FCMDevice` registra dispositivos, no eventos ni mensajes persistentes. `LecturaPlaca` registra lecturas, pero no constituye por sí sola un evento revisado.

## Implementación preparada

Se añaden modelos separados para eventos de seguridad, notificaciones individuales e historial. Los eventos tienen UUID, origen, categoría, fecha, ubicación opcional y estado. Una incidencia confirmada se vincula a la tabla `incidente` existente sin modificar sus columnas. Un identificador UUID repetido con los mismos datos no genera otro evento; si los datos difieren, se rechaza. Agrupar cuadros de video en un episodio sigue siendo responsabilidad de la futura integración de visión; esta fase no procesa video.

Al registrar un evento manual pendiente, se calculan los usuarios activos cuyo rol efectivo es guardia y se crea una notificación por destinatario. La restricción única por evento, destinatario y tipo impide duplicados en la base. Si no hay guardias, el evento sigue pendiente y se marca `sin_guardias`; el administrador puede consultar esta situación y reintentar manualmente la distribución. No se ha definido escalamiento automático ni un proceso programado de reintentos.

Solo un guardia activo confirma o descarta un evento; el descarte requiere motivo. La confirmación crea una sola incidencia y notificaciones internas para los administradores activos dentro de una misma transacción. La incidencia pasa por confirmada, en atención y resuelta, con observaciones y actor en el historial. El guardia que registra una incidencia desde el endpoint existente la deja identificada como manual confirmada, sin una segunda revisión. No se crea ninguna sanción automática.

El historial de notificaciones es individual y solo se muestra al destinatario que conserve el rol efectivo correspondiente. El administrador puede consultar eventos e historial de revisión. Los residentes no acceden a estos endpoints. Los mensajes de notificación son genéricos: los detalles se consultan mediante el endpoint protegido del evento. El estado de lectura se registra de forma idempotente. No se registran datos biométricos en el mensaje.

La interfaz web incorpora una lista de notificaciones para guardias y administradores, revisión por guardia, seguimiento y reintento manual por el administrador. La lista se carga al abrir la página; no hay actualización en tiempo real. No hay integración todavía con Flutter ni enlace protegido a evidencia, pues no existe todavía ese subsistema.

## API preparada

- `GET/POST /api/eventos-seguridad/`: lista y creación manual; la creación requiere un UUID proporcionado por el cliente para idempotencia. La API no acepta producir eventos de IA; una integración futura deberá utilizar un contrato autenticado y generar un UUID estable por episodio.
- `GET /api/eventos-seguridad/{uuid}/` y `GET .../historial/`: detalle e historial para guardias y administradores.
- `POST .../confirmar/`, `POST .../descartar/`, `POST .../atender/` y `POST .../resolver/`: transiciones controladas para guardias. Descartar requiere `motivo`; resolver requiere `observacion`.
- `POST .../redistribuir/`: reintento manual para administrador mientras el evento esté pendiente.
- `GET /api/notificaciones-seguridad/` y `POST /api/notificaciones-seguridad/{uuid}/leer/`: historial propio y lectura.

## Entrega móvil pendiente

En esta fase la notificación interna persistente y su lectura están implementadas, pero **no hay todavía estado de entrega FCM, cola de salida, registro de fallos ni reintento automático push**. La fase 6 debe diseñar e implementar entrega por dispositivo y reintentos, sin afectar la notificación interna. No se ha enviado ningún mensaje real ni se ha incluido un proveedor nuevo. Cuando se habilite, la app móvil necesitará integración con la API y el canal push.

## Cambios de esquema propuestos y aprobación

La migración generada crearía tres tablas nuevas: `seguridad_IA_eventoseguridad`, `seguridad_IA_notificacionseguridad` y `seguridad_IA_historialeventoseguridad`, con sus claves foráneas, unicidad de notificación y vínculo uno a uno opcional con una incidencia existente. Sus operaciones son tres `CreateModel`; no incluyen eliminación ni modificación de tablas existentes. Inicialmente las tablas estarían vacías. Las referencias protegidas impedirían borrar usuarios, incidencias o eventos referenciados sin una política de conservación. Se revisó el SQL generado para SQLite sin ejecutarlo; sigue pendiente revisar el historial y el SQL correspondientes a la base de datos objetivo, además de posibles tablas o restricciones homónimas.

Antes de aplicar cualquier migración: identificar la base de datos objetivo y su historial, realizar un respaldo verificable (por ejemplo, `pg_dump` para PostgreSQL) y probar la restauración o un procedimiento de recuperación en un entorno de prueba. Probar primero sobre una copia no productiva, revisar SQL, restricciones y compatibilidad; mantener la funcionalidad desactivada hasta que la migración y las verificaciones terminen correctamente. No ejecutar en producción. La aplicación requiere una autorización separada y la identificación de la base de datos.

## Verificación y limitaciones

Pruebas en SQLite aislado: roles, todos los guardias activos, usuarios inactivos, residentes excluidos, idempotencia, falta de guardias y reintento manual, confirmación, descarte con motivo, lectura propia, transiciones y rollback transaccional ante error. No se ha verificado la concurrencia real de `select_for_update` en PostgreSQL ni el comportamiento de una migración sobre bases existentes. El sistema actual no tiene flujo automático para el caso de cero administradores activos. Las alertas técnicas de cámaras y trabajadores requieren una política de destinatarios separada, que no se ha inventado.

Comandos de prueba: `.\env\Scripts\python.exe -B -m administracion.run_access_tests`, `.\env\Scripts\python.exe -B -m administracion.run_migration_smoke`, `manage.py check`, `node --test src/auth/access.test.js`, ESLint de los archivos frontend de esta fase y `npm run build`. La segunda prueba fuerza SQLite en memoria, aplica las migraciones en esa base desechable, verifica las tablas y ejecuta las 36 pruebas de acceso. Las pruebas simulan los proveedores y no usan datos reales.

## Archivos

Creados: `seguridad_IA/notificaciones.py`, `seguridad_IA/api_notificaciones.py`, `seguridad_IA/migrations/0002_eventoseguridad_historialeventoseguridad_and_more.py`, `administracion/run_migration_smoke.py`, `src/api/notificacionesApi.js`, `src/pages/NotificacionesPage.jsx` y este informe. Modificados: `seguridad_IA/models.py`, `seguridad_IA/urls.py`, `condominioBACK/settings.py`, `.env.example`, `residencial/viewsVehiculo.py`, `administracion/tests_access.py`, `src/auth/access.js`, `src/auth/access.test.js`, `src/routers/AppRouter.jsx` y `src/components/sidebar.jsx`. No se han eliminado archivos.
