# Rediseño del centro de seguridad

Fecha: 2026-11-05.

La ruta existente de eventos presenta las cámaras, los controles y los eventos en una interfaz de tonos oscuros. Se conservaron las rutas, los menús y las operaciones existentes. La vista muestra evidencia fotográfica únicamente cuando el evento ya dispone de ella; no crea ni reproduce grabaciones.

El botón **Configuración de análisis** agrupa la zona y sus ajustes, así como el análisis de videos cargados. Al regresar al monitoreo se conservan el estado y la zona mientras la cámara siga activa; detener la cámara o abandonar la página los restablece como antes. Las cámaras elegidas siguen funcionando al cambiar de fuente hasta que se detienen. Una tarea de análisis de video iniciada también puede continuar mientras se muestra el monitoreo.

La cámara Imou y su IA tienen controles separados. La cámara de laptop inicia la IA junto a la cámara como anteriormente, pero ahora también permite detenerla y volver a activarla sin detener la transmisión. Las detecciones se dibujan sobre el fotograma analizado; su frecuencia depende del procesador local.

Actualización 2026-11-05: al activar la IA de Imou, tanto en monitoreo como en configuración se muestra una sola imagen: el fotograma analizado ocupa el lugar de la imagen directa. Al detener la IA vuelve la imagen directa; dibujar la zona sigue disponible en configuración. Verificado con Imou y API simuladas, también a ancho reducido; no se ha vuelto a probar con la cámara física.

No se alteraron backend, aplicaciones móviles, Firebase, mecanismos de notificación ni el almacenamiento de eventos o evidencia. La presentación del formulario manual y la revisión de eventos permanecen disponibles en pestañas.

## Verificación y límites

- `npm run build` y ESLint de los archivos React modificados: correctos. Vite informa que el paquete JavaScript supera 500 kB.
- Recorridos automatizados con cámara, imagen, eventos y API simulados: Imou, webcam y archivo de video. Se comprobaron zona, envío fallido y reintento; además se verificó que detener la IA no detiene la cámara y que cambiar de vista conserva la configuración.
- Se revisó una captura visual con imágenes simuladas; el cuadro negro corresponde a la fuente ficticia utilizada en esa prueba.
- No se ejecutó en esta etapa una prueba con cámara física, dispositivos reales, base de datos o notificaciones reales. La verificación del nuevo diseño y del flujo real con el usuario queda pendiente.
