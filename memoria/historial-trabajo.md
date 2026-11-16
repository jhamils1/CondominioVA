# Historial del trabajo

2026-11-16: integrada opción de inferencia remota configurable y probada con proveedores y fuentes simulados; el usuario indicó que aún no tiene servidor. Ver `pruebas.md` y guía de IA por internet.

2026-11-16: implementada y probada con imágenes y fuentes simuladas la condición de una persona detectada sola en piscina. La migración se aplicó a la base local tras verificar un respaldo; quedan pruebas reales pendientes.

2026-11-16: reorganizada la configuración de cámaras web, sin cambios de backend ni activación de servicios externos. Ver `pruebas.md`.

2026-11-15: se ajustó visualmente el resultado de lectura de placas al diseño web y se revisaron sus estados con respuestas simuladas.

2026-11-15: unificada la configuración visual de las fuentes y añadidas consultas de placa en webcam, validadas con cámaras y proveedor simulados. Ver `pruebas.md`.

2026-11-15: se aplicó configuración de incidencias por cámara al análisis web y envío al flujo existente de revisión; se verificó con datos simulados y se aplicó la migración local tras respaldo. Ver pruebas.md.

2026-11-07: etapa de zonas por cámara adicional implementada y probada con datos simulados; zona Imou preservada. [Detalle](../documentacion/seguridad/ZONAS_CAMARAS_CATALOGO.md).

2026-11-07: implementada selección y visualización de cámaras de red del catálogo sin sustituir Imou ni webcam; pendiente prueba física adicional. [Detalle](../documentacion/seguridad/MONITOR_CAMARAS_CATALOGO.md).

2026-11-07: usuario reportó avisos frecuentes por una permanencia; ajustada la retención de pistas ya notificadas durante interrupciones breves. [Detalle](../documentacion/seguridad/AVISOS_REPETIDOS_IMOU.md).

2026-11-07: reiniciado puente con acceso a red tras fallo de conexión en entorno restringido; fotograma Wi-Fi recibido mediante catálogo. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: verificado vínculo del catálogo y reiniciado puente Imou; pendiente imagen real. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: implementada la transición por etapas del monitor Imou al catálogo; respaldo legible y migración local aditiva aplicados; vínculo real pendiente. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: detectada cámara candidata 192.168.1.108 por Ethernet; serial ONVIF coincide en sufijo y dos perfiles entregan imagen por cable. Integración del monitor pendiente.

2026-11-07: búsqueda local Imou vacía; Windows mostró candidato 192.168.1.108 en ARP Ethernet, aún sin verificar.

2026-11-07: se observó DHCP DISCOVER por Ethernet de dispositivo con prefijo de fabricante coincidente; no se identificó definitivamente como Imou.

2026-11-07: se validó lectura RTSP de perfiles ONVIF de la Imou con fotogramas descartados; pendiente la interacción web real.

2026-11-07: usuario aprobó comprobar ONVIF de Imou; descubrimiento y dos perfiles confirmados mediante consulta de solo lectura, video con rutas ONVIF aún pendiente.

2026-11-07: usuario pidió claridad sobre el perfil ONVIF; se muestra su nombre durante el alta y se conserva la opción manual.

2026-11-07: usuario solicitó sugerir puerto ONVIF anunciado y valor por defecto; se implementó sin confirmar puertos reales ni cambiar la red.

2026-11-07: usuario solicitó obtención ONVIF de ruta y bloqueo visual de edición; se implementaron con pruebas simuladas, pendiente validación física.

2026-11-07: usuario informó descubrimiento Imou intermitente; se implementó reintento acotado y estado de cámaras registradas, aún pendiente prueba real.

2026-11-07: implementada búsqueda local WS-Discovery de dispositivos compatibles; no se hizo búsqueda en red real durante las pruebas.

2026-11-07: usuario aprobó perfiles de cámara y descubrimiento gradual. Primera etapa: perfil Imou y alternativa manual; descubrimiento pendiente de etapa posterior.

2026-11-07: por solicitud del usuario, se muestra la ruta RTSP configurada de la Imou vinculada sin datos de acceso ni cambios al puente.

2026-11-07: etapa de comprobación puntual RTSP implementada; no se conectaron cámaras reales ni se modificaron las notificaciones.

2026-11-07: por solicitud del usuario se a?adi? visibilidad opcional de contrase?a de c?mara, restringida a administrador local, con acceso Imou de solo lectura. Ver documentaci?n de credenciales.

2026-11-07: usuario aprobó configurar acceso de cámaras nuevas; se añadió registro seguro de credenciales, manteniendo Imou existente y dejando conexión genérica para otra etapa. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: se verificaron menús y se habilitó apertura accesible con teclado. [Detalle](../documentacion/seguridad/MENU_MONITOR_CAMARAS.md).

2026-11-06: reorganizada navegación de cámaras y eventos, conservando la revisión del guardia desde monitor. [Detalle](../documentacion/seguridad/MENU_MONITOR_CAMARAS.md).

2026-11-06: usuario confirmó video en eventos y reportó prueba atascada; se añadió espera automática y se aclaró habilitación solo de catálogo. [Detalle](../documentacion/seguridad/VINCULO_IMOU_CATALOGO.md).

2026-11-06: usuario aprobó comenzar la conexión del catálogo con Imou; añadido vínculo por coincidencia y prueba restringida, pendiente validación con cámara accesible. [Detalle](../documentacion/seguridad/VINCULO_IMOU_CATALOGO.md).

2026-11-06: usuario pidió documentar decisiones recientes y comenzar gestión de cámaras por etapas; catálogo administrativo implementado. [Plan](../documentacion/seguridad/PLAN_CAMARAS_Y_AVISOS_RESIDENTES.md).

2026-11-05: implementado monitor Imou fuera del navegador, con eventos IA y exclusión frente al registro web. [Detalle](../documentacion/seguridad/MONITOREO_IMOU_INDEPENDIENTE.md).

