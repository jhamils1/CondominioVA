# Estado actual

2026-11-07: configuraciones de zonas independientes para cámaras adicionales, sin IA ni alertas; migración local aditiva aplicada con respaldo, Imou preservada. [Detalle](../documentacion/seguridad/ZONAS_CAMARAS_CATALOGO.md).

2026-11-07: selección y vista RTSP para cámaras adicionales activas, con puente independiente de Imou y permisos locales de operador; falta validación con segunda cámara física. [Detalle](../documentacion/seguridad/MONITOR_CAMARAS_CATALOGO.md).

2026-11-07: ajustada tolerancia a interrupciones para reducir avisos Imou repetidos; pruebas simuladas correctas, falta prueba real. [Detalle](../documentacion/seguridad/AVISOS_REPETIDOS_IMOU.md).

2026-11-07: puente con acceso a red y catálogo vinculado entregó un fotograma real por Wi-Fi a Django; falta confirmación en navegador y prueba Ethernet. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: vínculo Imou con catálogo activado y puente actualizado reiniciado; consulta real quedó conectando, sin fotograma confirmado. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: preparado el vínculo persistente del monitor Imou con el catálogo; migración local aplicada con respaldo. La cámara aún no está vinculada y el puente requiere reinicio. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: prueba directa Ethernet exitosa con PC 192.168.1.107/24 y cámara candidata 192.168.1.108; serial ONVIF coincide en sus cuatro últimos caracteres y dos perfiles RTSP entregaron fotogramas por Ethernet. El proyecto todavía puede apuntar a Wi-Fi; no se probó sin Wi-Fi de cámara. [Detalle](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-07: el usuario configuró Ethernet PC 192.168.77.1/24; la app Imou no encontró cámaras locales y ARP muestra una candidata 192.168.1.108 por Ethernet, identidad no confirmada. Se propuso probar PC en la misma subred; pendiente. [Detalle](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-07: Ethernet conectado, consulta ONVIF por esa interfaz sin respuesta; captura temporal observó DHCP DISCOVER con prefijo de fabricante coincidente, pero MAC distinta al Wi-Fi y sin identificar dispositivo. Sin cambios de IP, DHCP o cámara. [Diagnóstico](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-07: ambos perfiles ONVIF de Imou real devolvieron fotogramas decodificados sin guardarlos. Vista API con usuario/rol simulados contra cámara real devolvió dos perfiles; formulario web con sesión real aún no se probó. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: prueba autorizada de Imou real: descubrimiento ONVIF anunció puerto 80 y consulta autenticada devolvió dos perfiles RTSP puerto 554. Rutas con parámetros adicionales; no se probó video con ellas ni se cambió configuración. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: el formulario muestra el nombre del perfil ONVIF seleccionado mientras se registra la cámara. Guarda ruta y puerto; el nombre del perfil aún no se conserva para la edición posterior. Prueba web simulada correcta. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: búsqueda ONVIF propone puerto HTTP anunciado compatible al seleccionar IP; si falta, propone 80 sin verificar. Conserva entrada manual y muestra puertos de registros coincidentes. Pruebas simuladas correctas; falta prueba real. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: alta de cámara consulta perfiles ONVIF Media 1 y propone ruta/puerto RTSP; elección y guardado explícitos. Edición de ruta gris y bloqueada por defecto. Pruebas simuladas correctas; sin validar cámara real ni soporte HTTPS/Media 2. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: búsqueda ONVIF reintenta una vez y muestra cámaras registradas separadas de respuestas de red; coincidencia por IP no certifica identidad. Usuario observó respuestas intermitentes; causa sin confirmar y cambios aún sin prueba en su red. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: búsqueda opcional de dispositivos ONVIF por WS-Discovery, solo administrador local, ofrece IP seleccionable y conserva entrada manual; no obtiene ruta RTSP ni autentica dispositivos. Pruebas simuladas correctas, falta prueba con cámara real. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: selector web sugiere la ruta de flujo secundario para Imou Bullet 2E IPC-K3DN-3H0WF y permite modo manual. No hay descubrimiento automático ni garantías para otras cámaras; pruebas web simuladas correctas. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: edición de Imou vinculada muestra en solo lectura la ruta RTSP calculada desde su configuración local, sin credenciales; no modifica el puente ni la ruta guardada en catálogo. Pruebas simuladas correctas; falta revisión visual del usuario. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: prueba puntual RTSP para cámaras de red registradas, mediante proceso separado y solo administrador local; no inicia monitoreo ni altera Imou. Pruebas simuladas correctas; pendiente prueba con otra cámara y soporte de video en monitor. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: formulario de c?maras permite mostrar u ocultar la contrase?a introducida y consultar expl?citamente la guardada como administrador desde el equipo local; usuario de Imou se obtiene de su configuraci?n local. La conexi?n Imou no se modifica. Pruebas simuladas correctas; falta revisi?n visual por el usuario. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: catálogo admite credenciales de dispositivos cifradas con clave local independiente; migración aditiva aplicada tras respaldo. No conecta cámaras genéricas ni cambia la Imou. Pruebas aisladas correctas; falta conexión RTSP segura. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: menús laterales accesibles mediante teclado; verificación simulada de navegación, roles y revisión del guardia correcta. Faltan revisión visual real y capacidades de cámara descritas en el plan. [Detalle](../documentacion/seguridad/MENU_MONITOR_CAMARAS.md).

2026-11-06: menú Cámaras con Monitor en vivo para administrador/guardia y Gestión solo administrador; Eventos e incidencias bajo Seguridad solo en web administrativa. Guardia conserva revisión en monitor y API. Pruebas simuladas correctas; falta revisión del usuario y aclarar tercer submenú mencionado. [Detalle](../documentacion/seguridad/MENU_MONITOR_CAMARAS.md).

2026-11-06: corregida comprobación Imou para consultar mientras conecta. Usuario confirmó video en eventos y el puente devolvió JPEG real; falta confirmar botón en su pantalla. Habilitar en catálogo no controla monitor. [Detalle](../documentacion/seguridad/VINCULO_IMOU_CATALOGO.md).

2026-11-06: catálogo reconoce Imou local por IP/puerto y permite agregarla o probarla mediante el puente, solo administrador local. Pruebas simuladas correctas; puente real devolvió 503 y RTSP no respondió, integración física pendiente. [Detalle](../documentacion/seguridad/VINCULO_IMOU_CATALOGO.md).

2026-11-06: catálogo administrativo de cámaras creado (registro, edición y deshabilitación), API y menú web; no conecta ni almacena credenciales. Migración aditiva aplicada en PostgreSQL local tras respaldo verificable. Pruebas aisladas correctas; falta revisión del usuario y aprobación de etapa de conexión. [Plan](../documentacion/seguridad/PLAN_CAMARAS_Y_AVISOS_RESIDENTES.md).

2026-11-05: monitor Imou fuera del navegador implementado como comando local; reutiliza cámara/IA, configuración compartida, eventos, evidencia y cola FCM. Exclusión evita registros web simultáneos. Pruebas aisladas correctas; falta prueba real y arranque automático. [Detalle](../documentacion/seguridad/MONITOREO_IMOU_INDEPENDIENTE.md).

2026-11-05: conexión directa Imou–PC por Ethernet en investigación. Un dispositivo de fabricante coincidente solicitó la IP temporal ofrecida por Npcap; no respondió ping ni RTSP. No se cambió la configuración. [Detalle](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-05: guardado automático de zona, tiempo y avisos Imou; cancelar conserva configuración, eliminar exige confirmación y desactiva avisos, fallo pausa y ofrece reintento. Pruebas simuladas correctas; falta prueba real del usuario. Sustituye el flujo manual de guardado descrito abajo. [Detalle](../documentacion/seguridad/GUARDADO_AUTOMATICO_ZONA_IMOU.md).

2026-11-05: ante ausencia de eventos Imou se comprobó que no había zona persistida; 24 entregas existentes figuraban enviadas. Se aclaró el guardado obligatorio y se muestra el estado real de registro en monitoreo. Verificación simulada correcta; falta guardar configuración y comprobar evento real. [Detalle](../documentacion/seguridad/REGISTRO_IMOU_CONFIGURACION_PENDIENTE.md).

2026-11-05: tolerancia breve de pérdidas de detección habilitada solo para Imou, sin contar tiempo ausente ni repetir el aviso al recuperar la pista. Añadidos contador amarillo, punto inferior y diagnóstico de muestreo. Trece pruebas Node, recorrido simulado, build y lint correctos; pendiente maqueta real. [Detalle](../documentacion/seguridad/ESTABILIDAD_SEGUIMIENTO_IMOU.md).

2026-11-05: zona Imou compartida persistida; administrador configura zona, tiempo y registro, guardia consulta sin modificar. Migración aditiva aplicada en PostgreSQL local tras respaldo legible; pruebas simuladas correctas. Falta comprobación real. [Detalle](../documentacion/seguridad/ZONA_IMOU_COMPARTIDA.md).

2026-11-05: ajustada la vista Imou para mostrar un único panel con IA también en configuración; detener IA conserva la imagen directa. Verificación simulada correcta; falta revisión con cámara real. [Detalle](../documentacion/seguridad/REDISENO_CENTRO_SEGURIDAD.md).

2026-11-05: rediseñada la vista web de monitoreo, con configuración de análisis separada, evidencia fotográfica existente y controles independientes de cámara e IA. Build, ESLint y recorridos simulados correctos; falta comprobación visual con equipos reales. [Detalle](../documentacion/seguridad/REDISENO_CENTRO_SEGURIDAD.md).

2026-11-05: usuario confirmó flujo real Imou → rojo → notificación móvil. Se implementó evidencia JPEG privada para eventos nuevos, vista autenticada web/móvil y migración aditiva PostgreSQL local con respaldo estructuralmente verificado. Pruebas Django/Edge/Flutter correctas; falta recargar Flutter y comprobar evidencia real. [Informe](../documentacion/seguridad/EVIDENCIA_IMOU.md).

2026-11-05: registro automático optativo Imou conectado a API manual y avisos a guardias; sin evidencia ni vigilancia autónoma. Diez pruebas Node, cuatro Django en SQLite en memoria, dos recorridos Edge simulados, build y lint correctos. Procesador FCM continuo detectado activo; falta prueba real de Imou y recepción móvil. [Informe](../documentacion/seguridad/REGISTRO_IMOU_LOCAL.md).

2026-11-05: zona temporal para Imou implementada sobre la imagen analizada; permanencia configurable y recuadro rojo, sin eventos ni notificaciones. Ocho pruebas de reglas, interfaz simulada, build y lint correctos. Falta prueba del usuario con cámara y maqueta. [Informe](../documentacion/seguridad/ZONA_IMOU_TEMPORAL.md).

2026-11-05: usuario mostró Imou con recuadros de IA. Se alinearon las vistas y se colocaron controles arriba; en pantalla estrecha se apilan. Build, lint y pruebas de interfaz simulada correctos; falta revisión visual del usuario. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: IA local optativa añadida a la vista Imou, en panel separado con el fotograma exacto analizado. El usuario confirmó haber probado la vista anterior; la nueva interfaz aún requiere su comprobación con objetos. Un fotograma real recibió respuesta de IA sin detecciones. Sin zona, eventos ni alertas de la Imou en esta etapa. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: añadida vista Imou en web, con inicio/detención/ampliación y puente RTSP separado, local y autenticado. Nueve pruebas Python, build/lint y prueba Edge simulada correctos; tres JPEG reales recibidos. Puente iniciado; falta confirmación del usuario en su sesión web. Webcam conservada, sin IA/alertas para Imou aún. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: conexión Imou por Wi-Fi comprobada tras corregir la clave local con autorización. Decodificado un fotograma de 640 x 480 del flujo secundario; conexión cerrada sin grabaciones ni alertas. Falta incorporar la fuente IP a la web/IA. [Resultado](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: prueba Imou por Wi-Fi con clave local completada por el usuario no abrió video. RTSP DESCRIBE devolvió 401 también con Digest; falta verificar credenciales del dispositivo. Sin cambios en la cámara. [Detalle](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

## Preparación Imou local — 2026-11-05

Comprobados puertos 80/554 y respuesta RTSP 401 sin autenticación fuera del entorno restringido. Preparado diagnóstico de un fotograma y configuración privada ignorada por Git; falta completar credenciales y leer video. El usuario confirmó recepción móvil de un evento de video previo, independiente de la Imou. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

## Carátula e índice académico — 2026-11-05

Corrección posterior: el primer Word tenía un índice manual. Con autorización para añadir la estructura sin redactar capítulos, se creó [Word con índice automático](../output/pdf/caratula_indice_condominio_automatico.docx): 193 títulos fuente, campo TOC e hipervínculos, 23 páginas con numeración real calculada por Word. Se verificó que modificar un título e insertar un salto actualiza texto y página en el índice; cambios de prueba descartados. Exportación Word e inspección visual completadas; este archivo sustituye la entrega manual para continuar redactando.

Se preparó también una [versión Word editable](../output/pdf/caratula_indice_condominio_editable.docx) a petición del usuario. Su texto y numeración son editables; el renderizador no pudo comprobar el diseño porque LibreOffice no está disponible y el intento con Word no se completó.

Se creó [un PDF de siete páginas](../output/pdf/caratula_indice_condominio.pdf) con carátula e índice adaptados al condominio a partir de `PROYECTO-SI2 (3).pdf`. Grupo, integrantes y docente en blanco por solicitud del usuario; 193 entradas, cinco capítulos y cuatro sprints temáticos propuestos. Se revisaron visualmente las siete páginas. La paginación derecha conserva los valores de referencia, no páginas reales del informe del condominio; falta actualizarla cuando exista el desarrollo completo. Sin cambios funcionales ni al PDF original.

## Cola de guardia reactivada — 2026-11-05

Se comprobó el evento de video y tres entregas pendientes a guardia de prueba; Firebase las aceptó y el usuario confirmó recibir una notificación en el teléfono. El procesador continuo local se inició y verificó; no tiene arranque automático. [Informe](../documentacion/seguridad/REACTIVACION_FCM_VIDEO_2026_11_05.md).

## Revisión de repetición de video — 2026-11-05

El usuario aclaró que se equivocó sobre la repetición. En Edge con video sintético y API simulada, seis muestras se analizaron una vez y ambos reproductores se detuvieron al final. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## Comprobación simulada de cámara — 2026-11-04

En Edge con cámara y API simuladas pasaron zona, ocultación, error de registro y reintento con los mismos datos. Falta prueba con cámara física y entrega real del flujo automático. [Informe](../documentacion/seguridad/REGISTRO_CAMARA_DEMOSTRACION.md).

## Registro optativo desde cámara — 2026-11-04

La prueba de cámara puede registrar un evento pendiente mediante la API manual si el operador activa la opción. Se desactiva por defecto o ante fallos y conserva reintentos en memoria. Pueden existir duplicados al perder seguimiento; no hay evidencia ni servicio autónomo. Diez pruebas Node y build correctos; falta prueba de interfaz/cámara y entrega. [Informe](../documentacion/seguridad/REGISTRO_CAMARA_DEMOSTRACION.md).

## Zona temporal en cámara local — 2026-11-04

La prueba de cámara permite dibujar y mostrar/ocultar zona y marcar en rojo una posible permanencia, sin eventos ni avisos. La zona se pierde al detener la cámara. Nueve pruebas de reglas y build correctos; falta verificar con cámara y usuario. [Informe](../documentacion/seguridad/ZONA_CAMARA_DEMOSTRACION.md).

## Registro automático optativo desde video — 2026-11-04

El análisis puede registrar eventos mediante la API manual existente si el usuario activa la opción; reintentos conservan identificador. Quedan límites de seguimiento, duplicados y memoria, sin ingesta de servicio ni evidencia. Ocho pruebas Node, 100 de backend aisladas y build pasaron; falta prueba de interfaz y entrega del nuevo flujo. [Informe](../documentacion/seguridad/REGISTRO_AUTOMATICO_VIDEO.md).

El usuario confirmó que recibió en el móvil el aviso anterior del evento manual preparado desde video.

## Evento de video y envío a Firebase — 2026-11-04

El usuario envió el evento manual preparado desde video. Notificación interna para guardia de prueba creada; el segundo intento del lote único quedó ENVIADA tras un fallo inicial. Falta confirmar recepción en el teléfono; no se inició procesador continuo. [Informe](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

## Preparar evento manual desde video — 2026-11-04

Cada hallazgo puede preparar el formulario existente; solo al enviarlo se crea el evento manual y se distribuyen avisos según configuración. No se adjunta evidencia ni se implementó ingesta automática. Build y siete pruebas de lógica pasaron; recorrido interactivo y entrega no verificados. [Informe](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

## Estimación de permanencia en video — 2026-11-04

Se añadió una estimación temporal para vehículos casi quietos dentro de la zona marcada, con umbral configurable y vínculo al momento. Son resultados orientativos, en memoria y sin eventos ni alertas; no funciona aún con cámara. Siete pruebas Node y build correctos; falta comprobar con el video del usuario. [Informe](../documentacion/seguridad/PERMANENCIA_VIDEO.md).

## Retiro de la guía de ejemplo — 2026-11-04

A petición del usuario se retiraron la guía y el enlace añadidos en el cambio anterior. Se conserva el editor temporal de zona. [Detalle](../documentacion/seguridad/ZONA_VIDEO_PRIMERA_ETAPA.md).

## Zona temporal sobre video — 2026-11-04

Se puede dibujar y validar un polígono de zona prohibida en el video seleccionado, visible en ambas vistas y temporal a la sesión. Pruebas geométricas y navegador simulado pasaron; falta revisión manual. No hay todavía permanencia, configuración persistente ni alertas. [Informe](../documentacion/seguridad/ZONA_VIDEO_PRIMERA_ETAPA.md).

## Video fijo retirado — 2026-11-02

Con aprobación del usuario se retiraron la sección web del video público fijo, su ruta y los tres archivos de muestra. Permanecen cámara, análisis de archivos propios, pesos y notificaciones. Build, tres pruebas de cámara y comprobación web con sesión simulada pasaron. [Informe](../documentacion/seguridad/RETIRO_VIDEO_DEMOSTRACION.md).

## Reproductor nativo en vista analizada — 2026-11-02

Ante la aclaración del usuario, la vista analizada usa video con controles nativos dentro de la imagen y capa de recuadros; la ampliación usa un botón dentro del visor. Build y pruebas Edge con API simulada pasaron tras corregir sincronización. Falta revisión en la sesión del usuario. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## Controles en vista analizada — 2026-11-02

El usuario mostró ambas vistas en su navegador. Se añadieron controles de reproducción, pausa, posición, sonido y pantalla completa en la vista analizada; ambas vistas se sincronizan. Build y pruebas de navegador con API simulada pasaron. Pendiente comprobación del usuario en su sesión. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## Comparación de video en web — 2026-11-02

El usuario mostró un análisis completo de 243 muestras y solicitó original y resultado lado a lado. Se añadió reproducción sincronizada tras analizar, usando recuadros muestreados y resultados en memoria. Build y prueba de navegador con API simulada pasaron; queda validar la interfaz actualizada con el usuario. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## Análisis de archivo de video en web — 2026-11-02

Se añadió selección y análisis local de video por muestras en la pantalla de seguridad; el archivo completo no se guarda. Build y recorrido de navegador con API simulada pasaron; falta validación del usuario con su propio archivo. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## Prueba de cámara preparada — 2026-11-02

Se preparó una pantalla con inicio y detención voluntarios y un procesador RF-DETR local separado de Django. La API exige usuario de seguridad y conexión local. El usuario confirmó que vio la cámara y los recuadros. No se confirmó el tipo de objeto detectado ni el funcionamiento del botón de detención. [Informe](../documentacion/seguridad/CAMARA_LOCAL_DEMOSTRACION.md).

## Demostración web confirmada por el usuario — 2026-11-02

El usuario confirmó que vio el video y compartió una captura del reproductor con detecciones en el panel de administrador. La demostración usa video preprocesado; no prueba cámaras en vivo, zonas ni alertas de IA. [Informe](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## Ruta de video corregida en servidor local — 2026-11-01

Dos servidores Django escuchaban en 8000; las solicitudes llegaban al anterior iniciado sin recarga. Se detuvo ese proceso y quedó el servidor actualizado. La nueva ruta responde 401 sin sesión, como se espera; falta confirmar la reproducción con la sesión del usuario. [Informe](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## Video de demostración en la web — 2026-11-01

Se añadió un reproductor en eventos de seguridad y una ruta que entrega el video público fijo solo a administradores y guardias. Compilación web, pruebas de permisos simulados y reproducción WebM en Edge pasaron; falta comprobar la pantalla con sesión real tras cargar el backend actualizado. [Informe](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## Video completo con detecciones — 2026-11-01

RF-DETR procesó los 105 fotogramas de un video público y generó un MP4 con recuadros en CPU. No hay cámara en vivo, zonas, eventos ni notificaciones de IA. [Informe](../documentacion/seguridad/VIDEO_COMPLETO_RFDETR.md).

## Forma de trabajo solicitada — 2026-11-01

El usuario prefiere avanzar en el entorno local de desarrollo con verificaciones breves, sin repetir pruebas extensas innecesarias. Quiere hacer sus propias pruebas manuales y retirar los datos temporales identificados al terminar; no se han eliminado datos previos. Siguen vigentes las etapas con aprobación y la protección de datos existentes. [Decisión](../contexto/decisiones-tecnicas.md).

## Prueba inicial de visión local — 2026-11-01

RF-DETR Nano ejecutó tres fotogramas de un video público en CPU: detectó automóviles y personas. La prueba se trasladó a `Condominio-Backend/seguridad_vision` y se volvió a ejecutar correctamente. Entorno aislado, sin eventos ni notificaciones; video continuo, exactitud y modo completamente offline pendientes. [Informe](../documentacion/seguridad/PRUEBA_INICIAL_RFDETR.md).


## Etapa actual: cola automática local verificada con evento de prueba

2026-11-01: evento manual ficticio etiquetado en la base local creó notificaciones y una entrega; el procesador la marcó ENVIADA y el usuario confirmó recibirla en el teléfono. El evento queda pendiente, sin incidencia, con historial; no se probó el formulario web ni la IA. [Informe](../documentacion/seguridad/PRUEBA_COLA_AUTOMATICA_LOCAL.md).

## Etapa actual: push local de seguridad activado y prueba directa recibida

2026-11-01: app habitual debug instalada y guardia de prueba con un dispositivo validado en Firebase propio. Cola y envío de seguridad habilitados y procesador continuo iniciado; el usuario confirmó recibir y abrir un aviso directo sin crear incidencia. El recorrido real de cola de esta base no se probó. Push financiero/objetos sigue pausado; servidor, worker y enlace USB son locales y no persistentes tras reinicio. [Informe](../documentacion/seguridad/ACTIVACION_LOCAL_PUSH_GUARDIA.md).

## Etapa actual: APK habitual preparada; instalación rechazada

2026-11-01: APK debug habitual compilada para USB y Firebase propio; enlace USB configurado. Android rechazó el primer intento de instalación. Se preparó modo continuo del procesador FCM (cuatro pruebas simuladas aprobadas), pero cola y envíos continúan pausados y ningún dispositivo está validado. [Informe](../documentacion/seguridad/PREPARACION_APP_Y_PROCESADOR_FCM.md).

## Etapa actual: backend FCM incorporado y bandeja local habilitada

2026-11-01: respaldo PostgreSQL local restaurado en temporal (40 recuentos coincidentes); incorporadas protecciones FCM y aplicadas dos migraciones aditivas. Procedencia y bandeja habilitadas; cola/envíos seguridad y legado siguen pausados. Hay dos dispositivos activos, ninguno validado, y cero entregas pendientes. Django local iniciado en 8000; HTTP anónimo 401. Pasaron 100 pruebas SQLite y 36 PostgreSQL temporales. [Informe](../documentacion/seguridad/INCORPORACION_BACKEND_FCM_LOCAL.md).

## Etapa actual: inicio móvil FCM incorporado al código

2026-11-01: se incorporó el coordinador de inicio probado al código móvil habitual, sin controles exclusivos de ensayo. Pasaron 21 pruebas Flutter y análisis estático; no se compiló ni instaló la app habitual. La transición del backend y dispositivos sigue pendiente; no había servidor escuchando en 8000/8001 al revisar. [Informe](../documentacion/seguridad/INCORPORACION_INICIO_MOVIL_FCM.md).

## Etapa actual: apertura FCM con nuevo inicio comprobada en móvil aislado

2026-11-01: usuario y captura de prueba confirmaron apertura de «Alertas de seguridad» con la app aislada iniciada normalmente desde segundo plano y con proceso cerrado. Dos avisos ficticios aceptados por Firebase, sin controlador; entorno temporal retirado. No se incorporó al sistema habitual. [Informe](../documentacion/seguridad/PRUEBA_APERTURA_NUEVO_INICIO_FCM.md).

## Etapa actual: nuevo inicio FCM comprobado en segundo plano

2026-11-01: con variante instrumentada, guardia ficticio y Firebase de prueba, usuario confirmó un aviso visible fuera de primer plano; escenario Flutter aprobado. Base, servidor y enlace retirados. Falta probar esta versión con proceso terminado y transición habitual. [Informe](../documentacion/seguridad/PRUEBA_FCM_NUEVO_INICIO_SEGUNDO_PLANO.md).

## Etapa actual: inicio FCM probado con Firebase real en variante aislada

2026-11-01: instalación aceptada tras reintento; guardia y servidor ficticios, un aviso real aceptado por Firebase y recibido por el manejador en primer plano mientras el permiso simulado esperaba. Servidor, enlace y base retirados. La app habitual no aparece en el teléfono; causa y fecha desconocidas. [Informe](../documentacion/seguridad/PRUEBA_INICIO_FCM_REAL_ESPERA.md).

## Etapa actual: instalación de prueba FCM bloqueada por Android

2026-11-01: variante integrada de inicio FCM compilada en copia aislada; tres intentos de instalación USB rechazados por Android, sin envío. Servidor, base ficticia y enlace temporal retirados. La consulta posterior no encontró el paquete habitual en el teléfono, pero no se verificó antes del intento. [Informe](../documentacion/seguridad/PRUEBA_INTEGRADA_INICIO_FCM.md).

## Etapa actual: inicio móvil y red lenta FCM

2026-11-01: se preparó en copia Flutter ignorada el inicio de manejadores antes de esperar permiso y red. Pasaron 21 pruebas simuladas y análisis estático. No se probó con complementos/FCM reales ni se aplicó a la app habitual; tiempos y transición siguen pendientes. [Informe](../documentacion/seguridad/INICIO_MOVIL_RED_LENTA_FCM.md).

## Etapa actual: revisión de bloqueos y clientes FCM

2026-11-01: se corrigió en copia aislada una carrera de la baja DELETE heredada y se probó vencimiento durante tres bloqueos. Pasaron 17 pruebas PostgreSQL, 19 de procedencia y 100 SQLite. Siguen pendientes tiempos coordinados, clientes antiguos y revisión integral; no desplegar el parche anterior. [Informe](../documentacion/seguridad/REVISION_BLOQUEOS_CLIENTES_FCM.md).

## Etapa actual: pruebas adicionales FCM en copia aislada

2026-11-01: se reprodujeron y corrigieron en la copia defectos de expiración JWT durante la espera y de rotación tras cierre anterior. Pasaron 14 pruebas de cierre PostgreSQL, 19 de procedencia y 100 de acceso SQLite. Hay límites pendientes y el parche anterior no debe aplicarse. [Informe](../documentacion/seguridad/PRUEBAS_ADICIONALES_CIERRE_FCM.md).

## Etapa actual: corrección FCM probada en copia aislada

2026-11-01: se preparó coordinación de baja, registro y cierre por sesión en la copia ignorada. Pasaron siete pruebas PostgreSQL de cierre, 19 de procedencia y 100 regresiones SQLite con preparación adaptada. No se desplegó: el parche anterior sigue desactualizado y hay casos, compatibilidad, tiempos y transición pendientes. [Informe](../documentacion/seguridad/CORRECCION_CARRERA_FCM_AISLADA.md).

## Etapa actual: transición FCM bloqueada por carrera de cierre

2026-10-31: revisión aprobada de tiempos, clientes y respaldo. Dos pruebas diagnósticas con PostgreSQL temporal reprodujeron que la propuesta puede dejar un dispositivo ficticio activo después del cierre de sesión; no incorporar ni activar el parche hasta corregir ambos órdenes. Flutter espera cinco segundos y el SDK Firebase puede esperar más; una prueba móvil simulada y 25 regresiones pasaron. La APK habitual mostró indicios del proyecto anterior. Se creó un respaldo de la base local configurada y se restauró temporalmente con recuentos coincidentes en 40 tablas; no se confirmó que sea la base del servidor 8000 ni se cubrieron ACL/archivos. [Informe](../documentacion/seguridad/REVISION_TRANSICION_FCM_TIEMPOS_RESPALDO.md).

## Etapa anterior: validación FCM real comprobada en entorno aislado

2026-10-31: la app y guardia ficticios registraron un dispositivo en el backend temporal; Firebase aceptó la validación sin entrega en 2058 ms. Un identificador inventado fue rechazado sin crear otro registro. Se corrigió en la copia aislada la clasificación de entrada inválida y se verificó el rechazo real en proceso separado; pasaron 19 pruebas PostgreSQL temporales y 100 regresiones SQLite. No hubo notificación enviada ni cambios a dispositivos, backend o app habituales. App/enlace/servidor/base temporal retirados. [Informe](../documentacion/seguridad/PRUEBA_VALIDACION_FCM_REAL_AISLADA.md).

## Etapa anterior: procedencia FCM implementada en copia aislada

2026-10-31: se prepararon y probaron en una copia aislada la validación FCM por proyecto, la protección de registro y los filtros de envío. La migración se aplicó y revirtió solo en PostgreSQL temporal; pasaron 19 pruebas allí y 100 regresiones adaptadas en SQLite. Firebase fue simulado. El backend habitual usa recarga automática y **no recibió el parche ni la migración**; la protección no está activa en él. El parche revisable y sus límites están en el [resultado](../documentacion/seguridad/RESULTADO_PROCEDENCIA_FCM_AISLADA.md). La copia está ignorada por Git; no hay commit.

## Etapa anterior: transición Firebase preparada, pendiente de implementación

2026-10-31: revisión de solo lectura: dos dispositivos Android activos asociados a propietarios, sin campo que permita atribuirlos a un proyecto Firebase; cero entregas FCM de seguridad. Un proceso de diagnóstico nuevo usó Firebase propio y tenía los cuatro indicadores de notificación/envío desactivados, pero el servidor en 8000 no se reinició ni se verificó su entorno. El `DEBUG` heredado del proceso de diagnóstico era inválido; se usó una corrección solo para ese proceso. No se modificaron cuentas, dispositivos, `.env` ni app habitual. El control de procedencia y la transición segura siguen pendientes. [Plan y pruebas](../documentacion/seguridad/PLAN_TRANSICION_FIREBASE_DISPOSITIVOS.md).

## Etapa anterior: push con proceso cerrado comprobado

2026-10-31: un aviso dirigido al guardia ficticio llegó con el proceso temporal ausente. Firebase lo reactivó; se volvió a cerrar antes del toque y se comprobó que el aviso inició la app y abrió la bandeja. Usuario, captura temporal y marcador de `getInitialMessage()` confirmaron el resultado. Nueve pruebas del controlador pasaron; limpieza completada. No se usó «Forzar detención». Falta la transición de la instalación y dispositivos habituales. [Informe](../documentacion/seguridad/PRUEBA_PUSH_PROCESO_CERRADO.md).

## Etapa anterior: apertura push comprobada sin controlador de Flutter

2026-10-31: variante temporal compilada desde `lib/main.dart`, con el mismo flujo de navegación de la app; un aviso dirigido al guardia ficticio abrió la bandeja sin liberar ningún controlador. Usuario y captura temporal confirmaron el evento. Pasaron ocho pruebas de navegación y cinco del controlador; app, enlace, servidor y base temporales retirados. No se cambió código funcional ni la app habitual. Quedan app terminada y transición de dispositivos habituales. [Informe](../documentacion/seguridad/PRUEBA_APERTURA_PUSH.md).

Última actualización: **2026-10-31**. Rama revisada: `main`. El árbol contiene cambios locales de etapas anteriores y de esta etapa; se conservaron, sin commit.

## Etapa anterior: recepción push en segundo plano confirmada

2026-10-31: con app y guardia ficticios, controlador confirmó la app fuera del primer plano; el backend temporal envió un aviso y Firebase lo aceptó. El usuario pidió otro intento: se envió una segunda vez al mismo dispositivo y con el mismo aviso, y confirmó que lo vio. No puede saberse cuál de los dos mensajes produjo la notificación. Escenario Flutter terminó correctamente. App/enlace/base/log de prueba retirados; app habitual intacta, registro de prueba sigue en Firebase. Faltan app cerrada, apertura y migración de dispositivos habituales. [Informe](../documentacion/seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md).

## Etapa anterior: prueba en segundo plano preparada

2026-10-31: se prepararon y comprobaron el controlador y la APK aislada para verificar push en segundo plano. Android rechazó la instalación (`INSTALL_FAILED_USER_RESTRICTED`); el usuario dijo que no apareció ninguna ventana. Teléfono Xiaomi, causa no confirmada. Cuatro pruebas simuladas del controlador y análisis Flutter pasaron; no se envió aviso ni se verificó recepción en segundo plano. App habitual intacta, servidor/base/enlace temporales retirados. Pendiente revisar con el usuario la opción de instalación USB. [Informe](../documentacion/seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md).

## Etapa anterior: recepción push en primer plano confirmada

2026-10-31: prueba aislada con proyecto Firebase propio y guardia ficticio **aprobada**. Un único dispositivo temporal se registró, Django creó y procesó una entrega, Firebase la aceptó y Flutter recibió el mensaje en primer plano; el usuario confirmó que vio la notificación. App y enlace de prueba, base y logs temporales retirados; app habitual intacta. App de prueba permanece registrada en Firebase. 73 pruebas Flutter pasaron (2 omitidas) y análisis limpio. No se comprobó segundo plano, apertura, servidor habitual ni migración de tokens; push habitual sigue pendiente/pausado para procesos nuevos y el servidor previo puede requerir reinicio. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

## Etapa anterior: prueba push detenida por instalación Android

La captura posterior confirma API FCM V1 habilitada; el remitente coincide. El teléfono respondió por HTTPS a los dominios Firebase probados y pudo abrir conexiones TCP a los puertos FCM 5228–5230. El nuevo intento de instalar la app de prueba fue rechazado por Android; no hubo envío. Se limpiaron enlace/base temporales. Aún no se identificó la causa de `SERVICE_NOT_AVAILABLE`. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

Actualización: usuario desbloqueó el teléfono; variante de prueba se instaló y se inició sesión con guardia ficticio, pero FCM `getToken` respondió `SERVICE_NOT_AVAILABLE`, sin registro ni envío. Teléfono tiene red validada, ping, Play Services/Play Store activos y reloj cercano. Service Usage devolvió 403 para ambas APIs, por lo que su estado es desconocido. Un reintento de instalación fue rechazado. Se limpiaron app de prueba, USB 18082, base temporal y logs; app habitual intacta. Ver pestaña Cloud Messaging con el usuario. [Resultado](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

2026-10-31: variante debug `com.condominiun.smart.pushprueba` registrada en Firebase propio y compilada; servidor de base temporal restringido y test de recepción preparados. El teléfono rechazó la instalación (`INSTALL_FAILED_USER_RESTRICTED`); se preguntó al usuario si puede desbloquearlo y aceptar la confirmación. Ningún push enviado. Enlace y base temporales retirados, app habitual intacta; registro de app de prueba permanece en Firebase y APK de build es la de prueba. 71 Flutter correctas (2 omitidas), dos pruebas de restricciones en dos variantes y análisis pasaron; servidor denegó anónimos/envíos sin dispositivo. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

## Etapa anterior: Firebase propio configurado localmente, sin envío

2026-10-31: con aprobación del usuario, fuentes Android actualizadas al proyecto nuevo, clave copiada fuera del repositorio, `.env` local configurado y respaldado. Usuario eligió pausar push de expensas/objetos; se añadió interruptor compatible y se fijó False localmente, igual que cola/envío FCM de seguridad. Los avisos de expensas/objetos durante la pausa no se reencolan. Proceso Django nuevo confirmó proyecto e indicadores; **servidor previo puede conservar su entorno hasta reinicio**. APK debug compilada/verificada, no instalada; configurada para puerto 8001 actualmente cerrado. 100 pruebas backend y 71 Flutter correctas (2 omitidas), cinco de credenciales. Sin cambios en dispositivos/base ni entrega push. [Informe](../documentacion/seguridad/CONFIGURACION_FIREBASE_PROPIO_LOCAL.md).

## Etapa anterior: preparación del Firebase propio

El usuario descargó la clave privada de `condominio-seguridad`. Se validó sin imprimir ni copiar al repositorio y una consulta de solo lectura a Firebase respondió 200. Backend admite `FIREBASE_CREDENTIALS_PATH`, manteniendo compatibilidad y sin activar la ruta en `.env`. Cinco pruebas nuevas y 99 de regresión pasaron; Django temporal inicializó el proyecto nuevo con envío/cola desactivados. Las configuraciones activas de app y backend no migraron; faltan almacenamiento privado permanente y coordinación con los tokens del proyecto anterior. [Preparación](../documentacion/seguridad/PREPARACION_FIREBASE_PROPIO.md).

2026-10-31: el usuario creó `condominio-seguridad`, registró Android `com.condominiun.smart` y descargó su configuración. Archivos Android y opciones Flutter nuevos preparados junto a copias anteriores en directorio local ignorado; consistencia y sintaxis Dart comprobadas. **Todavía no están activados**; backend, `.env`, base y teléfono no cambiaron. Falta credencial de servicio del nuevo proyecto; el usuario pidió ayuda para encontrarla. [Preparación](../documentacion/seguridad/PREPARACION_FIREBASE_PROPIO.md).

## Etapa anterior: diagnóstico de push en el Firebase anterior

Consulta oficial de solo lectura 2026-10-31: `smart-condominiun` existe (HTTP 200) y la credencial local puede ver el proyecto y sus apps Android. La app normal está registrada y la variante `.prueba` no aparece en la respuesta. El usuario no encuentra el proyecto en sus cuentas; la propiedad y el acceso administrativo humano siguen sin verificarse. No se creó ni modificó nada en Firebase. [Informe](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

La captura posterior muestra una cuenta de consola con `smartsales360-fd434`, que no coincide con el proyecto Android configurado `smart-condominiun`. Falta acceso a una cuenta de Google autorizada para el proyecto del condominio; no se cambió Firebase. [Detalle](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

2026-10-31: el usuario autorizó preparar una prueba usando el proyecto Firebase existente. Configuración Android y Admin SDK de diagnóstico coinciden; guardia de prueba activo tiene cero dispositivos Android activos, hay dos de otras cuentas. No se sabe si aún corresponden al teléfono conectado. Sin cambios a registros ni envíos. Proceso de diagnóstico con opciones de seguridad apagadas; esto no verifica el entorno del servidor ya iniciado. 99 pruebas simuladas aprobadas. Acceso al navegador venció; falta acceder a la consola para preparar una app de prueba independiente **dentro del mismo proyecto** y después verificar entrega dirigida. [Informe](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

## Etapa anterior: rol personalizado probado en la web

2026-10-31: un escenario E2E React/Django pasó en Microsoft Edge headless con cuentas/base aisladas. Incluye creación, activación, asignación desde formularios, rutas denegadas, concesión y revocación de consulta de visitas, cierre y desactivación. Nueve regresiones Node, 26 solicitudes HTTP, lint seleccionado y build correctos. Capturas revisadas. Base temporal eliminada y puertos de prueba cerrados; sin cambios en cuentas, `.env` o teléfono habituales. [Informe web](../documentacion/seguridad/PRUEBA_INTEGRACION_WEB_ROLES.md).

Límites actuales: el menú refresca capacidades al recargar; servidor rechaza nuevas consultas inmediatamente tras revocación. Stripe se intenta cargar anticipadamente y se bloqueó en la prueba; pagos excluidos. `npm audit` detectó seis avisos moderados en la cadena de ESLint existente, pendientes de etapa de compatibilidad. Firebase separado y entrega push siguen pendientes. Esperar aprobación antes de la siguiente etapa; no repetir activaciones/migraciones ya completadas.

## Etapa anterior: rol personalizado probado en Android

2026-10-31: el usuario confirmó con capturas el login y los menús de `guardia_prueba` y `admin` en el móvil habitual. Después se añadió y ejecutó una prueba de integración de rol personalizado contra Django temporal: un escenario integral aprobado en teléfono autorizado, usando app separada y Firebase deshabilitado. Incluye login/almacenamiento nativo, permiso inicialmente ausente, consulta habilitada, revocación, cierre e invalidación. Pasaron también 71 pruebas móviles (2 omitidas por configuración), el escenario HTTP de 26 solicitudes y análisis estático. [Informe](../documentacion/seguridad/PRUEBA_INTEGRACION_ANDROID_ROLES.md).

El emulador no completó el arranque; la revisión automática exigió y el usuario otorgó autorización específica para sustituirlo por el teléfono. La app aislada y su enlace 18080 se retiraron, y el servidor/base temporales se eliminaron. La app habitual y su enlace 8001 permanecen intactos. La APK en la ruta de build ahora es la variante de pruebas, no la normal.

Push real sigue pendiente: solo se encontró configuración local del proyecto Firebase habitual, el usuario no recuerda otro y no se consultó la consola cloud. Identificar/crear proyecto separado y preparar variante específica según el plan antes de enviar. También falta el recorrido interactivo React. No repetir activación/migraciones locales: ya están completadas como se indica abajo.

## Etapa anterior: activación local y reparación Android USB

2026-10-31: a petición del usuario y con confirmación específica posterior a la revisión automática, se activaron roles personalizados en la base local `condominio` y se habilitó Inquilino sin permisos técnicos ni asignaciones. Antes se respaldó y restauró la base en PostgreSQL temporal; las migraciones `0005`/`0006` se ensayaron y luego aplicaron localmente, conservando el contenido de 34 tablas preexistentes. `.env` local tiene `ROLES_PERSONALIZADOS_ACTIVOS=True`; el valor predeterminado del código sigue en `False`. No hay roles personalizados ni asignaciones creadas. [Informe y respaldo](../documentacion/seguridad/ACTIVACION_LOCAL_ROLES_Y_ANDROID_USB.md).

Se reparó el enlace USB Android `8001 -> 8000`; una petición anónima desde el teléfono recibe 401 de Django. APK actual compilada e instalada conservando datos; `condominio-movil/conectar-usb.ps1` permite restablecer el enlace después de desconexión. El login habitual fue confirmado posteriormente por el usuario y el rol personalizado se probó como se describe arriba; siguen pendientes el recorrido React y push aislado.

## Etapa anterior: móvil y verificación de roles personalizados

Implementación móvil y verificación automatizada completadas; **recorrido visual web pendiente** porque el acceso al navegador sigue indisponible. Flutter reconoce el rol personalizado y ofrece consulta de visitas solo con su capacidad; no registra FCM para ese rol. Pasaron 99 pruebas backend, 8 PostgreSQL temporal, un escenario HTTP de 26 solicitudes, 7 pruebas web y 71 móviles (2 omitidas por configuración, comprobadas en variantes separadas); análisis Flutter de 10 archivos sin problemas. [Informe, comandos y límites](../documentacion/seguridad/RESULTADO_MOVIL_ROLES_PERSONALIZADOS.md).

El runner HTTP confirmó cierre y eliminación de su directorio temporal. No se modificó la base habitual, `.env`, cuentas o teléfono reales; `0005`/`0006` no se aplicaron allí y la función permanece desactivada por defecto. Reanudar con prueba visual aislada cuando esté disponible. No tratar HTTP/Node como E2E de React ni como recepción push. No ampliar capacidades ni activar en entorno persistente sin la aprobación correspondiente.

## Etapa anterior: primera capacidad de roles personalizados

2026-10-31: creación y asignación web/backend de roles personalizados, con una capacidad de consulta de visitas pendientes/activas, se implementó para pruebas aisladas. Está **desactivada por defecto**, no se aplicaron migraciones `0005`/`0006` a la base persistente y no se crearon roles o cuentas reales. Pasaron 99 pruebas backend, siete frontend, lint y build. No hay prueba interactiva integral ni soporte móvil para el rol. La asignación rechaza cuentas con dispositivos FCM existentes; ver [resultado](../documentacion/seguridad/RESULTADO_CAPACIDAD_VISITAS_PERSONALIZADAS.md). Esperar aprobación para la siguiente etapa y aprobación específica antes de migrar o activar en un entorno persistente.

## Etapa anterior: estructura preparatoria de roles personalizados

La etapa anterior preparó dos modelos y la migración `0005`, inicialmente sin integración; su [informe histórico](../documentacion/seguridad/RESULTADO_ESTRUCTURA_ROLES_PERSONALIZADOS.md) no describe los cambios posteriores de la etapa actual.

## Etapa anterior: roles predeterminados

2026-10-31: se completó la etapa aprobada de cuatro roles predeterminados visibles, no editables por la API y con habilitación explícita si falta el grupo. Se conservaron permisos y cuentas existentes. Pruebas: 91 backend, seis frontend, lint de la página y build correctos. Ver [resultado](../documentacion/seguridad/RESULTADO_ROLES_PREDETERMINADOS.md). No se han implementado roles personalizados; esperar aprobación antes de su siguiente etapa.

## Análisis de roles personalizados

El usuario decidió que los roles personalizados comiencen sin permisos, para seleccionarlos después. Se documentó un diseño por etapas en [plan de roles](../documentacion/seguridad/PLAN_ROLES_PREDETERMINADOS_PERSONALIZADOS.md).

## Aclaración documental posterior

2026-10-31: el usuario confirmó que el enunciado original recoge los requisitos del ingeniero. Se incorporó su resumen explícito en [estado del proyecto](../contexto/estado-proyecto.md), separando requisitos académicos de decisiones técnicas posteriores. El Word original permanece intacto en requisitos. Esta aclaración no autoriza una etapa funcional.

## Última etapa completada

Organización documental solicitada: cuatro originales clasificados sin alterar contenido, contexto y memoria creados, `AGENTS.md`, tres skills e índice central. Ver [informe y comprobaciones](../documentacion/auditorias/ORGANIZACION_DOCUMENTAL_2026-10-31.md). No se modificaron componentes funcionales ni configuración; no se hizo commit.

La última funcionalidad anterior documentada es el alta de empleado con cuenta opcional en la misma ventana y cuatro roles sujetos a perfil. **Finalizar sin cuenta se conserva**, por decisión del usuario: puede haber personal que no utilice el sistema.

## Alcance autorizado y reanudación

La organización documental está completada. La solicitud posterior autoriza avanzar por etapas hacia roles predeterminados y personalizados; el análisis actual no autoriza saltarse la aprobación expresa de la siguiente etapa. La existencia de un plan o de un archivo de preparación no autoriza ejecutar migraciones, activar Firebase, instalar modelos ni usar un teléfono real.

Para retomar: leer [pendientes](pendientes.md), [roles](../contexto/roles-permisos.md) y el código de la tarea elegida; revisar Git. Las modificaciones documentales quedan locales pendientes de revisión/commit; no suponer que ya están respaldadas remotamente.

## Verificado y límites

Se contrastaron módulos, relaciones, permisos, provisión de cuentas y distribución de notificaciones con código. Las pruebas funcionales anteriores están referenciadas en [pruebas](pruebas.md); no se repitieron en esta etapa. La bandeja interna web/móvil está implementada; push real, recuperación de cuenta FCM, ocupación de inquilinos, varias funciones móviles y visión continua siguen pendientes.

No se consultaron valores `.env`, base persistente, configuración real de Firebase, cuentas de usuarios ni procesos del teléfono. El estado previo de migraciones/activaciones consta en informes históricos y debe comprobarse por entorno antes de operar.

2026-11-12: puertos locales de IA, puente Imou y exclusi?n del monitor cambiados a 28765, 28766 y 28767 por reserva de Windows 18700?18799. Enlace exclusivo comprobado en los tres; cuatro pruebas del puente y compilaci?n Python correctas. La IA carg? el modelo y anunci? que el servicio estaba listo en una prueba temporal; no se prob? c?mara ni monitoreo real. Reiniciar Django y procesos locales para usar las nuevas direcciones.

2026-11-12: el puente de c?maras adicionales tambi?n pas? del puerto reservado 18768 al 28768; enlace exclusivo disponible. Sin prueba de c?mara f?sica.

2026-11-12: la prueba simulada del puente de c?maras adicionales fall? con WinError 10053 al recibir respuesta; queda pendiente repetir y diagnosticar.

2026-11-13: el usuario indic? que el monitor es solo para administraci?n; guardia revisa eventos y confirma incidencias. Se cambi? acceso web y permisos API de im?genes Imou y cat?logo; pruebas web de roles y cinco pruebas API Imou pasaron, build correcto. Dos pruebas de permisos del cat?logo pasaron con SQLite en memoria; no se comprob? con c?maras reales. El aviso m?vil al propietario o inquilino identificado por placa fue solicitado, pero no est? implementado; requiere verificar identidad, destinatario y alcance.

2026-11-13: preparada una tabla independiente y API administrativa para preferencias futuras de lectura de placas y zonas por c?mara, con valores desactivados. No son funciones operativas, no modifican Imou ni notifican. Migraci?n preparada, probada solo en SQLite temporal y no aplicada a la base local; siete pruebas aisladas y makemigrations --check correctos. Faltan interfaz, integraci?n de placa/incidencias y activaci?n segura.

2026-11-13: preparada interfaz administrativa para consultar y guardar preferencias futuras por c?mara. No activa lectura ni alertas y conserva el monitor existente. Build y ESLint correctos; interfaz no validada visualmente. La migraci?n de la tabla de preferencias sigue sin aplicar en la base local, por lo que esta secci?n todav?a no est? disponible all?. Falta integraci?n funcional y prueba real.

2026-11-13: aplicada migracion aditiva camaras.0004 a PostgreSQL local tras respaldo backups_locales/antes_funciones_camara_20261113_141521.dump, verificado con pg_restore --list; no se probo restauracion. Guardias pueden solicitar lectura manual de evidencia mediante la API existente, que envia imagen a Plate Recognizer solo al pulsar; no vincula resultado al evento ni envia avisos a residentes. Build y ESLint correctos; flujo visual y servicio real no probados.

2026-11-13: lectura de placa deja de atribuir una persona si existen multiples vehiculos con la misma placa; informa coincidencia ambigua. La pantalla de reconocimiento ya no presenta una coincidencia como autorizacion de acceso. Tres pruebas con proveedor simulado pasaron; build y ESLint correctos. Sin proveedor ni camaras reales. Quedan pendientes vinculacion al evento, destinatario confirmado y aviso al residente.

2026-11-13: guardia puede registrar una placa revisada en historial del evento, manualmente o tras lectura sugerida; guarda actor y fecha sin asociar automaticamente persona ni enviar aviso. API valida rol, formato y estado. Seis pruebas aisladas con SQLite y proveedor simulado, build y ESLint correctos. Sin migracion ni pruebas reales; pendientes destinatario y notificacion movil.

2026-11-13: agregado flujo de consulta por ultima placa revisada y confirmacion humana del residente con cuenta activa; solo guardia, incidencia confirmada o en atencion. Identificadores quedan en historial, sin enviar avisos ni garantizar identidad del conductor. Sin coincidencia, duplicados o cuenta inactiva no permiten confirmacion. Siete pruebas simuladas iniciales y cuatro pruebas de placa con SQLite temporal pasaron; build y ESLint correctos. Sin proveedor ni telefonos reales. Antes de enviar, revalidar asociacion y cuenta, disenar persistencia e idempotencia y probar FCM.

2026-11-13: preparada API separada de avisos propios para residentes activos, con detalle limitado, evidencia y marca de lectura solo del destinatario. No crea avisos ni envia FCM; Flutter aun no consume esta API. Seis pruebas aisladas SQLite correctas para acceso propio/ajeno y revision de placa; sin migraciones ni proveedor real. Pendientes creacion transaccional idempotente, revalidacion, cola FCM, app movil y pruebas integrales.

2026-11-13: guardia puede preparar aviso interno tras confirmar residente; se revalidan placa, coincidencia unica, vehiculo, persona, cuenta y estado; repeticiones no duplican aviso. Disponible mediante API propia del residente, sin cola FCM ni push y sin integracion Flutter. Migracion de tipo preparada y probada en SQLite, no aplicada a PostgreSQL. Nueve pruebas aisladas, build y ESLint correctos; sin datos ni envios reales. Pendiente entrega movil y pruebas integrales.

2026-11-13: creada bandeja Flutter Mis avisos para propietario e inquilino, consulta API propia, marca lectura y descarga evidencia protegida; no habilita la bandeja interna de seguridad. Tres pruebas Flutter simuladas pasaron (roles, servicio y apertura). No se instalo APK ni se probo telefono o push real. Sigue pendiente envio FCM y apertura desde notificacion, ademas de migracion de tipo no aplicada.

2026-11-13: agregado encolado explicito por guardia para aviso residente; al encolar y procesar se revalida destinatario, placa y cuenta, el push contiene datos minimos y se cancela si la asociacion deja de ser valida. Apertura Flutter de tipo aviso_residente dirige solo a bandeja propia. 15 pruebas backend con proveedores simulados, 16 pruebas Flutter y analisis de seis archivos sin problemas; build y ESLint web correctos. No se enviaron avisos reales ni instalo APK. Migracion seguridad_IA.0007 sigue sin aplicar; faltan pruebas integrales y reales.

2026-11-13: aplicada migracion seguridad_IA.0007 en PostgreSQL local tras respaldo backups_locales/antes_aviso_residente_20261113_183826.dump, listado legible; no se probo restauracion. Flujo integrado de aviso, cola FCM simulada, consulta propia y bloqueo de evidencia ajena paso junto con pruebas relacionadas (9, SQLite temporal). No se envio push real ni se instalo APK; no se probo integracion con camara real ni reconocimiento automatico en vivo.

2026-11-13: incorporada consulta puntual de placa desde el ultimo fotograma de Imou o camara de catalogo, solo al pulsar y avisando del proveedor externo; sin lectura continua ni enlace automatico con evento. Build y ESLint correctos; recorrido Edge simulado comprob? que no se envia hasta pulsar y conserva flujo Imou y restriccion del guardia. Sin camaras ni proveedor real. Pendiente integracion automatica por camara y validacion real.

2026-11-13: lectura solicitada por guardia desde evidencia puede registrarse como sugerencia en historial del evento; no se considera placa verificada ni identifica responsable. Accion autenticada valida rol, evidencia, lectura y estado e impide repetir la misma sugerencia. Nueve pruebas aisladas, build y ESLint correctos. No se enviaron imagenes reales; pendiente lectura automatica y prueba integral real.

2026-11-13: lectura solicitada por guardia desde evento usa evidencia privada recuperada por backend, no lectura arbitraria del cliente; verifica rol y estado y vuelve a verificar evidencia antes de asociar sugerencia. Se reutiliza API de placas, sin confirmar automaticamente el resultado. Nueve pruebas simuladas, build y ESLint correctos; sin imagenes reales ni conexion al proveedor. Sigue pendiente lectura continua y validacion integral real.

2026-11-13: prototipo optativo de lectura automatica para Imou web reutiliza IA local y envia un fotograma al proveedor externo ante deteccion unica de vehiculo; se limita por presencia y 30 segundos mientras permanece activo. Se detiene al parar IA o vista, no opera autonomamente, no vincula lectura a evento ni identifica conductor. Dos pruebas Node, recorrido Edge simulado, build y ESLint correctos; diez pruebas Django simuladas incluyen cambio de estado durante consulta. Sin proveedor ni camaras reales; falta prueba real, mayor robustez y soporte por camara.

2026-11-13: lectura automatica optativa de placas extendida a vista web de camaras adicionales mediante IA existente; sin eventos automaticos de zona y se detiene al ocultar vista. Guardia puede consultar lecturas anteriores coincidentes durante 30 minutos como sugerencias no verificadas, sin atribucion automatica. Once pruebas Django, build, ESLint y Edge simulado correctos. Fuente Imou configurada no respondio a RTSP en dos comprobaciones, incluida red local; no se capturo imagen ni se contacto al proveedor real. Pendiente prueba fisica, evidencia de entrada y asociacion fiable.

2026-11-13: el usuario cambio a IP Wi-Fi la Imou vinculada y mostro comprobacion de fotograma recibido por puente; vista de monitor sin confirmar tras el cambio. Gestion agrupa visualmente registros que coinciden en IP y puerto con la camara vinculada, permite mostrarlos y no elimina ni altera datos. Prueba de agrupacion, build y ESLint correctos; falta revision visual. El monitor puede seguir ofreciendo el registro adicional.

2026-11-13: por solicitud del usuario se retiro un unico registro duplicado de camara (id 2) tras comprobar coincidencia IP/puerto y ausencia de referencias relacionales en modelos instalados. Se preservo registro vinculado id 1; respaldo backups_locales/antes_retirar_duplicado_20261113_220952.dump con listado legible, restauracion no probada. Confirmado un registro restante y puente entrego un fotograma real sin guardarlo. Vista navegador pendiente de confirmacion del usuario.

2026-11-13: agregado README raiz breve para equipo con inicio Windows de backend, frontend, puentes e IA, requisitos y limites. Se comprobaron rutas de scripts y enlaces; no se reinstalaron dependencias ni se ejecutaron migraciones.
