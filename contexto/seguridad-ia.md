# Seguridad inteligente

Actualización: 2026-10-31. La [auditoría del 29 de octubre](../documentacion/auditorias/Auditoria_tecnica_seguridad_IA_condominio.docx) propuso YOLO. La orientación posterior solicitada es **evaluar e integrar RF-DETR Nano**. Ninguno está integrado como procesador continuo en el código revisado. No instalar modelos o dependencias en una etapa meramente documental.

## Existente

Desde 2026-11-05 hay una vista local Imou por RTSP: `imou_local.py` mantiene
imágenes JPEG en memoria fuera de Django; una pasarela autenticada las entrega
a React para administrador/guardia en la misma laptop. Se abre bajo demanda
y libera por inactividad. La webcam existente se conserva. El usuario confirmó
haber probado la vista y mostró detecciones en ella. Se puede activar RF-DETR
en un panel separado; posteriormente confirmó una alerta móvil desde la Imou.
No hay grabación de video. [Alcance](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

La vista Imou permite dibujar en el fotograma analizado una zona temporal,
oculta por defecto, y estimar permanencia para marcar posibles vehículos
detenidos en rojo. En la etapa inicial no creaba eventos; las pruebas de zona
fueron simuladas y su validación real sigue pendiente. [Detalle](../documentacion/seguridad/ZONA_IMOU_TEMPORAL.md).

Tras aprobación posterior, el operador puede activar registro desde la Imou:
la página utiliza la API manual existente y la distribución a guardias. No es
vigilancia autónoma. El usuario confirmó la entrega móvil de una detección
real de Imou. Posteriormente se añadió una imagen privada del fotograma para
eventos nuevos; falta probar esa evidencia en sesiones reales web y móvil.
[Detalle](../documentacion/seguridad/EVIDENCIA_IMOU.md).

La prueba inicial RF-DETR está organizada en
`Condominio-Backend/seguridad_vision/` y se ejecuta en un entorno independiente
del de Django. Detectó objetos en fotogramas de un video público; ahora puede
procesar el archivo completo y guardar una copia anotada. No constituye todavía
el servicio final de cámaras ni una integración de detecciones con alertas.
Ver [informe](../documentacion/seguridad/PRUEBA_INICIAL_RFDETR.md).

Existe ahora una prueba de cámara local iniciada voluntariamente desde la web
con inferencia en un proceso separado. Está limitada al mismo equipo y el
usuario confirmó que ve la cámara y los recuadros; no es el servicio de cámaras final.
[Informe inicial](../documentacion/seguridad/CAMARA_LOCAL_DEMOSTRACION.md).

La prueba de cámara ahora permite una zona temporal, oculta por defecto tras
dibujarla, y recuadro rojo ante posible permanencia. Si el operador habilita
el registro, la página usa la API manual existente para crear un evento.
No guarda la zona ni evidencia y no es ingesta autónoma; el seguimiento se
reinicia con muestras demasiado separadas. [Detalle](../documentacion/seguridad/REGISTRO_CAMARA_DEMOSTRACION.md).

La web también permite seleccionar un archivo de video y analizar muestras
con ese mismo procesador local. El archivo completo no se almacena en el
servidor y no se generan alertas. Tras el análisis se pueden comparar el
original y una vista anotada sincronizada, con recuadros por muestras que
pueden no coincidir exactamente con objetos en movimiento.
Ver [informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

Desde el 2026-11-04 se puede dibujar una zona temporal en el video seleccionado
y estimar permanencias de vehículos con seguimiento sencillo en el navegador.
Si el operador activa la opción, la página registra eventos mediante la API
existente. La zona no se guarda y la integración operativa de cámara sigue
pendiente. [Detalle](../documentacion/seguridad/REGISTRO_AUTOMATICO_VIDEO.md).

Un resultado de video puede preparar el formulario de evento manual; el usuario
revisa y envía voluntariamente. El envío usa el flujo existente, que distribuye
avisos a guardias, y no constituye ingesta automática de IA ni adjunta video.
[Detalle](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

La opción automática para video utiliza también la API manual: conserva el actor
humano y describe su procedencia, pero no es una ingesta autenticada del
trabajador de IA. Puede haber duplicados entre ejecuciones o tras perder una
identidad temporal. [Informe](../documentacion/seguridad/REGISTRO_AUTOMATICO_VIDEO.md).

La reproducción del video público fijo fue retirada a petición del usuario
el 2026-11-02. La prueba histórica sigue documentada en el
[informe web](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

Plate Recognizer procesa fotografías de matrículas y persiste `LecturaPlaca`; Luxand realiza reconocimiento/enrolamiento facial en nube. Se conservan esos flujos. Los eventos, notificaciones internas e historial permiten registrar y revisar hechos manuales; la API de creación existente no constituye una ingestión autenticada de IA. Los campos textuales de cámara/ubicación no son modelos de cámaras ni permisos sobre ellas.

## Estrategia solicitada, aún por implementar

- Servicio local independiente de las peticiones Django. Webcam USB inicial, arquitectura de 1 a N fuentes y futuras cámaras IP por RTSP.
- Seguimiento y estado separados por cámara; reconexión, identificación de fuente y control de carga. Evaluar video grabado para demostración reproducible.
- Personas, vehículos, perros y gatos solo si esas clases existen en los pesos elegidos. Verificar taxonomía antes de prometer otras detecciones.
- Convertir detecciones en eventos relevantes mediante reglas, tiempos y deduplicación; no transmitir cada fotograma al backend ni convertir automáticamente una detección en multa.
- Evidencia privada con permisos, trazabilidad y retención; confirmar incidencias mediante revisión humana.
- Inferencia local sin internet tras preparar dependencias y pesos. Cola local y sincronización posterior con identificadores estables, reintentos e idempotencia: diseño pendiente.

```mermaid
flowchart LR
  U[USB / video de demostración] -. previsto .-> T[Trabajador local RF-DETR Nano]
  R[Cámaras IP RTSP futuras] -. previsto .-> T
  T -. por diseñar .-> C[Seguimiento y reglas por cámara]
  C -. previsto .-> Q[Eventos y evidencia local pendientes]
  Q -. contrato autenticado pendiente .-> B[API Django]
  B --> G[Bandeja de guardias]
  G --> V[Revisión humana]
  V --> A[Aviso de incidencia confirmada al administrador]
```

La operación offline se refiere al trabajador futuro. Luxand, Plate Recognizer Cloud, FCM y otros proveedores actuales necesitan internet. Un backend en nube tampoco estará disponible durante una caída de conexión local.

Antes de seleccionar ejecución CPU/GPU o exportación, medir hardware real, RAM/VRAM, FPS, latencia, consumo y número de cámaras. No se verificaron aquí el equipo objetivo, rendimiento, licencia de código/pesos, compatibilidad de exportadores ni costes de proveedores. Estas comprobaciones pertenecen a una etapa autorizada de evaluación, con fuentes oficiales vigentes.
