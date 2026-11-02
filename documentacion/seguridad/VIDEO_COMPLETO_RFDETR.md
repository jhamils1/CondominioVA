# Procesamiento de video de demostración — 2026-11-01

**Nota posterior:** los archivos de muestra citados en este informe fueron
retirados con aprobación del usuario. Se conserva el informe histórico;
ver [retiro](RETIRO_VIDEO_DEMOSTRACION.md).

Se añadió `Condominio-Backend/seguridad_vision/procesar_video.py`, proceso
independiente que lee un video local completo y guarda otro MP4 con recuadros y
etiquetas. No modifica el original ni sobrescribe una salida existente.
Las instrucciones y los parámetros están en el README de seguridad_vision.

La prueba utilizó el [video público de Pexels](https://www.pexels.com/video/a-parking-lot-with-cars-parked-in-it-27668854/)
y el modelo RF-DETR Nano ya instalado. Se procesaron 105 fotogramas a partir
de un video de 30 FPS; la salida mide 540 × 960 píxeles y contiene los 105
fotogramas. La ejecución final tardó 32,4 segundos en CPU incluyendo la carga
del modelo. OpenCV abrió el archivo y leyó su primer fotograma; se revisó
visualmente una versión previa y se mejoró el contraste de las etiquetas.
No se midió la precisión ni se verificó la reproducción con todos los
reproductores. La velocidad no demuestra funcionamiento en tiempo real.

La copia final es `Condominio-Backend/seguridad_vision/salidas/demostracion_20261101_171104_320493.mp4`
y está ignorada por Git. Se retiraron únicamente el video intermedio y la imagen
creados durante esta comprobación; el usuario puede eliminar la copia final tras
su revisión. No se crearon eventos ni notificaciones, no se accedió al teléfono
ni se ejecutó una cámara. No se desconectó la red para probar operación offline.
No hay zona, seguimiento, evidencia privada ni conexión con Django en esta
etapa. El modelo detecta objetos, no infracciones.
