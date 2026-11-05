# Primera conexión local Imou

## Alineación de vistas Imou — 2026-11-05

El usuario mostró la cámara Imou con recuadros de IA y solicitó alinear las
imágenes. Se ubicaron controles y mensajes sobre la comparación y se empleó
una cuadrícula que alinea las dos imágenes a la misma altura y ancho en
pantallas grandes. En pantallas estrechas se muestran una debajo de otra.
La captura confirma visualización de la interfaz con detecciones; no valida
precisión ni rendimiento sostenido. No se alteró la cámara, la inferencia ni
el registro de eventos.

Comprobaciones: build y lint del frontend correctos; Edge con API e imágenes
simuladas verificó posición y tamaño iguales en 1440 px, disposición vertical
en 600 px, inicio y detención de IA/cámara y manejo de errores. No se abrió la
cámara real durante esta comprobación; falta la revisión visual del usuario.

## Detecciones locales para Imou — 2026-11-05

El usuario confirmó haber probado la vista y aprobó conectar RF-DETR Nano a la
Imou. En la misma sección, tras iniciar la cámara, **Activar IA en Imou** envía
muestras mediante la API autenticada `vision-camara/analizar/` existente al
procesador local de RF-DETR. No se agregan endpoints ni permisos. El usuario
puede detener la IA sin detener la cámara, o detener toda la vista.

Se muestra la imagen normal en directo y, a su lado, un panel de análisis. Cada
recuadro se dibuja sobre el mismo fotograma enviado al modelo: es una vista
retrasada, no recuadros en el último fotograma en vivo. Una solicitud de
análisis como máximo está activa por visor; espera 500 ms después del resultado
y toma la imagen más reciente, descartando intermedias. La velocidad depende de
la CPU y de otros usuarios que compartan procesador. Se cancela la solicitud y se
oculta el resultado al detener la IA, la cámara, desmontar o cambiar de pestaña.
Un error detiene la IA y conserva la vista de cámara siempre que esta siga activa.

Se reutilizan la autorización y límites existentes para administrador/guardia
y conexión local. Sin cambios de backend, webcam, móvil, configuración de la
cámara, base de datos, dependencias, zonas, eventos o avisos. Imágenes en
memoria, sin grabación. El sistema no funciona aún como vigilancia autónoma:
requiere servicios iniciados, sesión y página visible. El análisis puede ir más
lento que la cámara; una detección no constituye una infracción.

Verificado: compilación y lint del frontend correctos; Edge con cámara y API
simuladas comprobó inicio voluntario, recuadro verde en la misma imagen,
detención de IA sin detener video, error de IA con video intacto, cámara sin
consultas tras detener y cero eventos. Se obtuvo un fotograma real por el
puente Imou y se envió directamente al procesador local: respuesta correcta,
cero detecciones y 0,3 segundos de comunicación más inferencia en esa muestra;
ninguna imagen guardada ni evento creado. La muestra no verifica precisión,
identificación de objetos ni rendimiento sostenido. La interfaz final con la
sesión real del usuario y objetos reales sigue pendiente de confirmación.

Fecha: 2026-11-05. Alcance autorizado: preparar y probar el acceso local a la
Imou Bullet 2E IPC-K3DN-3H0WF adquirida por el usuario, preservando Imou Life y
la webcam existente. La preparación inicial se amplió después a la vista web y
al análisis local, según las etapas que se documentan a continuación.

## Etapa posterior aprobada: visualización web — 2026-11-05

El usuario aprobó incorporar la vista a la web. Se añadió `imou_local.py`, un
proceso independiente de Django/RF-DETR que lee RTSP solo bajo demanda,
mantiene el último JPEG en memoria y comparte una conexión entre espectadores.
Escucha exclusivamente en 127.0.0.1:18766 con token efímero guardado en recursos
ignorados. Credenciales RTSP únicamente en el archivo privado del servidor.
No hay ruta para que el navegador elija IP/URL arbitraria.

`POST /api/vision-imou/fotograma/` exige sesión, rol efectivo administrador o
guardia y cliente local, igual que la demostración de webcam. Responde JPEG
(200), inicio pendiente (202) o servicio no disponible (503), sin detalles
privados, con no-store y límite de un MiB. Cada consulta vuelve a comprobar
autorización. Esta restricción local no es válida como política de producción
detrás de proxies; tampoco sustituye futuras asignaciones por cámara.

`CamaraImou.jsx` ofrece inicio voluntario, detención y ampliación. Hace una
consulta a la vez, usa URLs Blob temporales, cancela al desmontar/ocultar pestaña,
oculta la imagen ante fallo y permite reinicio manual. Máximo aproximado de
cinco imágenes por segundo, según red y equipo; no son 25/30 FPS ni hay audio.
No se instaló ninguna dependencia, se migró base ni se alteró la webcam/móvil.
RF-DETR y alertas no están conectados a esta fuente todavía.

Tras cuatro segundos sin peticiones, el lector libera la cámara; una lectura
pendiente puede añadir hasta dos segundos. Con otros espectadores activos se
mantiene la conexión compartida. El proceso queda disponible sin abrir RTSP
hasta una nueva solicitud. No tiene arranque automático de Windows.

Validación:

- Siete pruebas Django (cuatro nuevas de permisos/pasarela y tres de webcam)
  correctas, sin base de datos ni conexión a cámara en esas pruebas.
