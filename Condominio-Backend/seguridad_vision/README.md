# Prueba local de RF-DETR Nano

Para la primera comprobación de una cámara Imou por red, consultar
[conexión local Imou](../../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).
`probar_imou.py` solo comprueba un fotograma con credenciales locales; todavía
no incorpora una fuente IP a la web ni al análisis con IA.

## Ver la Imou en la web

Con Django y frontend iniciados, ejecutar desde la raíz:

```powershell
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\imou_local.py
```

En **Seguridad → Eventos e incidencias → Cámara Imou por red**, pulsar
**Ver cámara Imou**. Requiere administrador o guardia y navegador en la misma
laptop que Django. **Detener vista Imou** oculta la imagen y deja de solicitarla.
El puente libera RTSP tras unos segundos sin espectadores. Cambiar de pestaña
detiene la vista; volver no la inicia automáticamente. La webcam se conserva.

Esta vista usa imágenes JPEG actualizadas hasta cinco veces por segundo.
**Activar IA en Imou** analiza muestras en un panel separado con el proceso
`camara_local.py` ya existente. Los recuadros corresponden al fotograma analizado;
el análisis puede ser más lento. No hay audio ni grabación para esta fuente.
El registro de eventos y avisos es opcional y requiere activarlo tras marcar
una zona. Las credenciales permanecen en el archivo local ignorado. Los procesos
se inician manualmente tras reiniciar; Ctrl+C los detiene cuando se ejecutan en
una terminal. Ver alcance y pruebas en
[conexión Imou](../../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

En la vista analizada se puede dibujar una zona temporal de estacionamiento y
marcar en rojo posibles vehículos detenidos. Es orientativo y no guarda la zona.
El registro optativo puede generar eventos y avisos reales; [instrucciones y
límites](../../documentacion/seguridad/REGISTRO_IMOU_LOCAL.md).

Los eventos nuevos de la Imou adjuntan el fotograma analizado como evidencia
protegida en la base de datos. [Consulta, permisos y límites](../../documentacion/seguridad/EVIDENCIA_IMOU.md).

Este directorio forma parte del backend y ejecuta el análisis como proceso
independiente de Django. La prueba de cámara requiere que el usuario la inicie
desde la web; todavía no crea eventos ni envía notificaciones. Los recursos y
el entorno virtual están excluidos de Git; no son una copia de seguridad.

En este equipo Windows se creó `.venv` con Python 3.13, PyTorch 2.9.1 para CPU,
torchvision 0.24.1 para CPU, `rfdetr==1.11.2` y OpenCV headless 5.0.0.93.
Los pesos oficiales se guardan en `recursos/cache_roboflow`. No usar
grabaciones reales sin autorización.

## Procesar el video completo

Desde la raíz del proyecto:

```powershell
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\procesar_video.py --entrada "C:\ruta\a\tu-video.mp4"
```

La copia WebM con recuadros se crea en `salidas/`, con nombre único. El original
no se modifica. La opción `--entrada` es obligatoria;
la salida puede indicarse con `--salida RUTA.webm` o `RUTA.mp4` y no se sobrescribe. La
salida es un archivo de demostración que se puede eliminar. La inferencia se
ejecuta en CPU, fotograma a fotograma, y tarda más que la duración del video
en este equipo. No produce alertas, no reconoce identidades y no decide si hay
una infracción.

## Prueba de cámara local

Esta demostración requiere Django, frontend y navegador en la misma computadora.
En una terminal, desde la raíz, inicia el procesador independiente:

```powershell
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\camara_local.py
```

Cuando indique que está listo, entra como administrador o guardia a **Eventos e
incidencias de seguridad**, pulsa **Iniciar cámara** y acepta el permiso del
navegador. Usa **Detener cámara** para apagarla; esto no cierra el procesador.
Para detener también el procesador ejecutado en la terminal, usa Ctrl+C.

El navegador envía fotogramas JPEG a Django local, que los pasa al procesador
en 127.0.0.1. No se guardan imágenes ni se crean alertas. El servicio solo
acepta conexiones con un token efímero almacenado en `recursos/` (ignorado por
Git). Es una prueba local, no un servicio de cámaras de producción ni una
solución de acceso remoto. La reproducción en vivo depende de la velocidad
de la CPU; el usuario confirmó que vio la cámara y los recuadros.

La misma pantalla permite elegir un video local y analizar una imagen cada
medio segundo. El archivo completo permanece en el navegador; las muestras se
envían a Django y al procesador local. Admite hasta 250 MB y cinco minutos, en
formato compatible con el navegador. No genera video descargable ni alertas.
Conviene detener la cámara antes de analizar un archivo: comparten procesador.
Tras analizarlo, la web muestra el original y la vista anotada lado a lado;
los controles nativos de ambas vistas sincronizan reproducción y posición. La
vista anotada tiene un botón de pantalla completa dentro de la imagen, arriba a
la derecha, para mantener visibles los recuadros. Los recuadros se calculan
cada medio segundo y pueden desplazarse respecto de objetos en movimiento.
