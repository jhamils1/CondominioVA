# Pendientes

2026-11-16: el usuario todavía no tiene servidor de IA remota. Preparar y configurar uno solo cuando esté disponible; probar TLS, protección, versiones y pesos equivalentes, detecciones, latencia, disponibilidad y costo con imágenes autorizadas. La selección actual no altera el monitor independiente ni soporta la interfaz de Django desde otro equipo.

2026-11-16: validar la regla de piscina con video y cámaras físicas autorizados, bajo revisión humana, y verificar recepción del aviso. La detección no reconoce ahogamientos ni garantiza que no haya personas fuera de cámara. La vista y la IA deben estar activas; varias sesiones o pérdidas de seguimiento pueden duplicar eventos. La webcam conserva la regla por dispositivo en su navegador. Los eventos web se registran con origen MANUAL en la API actual, aunque la descripción explica que son detecciones automáticas; evaluar una procedencia confiable.

2026-11-15: validar con cámara IP adicional y webcam físicas el seguimiento, evidencia y entrega al teléfono, así como el nuevo orden de configuración y la presentación de la lectura con el proveedor real. El análisis web requiere mantener activa la página; no es un servicio continuo, y varias sesiones pueden duplicar eventos. La webcam admite un dispositivo a la vez. Sus lecturas de placas no se vinculan automáticamente a una incidencia. Evaluar identificación persistente y reintentos después de cerrar la página.

2026-11-15: validar visualmente los controles para mostrar contraseñas y el formulario de usuario en el entorno del usuario; la contraseña almacenada no es recuperable y no se presenta en el catálogo.

2026-11-15: verificar con incidencia ficticia y guardia autorizado la confirmación móvil real y la recepción del aviso por administrador; no se modificaron incidentes reales ni se enviaron avisos en esta etapa. La verificación y envío al residente sigue disponible en web, no se agregó al móvil.

2026-11-15: confirmar visualmente con el usuario los menús e historial en la web y el teléfono actualizado. Validar con cuenta ficticia y autorización expresa el cambio de contraseña de extremo a extremo y recepción push después de revocaciones; no se cambiaron cuentas reales.

2026-11-15: pendiente respuesta del usuario sobre archivar conservando auditoría o borrar definitivamente incidencias revisadas para el administrador. No está implementado. Validar visualmente navegación web del guardia.

2026-11-14: comprobar exportación con el video y navegador del usuario; la salida actual es WebM sin audio, tarda aproximadamente la duración del video y requiere mantener la pestaña abierta. Evaluar conservación de sonido si el usuario la solicita.

2026-11-14: verificar el nuevo modo «Vehículos en zona» con una cámara o video autorizado, incluidos entrada y salida de zona y recepción de alertas.

2026-11-14: comprobar visualmente los modos y tiempos con cámara/video autorizados y recepción por un guardia. En Imou el registro automático debe estar habilitado; una configuración guardada de 5 s requiere cambiarse para mostrar amarillo antes de rojo.

2026-11-14: validar con video autorizado la precisión de zona, seguimiento, colores y recepción real por guardias; los eventos de grabación pueden corresponder a hechos antiguos. Falta comprobar el procesamiento y entrega push en el entorno operativo y gestionar duplicados entre análisis repetidos.

2026-11-14: validar visualmente el flujo web con el usuario y, con autorización apropiada, probar aviso de extremo a extremo con datos ficticios y recepción móvil. Alinear el historial móvil en una etapa posterior si el usuario lo solicita: la web incluye confirmadas y en atención; el móvil las conserva activas y muestra descartados en su historial.

2026-11-14: validar visualmente en el Xiaomi la transición derecha y las listas con incidencias reales autorizadas. El móvil consulta estados y detalle; confirmar, descartar o resolver desde la app no forma parte de este cambio.

2026-11-07: validar zona en segunda cámara física y después diseñar procesamiento y eventos asociados a cámara; las zonas nuevas aún no activan IA ni alertas. [Detalle](../documentacion/seguridad/ZONAS_CAMARAS_CATALOGO.md).

2026-11-07: probar selección y video de una segunda cámara RTSP real autorizada; zonas, eventos y permisos individuales por cámara siguen pendientes. [Detalle](../documentacion/seguridad/MONITOR_CAMARAS_CATALOGO.md).

2026-11-07: probar con cámara real permanencia prolongada, salida y regreso y dos vehículos; verificar push y reiniciar el monitor independiente si se utiliza. [Detalle](../documentacion/seguridad/AVISOS_REPETIDOS_IMOU.md).

