# Historial del trabajo

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
