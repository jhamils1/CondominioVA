# Credenciales de cámaras de red — 2026-11-07

El catálogo admite usuario del dispositivo, ruta RTSP y contraseña opcional para
cámaras de red. La contraseña se envía solo al crear/reemplazar y se cifra con
Fernet antes de guardarse. Las respuestas habituales indican únicamente si hay contraseña. Por petición del usuario, un administrador conectado desde este equipo puede solicitar verla explícitamente; la respuesta no se almacena en caché. La Imou vinculada conserva su archivo local como fuente de acceso: el catálogo no cambia su contraseña de conexión.
Puede conservarse, reemplazarse o eliminarse, y la auditoría no guarda su valor.
La ruta admite parámetros habituales pero rechaza URLs completas y nombres de
parámetros evidentes de credenciales. No constituye una garantía para todos los
formatos de fabricantes: no introducir secretos en la ruta.

La clave de cifrado `CAMARAS_CLAVE_CIFRADO` es independiente de `SECRET_KEY`, se
generó en el archivo local `.env` ignorado por Git y no se muestra. No se genera
automáticamente al iniciar: perderla impide descifrar las contraseñas ya guardadas.
Conservar una copia protegida de la clave por separado y restringir el acceso al
archivo. El cifrado protege la base aislada; una persona con acceso a la clave y
a la base puede descifrar. Para despliegue en nube se requiere una estrategia de
secretos, transporte HTTPS, respaldo y rotación antes de usar datos reales.

El administrador gestiona el catálogo; el guardia no recibe credenciales. Se añadió
una prueba puntual de conexión RTSP de cámaras registradas y habilitadas, con
dirección IPv4 privada, puerto y ruta, accesible solo al administrador local.
Utiliza las credenciales cifradas y un proceso separado de corta duración; recibe
los datos por entrada estándar, descarta su salida y comprueba si decodifica un
fotograma. No guarda imágenes ni activa análisis o avisos. La restricción de IP
no sustituye los controles de red o un firewall ante redirecciones del dispositivo.
No se implementó visualización ni análisis de cámaras genéricas; registrar una
cámara no inicia video. La Imou anterior conserva su
archivo local privado; modificar estos nuevos campos no altera esa conexión.
Al editar una Imou vinculada de forma única, el formulario consulta la ruta
derivada del flujo del archivo local y la presenta sin credenciales y en solo
lectura; no copia esa ruta al catálogo al guardar. Es la configuración del
archivo, no una consulta de una conexión que ya pudiera estar abierta.
La prueba usa el catálogo y rechaza direcciones públicas. El límite de
concurrencia es por proceso Django; un despliegue multiproceso necesita control
compartido adicional.

El formulario web ofrece un perfil para Imou Bullet 2E IPC-K3DN-3H0WF que
propone el flujo secundario usado en el proyecto y bloquea su ruta mientras el
perfil esté seleccionado. El modo manual permite otra ruta. La selección no
descubre cámaras ni garantiza compatibilidad: debe probarse la conexión. Al
editar, el perfil se infiere por el modelo exacto y la ruta almacenada; no se
almacena un identificador de perfil. La Imou vinculada al puente continúa
mostrando su propia ruta local y no usa este selector.

