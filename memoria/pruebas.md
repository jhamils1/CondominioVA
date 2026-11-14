# Pruebas y verificación

2026-11-07: zonas por cámara: 34 pruebas Django aisladas, ESLint, build, migraciones sin cambios y recorrido web simulado correctos; sin segunda cámara real. [Detalle](../documentacion/seguridad/ZONAS_CAMARAS_CATALOGO.md).

2026-11-07: 28 pruebas Django temporales, puente adicional con fuentes simuladas, ESLint y build Vite correctos; sin prueba de segunda cámara real. [Detalle](../documentacion/seguridad/MONITOR_CAMARAS_CATALOGO.md).

2026-11-07: 13 pruebas JavaScript y tres Django del seguimiento Imou aprobadas; ESLint y compilación Vite correctos. Sin prueba real de la corrección. [Detalle](../documentacion/seguridad/AVISOS_REPETIDOS_IMOU.md).

2026-11-07: verificados puertos de cámara por Wi-Fi y Ethernet desde Windows; puente con acceso a red entregó fotograma a Django por catálogo e IP Wi-Fi. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: puente Imou actualizado responde y Django usa el catálogo vinculado; ocho consultas devolvieron estado conectando, sin imagen confirmada. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: 34 pruebas Django aisladas, cuatro del puente, comprobaci?n de migraciones, ESLint, compilaci?n y recorrido web simulado satisfactorios. No se ha validado el puente actualizado con c?mara real. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: PC enlazada en 192.168.1.107 obtuvo respuesta por Ethernet de 192.168.1.108 en 80/554; ONVIF y dos fotogramas RTSP exitosos, sin guardar imágenes. Wi-Fi permaneció activo y monitor no se validó con IP cableada.

2026-11-07: inspección de Ethernet, ARP y rutas encontró candidata 192.168.1.108; no se verificó conexión ONVIF ni video por la diferencia de subred.

2026-11-07: descubrimiento ONVIF restringido al adaptador Ethernet sin respuesta; observación DHCP/ARP temporal sin guardar tráfico ni alterar red. RTSP por cable sigue sin comprobar.

2026-11-07: dos perfiles ONVIF de Imou real produjeron un fotograma cada uno; acción API devolvió 200 y dos perfiles con usuario simulado y sin contraseña en respuesta. Sin guardar video, alterar cámara o verificar sesión web.

2026-11-07: Imou real respondió descubrimiento y puerto ONVIF 80; consulta autenticada obtuvo dos perfiles RTSP 554. Sin comprobación de fotograma de esas rutas. Sandbox de red denegó acceso y prueba se ejecutó autorizada fuera de él.

2026-11-07: build, ESLint y recorrido Edge con perfiles simulados verificaron el nombre seleccionado y la opción manual; sin prueba física de cámara.

2026-11-07: 19 pruebas Django y recorrido Edge simulado cubren puerto anunciado, ausencia, rutas/HTTPS incompatibles y valor por defecto; build y lint sin fallos. Sin cámara real.

2026-11-07: 19 pruebas Django con SOAP, perfiles y red simulados; build Vite, ESLint y recorrido Edge simulado con selección ONVIF y bloqueo de ruta. Sin conexión a cámara real ni cambios de base persistente.

2026-11-07: pruebas Django de descubrimiento con sockets simulados, ESLint, build y recorrido Edge simulado para respuestas coincidentes y ausencia de respuesta; no se consultó cámara física.

2026-11-07: 16 pruebas Django con UDP y dispositivos simulados, build y ESLint y recorrido Edge con respuesta de descubrimiento simulada. Sin consultas a dispositivos reales.

2026-11-07: build Vite, ESLint y recorrido Edge con API simulada verificaron selección del perfil, ruta protegida y retorno a ruta manual. No se usaron cámaras reales.

2026-11-07: 13 pruebas Django de cámaras con configuración ficticia, build Vite y recorrido Edge simulado, incluido campo Imou en solo lectura; sin conexión a cámara real ni cambios de base persistente.

2026-11-07: comprobación RTSP de catálogo con subprocess y OpenCV simulados, permisos, direcciones privadas y rechazo Imou; recorrido frontend Edge simulado y build Vite. Sin pruebas de cámara real ni entrega de avisos.

2026-11-07: ocho pruebas Django de c?maras en SQLite temporal, build Vite y recorrido Edge simulado de alta, visibilidad, edici?n y permisos aprobados. No se consultaron credenciales ni c?maras reales en las pruebas; falta revisi?n visual real.

2026-11-07: 14 pruebas Django aisladas, migraciones, ESLint, build y Edge con credenciales ficticias correctos; sin cámara real. Migración local con backup listado, sin restauración probada. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: cinco pruebas Node de roles, ESLint, build y Edge simulado con navegación por teclado, roles y revisión de evento correctos; sin pruebas de cámara real. [Detalle](../documentacion/seguridad/MENU_MONITOR_CAMARAS.md).

2026-11-06: pruebas Node por rol, ESLint, build y cuatro recorridos Edge simulados verificaron menú, permisos web, revisión del guardia, Imou, webcam y video. Sin pruebas con cámara o Firebase reales. [Detalle](../documentacion/seguridad/MENU_MONITOR_CAMARAS.md).