2026-11-07: confirmar imagen del catálogo en navegador y probar monitor por Ethernet y sin Wi-Fi. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: comprobar por qué el puente del catálogo permanece conectando y verificar fotograma, antes de la prueba Ethernet. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: reiniciar el puente actualizado, vincular Imou al catálogo y comprobar imagen real; después probar IP Ethernet y operación sin Wi-Fi. Falta soporte de monitor y zonas para múltiples cámaras. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: integrar y verificar en el monitor la dirección Ethernet 192.168.1.108 sin perder la configuración Wi-Fi ni desasociar el catálogo; probar persistencia y cámara sin Wi-Fi. Conexión RTSP directa por Ethernet ya entrega fotogramas en prueba aislada. [Detalle](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-07: comprobar candidata Ethernet 192.168.1.108 con PC en subred compatible, identificar cámara y verificar RTSP; el usuario recibió instrucciones, pendiente su confirmación. [Detalle](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-07: resolver DHCP o IP fija para enlace directo Imou–PC, confirmar identidad del dispositivo y probar RTSP por Ethernet. Proceso actual no es administrador; Wi-Fi permanece conectado. [Diagnóstico](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-07: verificar formulario web ONVIF con sesión del usuario y su Imou sin guardar cámara duplicada; ya se comprobó fotograma en cada uno de sus dos perfiles y la acción API con autenticación simulada. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: comprobar lectura de video con perfiles ONVIF devueltos y recorrido completo del formulario sin crear registros duplicados; diagnóstico de intermitencia y cámaras de otras marcas sigue pendiente. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: evaluar si es necesario guardar el nombre y la identidad del perfil ONVIF para mostrarlo en edición; actualmente se conservan ruta y puerto, no el nombre. Probar con cámara real.

2026-11-07: probar con cámara física la obtención de puerto anunciado y consulta de perfiles ONVIF; evaluar servicios HTTPS y rutas ONVIF diferentes, sin asumir compatibilidad. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: verificar consulta ONVIF con cámara autorizada y puerto/credenciales correctos; evaluar HTTPS, Media 2, rutas no compatibles y control de concurrencia. Después integrar monitor de cámaras genéricas. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: usuario comprobará reintento ONVIF e indicación de cámaras registradas en su red. Si persiste intermitencia, diagnosticar interfaz, multicast, firewall y comportamiento del dispositivo sin suponer causa.

2026-11-07: probar descubrimiento ONVIF en red y cámara autorizadas, revisar interfaces múltiples y firewall; evaluar obtención autenticada de ruta RTSP. Seguir con monitor genérico y eventos por cámara. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: diseñar y probar descubrimiento compatible de cámaras, con selección explícita y alternativa manual; verificar en dispositivo real autorizado. Seguir con monitor de cámaras genéricas y eventos por cámara. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: usuario revisará la ruta local mostrada al editar Imou. La edición unificada de la configuración real de Imou sigue pendiente; el campo mostrado es de solo lectura.

2026-11-07: probar conexión RTSP genérica con un dispositivo compatible autorizado y ruta de fabricante; implementar visualización por cámara, controles de red y concurrencia adecuados al despliegue, y posteriormente análisis y eventos por cámara. La comprobación puntual ya está implementada con proveedor simulado. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: verificar visualmente los controles de credenciales y el usuario de Imou en el entorno real. La conexi?n RTSP gen?rica y el uso de credenciales para nuevas c?maras siguen pendientes; el cat?logo a?n no conecta dispositivos gen?ricos.

2026-11-07: implementar y probar conexión RTSP genérica segura por cámara, uso de credenciales cifradas, control de red, permisos y selección en monitor. Conservar y respaldar clave privada de cifrado; no generar otra si se pierde. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: verificar con el usuario el menú reorganizado; no se agregó tercer submenú porque no se indicó su nombre. Continúan pendientes conexión genérica, credenciales protegidas, control real y autorización por cámara. [Detalle](../documentacion/seguridad/MENU_MONITOR_CAMARAS.md).

2026-11-06: usuario revisará menú y vistas reales; aclarar tercer submenú mencionado sin nombre. Sigue pendiente autorización por cámara y filtro por cámara. [Detalle](../documentacion/seguridad/MENU_MONITOR_CAMARAS.md).

2026-11-06: usuario verificará botón «Probar conexión» con Imou real; diseñar control efectivo de cámara y monitor (habilitación del catálogo no lo detiene). [Detalle](../documentacion/seguridad/VINCULO_IMOU_CATALOGO.md).

2026-11-06: conectar y encender Imou, agregarla al catálogo y probar puente real; la prueba del puerto RTSP no respondió. Catálogo aún sin relación estable, soporte genérico ni control efectivo del monitor. [Detalle](../documentacion/seguridad/VINCULO_IMOU_CATALOGO.md).

2026-11-06: usuario revisará catálogo; esperar aprobación para vincular Imou de manera segura. Varias cámaras, permisos individuales, zonas/eventos por cámara, matrícula y avisos a residentes son etapas futuras. [Plan](../documentacion/seguridad/PLAN_CAMARAS_Y_AVISOS_RESIDENTES.md).

2026-11-05: probar monitor Imou independiente con cámara y teléfono reales cerrando la web; falta arranque automático, cola durable local y deduplicación entre reinicios. [Detalle](../documentacion/seguridad/MONITOREO_IMOU_INDEPENDIENTE.md).

2026-11-05: resolver conectividad y verificar video Imou por Ethernet directo sin internet; la IP temporal solicitada no respondió a RTSP. [Detalle](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-05: comprobar con cámara y teléfono reales el guardado automático, reemplazo/eliminación de zona y envío a guardia; no se modificó la zona real durante las pruebas. [Detalle](../documentacion/seguridad/GUARDADO_AUTOMATICO_ZONA_IMOU.md).

2026-11-05: administrador debe guardar zona Imou con registro automático habilitado y comprobar nuevo evento/aviso; no había configuración persistida durante el diagnóstico. No se activó desde herramientas. [Detalle](../documentacion/seguridad/REGISTRO_IMOU_CONFIGURACION_PENDIENTE.md).

2026-11-05: verificar con la maqueta el seguimiento Imou ante pérdidas breves, punto de contacto y ritmo de muestras. La precisión real del detector no se midió en esta etapa. [Detalle](../documentacion/seguridad/ESTABILIDAD_SEGUIMIENTO_IMOU.md).

2026-11-05: comprobar con la cámara real la configuración compartida del administrador y su uso por el guardia. Siguen pendientes detección autónoma, deduplicación y cámaras múltiples. [Detalle](../documentacion/seguridad/ZONA_IMOU_COMPARTIDA.md).

2026-11-05: verificar con la Imou real la vista única de configuración, la zona y los controles de IA. [Detalle](../documentacion/seguridad/REDISENO_CENTRO_SEGURIDAD.md).

2026-11-05: comprobar con el usuario la nueva vista de monitoreo, las cámaras reales, controles de IA, zona, evidencia y entrega de avisos; los recorridos de esta etapa fueron simulados. [Detalle](../documentacion/seguridad/REDISENO_CENTRO_SEGURIDAD.md).

2026-11-05: recargar la sesión Flutter y validar un nuevo evento real Imou con evidencia en web y móvil. Pendientes política de retención, cuotas, restauración de respaldo, asignación por cámara, deduplicación y operación sin navegador. [Informe](../documentacion/seguridad/EVIDENCIA_IMOU.md).

2026-11-05: usuario probará después zona, permanencia y entrega real desde Imou a móvil. Pendientes evidencia, deduplicación robusta, reintentos persistentes, identificación de cámara y operación sin navegador; inicio automático de procesos no implementado. [Informe](../documentacion/seguridad/REGISTRO_IMOU_LOCAL.md).

2026-11-05: el usuario debe comprobar zona y permanencia Imou con cámara y maqueta; pruebas actuales son simuladas. Después, por etapa aprobada, diseñar registro/notificación confiables, evidencia y operación autónoma. [Informe](../documentacion/seguridad/ZONA_IMOU_TEMPORAL.md).

2026-11-05: confirmar con el usuario la nueva alineación de las vistas Imou. Su captura ya muestra recuadros de IA; siguen pendientes precisión, rendimiento sostenido, zonas, alertas y evidencia. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: probar con el usuario detecciones visibles de objetos en la Imou y rendimiento sostenido. Pendientes etapa de zonas y alertas para Imou, evidencia y vigilancia autónoma. La vista y la IA existentes requieren servicios locales y la página activa. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: vista Imou implementada y puente real verificado; confirmar visualización/ampliación en sesión web del usuario y coexistencia con Imou Life. Siguiente etapa requiere aprobación: conectar fuente IP a IA/reglas. No hay arranque automático, grabación ni alertas desde Imou. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: autenticación y lectura de un fotograma Imou resueltas por Wi-Fi (640 x 480). Siguiente etapa por aprobar: visualización IP en web preservando webcam; después IA, reconexión y reglas por cámara. Simultaneidad con Imou Life y Ethernet aún no comprobados. [Resultado](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: verificar usuario y clave local de la Imou antes de repetir lectura: DESCRIBE autenticado devolvió 401. La clave ya está completada, no debe solicitarse en el chat. Se mantiene Wi-Fi por decisión del usuario. [Detalle](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: índice automático corregido y comprobado en Word. Completar datos y redactar bajo los títulos del [nuevo documento](../output/pdf/caratula_indice_condominio_automatico.docx); usar «Actualizar toda la tabla» tras editar. La comprobación visual pendiente del Word anterior queda superada por esta versión.

2026-11-05: completar localmente credenciales de la Imou y confirmar IP si se conecta por RJ45; probar lectura de un fotograma. Pendientes integración RTSP en web/IA y coexistencia con Imou Life. La webcam se conserva. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: revisar visualmente la versión Word editable en Word o LibreOffice; el renderizador de documentos no encontró LibreOffice y la exportación de prueba con Word no se completó.

2026-11-05: para usar la [carátula e índice académico](../output/pdf/caratula_indice_condominio.pdf), completar grupo, integrantes y docente y actualizar las páginas de referencia al integrar el informe completo. Esta entrega solicitada contiene únicamente carátula e índice; no autoriza redactar capítulos ni ejecutar sprints.

2026-11-05: el usuario aclaró que la repetición reportada fue una equivocación; no queda esa investigación pendiente.

2026-11-05: el usuario confirmó recibir una notificación tras el envío de tres avisos de prueba aceptados por Firebase; no precisó cuántos recibió. El procesador continuo se inició localmente y falta preparar su arranque automático. [Informe](../documentacion/seguridad/REACTIVACION_FCM_VIDEO_2026_11_05.md).

2026-11-04: comprobados zona y reintento con cámara y API simuladas; verificar con el usuario la cámara física y entrega real. Deduplicación ante pérdida, reintentos persistentes, evidencias, identificación de cámara y operación autónoma continúan pendientes. [Informe](../documentacion/seguridad/REGISTRO_CAMARA_DEMOSTRACION.md).

2026-11-04: verificar dibujo, ocultación y permanencia de zona en cámara con maqueta; medir la separación de muestras. Pendientes zona persistente por cámara, evidencia, evento/aviso y operación autónoma. [Informe](../documentacion/seguridad/ZONA_CAMARA_DEMOSTRACION.md).

2026-11-04: el usuario confirmó recepción en el teléfono del evento manual de video. El procesador se ejecutó para un lote único; funcionamiento continuo sigue pendiente. [Informe](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

2026-11-04: verificar en interfaz el nuevo registro automático optativo con el usuario; deduplicación entre análisis, persistencia de reintentos, ingesta de servicio IA, evidencias y cámara permanecen pendientes. [Informe](../documentacion/seguridad/REGISTRO_AUTOMATICO_VIDEO.md).

2026-11-04: probar con el usuario la preparación de un evento desde video; cualquier envío real crea un evento y avisos para guardias. Diseñar ingesta automática autenticada, evidencia y deduplicación antes de uso operativo. [Detalle](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

## Zona y permanencia — 2026-11-04

Zona temporal y estimación básica de permanencia en video disponibles; falta revisión con el usuario y medir precisión. Pendientes zonas persistentes por cámara, seguimiento robusto en vivo, deduplicación confiable, evidencia y conexión segura con eventos/alertas de Django. [Informe](../documentacion/seguridad/PERMANENCIA_VIDEO.md).

## Archivo de video desde la web — 2026-11-02

El usuario pidió controles dentro del video; se incorporó reproductor nativo con recuadros superpuestos y falta que lo pruebe en su sesión. No genera video descargable, eventos ni alertas. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## Cámara de demostración — 2026-11-02

El usuario confirmó que ve la cámara y los recuadros. Pendiente confirmar que «Detener cámara» libera la cámara y evaluar juguetes, rendimiento sostenido, zonas y alertas. El servicio local se inició temporalmente y puede detenerse al reiniciar el equipo. [Informe](../documentacion/seguridad/CAMARA_LOCAL_DEMOSTRACION.md).

## Visualización de demostración — 2026-11-01

El usuario confirmó la visualización en administrador; posteriormente aprobó retirar esta sección fija, ya eliminada. [Informe de retiro](../documentacion/seguridad/RETIRO_VIDEO_DEMOSTRACION.md).

## Visión: siguientes etapas — 2026-11-01

El video grabado completo ya se procesa y genera una copia anotada, revisada en la web por el usuario. Pendientes zonas y reglas temporales, cámaras en vivo, ingesta autenticada de IA, evidencia y alertas. [Informe](../documentacion/seguridad/VIDEO_COMPLETO_RFDETR.md).

## Datos de demostración y continuidad — 2026-11-01

En futuras pruebas, identificar los datos temporales creados y su limpieza, preservando datos anteriores e historial cuya eliminación no esté autorizada. El evento de prueba anterior sigue registrado; no se ha eliminado en esta etapa. El usuario hará pruebas manuales. La memoria local debe respaldarse o guardarse en un repositorio accesible para consultarla desde otra cuenta o equipo.

## Visión artificial — 2026-11-01

Primera prueba estática completada en CPU y organizada dentro del backend. Posteriormente se procesó el video grabado completo; siguen pendientes mediciones de carga representativa, mascotas, zonas, ingesta autenticada, evidencia y alertas con revisión humana. [Informe inicial](../documentacion/seguridad/PRUEBA_INICIAL_RFDETR.md).


2026-11-01: recorrido de servicio → cola → Firebase → teléfono confirmado con evento manual de prueba en base local. Pendientes: integración de cámaras/IA, flujo web y confirmación/aviso al administrador, operación persistente y transición de otros dispositivos. No repetir esta prueba como si estuviera pendiente. [Informe](../documentacion/seguridad/PRUEBA_COLA_AUTOMATICA_LOCAL.md).

2026-11-01: validar recorrido completo de evento por cola y procesador en base local cuando exista un evento autorizado, sin crear incidencias ficticias sin acordarlo. Preparar operación persistente de servidor/procesador, conectividad de app y transición de dispositivos anteriores; push financiero y objetos continúa pausado. [Informe](../documentacion/seguridad/ACTIVACION_LOCAL_PUSH_GUARDIA.md).

2026-11-01: esperar teléfono desbloqueado para reintentar instalación de APK habitual, iniciar sesión con guardia de prueba y verificar registro; después coordinar activación y procesador de seguridad. Push financiero y objetos sigue pausado. [Informe](../documentacion/seguridad/PREPARACION_APP_Y_PROCESADOR_FCM.md).

2026-11-01: probar la bandeja web con inicio de sesión real; instalar/configurar app habitual y validar dispositivo propio, definir activación de cola/envíos de seguridad y operación continua del procesador. Mantener push financiero legado pausado. [Informe](../documentacion/seguridad/INCORPORACION_BACKEND_FCM_LOCAL.md).

2026-11-01: preparar transición segura del backend y dispositivos al Firebase propio, verificar base y respaldo efectivo, arranque y activación antes de probar la app habitual; revisar instalación Android y URL. El inicio móvil ya se incorporó al código. [Informe](../documentacion/seguridad/INCORPORACION_INICIO_MOVIL_FCM.md).

2026-11-01: apertura del nuevo inicio FCM en segundo plano y proceso cerrado comprobada en variante aislada; pendientes revisión de tiempos, compatibilidad y transición al sistema habitual, y aclarar ausencia previa de su paquete en el teléfono. [Informe](../documentacion/seguridad/PRUEBA_APERTURA_NUEVO_INICIO_FCM.md).

2026-11-01: probar el nuevo inicio FCM con proceso terminado y apertura, revisar tiempos y transición antes de incorporarlo. Recepción en segundo plano ya confirmada con variante instrumentada. [Informe](../documentacion/seguridad/PRUEBA_FCM_NUEVO_INICIO_SEGUNDO_PLANO.md).

2026-11-01: probar la nueva versión de inicio FCM en segundo plano y proceso terminado, evaluar tiempos/red y transición al sistema habitual; revisar con el usuario la ausencia del paquete habitual en el teléfono. La prueba de primer plano en variante instrumentada sí pasó. [Informe](../documentacion/seguridad/PRUEBA_INICIO_FCM_REAL_ESPERA.md).

2026-11-01: pendiente instalación Android aceptada para prueba integrada de manejadores durante espera y revisión de presencia de la app habitual en el teléfono. La APK de prueba está compilada en copia ignorada; no se envió aviso. [Informe](../documentacion/seguridad/PRUEBA_INTEGRADA_INICIO_FCM.md).

2026-11-01: probar con complementos y app aislada la propuesta de inicio móvil con red lenta; definir tiempos y reintentos coordinados, revisar errores parciales y transición antes de incorporar. [Informe](../documentacion/seguridad/INICIO_MOVIL_RED_LENTA_FCM.md).

2026-11-01: revisar DELETE heredado para dispositivos aún inexistentes y clientes anteriores, espera de red y manejadores móviles, expiración durante cierre y concurrencia administrativa; después preparar parche actualizado y plan de transición. [Revisión](../documentacion/seguridad/REVISION_BLOQUEOS_CLIENTES_FCM.md).

2026-11-01: pendiente revisar bloqueos y vencimiento durante esperas de bloqueo, revocación administrativa completa, límites de espera y red lenta, clientes antiguos/iOS y transición segura antes de incorporar. [Pruebas adicionales](../documentacion/seguridad/PRUEBAS_ADICIONALES_CIERRE_FCM.md).

2026-11-01: ampliar revisión aislada de la corrección FCM (expiración, revocación administrativa, cierres concurrentes, respuestas perdidas y dispositivos anteriores), comprobar timeout y compatibilidad; preparar parche actualizado solo tras esas comprobaciones. El parche anterior no incluye la corrección. [Informe](../documentacion/seguridad/CORRECCION_CARRERA_FCM_AISLADA.md).

2026-10-31 — Prioridad alta: corregir y probar en la copia aislada las dos carreras entre sincronización, baja y revocación de sesión; el parche actual está bloqueado para incorporación. Revisar tiempos y compatibilidad de clientes. El respaldo local validó recuentos, pero falta verificar la base efectiva del servidor y actualizar el respaldo antes de migrar. [Revisión](../documentacion/seguridad/REVISION_TRANSICION_FCM_TIEMPOS_RESPALDO.md).

2026-10-31: completada una validación real sin entrega con Firebase y app ficticia; todavía faltan compatibilidad de clientes antiguos, límites/reintentos, tokens de otro proyecto y titularidad. Preparar respaldo y transición controlada antes de incorporar el parche. No aplicar migración ni activar envíos en la base habitual sin etapa posterior aprobada. [Prueba](../documentacion/seguridad/PRUEBA_VALIDACION_FCM_REAL_AISLADA.md).

2026-10-31: antes de actualizar la app habitual o reactivar push, diseñar y probar admisión y selección de dispositivos por procedencia verificada, con registros anteriores en estado desconocido y sin transferencia de tokens ajenos. Verificar proceso real, respaldo, recuperación y procesador de cola; tratar aparte los push financieros pausados. [Plan](../documentacion/seguridad/PLAN_TRANSICION_FIREBASE_DISPOSITIVOS.md).

2026-10-31: completadas recepción en primer/segundo plano y apertura con proceso terminado en variante temporal con cuenta ficticia. Pendientes: actualización de la app habitual, transición segura de dispositivos del Firebase anterior y activación controlada de envíos; no transferir tokens ajenos. Las pruebas no abarcan sesión vencida, «Forzar detención» ni todos los fabricantes. [Último resultado](../documentacion/seguridad/PRUEBA_PUSH_PROCESO_CERRADO.md).

Actualizado: 2026-10-31. Prioridades propuestas para organizar la revisión; no autorizan implementación.

| Estado | Prioridad | Tarea | Dependencia y motivo |
| --- | --- | --- | --- |
| Pendiente | Alta | Diseñar ocupación inquilino–unidad con fechas | Decisión de enfoque aprobada; falta esquema, compatibilidad, datos y autorización de migración |
| Pendiente | Alta | Definir titularidad histórica de expensas | Mantener restricción actual hasta regla verificable |
| Pendiente | Alta | Corregir edición de perfil y revisar contraseña móvil | El flujo puede informar éxito sin persistencia; requiere etapa y pruebas |
| Pendiente | Alta | Validar permisos por endpoint y configuración de despliegue | Default DRF `AllowAny`, hosts y CORS amplios; no basta revisar menú |
| Pendiente | Alta | Prueba interactiva completa de registro de empleado/cuenta | Cuenta opcional, cuatro roles, fallos parciales y vínculo residencial; existe prueba SSR, no E2E completa |
| Pendiente | Media | Definir baja de empleado y cuenta administrativa/residencial | Desactivar empleado no supone revocar todos los accesos de esa cuenta |
| Pendiente | Alta | Completar notificaciones administrativas y financieras | Definir destinatarios, persistencia, recuperación y cierre transaccional; objetos perdidos difunde ampliamente |
| Bloqueada para uso real | Alta | Recuperación FCM con titularidad o invalidación incierta | Falta mecanismo fiable; no transferir tokens ajenos ni usar cuenta previa desconocida |
| Pendiente | Media | Prueba push con Firebase actual y teléfono autorizado | No es obligatorio otro proyecto; falta aplicación de prueba registrada y receptor verificable, sin usar registros ajenos. [Diagnóstico](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md) |
| Pendiente | Media | Decidir acciones de revisión de eventos en móvil | Hoy la operación está en web; no duplicar reglas del backend |
| Pendiente | Media | Auditoría, retención y concurrencia integral | Historial no inmutable; PostgreSQL de dispositivos probado, sesiones/cola no completamente |
| Pendiente | Alta para objetivo académico | Diseñar cámaras, zonas, evidencias y evaluar RF-DETR Nano | Fuera de alcance actual; hardware, clases, licencias, contrato de ingestión y pruebas por aprobar |
| Pendiente | Media | Revisar reglas `.gitignore` y configuración pública/privada | Propuestas en informe documental; no aplicadas |
| Pendiente | Media | Revisar y guardar cambios documentales en Git/remoto | Archivos locales no equivalen a commit o respaldo; no se hizo commit en esta etapa |
| Completada | — | Organización documental y contexto | [Informe](../documentacion/auditorias/ORGANIZACION_DOCUMENTAL_2026-10-31.md) y [pruebas](pruebas.md) |
| Completada con límites | — | Cuenta opcional de empleado con cuatro roles | [Informe previo](../Condominio-Backend/ROLES_CUENTAS_EMPLEADOS.md); no implica prueba E2E integral |

**Completado:** roles predeterminados visibles y protegidos, con activación explícita de grupos faltantes. [Resultado y pruebas](../documentacion/seguridad/RESULTADO_ROLES_PREDETERMINADOS.md).

**Completado con límites:** estructura y migración preparatoria de roles personalizados, inactiva y sin asignación; solo probada en SQLite temporal. [Informe](../documentacion/seguridad/RESULTADO_ESTRUCTURA_ROLES_PERSONALIZADOS.md).

**Completado con límites:** creación/asignación web/backend y primera capacidad de consulta de visitas, con función desactivada y pruebas aisladas. [Resultado](../documentacion/seguridad/RESULTADO_CAPACIDAD_VISITAS_PERSONALIZADAS.md).

**Verificado en la etapa actual:** soporte Flutter de consulta personalizada, 8 pruebas PostgreSQL temporal y un escenario HTTP de 26 solicitudes, además de regresiones backend/web/móvil. [Resultado](../documentacion/seguridad/RESULTADO_MOVIL_ROLES_PERSONALIZADOS.md).

**Activación local completada — 2026-10-31:** después de autorización específica, respaldo/restauración y ensayo, `0005`/`0006` se aplicaron a la base local y se activó el indicador. Inquilino habilitado sin cuentas asignadas. Android USB reparado y APK actual instalada, conservando datos. [Informe](../documentacion/seguridad/ACTIVACION_LOCAL_ROLES_Y_ANDROID_USB.md).

**Comprobado posteriormente:** login habitual confirmado por capturas del usuario; un recorrido integral de rol personalizado pasó en la variante Android aislada del teléfono, con autorización específica y limpieza posterior. [Informe](../documentacion/seguridad/PRUEBA_INTEGRACION_ANDROID_ROLES.md).

**Recorrido React completado — 2026-10-31:** un escenario de formularios, asignación, consulta, revocación, cierre y desactivación pasó en Edge headless contra base temporal. Nueve regresiones Node y build correctos. [Informe web](../documentacion/seguridad/PRUEBA_INTEGRACION_WEB_ROLES.md). El menú requiere recarga para reflejar cambios remotos de capacidades; no existe actualización instantánea.

**Diagnóstico push actual — 2026-10-31:** el usuario prefiere probar con Firebase existente. Proyecto Android/backend coincide; `guardia_prueba` no tiene dispositivos Android activos. No se modificaron registros, configuración ni teléfono, y no se enviaron push. La consola no se pudo abrir por vencimiento de acceso. [Diagnóstico](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

La consola mostrada posteriormente pertenece a una cuenta que no muestra el proyecto configurado en la app. Pendiente que el usuario abra `smart-condominiun` con una cuenta autorizada, o confirme con el titular quién puede concederle acceso.

Una consulta oficial de solo lectura confirmó que ese proyecto sí existe y que la credencial de servicio local puede consultarlo. Esto no verifica que el usuario sea propietario. Pendiente obtener acceso humano autorizado o decidir crear un proyecto propio antes de cambiar recursos o enviar push. [Informe](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

**Decisión posterior:** el usuario creó el proyecto propio `condominio-seguridad` y registró Android. Configuración nueva preparada y respaldada, aún sin activar; falta credencial del servidor. Consultar [preparación Firebase propio](../documentacion/seguridad/PREPARACION_FIREBASE_PROPIO.md). La opción anterior de recuperar acceso no es requisito si se completa la migración al proyecto propio.

**Actualización:** la credencial nueva ya fue descargada y validada, y el backend admite una ruta privada sin activarla. Pendiente ubicarla de forma privada, coordinar el cambio con la app Android y resolver la separación de los dispositivos registrados bajo el proyecto anterior antes de habilitar envíos. [Preparación](../documentacion/seguridad/PREPARACION_FIREBASE_PROPIO.md).

**Configuración local posterior:** clave fuera del repositorio, `.env` y fuentes Android apuntan al proyecto nuevo; se pausaron por configuración los push de expensas/objetos y de seguridad, con aprobación. El servidor preexistente debe reiniciarse/verificarse; APK debug compilada no instalada. Faltan identidad y registro de dispositivos por proyecto, prueba real controlada y reactivación. Avisos de expensas/objetos generados durante la pausa no se reencolan automáticamente. [Informe](../documentacion/seguridad/CONFIGURACION_FIREBASE_PROPIO_LOCAL.md).

**Prueba push preparada:** app de prueba separada registrada en Firebase propio, APK compilada y servidor de base temporal preparado. Android canceló instalación; esperar al usuario, volver a iniciar servidor con base temporal nueva y no cambiar seguridad del teléfono. Sin push enviado; enlace y base temporales retirados. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

**Reintento posterior:** con teléfono desbloqueado la app ficticia inició sesión, pero obtener el token falló con `SERVICE_NOT_AVAILABLE`; no hubo registro o envío. Hay internet y servicios Google activos; el estado de APIs FCM no se pudo consultar (403). Revisar Cloud Messaging con el usuario antes de nuevas suposiciones. App, base y enlace temporales retirados. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

**Revisión posterior de consola:** captura confirma FCM V1 habilitada y remitente coincidente; conexiones HTTPS y puertos FCM probados accesibles. Nuevo intento de instalación fue rechazado; pendiente interacción del usuario con la confirmación del teléfono y diagnóstico de token. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

**Resultado posterior:** prueba aislada de push en primer plano completada; Firebase aceptó, Flutter recibió y el usuario vio la notificación. Pendientes recepción en segundo plano/app cerrada, apertura, registro de dispositivos por proyecto y activación coordinada en sistema habitual. La app de prueba sigue registrada en Firebase; decidir su retiro al finalizar el trabajo. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

**Prueba en segundo plano preparada:** APK y controlador verificados, pero Android rechazó instalar y el usuario no vio confirmación. No se envió aviso. Usuario debe revisar instalación USB; no asumir causa ni cambiar ajustes automáticamente. [Informe](../documentacion/seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md).

**Resultado posterior:** usuario pidió reintentar y autorizó instalación; escenario en segundo plano aprobado, con entrega inicial y reintento dirigido aceptados por Firebase. Confirmó ver el aviso después del reintento, sin atribución definitiva entre ambos. Pendientes app cerrada, pulsación y migración de dispositivos habituales. [Informe](../documentacion/seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md).

**Pendiente:** prueba de registro/desregistro FCM de roles predeterminados; identificar/crear proyecto Firebase separado y variante push para verificar entrega; ampliar capacidades y definir ciclo de dispositivos existentes. Revisar seis avisos moderados npm de minimatch/ESLint y carga anticipada de Stripe en etapa acotada. No se comprobó entrega push. No repetir migraciones como si estuvieran pendientes en esta base local; otros entornos requieren su propio respaldo y autorización. Esperar aprobación explícita antes de la siguiente etapa funcional.

**Aclaración completada — 2026-10-31:** requisitos del ingeniero resumidos y enlazados en `contexto/estado-proyecto.md`. Queda pendiente concretar el escenario y los criterios de demostración de seguridad con video real o maqueta; depende de una etapa de planificación, no de la organización documental.

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

2026-11-14: Pendiente verificar toque real en notificacion del sistema, comportamiento de push en segundo plano y app cerrada, y recepcion en cuenta habitual en entorno autorizado; la prueba en primer plano y navegacion simulada pasaron.

2026-11-14: Falta verificar aviso con app cerrada y eventual prueba con cuenta habitual en entorno autorizado. Recepcion en primer plano y segundo plano, incluido toque real de notificacion, comprobadas con app aislada y cuenta ficticia.

2026-11-14: Pendiente prueba de extremo a extremo con camara y confirmacion humana real; la prueba de app cerrada uso incidencia, placa y guardia ficticios, y la apertura de Mis avisos fue confirmada por el usuario. App separada de prueba conectada por USB al backend local.

2026-11-14: Revisar visualmente el resto de pantallas y flujos con datos autorizados. El lint global conserva 66 errores y cuatro advertencias preexistentes; el lint de archivos cambiados no tuvo errores y mostro dos advertencias preexistentes en dashboard. Dos recorridos antiguos de camaras no finalizaron por expectativas que no coinciden con la interfaz/permisos actuales.

2026-11-14: Pendiente revision visual del resto de botones y flujos con datos autorizados; la comprobacion cubrio pantallas simuladas de usuarios y bloques.

2026-11-14: Investigar cuatro fallos de la suite amplia PostgreSQL temporal en pruebas de dispositivo/FCM: dos esperas de intercepcion, un resultado 503 y un resultado 401 frente a los esperados. La prueba especifica de eliminacion concurrente paso. Verificar visualmente con el entorno habitual despues de reiniciar Django; no se eliminaron roles reales.

2026-11-14: Pendiente confirmacion del usuario de apertura del aviso reenviado y limpieza acordada de recursos de prueba. La incidencia ficticia tiene historial y evidencia; no se elimino a ciegas. Los dos roles personalizados existentes no presentan nombres marcados como prueba. La suite PostgreSQL de nueve casos paso dos ejecuciones tras actualizar las pruebas.

2026-11-14: Pendiente confirmacion del detalle por el usuario y limpieza acordada de recursos ficticios. El historial de la incidencia de prueba sigue conservado y la app requiere el backend local temporal y enlace USB.

2026-11-14: La incidencia ficticia anterior y su evidencia/historial siguen en la base local por trazabilidad; estan marcados como PRUEBA. El usuario confirmo apertura del detalle y ya se retiraron los recursos moviles y desactivaron cuentas ficticias.

2026-11-14: Confirmar metodo de conexion movil al backend antes de actualizar la app instalada; el APK existente contiene una direccion local adicional ausente en el APK generado por defecto. Pendiente revision visual en dispositivo real y pruebas de todas las pantallas con datos autorizados.

2026-11-14: Confirmar con el usuario la apariencia en el telefono y revisar otras pantallas con datos autorizados. El enlace USB 8001 a 8000 requiere backend local disponible y puede necesitar restablecerse al desconectar el telefono.

2026-11-14: El usuario confirmo que el nuevo diseno movil se ve bien; sigue pendiente una revision de todos los flujos con datos autorizados.

2026-11-14: En segundo telefono comprobar manualmente apertura e inicio de sesion; el enlace USB requiere el backend local y puede necesitar restablecerse al reconectar. No se verifico FCM real en ese dispositivo.

2026-11-14: Confirmar apariencia en el telefono conectado. El historial movil representa notificaciones leidas de la cuenta, no el historial completo de incidencias; confirmar/revisar incidentes desde movil no esta implementado. La actualizacion cada 30 segundos depende de pantalla visible, app activa y conexion.

2026-11-14: El segundo Xiaomi tiene el APK que contiene la barra; falta la confirmacion visual del usuario. La actualizacion anterior tenia interfaz anterior y su reporte de instalacion no demostraba que incluyera los cambios.

2026-11-14: Pendiente confirmacion del usuario de que la barra movil instalada cumple lo esperado; la visibilidad de sus cuatro opciones ya se comprobo.

2026-11-14: El usuario confirmo que la barra inferior ya aparece; la revision completa de acciones y flujos reales sigue pendiente.

2026-11-15: la cuenta ficticia residente de la prueba fue eliminada de la base local a solicitud del usuario.

2026-11-15: validar con cámara autorizada la imagen, reconexión tras caída y continuidad al cambiar de vista; probar cierre normal y recarga en Windows. Definir supervisión para nube y puertos dinámicos; los puertos actuales siguen fijos.

2026-11-15: validar con cámara o video autorizado colores del monitor Imou, salida de zona y recepción real de aviso preliminar por guardia y administrador; análisis web requiere IA y vista activa.

2026-11-15: diseñar e implementar múltiples zonas y tipos de incidencia por cámara con configuración compartida, compatibilidad con la zona existente y pruebas antes de cualquier migración persistente.

2026-11-15: validar en navegador del usuario el submenú y guardado explícito, incluidos cambios de cámara de catálogo y salida con borrador; probar el resultado con cámara autorizada.

2026-11-15: confirmar visualmente la nueva distribución del monitor Imou en pantallas grandes y pequeñas.

2026-11-15: confirmar visualmente el encabezado y submenú Configuración de incidencias en el navegador del usuario.

2026-11-15: validar vista múltiple y enlaces directos con una segunda cámara de red real; implementar incidencias automáticas por cámara adicional y medir capacidad antes de ampliar concurrencia.

2026-11-15: comprobar visualmente en el navegador del usuario la opción Ver varias cámaras y probar una segunda cámara física cuando esté disponible.

2026-11-15: confirmar con el usuario el mosaico y ampliación en navegador y validar dos cámaras físicas, capacidad y continuidad al cambiar de pestaña.

2026-11-15: confirmar visualmente el mosaico predeterminado y validar ampliación con cámaras físicas.

2026-11-15: confirmar con el usuario el mosaico compacto y verificarlo con más de una cámara física.

2026-11-15: confirmar con el usuario los controles superiores del mosaico con la cámara real.

2026-11-15: definir con el usuario la incorporación de la cámara de laptop al mosaico y confirmar visualmente la navegación simplificada.

2026-11-15: confirmar visualmente en el equipo del usuario la ampliación y reducción de una cámara dentro del mosaico.

2026-11-15: validar con el usuario el selector de cámaras y los mensajes de eliminación protegida; probar cámaras físicas sin eliminar registros reales.

2026-11-15: confirmar visualmente la gestión de cámaras sin la sección de funciones previstas.

2026-11-15: completar reglas y alertas automáticas por cámara de catálogo, configuración persistente de lectura de placas y validación con múltiples cámaras físicas; mascotas quedan fuera de esta etapa.
# Cámara local — límites pendientes (2026-11-15)

- Comprobar la cámara física y la selección de dispositivos en el equipo del usuario.
- Validar la lectura de placas de cámara local, su identidad y asociación confiable a incidencias; el registro puede duplicar eventos tras perder seguimiento.
- Investigar el fallo aislado de `camaras_catalogo.mjs` en la comparación de IP (línea 170), ajeno a la prueba de cámara local.

2026-11-16: Verificar Roboflow con credencial configurada por el usuario y fotograma autorizado; comprobar clases, latencia, cr?ditos y avisos.

2026-11-16: Validar an?lisis de video de usuario con Roboflow y comportamiento de incidencias; la imagen sint?tica no valida detecciones ni avisos.

2026-11-16: Comprobar visualmente configuracion de incidencias y alineacion de videos en escritorio y movil.

2026-11-16: Validar en navegadores y telefonos el flujo de confirmacion y retirada del historial; APK aun no actualizada.

2026-11-16: Verificar visualmente confirmacion desde el monitor con incidencia autorizada; el boton aparece solo para pendientes.

2026-11-16: Validar en navegador del usuario el flujo de detalle y retorno del monitor.

2026-11-16: Confirmar visualmente el nuevo orden del menu web.

2026-11-16: Pedir al usuario recargar las vistas de incidencias e incidentes y revisar mensaje exacto si persiste el error original.

2026-11-16: Validar recepcion real de notificaciones de guardia con dispositivo autorizado y cuenta de prueba; procesador FCM detenido y 12 entregas pendientes requieren revision antes de activarlo.

2026-11-16: Confirmar que el guardia recibio y abrio aviso ficticio; decidir limpieza del evento de prueba y revision de 12 entregas previas antes de activar procesador.

2026-11-16: Comprobar entregas reales por tipo si se autorizan. La navegacion FCM movil abre la lista y no usa el id de evento para abrir detalle; evaluar mejora si se solicita.

2026-11-16: Mantener revisable limpieza de tres eventos ficticios y revisar entregas previas antes de iniciar procesador FCM. Validar deteccion automatica real por camara y video.

2026-11-16: Validar en telefono avisos FCM con textos nuevos; procesador continuo detenido y entregas previas requieren revision antes de iniciarlo.

2026-11-16: Revisar y limpiar eventos ficticios identificados y entregas previas antes de iniciar procesador continuo; validar detecciones reales.

2026-11-16: Resolver compilacion Flutter, instalar APK con configuracion de conexion correcta y verificar icono y color en primer y segundo plano con envio autorizado.

2026-11-16: Comprobar tambien apariencia en primer plano y alerta de estacionamiento; revisar cola previa antes de iniciar procesador continuo.

2026-11-16: Confirmar visualmente en telefono el gesto y menu de historial; sin retirar incidencia real durante la prueba.

2026-11-16: Confirmar visualmente en dispositivo el historial de lista unica y pulsacion larga.

2026-11-16: Confirmar en el telefono correcto la lista unica de historial y gesto de pulsacion larga.

2026-11-16: Confirmar en telefono que el historial muestre lista unica y opcion al mantener pulsado.

2026-11-16: Confirmar en telefono el indicador de actualizacion al deslizar incidencias.

2026-11-16: Comprobar gesto web en pantalla tactil real y desplazamiento de la pagina.

2026-11-16: Confirmar visualmente cambio de descartados en web del guardia.