La búsqueda opcional usa WS-Discovery ONVIF por multicast IPv4 (4 segundos,
máximo 30 direcciones); no consulta servicios anunciados, no obtiene rutas RTSP
ni transmite credenciales. Solo un administrador conectado localmente puede
solicitarla. Se aceptan respuestas correlacionadas cuya dirección privada
anunciada coincide con la dirección de origen; esto no autentica el dispositivo.
La interfaz solo usa una IP cuando el usuario la selecciona y mantiene el modo
manual. La interfaz de red la elige el sistema operativo: múltiples interfaces,
aislamiento Wi-Fi, firewall o falta de ONVIF pueden impedir el descubrimiento.
El control de concurrencia es por proceso Django. No se probó con cámara física.
Se envía una segunda solicitud con identificador distinto tras un segundo para
reducir el efecto de paquetes perdidos; no garantiza que la cámara responda.
El formulario muestra por separado las cámaras ya registradas y si respondió una
dirección coincidente. Esta comparación por IP no acredita identidad ni estado.
Referencia: [especificación de pruebas ONVIF](https://www.onvif.org/wp-content/uploads/2021/01/ONVIF_Profile_S_Client_Test_Specification_20.12.pdf).

La búsqueda conserva el puerto anunciado solo si el servicio es HTTP y usa la
ruta `/onvif/device_service` que admite el consultor actual; una URL HTTP sin
puerto explícito implica 80. No se asume compatibilidad con HTTPS u otras rutas.
Al seleccionar una IP nueva se propone ese puerto; si no está disponible se
propone 80 sin verificar. Puede cambiarse manualmente. Las cámaras ya registradas
muestran el puerto coincidente sin crear otro registro. La coincidencia de IP no
autentica un dispositivo; solo la consulta exitosa de perfiles verifica el
servicio en ese momento. La respuesta conserva `direcciones` por compatibilidad.

El alta permite consultar perfiles Media 1 ONVIF con IP, puerto ONVIF y
credenciales introducidas en el formulario. El usuario elige un perfil y debe
guardar y probar la cámara; la consulta no registra ni abre video. Se usan
GetCapabilities, GetProfiles y GetStreamUri ([especificación ONVIF Media](https://www.onvif.org/specs/srv/media/ONVIF-Media-Service-Spec.pdf)).
La consulta está limitada a administrador local, IPv4 privada y respuesta de la
misma IP, sin redirecciones ni URL con credenciales; como máximo consulta cuatro
perfiles. Ofrece HTTP Digest y WS-Security UsernameToken Digest para dispositivos
compatibles, sobre HTTP local: no cifra el transporte. No soporta todavía HTTPS,
Media 2 ni otros métodos de autenticación. No se verificó con cámara física.
Validación local posterior, 2026-11-07: la Imou autorizada respondió al
descubrimiento y anunció ONVIF HTTP puerto 80; la consulta autenticada devolvió
dos perfiles, ambos con puerto RTSP 554. Las rutas devueltas utilizan el mismo
camino que la configuración local y canal 1, con flujos 0 y 1; incluyen
parámetros adicionales, por lo que no son cadenas idénticas a la ruta local.
No se abrió video con las rutas devueltas, ni se alteró la cámara, el catálogo o
la configuración. No se exponen credenciales. La consulta se ejecutó fuera del
aislamiento de red tras un intento bloqueado por el sandbox, usando base SQLite
en memoria; el servidor existente no se reinició.

Prueba posterior aprobada por el usuario: ambos perfiles ONVIF de esa Imou
entregaron un fotograma decodificado mediante el lector RTSP separado; los
fotogramas se descartaron en memoria. La acción de API se ejecutó con una
solicitud simulada y rol de administrador simulado contra la cámara real: HTTP
200, dos perfiles, sin clave en respuesta. No equivale a probar autenticación o
el formulario web del usuario. No se creó un registro, se guardaron imágenes ni
se modificó la configuración del dispositivo. Falta recorrido web real.

En el formulario se muestra temporalmente el nombre del perfil ONVIF elegido;
el catálogo guarda la ruta y el puerto, pero aún no guarda el nombre del perfil.
En edición la ruta queda visualmente gris y bloqueada; el administrador puede
habilitar la edición manual de cámaras genéricas. La ruta Imou vinculada sigue
siendo de solo lectura y se obtiene del archivo local del puente.

Se aplicó la migración aditiva `camaras.0002` en PostgreSQL local tras respaldo
`backups_locales/antes_credenciales_camaras_20261107_002703.dump`, cuyo listado
fue verificado (sin restauración de prueba). No se crearon credenciales reales de
cámaras ni se modificó la Imou. Pruebas: 14 casos Django aislados, migraciones
sin cambios pendientes, ESLint, build y recorrido Edge simulado con contraseña
ficticia. Se verificó cifrado, reemplazo, conservación, eliminación, permisos y
que la API no devuelva texto o ciphertext. Sin pruebas con cámara real o Firebase.
