# Bandeja móvil de alertas de seguridad

## Funcionalidad

La app Flutter incorpora una opción **Alertas de seguridad** para guardias y administradores. La navegación vuelve a consultar el perfil mediante la ruta protegida existente; propietario, inquilino y roles desconocidos quedan excluidos. Django continúa siendo la autoridad de permisos y filtra las notificaciones por destinatario y tipo.

La bandeja consulta `GET /api/notificaciones-seguridad/`. Al abrir una alerta obtiene su evento con `GET /api/eventos-seguridad/{id}/` y marca la notificación como leída con `POST /api/notificaciones-seguridad/{id}/leer/`. El detalle muestra categoría, descripción, estado y fecha. Se validan identificadores y datos recibidos; si falla la autorización o la consulta, se ocultan los datos previos y se permite reintentar. La API actual devuelve una lista completa sin paginación; si cambiara a un formato paginado, la app informa de respuesta inválida en lugar de mostrar una lista parcial como completa.

La lista se consulta al abrir o actualizar la pantalla. El administrador recibe su historial de confirmaciones y el guardia su historial de avisos de revisión, conforme al contrato existente. La bandeja no permite confirmar, descartar o resolver incidencias; esos controles siguen disponibles en la web y su incorporación móvil requiere otra etapa.

## Pruebas y límites

Pasaron 24 pruebas Flutter de la bandeja, rutas protegidas, menú por rol y consulta de perfil, usando HTTP y perfiles simulados. Cubren acceso de los cuatro roles, listado, detalle, lectura, respuestas inválidas, autorización denegada, sesión vencida, servicio desactivado y desconexión. `flutter analyze --no-pub` sobre los archivos integrados y la prueba nueva terminó sin observaciones. No se instalaron paquetes ni se modificó la base.

La aplicación no se ha compilado ni probado en un teléfono físico durante esta etapa. La URL del backend móvil continúa configurada en código y debe corresponder al entorno del dispositivo; el servidor de prueba ligado a `127.0.0.1:8001` solo es accesible desde el equipo que lo ejecuta. La apertura desde push y el registro de dispositivos se prepararon en etapas posteriores; consulta `SEGURIDAD_APERTURA_PUSH_MOVIL.md` y `SEGURIDAD_DISPOSITIVOS_MOVIL.md`. La cola operativa y la recepción real en Firebase siguen pendientes. No se activó FCM ni se enviaron mensajes reales.
