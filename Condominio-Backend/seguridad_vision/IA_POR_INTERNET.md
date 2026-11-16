# Procesador de IA por internet

El selector de la web admite **IA local** y **IA por internet**. La opción de internet requiere desplegar un servicio propio compatible: este repositorio no incluye una cuenta, dirección pública ni servidor contratado. Hasta configurarlo, la opción local continúa funcionando.

El servicio preparado es `camara_remota.py`. Ejecuta RF-DETR Nano con el mismo formato de detecciones que `camara_local.py`, sin guardar imágenes. Usa el mismo entorno de visión, las mismas versiones y los mismos pesos que la instalación local. El servidor debe tener previamente Python y las dependencias de visión instaladas, y el archivo de pesos en `seguridad_vision/recursos/cache_roboflow/rf-detr-nano.pth`. El servicio trabaja sin descargar modelos al iniciarse.

Como referencia, el entorno local inspeccionado utiliza `rfdetr==1.11.2`, PyTorch 2.9.1 y torchvision 0.24.1 para CPU, OpenCV headless 5.0.0.93, NumPy 2.5.4 y Pillow 13.0.0. La compatibilidad de estas versiones con el sistema y la GPU del servidor debe comprobarse al prepararlo; no se ha preparado ni probado ese entorno remoto.

## Configuración del servidor remoto

1. Prepara un servidor propio con los recursos de visión y pesos compatibles. No copies `.env` ni credenciales de la PC.
2. Define una variable privada `VISION_REMOTA_TOKEN` con un valor aleatorio de 32 a 128 caracteres alfanuméricos, guiones o guiones bajos. Genera una clave nueva y consérvala fuera de Git.
3. Ejecuta `camara_remota.py` con el entorno de visión y esa variable. Opcionalmente configura `VISION_REMOTA_PUERTO` (por defecto 28767) y `VISION_REMOTA_DISPOSITIVO` (`cpu` o `cuda`, si el servidor dispone de CUDA compatible).
4. El proceso escucha únicamente en `127.0.0.1` del servidor remoto. Configura un proxy inverso con **HTTPS y certificado válido**, que reenvíe `/estado` y `/detectar` al puerto local del servicio. Restringe el acceso a Django cuando sea posible. No publiques el puerto HTTP interno ni registres cuerpos o cabeceras de autorización.

## Configuración de Django

En el `.env` privado de `Condominio-Backend`, establece `VISION_REMOTA_URL` como URL base HTTPS del proxy y `VISION_REMOTA_TOKEN` con la misma clave privada del servicio. Reinicia Django. No compartas esos valores ni los incluyas en Git.

En **Cámaras → Configuración de incidencias → Procesador de IA**, selecciona **IA por internet** y pulsa **Aplicar cambio**. El sistema comprueba la conexión antes de cambiar. La elección corresponde a la pestaña; al aplicar se recarga y se detienen las vistas. Elige **IA local** para volver, con el procesador local en ejecución.

El servicio remoto debe responder al contrato `condominio-vision-v1`: `GET /estado` devuelve `disponible`, `contrato` y `modelo`; `POST /detectar` recibe JPEG y devuelve `detecciones` con `clase`, `confianza` y `caja`. Ambas solicitudes usan `Authorization: Bearer <token>`. Django exige HTTPS, no sigue redirecciones y limita las respuestas.

## Límites

- La conexión remota envía fotogramas al servidor configurado y puede generar costos y retrasos. La cámara y el navegador todavía consumen recursos para capturar y mostrar video.
- No hay cambio automático a local si falla internet. La vista de análisis debe permanecer activa; los procesos independientes de monitoreo no cambian mediante este selector.
- Las reglas y zonas se conservan, pero la velocidad y el resultado real dependen del servidor, la red, los pesos y la versión del modelo. Un video guardado conserva su advertencia: puede generar avisos reales.
- El servicio, TLS, tamaño de máquina, capacidad concurrente, recuperación y disponibilidad deben probarse en el servidor elegido antes de usarlo para vigilancia real. No se han medido latencia ni recursos en un despliegue remoto.

Referencia oficial de la arquitectura y licencia: [RF-DETR de Roboflow](https://github.com/roboflow/rf-detr).
# Roboflow alojado

En el `.env` privado de `Condominio-Backend` configura `VISION_REMOTA_PROVEEDOR=roboflow` y `ROBOFLOW_API_KEY=` seguido de la clave privada. Reinicia Django y selecciona IA por internet. La clave nunca se envía al navegador. La comprobación inicial solo verifica que existe una clave: la conexión y los permisos se comprueban con la primera imagen. `VISION_REMOTA_PROVEEDOR=propio` conserva el servicio descrito abajo. No hay alternativa automática local.

Cada análisis envía un fotograma a Roboflow y puede consumir créditos. Las reglas permanecen en la vista web. El servicio alojado y la entrega de alertas no se han validado con una cuenta real en esta etapa.