2026-11-05: iniciada prueba directa Imou–PC sin router; pendiente resolver DHCP. [Detalle](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-05: implementado flujo aprobado de guardado automático de la configuración Imou y eliminación confirmada. [Detalle](../documentacion/seguridad/GUARDADO_AUTOMATICO_ZONA_IMOU.md).

2026-11-05: diagnosticada falta de configuración persistida ante reporte de eventos/avisos ausentes; se hizo explícito el estado del registro y el paso de guardar. [Detalle](../documentacion/seguridad/REGISTRO_IMOU_CONFIGURACION_PENDIENTE.md).

2026-11-05: ante rojo intermitente comunicado por el usuario, se corrigió el reinicio por pérdidas breves y se agregó diagnóstico visual de permanencia. [Detalle](../documentacion/seguridad/ESTABILIDAD_SEGUIMIENTO_IMOU.md).

2026-11-05: zona persistente Imou, autorización de escritura al administrador, lectura de guardia y respaldo/migración local. [Detalle](../documentacion/seguridad/ZONA_IMOU_COMPARTIDA.md).

2026-11-05: ajustada la configuración Imou a una sola vista al activar IA; recorrido simulado correcto. [Detalle](../documentacion/seguridad/REDISENO_CENTRO_SEGURIDAD.md).

2026-11-05: rediseño web del centro de seguridad y reorganización de ajustes sin cambios en backend ni móvil; verificación simulada. [Detalle](../documentacion/seguridad/REDISENO_CENTRO_SEGURIDAD.md).

2026-11-05: usuario confirmó recepción móvil de detección Imou y aprobó evidencia. Se respaldó base, aplicó migración aditiva, incorporó captura atómica y consulta privada en web/móvil; pruebas simuladas y permisos verificadas. Sin instalación móvil ni nuevas notificaciones reales. [Informe](../documentacion/seguridad/EVIDENCIA_IMOU.md).

2026-11-05: usuario postergó prueba con maqueta y aprobó registro automático y notificación Imou. Se usó API y cola existentes con activación optativa, reintentos y pruebas simuladas. Sin tocar configuración Firebase ni datos reales. [Informe](../documentacion/seguridad/REGISTRO_IMOU_LOCAL.md).

2026-11-05: aprobada e implementada zona temporal en la Imou, con permanencia y recuadros rojos. Se reutilizó el seguimiento existente; no se conectaron notificaciones ni se realizaron envíos. [Informe](../documentacion/seguridad/ZONA_IMOU_TEMPORAL.md).

2026-11-05: usuario mostró recuadros de IA en Imou y solicitó alinear las dos vistas. Se movieron controles arriba y se ajustó la presentación responsiva. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: usuario confirmó probar la vista Imou y autorizó conectar IA. Implementado panel de muestras con recuadros sincronizados, reutilizando API de webcam. Prueba sintética de interfaz y un fotograma real procesado, sin cambios de datos ni avisos. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: con aprobación se incorporó visualización Imou a eventos de seguridad conservando webcam. Corregido arranque del socket Windows, probado y dejado puente local en segundo plano. Sin modificar configuración física ni crear eventos. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: el usuario autorizó copiar el código de su etiqueta física al archivo local privado. Clave corregida y lectura RTSP comprobada por Wi-Fi; sin modificar cámara, firmware o red. [Resultado](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: usuario encontró y guardó clave local; prueba por Wi-Fi y diagnóstico autenticado rechazados con 401. Se detuvieron reintentos para verificar credenciales. [Detalle](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: corregido índice manual tras observación del usuario. Autorizó añadir estructura de títulos sin contenido; generado y actualizado índice nativo de Word con 193 entradas. [Resultado](estado-actual.md#carátula-e-índice-académico--2026-11-05).

2026-11-05: usuario autorizó comenzar la prueba Imou y consultó RJ45. Se preparó lector local y archivo privado sin clave. Se corrigió diagnóstico previo: las conexiones hab?an sido bloqueadas por el entorno del agente; RTSP sí respondió. No se modificó la cámara. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: a petición del usuario se preparó la carátula y el índice en Word editable a partir del PDF adaptado.

2026-11-05: adaptadas únicamente carátula e índice académico, con título de gestión y seguridad inteligente de condominios, subtítulos pertinentes y espacios para los datos académicos. Se eliminó la repetición del índice del original y se corrigió el apartado 3.5 duplicado. [Resultado y límites](estado-actual.md#carátula-e-índice-académico--2026-11-05).

2026-11-05: el usuario confirmó recepción en su teléfono después de procesar las entregas pendientes del guardia. [Informe](../documentacion/seguridad/REACTIVACION_FCM_VIDEO_2026_11_05.md).

2026-11-05: el usuario aclaró que no existía el problema de repetición. Se procesaron tres avisos de prueba pendientes del guardia y se inició el procesador continuo local; falta confirmación telefónica. [Informe](../documentacion/seguridad/REACTIVACION_FCM_VIDEO_2026_11_05.md).

2026-11-05: se investigó la repetición de video reportada; un escenario sintético de reproducción finalizó sin repetir inferencia. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

2026-11-04: comprobación de cámara, zona y reintento en Edge con fuente y API simuladas; sin usar dispositivo o Firebase reales. [Informe](../documentacion/seguridad/REGISTRO_CAMARA_DEMOSTRACION.md).

2026-11-04: añadido registro optativo desde la prueba de cámara mediante API existente; no se enviaron avisos durante la etapa. [Informe](../documentacion/seguridad/REGISTRO_CAMARA_DEMOSTRACION.md).

2026-11-04: se añadió zona temporal ocultable y resaltado por permanencia a la prueba de cámara, sin eventos ni avisos. [Informe](../documentacion/seguridad/ZONA_CAMARA_DEMOSTRACION.md).

2026-11-04: se añadió registro automático optativo de hallazgos de video por API manual y reintentos con identificador estable; el usuario confirmó recepción de la prueba manual anterior. [Informe](../documentacion/seguridad/REGISTRO_AUTOMATICO_VIDEO.md).

2026-11-04: el usuario envió el evento de video; se procesó su única entrega pendiente y Firebase la aceptó en el segundo intento. Falta confirmar recepción. [Informe](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

2026-11-04: conectada la preparación voluntaria de un evento manual con un hallazgo del video; el envío usa el flujo de alertas existente. No se enviaron eventos durante la implementación. [Informe](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

2026-11-04: aprobada e implementada estimación de permanencia para video, con seguimiento básico y sin alertas. [Informe](../documentacion/seguridad/PERMANENCIA_VIDEO.md).

2026-11-04: se añadió una guía con enlace al video público anterior; posteriormente se retiró a petición del usuario. El archivo no se descargó. [Detalle](../documentacion/seguridad/ZONA_VIDEO_PRIMERA_ETAPA.md).

## 2026-11-04: marcado de zona en video

Se incorporó un editor temporal de polígonos sobre video y se verificó en navegador con API simulada. [Informe](../documentacion/seguridad/ZONA_VIDEO_PRIMERA_ETAPA.md).

## 2026-11-02: retiro del video fijo

Se retiró la muestra pública fija con autorización, preservando cámara y análisis de archivos elegidos. [Informe](../documentacion/seguridad/RETIRO_VIDEO_DEMOSTRACION.md).

## 2026-11-02: reproductor nativo en video analizado

Se reemplazaron los botones externos por controles de video dentro de la imagen y se corrigió la sincronización de los controles nativos. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: controles del video analizado

Se añadieron controles sincronizados y se probaron en Edge con detección simulada. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: comparación de videos

La interfaz presenta original y detecciones lado a lado y permite reproducción sincronizada después del análisis por muestras. Se probó con API simulada; falta revisión del usuario. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: selección de archivo de video

Se añadió análisis por muestras desde un archivo local en la web, reutilizando el procesador existente. El recorrido se probó en navegador con API simulada. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: imagen de cámara confirmada

El usuario informó que ve la cámara y los recuadros en la demostración. No indicó qué objetos se reconocieron ni confirmó la detención. [Informe](../documentacion/seguridad/CAMARA_LOCAL_DEMOSTRACION.md).

## 2026-11-02: cámara local preparada

Se añadieron controles web y procesador de demostración independiente; se probó inferencia con una imagen pública, sin abrir la cámara. Pendiente respuesta del usuario. [Informe](../documentacion/seguridad/CAMARA_LOCAL_DEMOSTRACION.md).

## 2026-11-02: demostración web confirmada

El usuario informó que vio el video y adjuntó una captura del panel de administrador con el reproductor. [Informe](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## 2026-11-01: corrección del servidor local

Se encontró un servidor anterior sin recarga compartiendo el puerto 8000. Se detuvo solo ese proceso; el servidor actualizado sigue activo y la nueva ruta responde 401 a una solicitud anónima. Falta la comprobación con sesión real. [Informe](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## 2026-11-01: video de demostración web

Reproductor incorporado a eventos de seguridad, con API restringida a operadores y video público fijo; comprobaciones realizadas y verificación real pendiente. [Informe](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## 2026-11-01: video completo con detecciones

Se agregó y verificó el procesamiento local de video grabado. Copia anotada conservada para revisión manual; temporales intermedios eliminados. [Informe](../documentacion/seguridad/VIDEO_COMPLETO_RFDETR.md).

## 2026-11-01: preferencia de desarrollo y pruebas

Se documentó la preferencia de desarrollar localmente, realizar comprobaciones proporcionadas y dejar identificados los datos temporales para su limpieza. Sin cambios de código ni eliminación de registros. [Decisión](../contexto/decisiones-tecnicas.md).

## 2026-11-01: evaluación inicial de visión

Se preparó un entorno independiente y se ejecutó RF-DETR Nano sobre tres fotogramas públicos; después se trasladó al backend y se verificó nuevamente, sin modificar la base ni enviar alertas. [Informe](../documentacion/seguridad/PRUEBA_INICIAL_RFDETR.md).


2026-11-01: prueba solicitada del flujo automático en base local; evento manual de prueba en revisión, notificaciones creadas y aviso recibido por guardia. [Informe](../documentacion/seguridad/PRUEBA_COLA_AUTOMATICA_LOCAL.md).

2026-11-01: instalación habitual aceptada; validación FCM completada tras reconstrucción, envío de seguridad y procesador local activados, prueba directa confirmada por el usuario. [Informe](../documentacion/seguridad/ACTIVACION_LOCAL_PUSH_GUARDIA.md).

2026-11-01: compilada app habitual para USB; instalación rechazada. Preparado procesador FCM continuo, aún sin activar. [Informe](../documentacion/seguridad/PREPARACION_APP_Y_PROCESADOR_FCM.md).

2026-11-01: incorporado backend FCM, respaldo local verificado, migraciones aplicadas, procedencia y bandeja habilitadas; servidor local iniciado y push pausado. [Informe](../documentacion/seguridad/INCORPORACION_BACKEND_FCM_LOCAL.md).

2026-11-01: incorporada al código móvil la mejora de inicio FCM y ejecutadas pruebas relacionadas; sin migración ni activación backend. [Informe](../documentacion/seguridad/INCORPORACION_INICIO_MOVIL_FCM.md).

2026-11-01: investigado reporte de apertura en perfil; con inicio normal aislado se abrió la bandeja en segundo plano y con proceso cerrado. Limpieza temporal completada. [Informe](../documentacion/seguridad/PRUEBA_APERTURA_NUEVO_INICIO_FCM.md).

2026-11-01: recepción en segundo plano del nuevo inicio FCM confirmada en teléfono y variante aislada; entorno temporal retirado. [Informe](../documentacion/seguridad/PRUEBA_FCM_NUEVO_INICIO_SEGUNDO_PLANO.md).

2026-11-01: instalación de prueba aceptada tras reintento del usuario; prueba FCM real en primer plano aprobada con espera simulada, limpieza del servidor y base. [Informe](../documentacion/seguridad/PRUEBA_INICIO_FCM_REAL_ESPERA.md).

2026-11-01: preparada prueba integrada aislada de inicio FCM y compilada APK; Android rechazó instalación. No hubo envío y se limpió el entorno temporal. [Informe](../documentacion/seguridad/PRUEBA_INTEGRADA_INICIO_FCM.md).

2026-11-01: revisión y propuesta aislada del inicio móvil bajo red lenta; 21 pruebas simuladas, sin modificar aplicación habitual. [Informe](../documentacion/seguridad/INICIO_MOVIL_RED_LENTA_FCM.md).

2026-11-01: revisión aislada de bloqueos, espera y clientes FCM; corrección de carrera DELETE y pruebas. [Informe](../documentacion/seguridad/REVISION_BLOQUEOS_CLIENTES_FCM.md).

2026-11-01: se ampliaron las pruebas de cierre FCM y se corrigieron dos defectos en la copia aislada; sin despliegue. [Informe](../documentacion/seguridad/PRUEBAS_ADICIONALES_CIERRE_FCM.md).

2026-11-01: corrección experimental de la carrera FCM en copia aislada y comprobaciones concurrentes; sin incorporación al backend activo. [Informe](../documentacion/seguridad/CORRECCION_CARRERA_FCM_AISLADA.md).

2026-10-31: se revisaron tiempos FCM, clientes y copia de seguridad. Se reprodujeron dos carreras con cuenta ficticia y se dejó bloqueado el parche para incorporación; se respaldó y restauró temporalmente la base local configurada, sin modificar la base. [Resultado](../documentacion/seguridad/REVISION_TRANSICION_FCM_TIEMPOS_RESPALDO.md).

2026-10-31: validada en Firebase real la procedencia de la app temporal, sin entregar avisos. Corregida la clasificación de identificadores inválidos en la copia y actualizado el parche; servidor, app, enlace y datos ficticios retirados. Backend y app habituales no migrados. [Informe](../documentacion/seguridad/PRUEBA_VALIDACION_FCM_REAL_AISLADA.md).

2026-10-31: implementada procedencia FCM en copia aislada porque el backend habitual recarga archivos automáticamente; preparado parche revisable y probados escenarios de seguridad/migración en bases temporales. Sin aplicación al backend ni datos habituales. [Resultado](../documentacion/seguridad/RESULTADO_PROCEDENCIA_FCM_AISLADA.md).

2026-10-31: revisada en modo lectura la transición al Firebase nuevo y preparados pasos para protección de procedencia, pruebas, recuperación y migración gradual. No se activaron envíos ni se alteraron datos, procesos o app habituales. La transición no está implementada. [Resultado](../documentacion/seguridad/PLAN_TRANSICION_FIREBASE_DISPOSITIVOS.md).

2026-10-31: etapa aprobada de apertura con proceso terminado. Se añadió comprobación y cierre acotado del proceso de prueba; se instaló la variante normal temporal, se envió un único aviso y se confirmó el arranque hacia alertas tras el toque. No se cambió la app habitual; limpieza temporal completada. [Informe](../documentacion/seguridad/PRUEBA_PUSH_PROCESO_CERRADO.md).

2026-10-31: se investigó el retraso observado en los ensayos con `integration_test`. Se compiló e instaló la variante temporal con inicio normal; tras un rechazo de instalación y reintento autorizado, un aviso abrió la bandeja sin intervención posterior. Usuario confirmó el resultado. Se limpiaron app y datos temporales. Los intentos anteriores y sus límites se conservan en el [informe](../documentacion/seguridad/PRUEBA_APERTURA_PUSH.md).

2026-10-31 — A petición del usuario se repitió la instalación y pasó la prueba de push en segundo plano. Tras un reintento explícito al mismo dispositivo, confirmó ver la notificación. Se retiraron recursos locales de prueba; falta migrar dispositivos habituales y probar apertura/app cerrada. [Informe](../documentacion/seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md).

2026-10-31 — Aprobada prueba en segundo plano; preparados APK, controlador, endpoint temporal y pruebas. El teléfono Xiaomi rechazó instalar sin mostrar ventana al usuario. Recursos temporales retirados; sin envío. [Informe](../documentacion/seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md).

2026-10-31 — Reanudada prueba autorizada: tras ajustar recursos nativos de la app aislada y dar salida de red al backend temporal, un aviso de seguridad fue aceptado por Firebase y recibido en primer plano; el usuario confirmó verlo. Limpieza local verificada. Pendientes segundo plano y migración de dispositivos reales. [Resultado](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

2026-10-31 — Usuario mostró API FCM V1 habilitada; se confirmó remitente y conectividad específica de Firebase. Android rechazó reintento de instalación; recursos temporales retirados. Causa del fallo de token aún no determinada. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

2026-10-31 — Usuario desbloqueó el teléfono; test aislado inició sesión pero FCM no obtuvo token (`SERVICE_NOT_AVAILABLE`). Red y servicios Google activos; APIs no verificables por 403. Sin envío. Reintento de instalación rechazado y recursos temporales retirados; revisar Cloud Messaging. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

2026-10-31 — Aprobada prueba controlada. Registrada app separada en Firebase propio, preparadas variante debug, servidor SQLite temporal y prueba de primer plano; compilación y verificaciones locales correctas. Teléfono canceló instalación; usuario consultado, enlace/base temporales retirados. Sin entrega real. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

2026-10-31 — Aprobada la continuación y la pausa temporal de push de expensas/objetos. Se configuró Firebase propio en `.env` y fuentes Android, clave fuera de repositorio, respaldo, interruptor probado y APK debug compilada sin instalación. No se verificó reinicio de servidor ni entrega; datos/dispositivos intactos. [Informe](../documentacion/seguridad/CONFIGURACION_FIREBASE_PROPIO_LOCAL.md).

2026-10-31 — Descargada por el usuario la clave privada de Firebase propio; validada sin copiar al repositorio mediante consulta de solo lectura. Añadida selección opcional por ruta privada en backend con cinco pruebas y 99 regresiones. Sin activar migración ni enviar push. [Preparación](../documentacion/seguridad/PREPARACION_FIREBASE_PROPIO.md).

2026-10-31 — El usuario creó Firebase propio y registró la app Android. Configuración descargada verificada y candidatas preparadas sin activarlas; falta credencial de servicio y el usuario pidió orientación para encontrarla. [Preparación](../documentacion/seguridad/PREPARACION_FIREBASE_PROPIO.md).

2026-10-31 — El usuario indicó que no encuentra el proyecto en sus cuentas. La API Firebase confirmó en consulta de solo lectura que existe y que la credencial local puede consultarlo; permanece sin verificar propiedad y acceso humano. Sin cambios cloud ni envío. [Diagnóstico](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

2026-10-31 — El usuario abrió Firebase: su captura muestra un proyecto distinto al configurado en la app. Se compararon identificadores públicos y se solicitó acceso a la cuenta autorizada del proyecto correcto; sin cambios en nube. [Diagnóstico](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

2026-10-31 — El usuario decidió utilizar Firebase actual para la prueba push. Diagnóstico comprobó proyectos coincidentes y ausencia de dispositivo Android activo de guardia de prueba; registros ajenos conservados. Pruebas simuladas aprobadas. No hubo envío; acceso a consola de Firebase pendiente tras vencimiento del permiso de ventana. [Informe](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

2026-10-31 — Aprobada la continuación, se completó la prueba web de roles con Playwright/Edge y Django aislado. Creación/asignación desde React, permisos, revocación, cierre y desactivación aprobados. Se conservaron cuentas reales y móvil; se verificó limpieza. Añadidos ejecutor reproducible e informe; registrados límites de actualización del menú, Stripe y avisos npm. [Resultado](../documentacion/seguridad/PRUEBA_INTEGRACION_WEB_ROLES.md).

2026-10-31 — Tras capturas de login móvil exitoso del guardia/admin, se ejecutó una prueba integral de rol personalizado. El emulador no arrancó; con autorización específica posterior al rechazo automático, la prueba pasó en app aislada del teléfono. Se retiraron app/enlace de prueba y base temporal. Firebase separado no identificado en configuración local; no se enviaron push. [Resultado](../documentacion/seguridad/PRUEBA_INTEGRACION_ANDROID_ROLES.md).

2026-10-31 — El usuario solicitó reparar web/móvil y autorizó expresamente activar roles personalizados e Inquilino tras una exigencia de revisión automática. Se restauró y ensayó el respaldo antes de aplicar las dos migraciones locales; activación completada sin asignar cuentas. USB verificado desde Android y actualización APK instalada conservando datos. Pendiente validación visual y push. [Informe](../documentacion/seguridad/ACTIVACION_LOCAL_ROLES_Y_ANDROID_USB.md).

2026-10-31 — Etapa autorizada de móvil y verificación de roles personalizados: soporte Flutter implementado, 99 pruebas backend, 8 PostgreSQL temporal, 26 solicitudes HTTP, 7 pruebas web y 71 móviles correctas; variantes aisladas y análisis Flutter comprobados. La prueba visual web permanece pendiente por bloqueo de la herramienta de navegador. Se conserva desactivación por defecto y no se migra la base habitual. [Informe](../documentacion/seguridad/RESULTADO_MOVIL_ROLES_PERSONALIZADOS.md).

2026-10-31 — Primera capacidad de roles personalizados para consultar visitas pendientes/activas, con creación y asignación en web/backend bajo interruptor desactivado. 99 pruebas backend, siete web, lint y build correctos; migraciones solo en SQLite temporal. Sin pruebas reales ni soporte móvil. [Resultado](../documentacion/seguridad/RESULTADO_CAPACIDAD_VISITAS_PERSONALIZADAS.md).

2026-10-31 — Etapa autorizada de estructura preparatoria de roles personalizados: dos modelos y migración aislada, catálogo/contrato propuesto y pruebas de denegación por defecto. 94 pruebas backend y comprobación de migraciones pasaron en SQLite en memoria; ninguna base persistente modificada. [Informe](../documentacion/seguridad/RESULTADO_ESTRUCTURA_ROLES_PERSONALIZADOS.md).

2026-10-31 — Implementación aprobada de roles predeterminados: cuatro estados visibles, habilitación explícita del grupo faltante y bloqueo de edición por API. Resultado: 91 pruebas backend, seis frontend, lint y build correctos; sin modificaciones a grupos reales. [Informe](../documentacion/seguridad/RESULTADO_ROLES_PREDETERMINADOS.md).

2026-10-31 — El usuario decidió que cada rol personalizado comenzará sin permisos hasta que el administrador seleccione sus accesos. Se registró en el plan; no implica aprobación de la siguiente etapa funcional.

2026-10-31 — Análisis inicial solicitado para roles predeterminados no editables y nuevos roles personalizados. Se contrastaron backend, asignación, React y Flutter; el diseño y las etapas se documentan en [plan](../documentacion/seguridad/PLAN_ROLES_PREDETERMINADOS_PERSONALIZADOS.md). Sin cambios funcionales o pruebas de ejecución; se verificaron enlaces y preservación del código.

Ampliación documental del 2026-10-31, posterior a la organización: se releyó el enunciado del ingeniero y se resumieron sus requisitos en `contexto/estado-proyecto.md`, actualizando el índice de contexto y el estado de memoria. Se distinguieron requisitos originales de elecciones tecnológicas posteriores. Se comprobó que el Word sigue idéntico a Git HEAD, los enlaces son válidos y los componentes no tienen cambios.

Consolidado el 2026-10-31. Las fechas exactas no disponibles se señalan; no se inventa cronología de commits. Los resultados previos proceden de informes conservados, no de nuevas ejecuciones.

| Fecha | Objetivo y resultado | Archivos/evidencia y pruebas |
| --- | --- | --- |
| 2026-10-29 | Auditoría de seguridad y propuesta inicial YOLO, ALPR y rostros; lectura, sin implementar visión | [Auditoría original](../documentacion/auditorias/Auditoria_tecnica_seguridad_IA_condominio.docx) |
| Fecha exacta pendiente; anterior a esta consolidación | Roles efectivos, aislamiento de datos, web y eventos con revisión humana | [Fase 2](../Condominio-Backend/SEGURIDAD_ROLES_FASE2.md), [fase 3](../Condominio-Backend/SEGURIDAD_DATOS_FASE3.md), [fase 7](../Condominio-Backend/SEGURIDAD_INCIDENCIAS_FASE7.md); informes de pruebas por etapa |
| Fecha exacta pendiente; anterior a esta consolidación | Revocación de sesiones; usuario aprobó volver a iniciar sesiones antiguas; aplicación local de migraciones documentada en etapa posterior | [Revocación](../Condominio-Backend/SEGURIDAD_REVOCACION_SESIONES.md), [migración de sesiones](../Condominio-Backend/PREPARACION_MIGRACION_SESIONES.md) |
| 2026-10-31 según revisión consolidada | Bandeja Flutter, aislamiento de dispositivos y preparación de cambio de cuenta; recepción real no validada | [Revisión](../Condominio-Backend/REVISION_PENDIENTES_ROLES_NOTIFICACIONES.md), [concurrencia PostgreSQL](../Condominio-Backend/RESULTADOS_POSTGRES_CONCURRENCIA_DISPOSITIVOS.md) |
| Fecha exacta pendiente; anterior a esta consolidación | Variante Android y backend aislados: lectura independiente para dos guardias ficticios; sin push | [Resultados de emulador](../Condominio-Backend/RESULTADOS_EMULADOR_BANDEJA_AISLADA.md) |
| Fecha exacta pendiente; anterior a esta consolidación | Alta de empleado con cuenta opcional; ampliación a cuatro roles con requisitos de identidad | [Cuentas de empleados](../Condominio-Backend/ROLES_CUENTAS_EMPLEADOS.md): 89 pruebas backend y cinco web según informe |
| 2026-10-31 | Organización documental, contexto, memoria e instrucciones; preservación de originales y código | [Informe de organización](../documentacion/auditorias/ORGANIZACION_DOCUMENTAL_2026-10-31.md), [verificación actual](pruebas.md) |

Decisiones vigentes: seguridad como objetivo central; cuenta opcional para empleados; ocupación con fechas pendiente; expensas históricas restringidas; RF-DETR Nano como orientación futura. Ver [registro de decisiones](../contexto/decisiones-tecnicas.md).

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

2026-11-13: a solicitud del usuario se retiraron del seguimiento Git las carpetas output y tmp, conservando sus 36 archivos existentes en disco; reglas de exclusion agregadas. Los archivos permanecen en el historial previo de Git.

2026-11-14: actualizado .env.example con nombres de variables requeridas y opcionales de integraciones, sin copiar valores de .env; FRONTEND_URL documentada segun settings. manage.py check paso usando el ejemplo con SQLite temporal. No se modifico .env ni se verificaron proveedores reales.

2026-11-14: preparada prueba push real aislada para residente, con APK debug de variante pushprueba y backend SQLite temporal. Firebase respondio a consulta de solo lectura y telefono USB autorizado; Android rechazo instalacion con INSTALL_FAILED_USER_RESTRICTED. No se envio push ni se instalo variante; app habitual permanece instalada. Enlace USB temporal y servidor detenidos; define y log temporales retirados. APK app-debug generada corresponde a variante de prueba, no a la app habitual. Pendiente instalacion aceptada, ejecucion y confirmacion de recepcion.

2026-11-14: el usuario autorizo el reintento e indico que el telefono tiene internet. La instalacion de la variante Android de prueba y el inicio de sesion ficticio funcionaron; en dos intentos Firebase devolvio SERVICE_NOT_AVAILABLE y no registro el dispositivo. La configuracion Firebase de la variante coincide con el proyecto; Android informa red validada y servicios de Google habilitados. En bases SQLite temporales se comprobaron cero dispositivos, avisos y entregas: no se envio push. Servidor y enlace USB temporal detenidos; app habitual instalada y variante de prueba retirada. Queda pendiente diagnosticar Firebase y validar recepcion real y apertura del aviso. El APK app-debug generado corresponde a la variante de prueba.

2026-11-14: se repitio la prueba aislada de aviso al residente con telefono autorizado. La app de prueba inicio, pero Firebase volvio a indicar SERVICE_NOT_AVAILABLE y no se registro el dispositivo; prueba fallo antes de enviar un aviso. Se detuvo el servidor y se retiro el enlace USB; la app habitual sigue instalada y la variante de prueba no permanece instalada. Pendiente investigar la disponibilidad de Firebase y validar la recepcion real.

2026-11-14: Tras reinicio autorizado se repitio el recorrido de residente en Android con cuenta ficticia, SQLite temporal y un solo dispositivo. Se recibio FCM y la prueba abrio el aviso y su evidencia mediante navegacion simulada.

2026-11-14: Con Android autorizado se instalo variante aislada y se probo envio FCM en segundo plano. El usuario confirmo toque de la notificacion y el recorrido automatizado abrio aviso ficticio y pantalla de evidencia.

2026-11-14: Por solicitud del usuario se creo cuenta ficticia en la base local y se probo aviso FCM desde el sistema local con app de prueba cerrada. Usuario confirmo recepcion y apertura de Mis avisos. Se reservo especificamente la unica entrega ficticia sin procesar la cola ajena.

2026-11-14: Actualizacion visual del frontend solicitada por el usuario con referencia a camaras; no se modifico backend. Se revisaron pantallas representativas mediante datos simulados y se actualizaron selectores de acceso en pruebas web.

2026-11-14: A solicitud del usuario se diferenciaron visualmente los botones del frontend y se verificaron crear, editar, desactivar, cancelar y eliminar con datos ficticios.

2026-11-14: El usuario autorizo eliminar roles nuevos salvo los cuatro principales. Se agrego DELETE administrativo de roles personalizados sin cuentas asignadas y accion web con confirmacion; se mantuvieron controles y trazabilidad.

2026-11-14: A solicitud del usuario se reviso la cuenta ficticia local y se ejecuto validacion real FCM sin entregar datos del residente ni persistir cambios. Se reenvio el aviso de prueba existente al unico telefono autorizado; no se creo otra incidencia. Las pruebas de concurrencia se alinearon al contrato vigente y pasaron dos veces.

2026-11-14: Se recupero el acceso de la cuenta ficticia en Android tras solicitud del usuario, sin tocar cuentas reales. La pantalla mostro Mis avisos y el evento de prueba.

2026-11-14: Tras confirmacion del usuario se cerro la prueba real local. Solo se desactivaron cuentas y dispositivo ficticios identificados, y se retiro variante movil y enlace temporal. Historial y evidencia de la incidencia de prueba conservados.

2026-11-14: Por solicitud se ajusto la apariencia movil a la web sin alterar permisos ni servicios. Se revisaron vistas previas ficticias de acceso, perfil y avisos, y se agregaron pruebas de pantalla pequena y acceso por rol.

2026-11-14: Usuario confirmo que usa USB. Se verificaron identificador y firma del APK, se compilo la app con la direccion documentada y se actualizo la app habitual sin desinstalarla; enlace USB restaurado.

2026-11-14: El usuario reviso en su telefono la actualizacion movil e indico que el diseno se ve bien.

2026-11-14: Usuario conecto y autorizo segundo telefono; la instalacion fue rechazada hasta habilitar instalar mediante USB. Luego se instalo el APK de desarrollo, se configuro ADB reverse y se retiro una copia temporal de Descargas.

2026-11-14: Por solicitud se incorporo navegacion inferior movil, ajustes y distincion de avisos nuevos e historial leido usando APIs existentes. Se agregaron pruebas de actualizacion, roles, detalles y revocacion. App habitual actualizada en el telefono conectado sin desinstalar.

2026-11-14: Corregida la instalacion movil tras informar el usuario que la barra no aparecia: el APK previo no incluia la nueva navegacion. Una recompilacion y comparacion del contenido precedieron la actualizacion en el Xiaomi.

2026-11-14: Se observo en el Xiaomi la barra de cuatro opciones tras la recompilacion corregida, sin consultar datos personales.

2026-11-14: El usuario confirmo la aparicion de la barra inferior corregida en el segundo telefono.
# 2026-11-14

Se ajustó la navegación móvil a petición del usuario, conservando accesos por rol y la ruta de notificaciones push. Se implementó la separación por estados existente en seguridad sin modificar Django ni sus datos.

# 2026-11-14 — Incidencias web

El usuario aclaró que solo al confirmarse pasa una incidencia al historial; se separaron los eventos descartados para mantener trazabilidad.

Se adaptó la revisión web solicitada a las transiciones y permisos existentes. La clasificación web tras confirmar difiere de la móvil previa, sin modificar estados ni el cliente móvil.

# 2026-11-14 — Análisis de archivo

Por solicitud del usuario se equiparó la visualización y regla de permanencia del video con Imou, sin iniciar cámaras ni modificar backend. Se usaron únicamente video y respuestas ficticias durante las pruebas.

# 2026-11-14 — Modos de monitor

Implementados los modos solicitados y el cambio visual a amarillo a los 5 segundos; la alerta mantiene el umbral y proceso existentes. Sin modificaciones en Django ni envíos de prueba a guardias reales.

# 2026-11-14 — Tercer modo de detección

Se agregó el modo solicitado para visualizar solo vehículos dentro de zona, conservando la regla y los avisos existentes.

# 2026-11-14 — Exportación del análisis

Se sustituyó la descarga engañosa del original en el visor analizado por una exportación de los fotogramas y recuadros ya calculados, sin cambiar cámara ni backend.

# 2026-11-15 — Revisión de guardia y retiro de incidencias

Se ajustó la navegación web de guardia y se solicitó definir si retirar una incidencia revisada significa archivo reversible o borrado definitivo. Sin cambios de backend o datos.

# 2026-11-15 — Guardias, historial y contraseña

Por solicitud del usuario se simplificó la navegación web/móvil del guardia, se ubicaron confirmadas en historial y se completó el cambio de contraseña, antes inexistente en backend. Se usaron únicamente cuentas ficticias en las pruebas y no se aplicaron migraciones.

# 2026-11-15 — Confirmación desde el teléfono

Por aclaración del usuario se implementó confirmación móvil para guardias y se simplificó la web administrativa sin alterar el procesamiento de notificaciones. Revisión y aviso a residente permanecen en web.

# 2026-11-15 — Contraseña de cuenta compartida

Se aclaró y verificó con cuenta ficticia que web y móvil usan la contraseña de la misma cuenta Django. El catálogo no puede recuperar ni mostrar la contraseña anterior. No se modificaron credenciales reales.


2026-11-15: por solicitud del usuario se eliminó de la base local la incidencia de prueba de estacionamiento vinculada al guardia ficticio, junto con sus cuatro registros de historial, evidencia, notificación y entrega; también se eliminó la cuenta ficticia del guardia y su empleado de prueba. La cuenta ficticia residente se conservó. La operación fue transaccional y se comprobó la ausencia del evento y del usuario.

2026-11-15: a solicitud del usuario se eliminó transaccionalmente de la base local la cuenta inactiva residente ficticia de prueba, su perfil y vehículo ficticios, dispositivo, sesiones, tokens y registros dependientes. Se verificó que la cuenta ya no existe.

2026-11-15: runserver local supervisa los puentes Imou y catálogo con el entorno de visión existente, sin iniciar IA; detecta puertos ocupados, reintenta procesos y solicita cierre autenticado de procesos propios. Los puertos siguen fijos (28766 y 28768); un servicio ajeno puede bloquearlos. Se probaron tres casos simulados y el inicio real de ambos puentes con un servidor temporal, sin abrir cámara. Falta validar reconexión, cierre y monitoreo real; no aplica automáticamente a producción.

2026-11-15: las vistas Imou y catálogo reintentan cada cinco segundos tras fallos de imagen; permisos denegados detienen la vista y un fallo de Imou desactiva la IA y registro. La compilación web pasó. Al ocultar la pestaña siguen deteniéndose y no se garantiza análisis continuo; validación real de reconexión pendiente.

2026-11-15: por solicitud del usuario, el monitor Imou muestra solo vehículos dentro de la zona guardada: verde al detectar, amarillo durante el tiempo de tolerancia y rojo al cumplir el umbral. El aviso preliminar de estacionamiento de Imou se crea para guardias y administradores; sigue pendiente de revisión. La prueba simulada usó SQLite en memoria, sin envío real: 11 pruebas backend y 17 de seguimiento/colores pasaron; build web correcto. Falta validación visual real y recepción push con cuentas autorizadas.

2026-11-15: comprobada la configuración compartida de zona Imou entre ajustes y monitor: el componente aplica la misma zona y tiempo guardados en Django. Se aclaró el vínculo en la pantalla y se amplió la prueba de navegador con API e imágenes simuladas para validar guardado, retorno al monitor y filtro de objetos; prueba integral y build web correctos. Actualmente se admite una sola zona de estacionamiento Imou; múltiples zonas y tipos de incidencia requieren ampliación posterior. Sin migraciones ni pruebas con cámara real.

2026-11-15: Configuración de análisis se movió al submenú Cámaras; monitor y ajustes comparten la misma ruta con estado de vista, evitando desmontar la Imou al alternar. Zona, tiempo y avisos Imou se aplican con Guardar configuración; las cámaras de catálogo también usan borrador y guardado explícito. Pruebas simuladas: navegación y guardado Imou (incluido borrador sin aplicar y fallo con reintento), catálogo y compilación web correctos; guardado de catálogo y visualización con cámara real pendientes. Sin cambios de backend ni migraciones.

2026-11-15: los botones Ver cámara Imou y Detener vista Imou se ubicaron horizontalmente entre el título y el video; los controles adicionales quedaron debajo para ampliar el monitor. Build web correcto; pendiente validación visual por el usuario. Sin cambios de backend.

2026-11-15: el submenú y encabezado de configuración se renombraron a Configuración de incidencias, con icono y estilo diferenciados del monitor. Se mantuvo la misma ruta interna y configuración. Build web y recorrido Imou con API simulada correctos; sin cambios del backend ni pruebas con cámara real.

2026-11-15: Gestión de cámaras ofrece enlaces Ver cámara y Configurar incidencias para cámaras de red habilitadas; el monitor acepta la cámara seleccionada por enlace, muestra las cámaras disponibles y permite un mosaico con inicio manual por cámara. Las zonas siguen independientes; análisis y alertas automáticas de cámaras adicionales no se incorporaron. Build web y pruebas simuladas de enlaces, dos vistas y guardado de zona pasaron; falta validar con una segunda cámara real. Sin cambios de backend ni migraciones.

2026-11-15: se comprobó en la base local que la Imou está vinculada y no hay cámaras de red adicionales habilitadas. La opción Ver varias cámaras se mantiene visible aun sin cámaras adicionales, con orientación hacia Gestión de cámaras. Build web y recorrido Imou simulado correctos; no se modificaron cámaras ni datos.

2026-11-15: el monitor en mosaico ofrece Ampliar para cada cámara y mantiene montadas las vistas iniciadas al seleccionar una y volver; las cámaras de catálogo permiten pantalla completa y ocupan el ancho disponible. El mosaico oculta controles secundarios sin desmontarlos. Build y prueba de navegador con dos cámaras simuladas pasaron; sin prueba con segunda cámara física ni cambios de backend.

2026-11-15: por observación del usuario, el monitor abre directamente en mosaico con tarjetas compactas y acceso Agregar cámara; Ampliar muestra una cámara y la vista múltiple conserva las cámaras iniciadas. Los enlaces directos a una cámara siguen abriéndola seleccionada. Build web y pruebas de navegador con cámaras simuladas correctos; falta revisión visual con el usuario y validación con segunda cámara real. Sin cambios de backend.

2026-11-15: rediseñado el mosaico del monitor en cuadros 16:9 uniformes con imagen, nombre y control integrados; seleccionar la imagen amplía la cámara y Agregar cámara conserva el mismo tamaño de cuadro. Vista comprobada con captura y dos cámaras simuladas, build y recorridos simulados Imou y catálogo correctos; falta validación con cámaras físicas. Sin cambios de backend.

2026-11-15: controles compactos Ver/Detener y botón de ampliación se colocaron en una barra superior fuera de las imágenes del mosaico, para Imou y cámaras de catálogo. Build, prueba de dos cámaras simuladas, recorrido Imou y revisión visual de captura simulada correctos; falta validación visual del usuario con cámara real. Sin cambios de backend.

2026-11-15: por solicitud del usuario se ocultó el selector de fuentes en Monitor en vivo y se añadió Volver al mosaico en la vista ampliada. La selección de cámara permanece en Configuración de incidencias; incorporar la cámara de laptop al mosaico queda para otra etapa. Build web y recorridos de Imou y dos cámaras simuladas correctos; sin cambios de backend ni prueba física.

2026-11-15: la ampliación alterna el tamaño de la cámara dentro del mosaico mediante el mismo icono; no cambia a la vista independiente. Las demás cámaras permanecen visibles y activas. Gestión de cámaras puede abrir la cámara resaltada en el mismo mosaico; Configuración de incidencias conserva sus controles. Build y pruebas de dos cámaras e Imou simuladas correctos; falta validación visual física. Sin cambios de backend.

2026-11-15: Gestión de cámaras permite eliminación con confirmación y auditoría solo para administrador; Django rechaza la eliminación si hay vínculos protegidos de monitor, configuración o historial. En el mosaico, Agregar cámara abre un selector de cámaras de red habilitadas; ocultar una vista no detiene una transmisión iniciada y la selección es temporal en la página. Pasaron 28 pruebas backend con SQLite en memoria, dos recorridos web simulados y build; sin eliminación real ni migraciones. Falta validación en interfaz con cámaras físicas.

2026-11-15: retirada de Gestión de cámaras la sección de preferencias no operativas Funciones previstas. Se conservan backend y datos existentes. Build web y recorrido simulado del catálogo correctos; sin cambios en cámaras reales.

2026-11-15: Configuración de incidencias identifica la cámara seleccionada y aclara el alcance individual. Se agruparon los controles existentes de lectura de placas por cámara y la consulta puntual ahora indica el identificador de la cámara en la solicitud. Prueba web con dos cámaras simuladas verificó zonas y tiempos independientes y origen de placa distinto; cinco pruebas backend de zonas y build web pasaron. Las cámaras de catálogo aún no generan automáticamente incidencias por zona; la lectura automática es una activación de sesión y usa servicio externo. Sin migraciones ni cambios en datos reales.
# 2026-11-15 — monitor de cámara local

Se integró la fuente local al mosaico y se añadió persistencia de su configuración en el navegador. La comprobación es simulada; quedan pendientes las capacidades indicadas en `pendientes.md`.

2026-11-16: Agregada opci?n de proveedor alojado Roboflow para IA remota; pendiente validaci?n real. Ver pruebas.md.

2026-11-16: Diagnosticado error 404 y corregido endpoint Roboflow; validaci?n sint?tica real realizada.

2026-11-16: Mejorada presentacion de configuracion de incidencias y analisis de video sin cambios de backend.

2026-11-16: Actualizado flujo de revision de administrador y guardia en API, web y movil; retirada auditada en lugar de borrado fisico.

2026-11-16: Ajustado detalle de revision en monitor para mostrar la accion y el resultado.

2026-11-16: Ajustado flujo de revision en el monitor conforme a solicitud del usuario.

2026-11-16: Menu lateral reorganizado a pedido del usuario.

2026-11-16: Diagnosticada carga de incidencias tras reordenar menu; sin evidencia de relacion causal con el menu.

2026-11-16: Revisadas notificaciones de estacionamiento y piscina; pruebas simuladas y estado de cola, sin enviar avisos reales.

2026-11-16: Prueba individual FCM del guardia iniciada tras autorizacion; se creo evento ficticio identificado, sin procesar cola previa.

2026-11-16: Enviados dos avisos ficticios autorizados al guardia, usando registro y cola habituales y procesando solamente sus entregas; usuario confirmo ambos.

2026-11-16: Anadidos titulos y mensajes distintos para alertas de piscina y estacionamiento.

2026-11-16: Comprobados en telefono mensajes FCM diferenciados para piscina y estacionamiento.

2026-11-16: Preparada apariencia de notificaciones Android segun solicitud del usuario.

2026-11-16: Actualizada APK y comprobada en telefono apariencia de alerta de piscina.

2026-11-16: Actualizado historial movil y APK del telefono conectado.

2026-11-16: Verificado orden de llegada del historial movil y restriccion del gesto a historial.

2026-11-16: Reinstalada la APK a solicitud del usuario porque no observaba el cambio en historial.

2026-11-16: Corregida compilacion movil obsoleta y reinstalada APK tras reporte de usuario.

2026-11-16: Implementado gesto para actualizar incidencias moviles e instalada APK.

2026-11-16: Implementada actualizacion manual tactil para incidencias web.

2026-11-16: Alineada vista web del guardia con historial movil de lista unica.