2026-11-06: puente Imou real recibió JPEG sin guardar ni crear evento; Edge simulado comprobó reintentos conectando→disponible, ESLint y build pasaron. Falta confirmación del botón real por el usuario. [Detalle](../documentacion/seguridad/VINCULO_IMOU_CATALOGO.md).

2026-11-06: 13 pruebas Django, ESLint, build y Edge simulado pasaron para agregar/probar Imou. Puente real 503 y puerto RTSP inaccesible; sin evidencia guardada, alertas ni registros reales creados. [Detalle](../documentacion/seguridad/VINCULO_IMOU_CATALOGO.md).

2026-11-06: 10 pruebas Django aisladas (catálogo, zona y monitor), ESLint, build y Edge con API simulada correctos; migración local aplicada tras backup cuyo listado se comprobó, sin prueba de restauración ni dispositivos reales. [Detalle](../documentacion/seguridad/PLAN_CAMARAS_Y_AVISOS_RESIDENTES.md).

2026-11-05: 12 pruebas Django con SQLite aislado verificaron seguimiento, exclusión, API y monitor sin navegador con eventos/evidencia y dos guardias simulados. Build y recorrido Edge simulado correctos; sin cámara ni Firebase reales. [Detalle](../documentacion/seguridad/MONITOREO_IMOU_INDEPENDIENTE.md).

