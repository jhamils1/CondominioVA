# Análisis de video seleccionado en la web — 2026-11-02

## Revisión de posible repetición — 2026-11-05

El usuario informó que su video parece repetirse. Su captura mostró 67 de 67
imágenes analizadas y un evento registrado. En una prueba de Edge con un video
sintético de tres segundos y API simulada se analizaron seis muestras; tras
reproducir hasta el final, ambos videos quedaron detenidos y el número de
solicitudes de análisis siguió en seis. La prueba se repite mediante
`node e2e/video_fin_simulado.mjs` después del build. No se reprodujo el problema
en ese caso sintético y no se examinó el archivo del usuario; sigue pendiente
identificar si se refiere al análisis, a la reproducción o al contenido.

Se agregó la opción «Analizar un video desde un archivo» en eventos de
seguridad. El usuario selecciona un archivo local de hasta 250 MB y cinco
minutos, en un formato que pueda reproducir su navegador. El navegador lee el
archivo localmente y envía una imagen cada 0,5 segundos a la pasarela
autenticada de demostración existente; el procesador RF-DETR local devuelve
las detecciones y se muestran en pantalla. Solo hay una solicitud en curso
por análisis y puede detenerse desde la página.

No se envía ni guarda el archivo completo en el servidor. La opción no genera
un video anotado descargable, evidencias, eventos ni alertas. Se comparte el
procesador de la cámara, por lo que conviene detenerla antes de analizar.
Los controles de seguridad y límites de despliegue del procesador son los
descritos en [cámara local](CAMARA_LOCAL_DEMOSTRACION.md).

Se compiló el frontend correctamente. Una prueba de navegador Edge simuló
autenticación y respuestas de IA, seleccionó el video público de 3,5 segundos
y comprobó siete imágenes analizadas y el lienzo visible. La API fue simulada
en ese recorrido; la inferencia real del procesador se comprobó en la etapa
anterior con una imagen pública. Falta validación manual del usuario con un
archivo propio y medir rendimiento. No se crearon datos persistentes ni avisos.

## Comparación y reproducción posterior — 2026-11-02

El usuario mostró una captura de un archivo de aproximadamente dos minutos
con 243 de 243 muestras analizadas y reportó lentitud. La interfaz ahora
coloca el original y el resultado lado a lado. Al terminar, se puede reproducir
el original y el lienzo dibuja el mismo fotograma junto con los recuadros de
la muestra correspondiente, sin volver a ejecutar inferencia. La posición
de los recuadros puede ser imprecisa entre muestras: no hay seguimiento
continuo ni detección en todos los fotogramas. Los resultados se guardan solo
en la memoria de la página y se pierden al cambiar de archivo o recargar.

Se compiló la web y se probó en Edge la selección del video público, el
análisis de siete muestras con API simulada, la reproducción y el cambio de
posición del video. No se hizo la prueba con un nuevo archivo real del usuario.

## Controles en la vista analizada — 2026-11-02

El usuario compartió una captura donde se ven ambas vistas y pidió controles
en la vista analizada. Se añadieron reproducción, pausa, barra de posición,
silencio y pantalla completa. Las dos vistas siguen usando el mismo reproductor:
una acción en cualquiera de ellas controla la reproducción compartida. Los
controles de la vista analizada aparecen cuando termina el análisis. La vista
es un lienzo sincronizado, no un archivo de video nuevo.

La compilación de frontend terminó correctamente. En Edge headless, con la API
de detección simulada y un video público, se comprobaron reproducción, pausa,
desplazamiento con ratón y teclado, sonido y entrada y salida de pantalla
completa. No se probó esta versión con la sesión real del usuario. El aviso de
tamaño del paquete de Vite continúa presente.

## Reproductor con controles dentro del video — 2026-11-02

El usuario aclaró que deseaba controles dentro de la imagen, como los del
reproductor original. La vista analizada ahora usa un elemento de video con
controles nativos del navegador y un lienzo transparente encima para las
detecciones. Ambas vistas sincronizan reproducción, pausa y posición. La
ampliación de la vista analizada se activa con el botón situado dentro de
ella, arriba a la derecha, para conservar visibles los recuadros; la salida se
hace con el mismo botón o Escape. Sigue sin generarse un archivo anotado.

Tras corregir una primera falla en la sincronización de los controles nativos,
se probaron en Edge headless el botón nativo de reproducción y pausa, el
desplazamiento con la barra nativa, la sincronización, la ampliación y la
visibilidad de la capa de detecciones. La inferencia estaba simulada y se usó
el video público. La compilación pasó, con el aviso de tamaño de paquete. No
se ha verificado esta versión en la sesión real del usuario.
