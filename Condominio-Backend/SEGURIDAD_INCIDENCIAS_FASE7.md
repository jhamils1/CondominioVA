# Fase 7: revisión y atención de incidencias

## Alcance

Se reutiliza el modelo `residencial.incidente` existente, vinculado desde `EventoSeguridad`. No se ha incorporado RF-DETR, cámaras, zonas, seguimiento ni procesamiento de video. No se modificó el esquema en esta etapa. Las migraciones anteriores 0002 y 0003 solo se han aplicado en bases temporales de prueba; el módulo continúa desactivado por defecto.

## Flujo y permisos

Un evento puede ser manual o de IA. La API de creación pública solo admite el origen manual; el servicio interno admite un origen IA para una futura integración autenticada y solo se ha probado con datos simulados. El evento comienza pendiente y no crea una incidencia ni multa. Los guardias activos reciben una notificación interna. Un guardia confirma o descarta: el descarte requiere motivo; la confirmación crea una incidencia y notifica a los administradores. No se asignan automáticamente responsables ni multas. La decisión se registra con actor y fecha.

Una incidencia confirmada puede pasar a `EN_ATENCION`, recibir varias actuaciones documentadas y pasar a `RESUELTA` con observación, actor y fecha. Los cambios de estado se comprueban transaccionalmente y se rechazan transiciones inválidas, incluido descartar un evento confirmado. El historial permite consultar las actuaciones anteriores. Propietarios e inquilinos no tienen acceso al detalle ni al historial.

Al editar mediante el endpoint existente una incidencia vinculada, se sincronizan descripción y fecha con el evento y se registra un historial con los valores anteriores y nuevos. Una incidencia con historial de seguridad no se puede eliminar mediante ese endpoint. Si el módulo está desactivado y la tabla de eventos aún no existe, la eliminación responde 503 de forma clara, en lugar de intentar acceder a una tabla inexistente.

La nueva pantalla web **Eventos e incidencias** permite a administradores y guardias consultar todos los eventos y su historial, incluidas las incidencias manuales confirmadas que no producen una notificación de revisión para el guardia. El guardia puede confirmar, descartar, iniciar atención, registrar actuaciones y resolver desde esa pantalla. El administrador supervisa sin revisar por el guardia. La pantalla no está disponible para residentes.

## Evidencias y límites

El proyecto aún no tiene un almacenamiento y endpoint de evidencia de este flujo con autorización y auditoría. No se añadieron URLs públicas ni acceso a archivos; por ello la revisión visual de evidencia queda pendiente y no se debe considerar implementada. También faltan la integración de visión, pruebas en PostgreSQL y pruebas interactivas de interfaz con cuentas reales.

La vinculación ORM de la fase 5 existe en el código aunque su tabla no esté migrada en la base del proyecto. Además del endpoint de eliminación de incidencias controlado en esta fase, es necesario verificar en una copia no productiva posibles eliminaciones en cascada de otros registros relacionados antes de habilitar o desplegar el código. No se han modificado datos reales. Las notificaciones push permanecen desactivadas y la pantalla de eventos mostrará el mensaje de servicio no habilitado mientras la configuración continúe desactivada.

## Pruebas

`administracion.run_migration_smoke` aplica las migraciones únicamente en SQLite en memoria y ejecuta 47 pruebas. Las pruebas incluyen incidencias manuales, historial de ediciones, eliminación protegida, actuaciones múltiples, transiciones inválidas, acceso de residentes denegado, evento de IA simulado sin multa ni responsable y notificación posterior a confirmación. También pasaron las pruebas de reglas de navegación, ESLint de los archivos frontend modificados y `npm run build`. Los servicios externos se simulan. La compilación advierte que el paquete principal supera 500 kB.

## Archivos de la etapa

Creados: `src/pages/EventosSeguridadPage.jsx` y este informe. Modificados: `seguridad_IA/notificaciones.py`, `seguridad_IA/api_notificaciones.py`, `residencial/viewsVehiculo.py`, `administracion/tests_access.py`, `src/api/notificacionesApi.js`, `src/auth/access.js`, `src/auth/access.test.js`, `src/routers/AppRouter.jsx` y `src/components/sidebar.jsx`. No se eliminaron archivos ni se generaron migraciones.