2026-11-05: DHCP temporal por Npcap recibió solicitud de la IP ofrecida; ping y RTSP no respondieron. No se comprobó video por cable. [Detalle](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-05: build, ESLint, 13 pruebas Node y recorrido Edge/API simulada correctos para guardado automático de zona, fallo, reintento, cancelación, eliminación, evento y lectura del guardia. Sin prueba real de recepción en esta etapa. [Detalle](../documentacion/seguridad/GUARDADO_AUTOMATICO_ZONA_IMOU.md).

2026-11-05: consulta local de solo lectura sin zona guardada y con 24 entregas enviadas; 13 pruebas Node, ESLint, build y Edge simulado correctos. Se verificó borrador sin envíos, fallo de guardado, activación tras guardar y reintento con evidencia. Falta recepción real de este flujo. [Detalle](../documentacion/seguridad/REGISTRO_IMOU_CONFIGURACION_PENDIENTE.md).

2026-11-05: 13 pruebas Node y recorrido Edge simulado correctos para estabilidad Imou, salida, pérdida, recuperación, permisos y reintento. Build/ESLint correctos; sin cámara o Firebase reales. [Detalle](../documentacion/seguridad/ESTABILIDAD_SEGUIMIENTO_IMOU.md).

2026-11-05: seis pruebas Django con SQLite aislado, migración sin cambios pendientes, ESLint, build y recorrido Imou simulado por roles correctos. Migración 0005 aplicada en PostgreSQL local tras verificar lectura de respaldo; no se probó restauración ni cámara real. [Detalle](../documentacion/seguridad/ZONA_IMOU_COMPARTIDA.md).

2026-11-05: build, ESLint y recorrido de Imou simulada correctos tras reemplazar la comparación por una sola imagen también en configuración; incluye zona y tamaños de pantalla. [Detalle](../documentacion/seguridad/REDISENO_CENTRO_SEGURIDAD.md).

2026-11-05: build y ESLint del frontend correctos; recorridos simulados de Imou, laptop y video correctos, incluyendo independencia cámara/IA y conservación de zona. Sin prueba real nueva. [Detalle](../documentacion/seguridad/REDISENO_CENTRO_SEGURIDAD.md).

2026-11-05: PostgreSQL local escribió y leyó un JPEG ficticio en una transacción revertida; se comprobó que no quedaron registros ni se crearon avisos. [Informe](../documentacion/seguridad/EVIDENCIA_IMOU.md).

2026-11-05: migración aditiva probada en SQLite y aplicada en PostgreSQL local con respaldo verificado por listado. Cinco pruebas backend, tres reforzadas, Edge simulado, nueve pruebas Flutter, analizador, lint y build correctos. Descarga anónima real 401. Falta probar evidencia real en web/móvil; sin envío real en esta etapa. [Informe](../documentacion/seguridad/EVIDENCIA_IMOU.md).

2026-11-05: 10 pruebas Node y cuatro Django con SQLite en memoria pasaron; se verificaron dos guardias, exclusión residentes, UUID idempotente y FCM simulado. Edge simulado comprobó Imou con fallo/reintento y webcam existente. Build y lint correctos; procesador FCM observado activo. Sin envíos reales nuevos ni prueba real de Imou. [Informe](../documentacion/seguridad/REGISTRO_IMOU_LOCAL.md).

2026-11-05: ocho pruebas existentes de zonas/permanencia correctas; build/lint correctos. Edge con imágenes ficticias comprobó dibujo, zona oculta, mostrar/ocultar, verde a rojo con umbral de 2 s, salida a verde, sin eventos y controles existentes. No se usó la cámara real en esta etapa. [Informe](../documentacion/seguridad/ZONA_IMOU_TEMPORAL.md).

2026-11-05: build y lint del frontend correctos. Edge con datos ficticios comprobó imágenes Imou alineadas y del mismo ancho en 1440 px, apiladas en 600 px y controles de IA y cámara funcionales. No se abrió la cámara real en esta comprobación. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: build y lint frontend correctos; Edge con API y fotogramas ficticios comprobó recuadro sobre imagen correspondiente, inicio/detención y fallo de IA con vista activa, sin eventos. Un fotograma real Imou se analizó directamente por RF-DETR local: 0 detecciones, 0,3 s; sin guardar imágenes. No valida precisión ni rendimiento continuo. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: siete pruebas Django y dos del lector correctas; build/lint correctos, Edge simulado verificó vista Imou y detención/error. Puente real entregó tres JPEG y rechazó token ausente (403); Django rechazó sesión ausente (401). Cierre RTSP por inactividad observado. Pendiente sesión web del usuario. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: `probar_imou.py` terminó con código 0 fuera del entorno restringido y decodificó un fotograma real de 640 x 480 por Wi-Fi. Conexión cerrada, sin persistir imágenes ni enviar avisos; configuración privada ignorada por Git. No valida aún visualización web ni IA sobre cámara IP. [Resultado](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: lector Imou salió con código 1, sin imagen; diagnóstico DESCRIBE sin credenciales 401 y un intento Digest 401. Configuración tiene clave no vacía, sin comillas externas, usuario admin. Sin exponer valores secretos ni guardar imágenes. [Detalle](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: Word 16 generó y actualizó TOC; prueba temporal cambió «Introducción» y su página de 8 a 9, y ambos cambios aparecieron en el índice. Prueba descartada sin guardar. Verificados 193 títulos y enlaces; versión final de 23 páginas exportada con Word y revisada visualmente, incluido ajuste del primer sprint para evitar una página de solo título. El fallo anterior de automatización se resolvió ejecutando Word fuera del entorno restringido.

2026-11-05: RTSP respondió 401 sin credenciales y TCP 80/554 accesibles fuera del entorno restringido. Sintaxis y tres comprobaciones locales de configuración correctas; archivo privado ignorado por Git. Lectura de imagen y Ethernet pendientes. Usuario confirmó recepción móvil tras subir video previo; no corresponde a la Imou. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: comprobada apertura estructural y presencia de párrafos editables en DOCX; renderizado no completado por ausencia de LibreOffice y exportación Word bloqueada. No se verificó visualmente su paginación.

2026-11-05: PDF académico comprobado con pypdf (siete páginas, cinco capítulos, cuatro sprints y ausencia del título y autores del ejemplo) y renderizado con Poppler; inspección visual de las siete páginas sin recortes ni superposición. Índice de 193 entradas con números de referencia alineados a la derecha. Validación documental únicamente; sin pruebas de la aplicación. [Entrega](../output/pdf/caratula_indice_condominio.pdf).

2026-11-05: el usuario confirmó recibir una notificación en el teléfono tras el procesamiento de tres entregas de prueba. No confirmó cuál ni cuántas recibió. [Informe](../documentacion/seguridad/REACTIVACION_FCM_VIDEO_2026_11_05.md).

2026-11-05: Firebase aceptó tres avisos existentes, el último evento figura ENVIADA y se comprobó arranque del procesador continuo. Falta recepción en el teléfono. [Informe](../documentacion/seguridad/REACTIVACION_FCM_VIDEO_2026_11_05.md).

2026-11-05: Edge con video sintético de tres segundos y API simulada procesó seis muestras una vez y detuvo ambos reproductores al final. Primer intento de prueba tuvo selector ambiguo; corregido y segunda ejecución correcta. El archivo del usuario no se probó. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

2026-11-04: Edge headless con cámara y API simuladas comprobó zona, ocultación, fallo y reintento del registro con los mismos datos. Sin cámara física ni Firebase. [Informe](../documentacion/seguridad/REGISTRO_CAMARA_DEMOSTRACION.md).

2026-11-04: diez pruebas Node de visión y contenido del evento, y build web correctos; no se ejecutaron cámara, interfaz, entrega o reintentos reales. [Informe](../documentacion/seguridad/REGISTRO_CAMARA_DEMOSTRACION.md).

2026-11-04: nueve pruebas Node de reglas y compilación web correctas; no se abrió la cámara ni se probó la interfaz de esta etapa. [Informe](../documentacion/seguridad/ZONA_CAMARA_DEMOSTRACION.md).

2026-11-04: ocho pruebas Node, build web y 100 pruebas backend SQLite simuladas pasaron; la invocación inicial `manage.py test` falló por runner incompatible y se utilizó el ejecutor aislado propio. No se probó el flujo automático en interfaz ni se envió evento nuevo. [Informe](../documentacion/seguridad/REGISTRO_AUTOMATICO_VIDEO.md).

2026-11-04: evento de video en estado pendiente y aviso interno del guardia comprobados; Firebase aceptó la entrega tras un intento fallido. Recepción en teléfono aún no confirmada. [Informe](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

2026-11-04: build y siete pruebas Node existentes pasaron tras añadir la preparación de eventos. No se probó el nuevo recorrido interactivo ni la entrega; sin eventos ni envíos reales. [Informe](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

2026-11-04: siete pruebas Node de zona y permanencia y build web pasaron; muestras sintéticas, falta verificación en video del usuario. Aviso previo de tamaño de paquete. [Informe](../documentacion/seguridad/PERMANENCIA_VIDEO.md).

2026-11-04: compilación web correcta después de retirar la guía; permanece el aviso previo de tamaño del paquete.

2026-11-04: build web y dos pruebas geométricas de zonas pasaron después de añadir la guía. La descarga desde el entorno falló por conexión; falta probar la guía con el usuario. Vite mantiene aviso de tamaño de paquete. [Detalle](../documentacion/seguridad/ZONA_VIDEO_PRIMERA_ETAPA.md).

## 2026-11-04: marcado de zona en video

Dos pruebas de geometría, build y recorrido Edge con API simulada correctos; el video sintético temporal se retiró. Falta revisión manual. [Informe](../documentacion/seguridad/ZONA_VIDEO_PRIMERA_ETAPA.md).

## 2026-11-02: retiro del video fijo

Build frontend, tres pruebas aisladas de la API de cámara y revisión de pantalla con sesión simulada correctos. Falta comprobación del usuario con sesión real. [Informe](../documentacion/seguridad/RETIRO_VIDEO_DEMOSTRACION.md).

## 2026-11-02: reproductor nativo analizado

Compilación correcta; en Edge headless, con IA simulada y video público, se probaron reproducción y pausa con controles nativos, posición con barra nativa, sincronización y ampliación con capa de detecciones visible. Pendiente prueba con usuario. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: controles de vista analizada

Build frontend correcto. En Edge headless y con API simulada se verificaron reproducción, pausa, posición con ratón y teclado, sonido y pantalla completa. Falta comprobación con sesión real. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: comparación de video

Frontend compilado y prueba Edge con siete muestras simuladas; video original y lienzo visibles, reproducción y cambio de posición verificados. Falta validación manual con el usuario. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: análisis de video seleccionado

Compilación frontend y recorrido en Edge con API simulada: siete muestras para un video público de 3,5 segundos y lienzo visible. Pendiente prueba manual con un archivo propio y API real. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: cámara local en navegador

El usuario confirmó que vio la cámara y los recuadros. No confirmó el tipo de objeto, la detención ni una medición de rendimiento. [Informe](../documentacion/seguridad/CAMARA_LOCAL_DEMOSTRACION.md).

## 2026-11-02: cámara de demostración

Tres pruebas aisladas de pasarela, compilación frontend y detección de 10 objetos en un fotograma público a través del procesador local. Falta probar cámara real, controles y sesión del usuario. [Informe](../documentacion/seguridad/CAMARA_LOCAL_DEMOSTRACION.md).

## 2026-11-02: visualización por administrador

El usuario confirmó haber visto el video y compartió una captura de la página con el reproductor y las detecciones. No se comprobó una sesión real de guardia ni la generación de alertas. [Detalle](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## 2026-11-01: ruta de video en servidor activo

La nueva ruta y la de eventos devolvieron 401 sin autenticación después de detener el servidor anterior. No se accedió a una sesión del usuario; queda pendiente verificar la reproducción desde la interfaz. [Detalle](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## 2026-11-01: video de demostración web

Dos pruebas aisladas de API, compilación frontend y reproducción WebM en Edge headless satisfactorias. No se verificó una sesión real ni la nueva ruta en el servidor anterior. [Informe](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## 2026-11-01: procesamiento de video

Procesados 105 fotogramas con RF-DETR Nano; MP4 resultante abrió con OpenCV y contiene 105 fotogramas. Primera versión inspeccionada visualmente; se mejoraron etiquetas en la versión final. [Detalle](../documentacion/seguridad/VIDEO_COMPLETO_RFDETR.md).

## 2026-11-01: documentación de preferencias

Comprobación documental de enlaces y contenido; no se ejecutaron pruebas funcionales ni se crearon o eliminaron datos de prueba en esta etapa.

## RF-DETR Nano — 2026-11-01

Tres fotogramas de video público procesados en CPU y `pip check` satisfactorio, repetidos tras trasladar el entorno al backend. Sin prueba integral de cámara, alertas ni desconexión real. [Detalle](../documentacion/seguridad/PRUEBA_INICIAL_RFDETR.md).


2026-11-01: evento manual ficticio en base habitual pasó por cola y procesador, Firebase aceptó una entrega y usuario confirmó recepción. Verificados destinatarios guardias activos, historial y ausencia de incidencia; no se probó creación por formulario o IA. [Informe](../documentacion/seguridad/PRUEBA_COLA_AUTOMATICA_LOCAL.md).

2026-11-01: Firebase aceptó un aviso directo al único dispositivo validado del guardia; usuario confirmó recepción y apertura de alertas en app habitual. No se probó la cola real con un evento nuevo. Dos pruebas del diagnóstico, cinco de inicio, cuatro de procesador simulado y análisis pasaron. [Informe](../documentacion/seguridad/ACTIVACION_LOCAL_PUSH_GUARDIA.md).

2026-11-01: APK habitual compilada y paquete/proyecto Firebase verificados; instalación rechazada por Android. Cuatro pruebas del procesador continuo con proveedores simulados y Django check pasaron. [Informe](../documentacion/seguridad/PREPARACION_APP_Y_PROCESADOR_FCM.md).

2026-11-01: 100 pruebas backend SQLite, 19 de procedencia y 17 de cierre PostgreSQL temporales; Django check y migraciones sin cambios pendientes. Bandeja del guardia de prueba 200 mediante autenticación forzada, perfil anónimo 401 en servidor local. Respaldo restaurado y 40 recuentos coincidentes. [Informe](../documentacion/seguridad/INCORPORACION_BACKEND_FCM_LOCAL.md).

2026-11-01: 21 pruebas Flutter de inicio, timeout, registro y navegación pasaron contra el código habitual; análisis estático limpio. No se compiló ni ejecutó la app habitual en teléfono. [Informe](../documentacion/seguridad/INCORPORACION_INICIO_MOVIL_FCM.md).

2026-11-01: apertura de dos avisos ficticios en segundo plano y con proceso cerrado confirmada por usuario en variante de inicio normal; captura temporal corroboró pantalla final. Firebase real, base y cuenta ficticias. [Informe](../documentacion/seguridad/PRUEBA_APERTURA_NUEVO_INICIO_FCM.md).

2026-11-01: Firebase aceptó un aviso ficticio con variante aislada en segundo plano; usuario confirmó que lo vio y Flutter terminó correctamente. [Informe](../documentacion/seguridad/PRUEBA_FCM_NUEVO_INICIO_SEGUNDO_PLANO.md).

2026-11-01: prueba integrada aislada aprobada: Firebase entregó el aviso ficticio y el manejador lo recibió en primer plano mientras el permiso simulado seguía pendiente. No se evaluó visualización ni apertura con esta versión. [Informe](../documentacion/seguridad/PRUEBA_INICIO_FCM_REAL_ESPERA.md).

2026-11-01: compilación APK de prueba FCM correcta y proyecto Firebase accesible en lectura; instalación Android rechazada tres veces, prueba integrada sin ejecutar. [Informe](../documentacion/seguridad/PRUEBA_INTEGRADA_INICIO_FCM.md).

2026-11-01: 21 pruebas Flutter de inicio, timeout, registro y navegación en copia aislada y análisis estático correcto. Cinco de ellas prueban coordinador simulado; no comprueban entrega FCM real. [Informe](../documentacion/seguridad/INICIO_MOVIL_RED_LENTA_FCM.md).

2026-11-01: 17 pruebas de cierre y bloqueos y 19 de procedencia en PostgreSQL temporal, 100 regresiones SQLite, proveedores simulados. Una prueba diagnóstica reprodujo la carrera DELETE antes de corregirla. [Informe](../documentacion/seguridad/REVISION_BLOQUEOS_CLIENTES_FCM.md).

2026-11-01: 14 pruebas aisladas de cierre con PostgreSQL, 19 de procedencia y 100 regresiones SQLite pasaron; proveedores simulados. Se documentaron los fallos iniciales de expiración y rotación y sus correcciones. [Informe](../documentacion/seguridad/PRUEBAS_ADICIONALES_CIERRE_FCM.md).

2026-11-01: siete pruebas de cierre con JWT en PostgreSQL temporal, 19 pruebas de procedencia y 100 regresiones SQLite en copia aislada; proveedores simulados. Sin entrega real ni cambios en base habitual. [Límites y resultados](../documentacion/seguridad/CORRECCION_CARRERA_FCM_AISLADA.md).

2026-10-31: dos pruebas diagnósticas PostgreSQL temporal reproducen la carrera de registro durante el cierre de sesión; sus resultados verdes confirman el defecto, no la corrección. Pasaron 26 pruebas móviles simuladas, incluida una nueva para respuesta posterior al timeout. Un respaldo de la base local configurada se restauró en PostgreSQL temporal y coincidieron los recuentos de 40 tablas públicas; sus límites están en la [revisión](../documentacion/seguridad/REVISION_TRANSICION_FCM_TIEMPOS_RESPALDO.md).

2026-10-31: Firebase real aceptó una validación sin entrega del dispositivo de app ficticia y rechazó un identificador inventado sin crear registros; la clasificación errónea inicial 503 se corrigió en la copia y se comprobó el rechazo real 400 en proceso separado. Pasaron 3 pruebas del servidor sin envíos, 19 PostgreSQL temporal y 100 regresiones SQLite. [Informe](../documentacion/seguridad/PRUEBA_VALIDACION_FCM_REAL_AISLADA.md).

2026-10-31: procedencia FCM en copia aislada: 19 pruebas PostgreSQL temporal (dos de concurrencia), 17 SQLite funcionales, 100 regresiones SQLite adaptadas y migración temporal aplicada/revertida/reaplicada. Firebase se simuló. Incluye fallos iniciales de regresión y su adaptación documentados en el [resultado](../documentacion/seguridad/RESULTADO_PROCEDENCIA_FCM_AISLADA.md).

2026-10-31: transición Firebase revisada sin escritura mediante transacción PostgreSQL de solo lectura; dos dispositivos activos de propietarios y cero entregas de seguridad. Nueve pruebas backend seleccionadas y 26 Flutter simuladas pasaron; el conjunto de 100 backend pasó tras configurar indicadores y crear permisos ficticios. Los intentos previos del ejecutor y corredor estándar fallaron por configuración/preparación de prueba; detalle en el [plan](../documentacion/seguridad/PLAN_TRANSICION_FIREBASE_DISPOSITIVOS.md).

2026-10-31: push con proceso cerrado aprobado en variante temporal. Ausencia del proceso verificada antes del envío y de nuevo antes del toque; usuario confirmó bandeja y evento, captura inspeccionada y marcador de arranque desde notificación presente. Nueve pruebas unitarias del controlador aprobadas. Entorno temporal retirado. [Informe](../documentacion/seguridad/PRUEBA_PUSH_PROCESO_CERRADO.md).

2026-10-31: apertura manual sin controlador Flutter aprobada: un push aceptado, bandeja y evento visibles tras el toque, confirmados por el usuario y captura inspeccionada. El control de finalización permaneció en `false`. APK debug con inicio `lib/main.dart`; ocho pruebas de navegación y cinco del controlador aprobadas. Los ensayos previos con controlador tuvieron resultados limitados, conservados en el [informe](../documentacion/seguridad/PRUEBA_APERTURA_PUSH.md).

## Prueba push en segundo plano — 2026-10-31

Reintento posterior: app ficticia pasó a segundo plano y Firebase aceptó entrega de la cola. Usuario pidió segundo envío dirigido al mismo dispositivo y confirmó ver la notificación; no se distingue cuál entrega apareció. Escenario Flutter concluyó correctamente. App/enlace/base/log temporales retirados. [Informe](../documentacion/seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md).

APK compilada y manifiesto comprobado; análisis Flutter y cuatro pruebas simuladas del controlador aprobados. Servidor temporal confirmó restricciones sin destinatario. Android rechazó instalación y el usuario no vio una ventana; no hubo prueba de recepción ni envío. Base/enlace temporales retirados. [Informe](../documentacion/seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md).

## Preparación push aislado — 2026-10-31

Resultado final: un escenario Android real aprobó registro de dispositivo ficticio, evento/cola Django, aceptación por Firebase y recepción en primer plano. El usuario confirmó visualización. 73 pruebas Flutter correctas (2 omitidas) y análisis limpio. App/enlace/base/logs temporales retirados; no se probó segundo plano, apertura ni envío a la base habitual.

Captura posterior: FCM V1 habilitada y remitente consistente. HTTPS a dominios Firebase y TCP 5228–5230 desde teléfono respondieron; prueba inicial `nc -z` era inválida y se repitió correctamente. Android rechazó nueva instalación, sin envío. Enlace/base temporales eliminados.

Posteriormente la variante se instaló e inició sesión como guardia ficticio, pero FCM devolvió `SERVICE_NOT_AVAILABLE` y no dio token; prueba falló antes del envío. Red validada y Google Play activos; consulta de estados de API 403 no concluyente. Reintento de instalación rechazado; app/enlace/base temporales y logs retirados. Sin evidencia de entrega.

Variante de Firebase real compilada, manifiesto verificado y análisis limpio; 71 Flutter correctas (2 omitidas), dos pruebas nuevas correctas en modos normal y configuración inválida. Servidor temporal rechazó anónimo y envío sin dispositivo. Instalación rechazada por Android `INSTALL_FAILED_USER_RESTRICTED`, sin envío. Enlace/base temporales retirados. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

## Configuración local Firebase propio — 2026-10-31

100 pruebas backend aisladas, cinco de selección de credenciales y 71 Flutter correctas (2 omitidas). APK debug compilada y proyecto/paquete verificados en recursos; proceso Django nuevo comprobó proyecto y pausa. No se verificó entorno del servidor ya ejecutado ni se instaló APK o envió push. [Informe](../documentacion/seguridad/CONFIGURACION_FIREBASE_PROPIO_LOCAL.md).

## Preparación Firebase propio — 2026-10-31

La credencial descargada se verificó con API Firebase de solo lectura (HTTP 200); Django temporal la inicializó con cola y envío desactivados. Cinco pruebas de selección de credenciales y 99 regresiones SQLite aisladas pasaron. No se probaron entregas ni se activó el cambio en `.env`.

Archivo Android descargado validado contra paquete y proyecto nuevos. Opciones Android Flutter candidatas comparadas campo a campo, otras plataformas conservadas; copias anteriores coinciden con archivos activos y Dart formatea la propuesta sin cambios. No se compiló ni se conectó backend/dispositivo. [Preparación](../documentacion/seguridad/PREPARACION_FIREBASE_PROPIO.md).

## Diagnóstico push — 2026-10-31

Comprobación posterior de solo lectura por API Firebase: proyecto `smart-condominiun` accesible con la credencial configurada (HTTP 200); app habitual registrada y variante `.prueba` no presente en la respuesta de listado. No prueba titularidad, no modifica recursos y no envió push.

Comparación posterior de solo lectura: el proyecto mostrado en la captura del usuario no coincide con el identificador configurado en Android. No se accedió al proyecto ni se cambió su configuración.

Consulta PostgreSQL local en transacción de solo lectura: guardia de prueba activo con cero Android activos y dos registros Android activos de otras cuentas. Comparación de identificadores de proyecto Android/Admin SDK coincidente en proceso de diagnóstico. Sin enviar FCM ni modificar registros. En SQLite en memoria pasaron 99 pruebas con proveedores simulados y bandera de roles personalizada explícitamente desactivada solo para esa prueba; la primera ejecución había heredado la bandera local y falló la prueba del valor por defecto. [Informe](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

## Integración web de roles — 2026-10-31

Un escenario React/Django real en Edge headless aprobado (16,5 s; ejecutor 21,9 s), con formularios de creación/asignación, permiso inicial ausente, concesión/revocación, denegación de rutas, cierre y desactivación. Nueve regresiones Node, 26 solicitudes HTTP, lint seleccionado y build correctos. Capturas revisadas; servidor/base temporales limpiados y puertos 18081/15173 cerrados. Menú se actualiza al recargar; Stripe bloqueado intencionalmente, pagos y push excluidos. Seis avisos moderados npm en cadena ESLint previa pendientes. [Resultado y fallos iniciales resueltos](../documentacion/seguridad/PRUEBA_INTEGRACION_WEB_ROLES.md).

## Integración Android de rol personalizado — 2026-10-31

Un escenario Flutter/Django integral aprobado en teléfono específicamente autorizado, usando app/base separadas: login real, almacenamiento nativo, menús/permisos, lectura, revocación y cierre. `flutter drive`: código 0 y `All tests passed`; el segundo contador es `tearDownAll`. 71 pruebas móviles y 26 solicitudes HTTP correctas; análisis de test/controlador sin observaciones. APK compilada y manifiesto aislado revisado. Emulador falló al arrancar; el cambio de dispositivo exigió confirmación y se ejecutó después de recibirla. App de prueba/enlace retirados, base temporal eliminada y app habitual preservada. No hubo push ni prueba React. [Resultado, incidencias y limpieza](../documentacion/seguridad/PRUEBA_INTEGRACION_ANDROID_ROLES.md).

## Activación local y Android USB — 2026-10-31

Respaldo PostgreSQL restaurado en instancia temporal; migraciones `0005`/`0006` ensayadas y aplicadas localmente con preservación del contenido de 34 tablas anteriores. Indicador local activo, cuatro roles disponibles y vista administrativa comprobada con autenticación forzada: 200; cero roles/asignaciones personalizados. Android devuelve 401 anónimo desde el enlace USB a Django. APK debug compilada e instalada con `adb install -r` correcto; sin borrado de datos. Script de reconexión ejecutado correctamente. No se probó visualmente login, flujo React ni push; las pruebas automatizadas del código son las de la etapa precedente. [Evidencia y límites](../documentacion/seguridad/ACTIVACION_LOCAL_ROLES_Y_ANDROID_USB.md).

## Móvil, PostgreSQL y HTTP de roles personalizados — 2026-10-31

99 pruebas backend, 8 PostgreSQL temporal, escenario HTTP de 26 solicitudes y 7 pruebas web correctos. Flutter: 71 correctas y 2 omitidas por configuración; se ejecutaron también las variantes aisladas válida e inválida. Análisis de los 10 archivos Flutter afectados: sin problemas. El escenario HTTP comprueba permisos, campos mínimos, revocación con el mismo token, refresh, auditoría y ausencia de dispositivos creados; confirma servidor y directorio temporal cerrados/eliminados. `git diff --check` sin errores, con avisos de conversión LF/CRLF. El recorrido visual React sigue pendiente por indisponibilidad del navegador. No certifica Android real ni push. [Comandos, fallos corregidos y límites](../documentacion/seguridad/RESULTADO_MOVIL_ROLES_PERSONALIZADOS.md).

## Primera capacidad personalizada — 2026-10-31

99 pruebas backend con migraciones solo en SQLite en memoria; siete pruebas web, ESLint seleccionado y build correctos. Las pruebas backend verifican API, aislamiento, revocación, auditoría y límites de dispositivos; las web no ejecutan el formulario nuevo contra la API en navegador. `makemigrations --check --dry-run` aislado: sin cambios. La primera revisión de lint detectó cuatro variables `catch` no usadas en el cliente de roles y pasó después de corregirlas. Build conserva advertencia de tamaño. No se modificó base persistente, `.env`, dispositivos ni móvil. Detalle en [resultado](../documentacion/seguridad/RESULTADO_CAPACIDAD_VISITAS_PERSONALIZADAS.md).

## Estructura de roles personalizados — 2026-10-31

94 pruebas de `administracion.run_migration_smoke` pasaron en SQLite en memoria con Firebase y proveedores simulados. `makemigrations administracion --check --dry-run` en configuración aislada: sin cambios. Se verificaron inicio inactivo, capacidades vacías, unicidad y denegación de roles desconocidos con inicio de sesión y tokens existentes. No se probó PostgreSQL, no se aplicó migración a base persistente y no se ejecutaron pruebas de clientes. [Informe](../documentacion/seguridad/RESULTADO_ESTRUCTURA_ROLES_PERSONALIZADOS.md).

## Roles predeterminados — 2026-10-31

91 pruebas backend en SQLite en memoria; seis frontend de permisos/renderizado; ESLint seleccionado y compilación de producción correctos. La primera ejecución frontend falló por restricciones de acceso a dependencias; se repitió en serie con permisos de lectura apropiados y pasó, con aviso de puerto WebSocket ocupado. No se tocó base persistente ni se probaron las acciones en navegador con datos reales. Comandos y límites en [resultado](../documentacion/seguridad/RESULTADO_ROLES_PREDETERMINADOS.md).

## Análisis de roles personalizados — 2026-10-31

Revisión estática de autenticación, roles, permisos, asignación, pantallas React y política Flutter. Se verifican enlaces locales del plan y que Git no muestra cambios de código de los componentes frente al estado previo. No se ejecutaron pruebas funcionales, no se consultó base persistente ni se modificaron permisos o cuentas. Los casos necesarios para las futuras etapas se encuentran en el [plan](../documentacion/seguridad/PLAN_ROLES_PREDETERMINADOS_PERSONALIZADOS.md).

## Aclaración del enunciado — 2026-10-31

Se releyó el Word original para resumir sus requisitos en contexto. Comparación SHA-256 con `git show HEAD:documentacion/Enunciado Proyecto condominio.docx`: contenido idéntico al documento trasladado. Enlaces locales de los documentos de contexto/estado editados: válidos. `git diff --exit-code` de los tres componentes, base-datos y `.gitignore`: sin cambios. No se ejecutaron pruebas funcionales porque la ampliación es documental. El conteo de enlaces de la etapa anterior es histórico y no se reutiliza como medición de esta ampliación.

## Etapa documental — 2026-10-31

Entorno: Windows/PowerShell, rama `main`; herramientas locales existentes, sin instalaciones. No se ejecutaron Django, Flutter, migraciones, envíos ni consultas a base persistente.

Comprobaciones ejecutadas y completadas, cuyo detalle está en el [informe documental](../documentacion/auditorias/ORGANIZACION_DOCUMENTAL_2026-10-31.md):

- `git status --short`, `git branch --show-current` y `git rev-parse --show-toplevel`: raíz confirmada, rama `main`, árbol limpio antes del trabajo.
- Inventario de archivos e instrucciones; lectura de modelos, permisos, configuración seleccionada sin valores secretos y documentos fuente.
- Comparación SHA-256 de originales trasladados y todos los archivos de `documentacion/base-datos/` contra manifiesto previo guardado en directorio temporal.
- Resolución de enlaces locales de documentos nuevos, presencia de los archivos exigidos, ausencia de `proyectos/`.
- Validador `quick_validate.py` de skill-creator para las tres habilidades, sin instalar paquetes.
- `git diff --exit-code -- Condominio-Backend Condominio-Frontend condominio-movil documentacion/base-datos .gitignore`: comprobar preservación de archivos rastreados; revisar también archivos nuevos por componente.
- `git diff --check` y revisión final de Git para confirmar que el conjunto nuevo es exclusivamente documental.

Un intento inicial de extraer texto Word a consola falló por codificación cp1252; se repitió con salida UTF-8 y se pudo leer. No alteró los documentos. Los Word se trasladaron como archivos originales, sin editar ni regenerar su formato.

Resultado final: cuatro originales y once archivos de base-datos con SHA-256 idéntico; veinte archivos nuevos, 137 enlaces locales válidos, 46 Markdown de componentes catalogados y tres habilidades válidas. Componentes y `.gitignore` sin diferencias ni archivos nuevos; `git diff --check` correcto. La primera comprobación de cantidad de elementos de base-datos contó también su subcarpeta vacía `qa_word/`; se ajustó para comparar exclusivamente archivos y hashes, sin modificar la carpeta. No quedan fallos de verificación documental pendientes. Esto no certifica funciones, proveedores ni entorno productivo.

## Evidencia funcional anterior — no ejecutada de nuevo aquí

| Fuente | Resultado registrado | Comando / alcance |
| --- | --- | --- |
| [Cuentas de empleados](../Condominio-Backend/ROLES_CUENTAS_EMPLEADOS.md) | 89 backend y cinco web; build y lint seleccionado correctos | Backend: `env\Scripts\python.exe -B -m administracion.run_migration_smoke` desde su carpeta; solo SQLite temporal. Web: pruebas de acceso/cuentas y `npm.cmd run build`; advertencia de tamaño |
| [Revisión de pendientes](../Condominio-Backend/REVISION_PENDIENTES_ROLES_NOTIFICACIONES.md) | 82 backend, siete web, veinte Flutter en esa revisión anterior | Conjuntos diferentes de pruebas, no sumar ni presentar como ejecución actual; servicios simulados |
| [Concurrencia PostgreSQL](../Condominio-Backend/RESULTADOS_POSTGRES_CONCURRENCIA_DISPOSITIVOS.md) | Seis escenarios de dispositivos correctos | `env\Scripts\python.exe -B -m administracion.run_device_postgres_isolated`; instancia PostgreSQL temporal y Firebase simulado |
| [Emulador aislado](../Condominio-Backend/RESULTADOS_EMULADOR_BANDEJA_AISLADA.md) | Login, detalle y lectura individual de dos cuentas ficticias | Variante Android aislada, backend/base temporales, sin Firebase; no demuestra recepción push |

No ejecutar los comandos anteriores como parte de una mera lectura documental: algunos crean entornos, aplican migraciones temporales o requieren preparación. Revisar sus fuentes y autorización antes de repetir. Faltan E2E del alta completa, push real aislado, concurrencia integral de sesiones/cola, operaciones móviles de incidencias y rendimiento de visión.

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
