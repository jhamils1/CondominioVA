# Evidencia del evento Imou

Fecha: 2026-11-05. Tras confirmar el usuario que una detección real avisó al
teléfono, aprobó guardar una imagen para revisión. Esta etapa agrega una sola
imagen al evento de la Imou y permite verla en web y móvil.

## Almacenamiento y flujo

El navegador conserva el JPEG exacto analizado que disparó el umbral y lo
envía junto al evento por `POST /api/eventos-seguridad/` como multipart. Se
usa el flujo existente de eventos manuales y el UUID estable en reintentos;
los demás clientes pueden seguir enviando JSON sin evidencia. El JPEG es la
imagen original del fotograma, **sin los recuadros gráficos**, aunque el
evento describe el hallazgo. No se guardan video ni la zona dibujada.

El backend valida que sea JPEG válido de hasta 1 MiB y 1280 píxeles por lado;
lo decodifica y vuelve a codificar eliminando EXIF y otros metadatos. Guarda
los bytes y su SHA-256 en la tabla `EvidenciaEventoSeguridad` de PostgreSQL,
no en `MEDIA_ROOT` ni en una URL pública. El evento, la evidencia, las
notificaciones internas y la cola se confirman en una única transacción. Si
falla el guardado se revierte el evento y sus avisos. Un reintento con el mismo
UUID y la misma evidencia es idempotente; con una imagen distinta se rechaza.

El serializer incluye `evidencia_disponible` sin incluir bytes en las listas.
La descarga usa `GET /api/eventos-seguridad/{id}/evidencia/`, exige sesión y
rol efectivo administrador o guardia, y responde JPEG sin caché con
`nosniff`. Propietarios, inquilinos, usuarios inactivos y anónimos no pueden
descargarla. Esta etapa aplica la política actual para operadores de seguridad;
la autorización específica por cámara sigue pendiente. No existe API para
alterar o borrar evidencias. No se suben imágenes a Firebase ni al chat.

La web carga la imagen autenticada en el detalle de Eventos y de Notificaciones
y libera la URL temporal al cerrar. Flutter la carga con su token en Alertas de
seguridad → detalle del evento, con error/reintento y sin guardar archivo;
los eventos anteriores sin evidencia siguen mostrándose. Es necesario recargar
la aplicación móvil para ejecutar el código nuevo. La imagen puede contener
datos personales: la base de datos y sus respaldos deben protegerse. Aún no hay
política de retención, borrado, cuotas ni almacenamiento externo; el crecimiento
de la base es un pendiente antes de producción.

Continúan las limitaciones de la etapa anterior: registro optativo, navegador y
servicios activos, zona temporal, revisión humana, posibles duplicados tras
pérdida de seguimiento y dependencia de Firebase/procesador para push. Una
notificación no garantiza que el guardia la haya recibido. La evidencia no
atribuye identidad o responsabilidad.

## Migración y respaldo local

Se verificó que la configuración utilizada corresponde a PostgreSQL local;
el plan contenía únicamente `seguridad_IA.0004_evidenciaeventoseguridad`, que
crea una tabla nueva. Antes de aplicarla se generó un respaldo en
`Condominio-Backend/backups_locales/`, ignorado por Git. `pg_restore --list`
verificó la estructura del archivo; no se ha probado una restauración completa.
La migración se probó previamente en SQLite en memoria, se aplicó en PostgreSQL
local y `showmigrations` y `manage.py check` confirmaron su estado. No se borraron
datos ni modificó Firebase.

## Comprobaciones

- Cinco pruebas Django sobre SQLite en memoria: evidencia válida, permisos,
  eliminación de metadatos, reintento, rechazo por cambio de imagen,
  transacción ante fallo, compatibilidad y cola existente. Se amplió luego la
  comprobación de rechazo a usuarios inactivos y archivos inválidos/grandes;
  las tres pruebas afectadas pasaron nuevamente. Un error 500 fue inyectado
  intencionalmente para verificar reversión y no es un fallo del resultado.
- Edge con cámara/API simuladas verificó que el evento y su reintento transportan
  exactamente el mismo JPEG, que la web abre una evidencia autenticada y que el
  flujo de webcam anterior continúa. Sin acceder a cámaras, base o Firebase.
- Nueve pruebas Flutter con servicio simulado, incluida carga de imagen y error
  con reintento; `flutter analyze` no informó problemas. Sin instalar una nueva
  versión en el teléfono ni enviar avisos reales durante esta etapa.
- Build y lint frontend correctos; la compilación conserva la advertencia de
  tamaño del paquete. El backend local aplicó la migración y la descarga sin
  sesión respondió 401. Falta comprobar un nuevo evento de la Imou y la imagen
  en la sesión web y móvil reales del usuario.
- PostgreSQL local guardó y devolvió un JPEG ficticio dentro de una transacción
  revertida; se comprobó que no quedaron evento ni evidencia y no se crearon
  notificaciones. No es una prueba de restauración del respaldo.
