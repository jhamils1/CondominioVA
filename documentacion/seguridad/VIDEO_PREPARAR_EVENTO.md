# Preparar un evento manual desde un resultado de video — 2026-11-04

La pantalla permite elegir «Preparar evento manual» en un resultado de
permanencia. Completa categoría y descripción en el formulario existente,
indicando que procede de video, el minuto aproximado, que la fecha y
ubicación de grabación no están verificadas y que no se adjunta el video.
No se sobrescribe un formulario con datos ni un envío pendiente. Preparar el
formulario no escribe en Django ni crea avisos.

El usuario decide si envía el formulario. El endpoint existente registra el
evento como MANUAL, pendiente de revisión; usa la fecha de envío como fecha
del evento, no como fecha confirmada de grabación. Registra el actor y crea
notificaciones internas para guardias activos; si la cola FCM está activada,
puede encolar entregas. El registro no confirma una incidencia. El aviso al
administrador corresponde a la confirmación por guardia. Este flujo no
constituye ingesta automática autenticada del servicio IA, no adjunta
evidencia ni garantiza deduplicación entre análisis o reenvíos diferentes.

No se enviaron eventos ni se usaron dispositivos al implementar el cambio.
Build del frontend y siete pruebas Node de las reglas existentes pasaron;
no se probó el nuevo recorrido interactivo ni una entrega real. No se cambió
backend, configuración o base de datos. Vite mostró el aviso de tamaño previo.

## Prueba posterior con el usuario — 2026-11-04

El usuario envió un evento preparado desde el video. Se comprobó que está
pendiente de revisión y tiene notificación interna para `guardia_prueba`.
La única entrega pendiente correspondía a esa cuenta. Un primer intento de
procesamiento falló con `ERROR_ENVIO`; un segundo intento con acceso de red
quedó en estado `ENVIADA`. Ese estado indica aceptación por Firebase, no
confirma por sí mismo recepción en el teléfono. Falta confirmación del usuario.
Se procesó un lote único; no se dejó un procesador continuo iniciado.

El usuario confirmó posteriormente que vio la notificación en el teléfono.
