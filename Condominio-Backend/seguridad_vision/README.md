# Prueba local de RF-DETR Nano

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