- Dos pruebas del lector con fuente ficticia: apertura bajo demanda,
  cierre por inactividad y fallo sin imágenes.
- Build React correcto; advertencia de tamaño de bundle existente. Lint de
  los dos módulos nuevos/modificados de vista/API correcto.
- Edge con API/imágenes ficticias: inicio voluntario, imagen decodificada,
  cese de solicitudes y ocultación al detener, error/reintento disponible y
  botón de webcam conservado. No prueba una sesión real.
- Puente real: petición sin token 403, Django sin sesión 401, tres JPEG reales
  recibidos desde la Imou sin guardarlos. Después se comprobó ausencia de
  conexión RTSP activa por inactividad, con el puente aún escuchando.
- Primer arranque falló por opciones incompatibles del socket en Windows;
  corregido con `allow_reuse_address=False`. El segundo arranque funcionó.

El puente se dejó iniciado en segundo plano (PID de escucha observado 11328; no asumir
que permanece válido en otra sesión). Log genérico ignorado en
`recursos/imou_local.log`. Pendiente que el usuario confirme la imagen en su
sesión web, ampliación y coexistencia con Imou Life. No hubo grabaciones,
inferencias, eventos o envíos FCM en esta etapa.

## Resultado observado

Resultado posterior 2026-11-05: con autorización explícita, se corrigió la clave
del archivo privado a partir de la etiqueta física aportada por el usuario.
El lector terminó con código 0 y decodificó un fotograma de 640 x 480 píxeles
del flujo secundario por Wi-Fi. Se cerró la conexión sin guardar imágenes ni
generar avisos. Git confirmó que el archivo privado continúa ignorado.
Esto resuelve el fallo de autenticación anterior; falta visualización web,
análisis con IA e integración operativa. No se cambió configuración de Imou.

Actualización 2026-11-05: el usuario completó la clave local y autorizó probar
por Wi-Fi. `probar_imou.py` no abrió video. Diagnóstico posterior DESCRIBE:
401 sin credenciales y 401 tras un intento Digest autenticado con la cuenta
configurada `admin`. Clave presente y sin comillas externas, sin imprimirla.
Pendiente verificar usuario/clave local vigentes; no se repiten intentos ni
se cambia la clave del dispositivo. No se decodificó ni guardó imagen.

El usuario confirmó imagen en Imou Life. La cámara respondió a ping; fuera del
entorno restringido se comprobaron TCP 80 y 554 accesibles y respuesta
`RTSP/1.0 401 Unauthorized` a OPTIONS sin credenciales. Esto confirma un
servicio RTSP que requiere autenticación, no una lectura de video.
Las primeras conclusiones de puertos cerrados fueron incorrectas: las pruebas
estaban bloqueadas por el entorno del agente (`SocketError.AccessDenied`).
No se cambió TLS, Wi-Fi, firmware ni configuración del router.

## Conexión física

Conectar RJ45 entre cámara y puerto LAN del mismo router de la laptop, usando
también su adaptador de corriente. La laptop puede permanecer por Wi-Fi.
Revisar la nueva dirección en clientes DHCP: Ethernet puede tener otra IP.
No asumir alimentación PoE ni abrir puertos del router a Internet.
La conexión directa cámara-laptop no es el procedimiento de esta etapa.

Referencia: [ficha oficial Bullet 2E 3 MP](https://static-website.imou.com/63df00c4-3f26-44a5-82d2-0d946431342c.pdf),
que especifica Ethernet, ONVIF y alimentación DC 12 V.

## Preparación local

`Condominio-Backend/seguridad_vision/recursos/imou.local.ini` contiene IP,
puerto, usuario, clave y flujo. La clave se deja vacía para que el usuario la
complete localmente; no se usa la contraseña de Django ni la cuenta de la app.
El usuario inicial `admin` y la ruta `/cam/realmonitor?channel=1&subtype=1`
son candidatos a comprobar, no valores autenticados en esta unidad.
El directorio recursos está excluido de Git, comprobado con `git check-ignore`.
El archivo local no es cifrado ni debe publicarse, adjuntarse o copiarse a informes.

Desde la raíz:

```powershell
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\probar_imou.py
```

El diagnóstico usa OpenCV instalado, valida una IP privada IPv4 y credenciales
no vacías, intenta decodificar un fotograma y cierra la conexión. No guarda
imagen, no ejecuta RF-DETR y no crea eventos ni avisos. El proceso padre limita
la prueba a 20 segundos y descarta stderr nativo para evitar URLs con claves
en errores de FFmpeg. No pasar credenciales por argumentos.

## Verificación y pendientes

Sintaxis y tres comprobaciones locales pasaron: clave vacía rechazada, IP
pública rechazada y caracteres especiales de clave ficticia codificados.
No se contactó la cámara en esas comprobaciones. No se instalaron dependencias.
Pendiente: usuario completa credenciales y confirma IP vigente, luego lectura
real del fotograma y comprobación de continuidad de Imou Life. Ethernet,
visualización web, IA sobre RTSP y simultaneidad no están verificados.

Por separado, el usuario confirmó en conversación que subió un video al
sistema existente y recibió su notificación móvil. No atribuir ese resultado
a la Imou, que aún no alimenta el sistema.
