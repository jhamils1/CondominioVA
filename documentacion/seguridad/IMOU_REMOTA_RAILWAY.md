# Imou local con interfaz en Railway

## Alcance

La cámara permanece conectada a la PC por Ethernet. El backend local consulta el catálogo local y entrega fotogramas al procesador de visión local; el túnel HTTPS permite al backend de Railway solicitarlos. Las credenciales RTSP y la dirección de la cámara no se envían a Railway. La interfaz de Railway permite ver la imagen, analizarla y registrar eventos en la base de Railway. El acceso remoto está limitado a administradores autenticados.

La PC, el backend local de loopback, el puente Imou, la IA local, el túnel y la cámara deben estar activos. Si la dirección de la cámara cambia, debe actualizarse en el catálogo local. El catálogo y los eventos locales y de Railway son independientes.

## Configuración

- En el backend Railway se usa el túnel existente `VISION_PC_URL` y su secreto `VISION_PC_TOKEN`. No copiar su contenido a este documento ni al repositorio.
- `IMOU_REMOTA_ACTIVA=True` habilita el acceso remoto. Su valor predeterminado es `False`. No ejecutar migraciones para esta función.
- El backend local escucha solo en `127.0.0.1:8000`, el puente Imou en `127.0.0.1:28766` y la IA/túnel en `127.0.0.1:28767`. La exclusión del monitor usa el puerto local `28769`.
- `iniciar-imou-pc.ps1` prepara el backend y el puente sin abrir el video. El iniciador de visión/ngrok lo supervisa junto a la IA; no debe detener procesos desconocidos si sus puertos ya están ocupados.
- Mantener la inspección de ngrok desactivada para no guardar imágenes o cabeceras. El acceso al túnel requiere la clave existente.

## Exclusión y recuperación

Cada vista remota solicita el control de la fuente física. Solo un titular puede analizar y registrar eventos; la exclusión impide iniciar el monitor independiente local mientras la vista conserva el control. La liberación espera a que terminen las operaciones de registro en curso. Si el proceso se interrumpe, una marca local conserva el bloqueo para evitar dos registros simultáneos.

Si se cierra una pestaña sin liberar el control, el administrador puede usar **Liberar control anterior**. Esta operación puede detener el análisis de otra sesión y no libera un evento en curso. Una marca con operaciones pendientes o contenido inválido se mantiene bloqueada; debe investigarse el estado del servicio y de Railway antes de una recuperación manual. No borrar la marca mientras pueda estar guardándose una incidencia.

## Límites y pruebas

La vista remota espera 0,5 segundos entre solicitudes completadas; la inferencia también consume solicitudes y transferencia del túnel. Consultar los [límites vigentes de ngrok](https://ngrok.com/docs/pricing-limits) y detener la vista al terminar. Si la conexión produce intervalos entre muestras superiores a los admitidos por el seguimiento, no se confirma permanencia; un túnel lento puede impedir detecciones. El procesamiento sigue dependiendo de la PC y de la conexión a internet; no es monitoreo autónomo sin navegador.

Se verificaron el puente local con un fotograma real, el rechazo de claves incorrectas, exclusión y transporte simulado, pruebas aisladas de backend y navegador. La validación final desde Railway, el registro de una incidencia y la recepción en el móvil deben anotarse únicamente después de comprobarlos en el entorno desplegado. No se ha probado un reinicio completo de Windows para esta ampliación.
