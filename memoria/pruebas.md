# Pruebas y verificación

2026-11-16: IA remota: pruebas Django aisladas comprobaron autorización, modo remoto/local, fallo sin fallback, HTTPS y límites del contrato. Prueba del servicio con modelo e imagen simulados verificó autenticación y formato; pruebas web simuladas comprobaron selección, error sin cambio y regla de piscina en cámara y video con procesador remoto seleccionado. Build y ESLint correctos. Sin servidor o envío real por internet, medición de rendimiento ni uso de imágenes reales.

2026-11-16: pruebas unitarias de seguimiento comprueban 10 segundos, segunda persona, salida y pérdida; API Django en SQLite temporal comprueba permisos, validación e independencia; pruebas web simuladas cubren video con evidencia, Imou, cámara de red y webcam, reintentos y reglas previas. Build y ESLint correctos. PostgreSQL local: respaldo `Condominio-Backend/backups_locales/antes_regla_piscina_20261116_024123.dump` legible antes de migración 0009. No se enviaron avisos reales ni se probó reconocimiento físico o recepción móvil.

2026-11-16: build y ESLint de los componentes modificados correctos. Las pruebas simuladas de webcam, cámaras de red e Imou verificaron un único guardado después de incidencias y placas; también pasaron la prueba de eventos con evidencia y los reintentos de Imou. Sin cámaras físicas ni envío al proveedor.

2026-11-15: build y ESLint correctos; pruebas de cámara local, cámaras de red e Imou con API simulada verificaron el nuevo resultado. Se comprobaron coincidencia, ausencia, ambigüedad y confianza no disponible, y se revisó una captura del resultado sin coincidencia. Sin cámara ni proveedor real.

2026-11-15: build y ESLint correctos. Pruebas de navegador con fuentes y API simuladas comprobaron vista única, cambio entre cámaras, visualización, consulta puntual con IA detenida, lectura automática bajo acción explícita y conservación de zona; también pasaron las pruebas de cámaras de red y de Imou. Sin acceso a cámara física ni envío al proveedor.

2026-11-15: 7 pruebas Django en SQLite temporal verificaron zona, auditoría, permisos y notificación idempotente a guardia. e2e/incidencias_camaras_simuladas.mjs verificó dos fuentes de red, aislamiento, JPEG reducido de 1920 a 1280 píxeles y reintento con el mismo identificador; e2e/camara_local_mosaico.mjs, configuración y evidencia simulada; e2e/zonas_camaras_simuladas.mjs e e2e/imou_simulada.mjs pasaron. Pasaron 24 pruebas unitarias de visión, build y ESLint. PostgreSQL local respaldado en Condominio-Backend/backups_locales/antes_zonas_camara_20261115_193253.dump antes de aplicar 0008; se comprobó que el respaldo se puede listar. No se usaron cámaras ni se enviaron avisos reales.

2026-11-15: 108 pruebas Django aisladas correctas, incluida la comprobación de contraseña compartida y edición administrativa sin exponerla; Flutter pruebas de campo y servicio correctas; build, ESLint y dos recorridos web con datos simulados correctos. APK instalada en el teléfono conectado y hash verificado. Sin pruebas de contraseñas reales.

2026-11-15: Flutter: 105 pruebas correctas y 2 omitidas; confirma, cancela, impide confirmar al administrador y maneja fallo simulado. Analizador, build web y ESLint correctos; pruebas Edge simuladas cubrieron confirmación web, ocultación de bandeja administrativa y redistribución. APK final instalada en el teléfono conectado; hash y enlace USB comprobados. Sin incidentes ni notificaciones reales en esta etapa.

2026-11-15: 107 pruebas Django en SQLite aislado pasaron, incluidas validación de contraseña y revocación de sesiones y dispositivos ficticios; Flutter 102 pasaron y 2 omitidas; analizador Flutter, build web, ESLint y recorrido web simulado correctos. APK compilada e instalada conservando datos en el teléfono conectado; hash y enlace USB comprobados. Sin prueba de contraseña ni envío push real en esta etapa.

2026-11-15: build y ESLint de navegación web correctos. Edge con API ficticia verificó accesos de guardia, historial, confirmación, vínculo de notificación al evento y el flujo de aviso simulado. No se usaron cuentas ni envíos reales; retiro de historial sin implementar.

2026-11-14: build y ESLint del exportador correctos. Recorrido Edge con video generado y API simulada descargó los tres modos; OpenCV decodificó los archivos completos y comprobó recuadros de persona, vehículo dentro y fuera de zona. Se verificó que exportar no repite inferencia ni registra eventos. No se utilizó video real del usuario.

2026-11-14: 16 pruebas Node, build y ESLint correctos. En Edge con video y respuestas simuladas, el nuevo modo oculta vehículos fuera de zona y conserva el de dentro, sus colores y el evento único; al desaparecer la detección se retira el recuadro. El recorrido Imou simulado verificó la indicación cuando no hay zona y conservó el flujo existente. Sin pruebas físicas ni avisos reales.

2026-11-14: 16 pruebas Node de colores, filtros y seguimiento; build y ESLint correctos. Edge con video generado verificó mostrar/ocultar persona, verde, amarillo, rojo, desaparición del recuadro y evento único simulado. La prueba Imou con datos simulados verificó ambos modos y reintento; no se probó notificación real.

2026-11-14: 15 pruebas Node de seguimiento, eventos y colores; build y ESLint correctos. Edge con video generado y API simulada verificó zona oculta, amarillo/rojo, un evento con JPEG, reproducción sin registros nuevos y registro desactivado. Recorrido Imou simulado pasó. No se verificó el video del usuario ni envío o recepción real de avisos.

2026-11-14: tras separar eventos descartados del historial de incidencias confirmadas, build, ESLint del componente y recorrido Edge simulado correctos; se verificó que los descartados aparezcan solo en su vista.

2026-11-14: build Vite y ESLint de archivos web cambiados correctos. Recorrido Edge con API ficticia verificó evidencia, traslado al historial, verificación de destinatario, preparación y cola; cubrió falta de coincidencia y reintento tras fallo de entrega. La prueba simulada de catálogo se actualizó a la política vigente (guardia accede a incidencias, no al monitor) y pasó. No se probaron envíos reales ni recepción móvil en este cambio.

2026-11-14: suite Flutter: 100 pruebas aprobadas y 2 omitidas; cubre roles, panel derecho, listas por estado, detalle y revocación de acceso con datos ficticios. Análisis estático de los archivos modificados sin incidencias. APK de depuración actualizado en el Xiaomi conectado; el hash coincide y se conserva la conexión USB. Falta confirmación visual en teléfono.

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

2026-11-14: actualizado .env.example con nombres de variables requeridas y opcionales de integraciones, sin copiar valores de .env; FRONTEND_URL documentada segun settings. manage.py check paso usando el ejemplo con SQLite temporal. No se modifico .env ni se verificaron proveedores reales.

2026-11-14: preparada prueba push real aislada para residente, con APK debug de variante pushprueba y backend SQLite temporal. Firebase respondio a consulta de solo lectura y telefono USB autorizado; Android rechazo instalacion con INSTALL_FAILED_USER_RESTRICTED. No se envio push ni se instalo variante; app habitual permanece instalada. Enlace USB temporal y servidor detenidos; define y log temporales retirados. APK app-debug generada corresponde a variante de prueba, no a la app habitual. Pendiente instalacion aceptada, ejecucion y confirmacion de recepcion.

2026-11-14: el usuario autorizo el reintento e indico que el telefono tiene internet. La instalacion de la variante Android de prueba y el inicio de sesion ficticio funcionaron; en dos intentos Firebase devolvio SERVICE_NOT_AVAILABLE y no registro el dispositivo. La configuracion Firebase de la variante coincide con el proyecto; Android informa red validada y servicios de Google habilitados. En bases SQLite temporales se comprobaron cero dispositivos, avisos y entregas: no se envio push. Servidor y enlace USB temporal detenidos; app habitual instalada y variante de prueba retirada. Queda pendiente diagnosticar Firebase y validar recepcion real y apertura del aviso. El APK app-debug generado corresponde a la variante de prueba.

2026-11-14: se repitio la prueba aislada de aviso al residente con telefono autorizado. La app de prueba inicio, pero Firebase volvio a indicar SERVICE_NOT_AVAILABLE y no se registro el dispositivo; prueba fallo antes de enviar un aviso. Se detuvo el servidor y se retiro el enlace USB; la app habitual sigue instalada y la variante de prueba no permanece instalada. Pendiente investigar la disponibilidad de Firebase y validar la recepcion real.

2026-11-14: Flutter drive en dispositivo Android autorizado: instalacion variante aislada, inicio de sesion ficticio, registro FCM, envio a un unico dispositivo, recepcion en primer plano y apertura programatica del aviso con evidencia: correctos. No cubre toque real ni entrega con app cerrada.

2026-11-14: Flutter drive en Android real: registro FCM, app en segundo plano, envio a dispositivo unico, toque confirmado por usuario y apertura del listado y detalle ficticio: correctos. No se verifico app cerrada.

2026-11-14: Prueba Android y backend PostgreSQL local: cuenta ficticia con un dispositivo elegible, app de prueba cerrada mediante am kill sin forzar detencion, envio FCM ENVIADA a una unica entrega y usuario confirmo recepcion y apertura de Mis avisos. No se verifico personalmente el detalle tras el toque ni se uso camara.

2026-11-14: Frontend: npm.cmd run build correcto; ESLint sobre archivos cambiados sin errores (dos advertencias existentes de hooks en dashboard). Edge con respuestas ficticias: inicio, acceso, dashboard, tabla y formulario de bloques, menu movil y exclusion del tema en camaras comprobados. camaras_catalogo.mjs agoto espera en expectativa de permiso de guardia; camara_simulada.mjs agoto espera de boton Camara de laptop. No se probo camara real ni todas las paginas.

2026-11-14: Frontend: compilacion y ESLint selectivo correctos; Edge con usuarios y bloques ficticios verifico colores de nuevo, editar, desactivar, cancelar y eliminar, y apertura/cierre del formulario. No se ejecuto ninguna operacion destructiva.

2026-11-14: 105 pruebas de acceso SQLite aislado correctas, build y lint selectivo correctos, recorrido React/Django aislado correcto (confirmar, cancelar y bloquear por asignaciones), prueba especifica de concurrencia asignacion/eliminacion correcta en PostgreSQL temporal. La suite PostgreSQL completa tuvo cuatro fallos en otras pruebas de registro de dispositivos/FCM; se reprodujeron. Sin migraciones ni cambios en bases existentes.

2026-11-14: Base local: vista Django sincronizar dispositivo ficticio con sesion creada dentro de transaccion revertida y validacion FCM real devolvio HTTP 204. Se reenvio por FCM directamente el aviso existente, sin pasar por la cola y sin crear incidencia; Android registra notificacion, apertura pendiente. PostgreSQL temporal: 9 pruebas correctas en dos ejecuciones; validacion del proveedor simulada en pruebas de concurrencia.

2026-11-14: Android autorizado: se constato en pantalla Mis avisos y el texto de la incidencia ficticia tras iniciar la cuenta de prueba. Confirmacion de apertura de detalle pendiente.

2026-11-14: El usuario confirmo recepcion y apertura del detalle del aviso ficticio en Android; antes se habia comprobado pantalla Mis avisos. Tras la prueba se verifico la app habitual instalada y se desinstalo la variante de prueba.

2026-11-14: Flutter test: 95 pruebas correctas y 2 omitidas por configuracion. Analisis selectivo sin errores con 42 avisos informativos existentes; APK debug compilado. Vistas previas de widgets ficticios para acceso, perfil y avisos; no se instalo ni ejecuto la nueva version en el telefono.

2026-11-14: Flutter: 95 pruebas correctas y 2 omitidas; analisis selectivo sin errores (avisos informativos existentes); build debug correcto. Comparados identificador y firma del APK; instalacion de reemplazo exitosa, hash del APK instalado coincide y enlace USB activo. Revision visual real pendiente.

2026-11-14: Revision visual real: el usuario abrio la app actualizada en su telefono y confirmo que el nuevo diseno se ve bien; no se afirmo una prueba integral de todos los flujos.

2026-11-14: En segundo telefono Android, adb install exitoso; SHA-256 del APK instalado coincide con build local; ADB reverse 8001 a 8000 confirmado. Puerto local 8000 en escucha; no se verifico la respuesta autenticada ni notificaciones.

2026-11-14: Flutter test: 100 pruebas correctas y 2 omitidas; analisis selectivo sin incidencias. Pruebas cubren rol residente, guardia y personalizado, filtros, detalles, consulta a 30 segundos, cancelacion al cambiar pantalla y revocacion de acceso. APK debug con direccion USB instalado sin borrar datos; hash y enlace USB verificados. Vista previa local con datos ficticios; revision real pendiente.

2026-11-14: Se contrastaron cadenas y clases de la barra en el kernel del APK, se comprobo instalacion con hash coincidente y enlace USB 8001 a 8000. El usuario aun no ha confirmado la barra en pantalla.

2026-11-14: Verificacion en pantalla Android: Inicio, Incidencias, Historial y Ajustes visibles tras instalar el APK recompilado. No se probaron operaciones con datos reales.

2026-11-14: Confirmacion del usuario en segundo Xiaomi: la barra inferior ya aparece tras reinstalar la version corregida.

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
# 2026-11-15 — cámara local en navegador

`npm.cmd run build` y ESLint de los dos componentes modificados: correctos. `node e2e/camara_local_mosaico.mjs`: correcto con dos dispositivos y API simulados; comprueba selección, zona y tiempo por dispositivo, mosaico y ampliación. No se usaron dispositivos físicos ni se enviaron avisos reales. `node e2e/camaras_catalogo.mjs` falló en línea 170 al comparar las IP simuladas 192.168.20.20 y 192.168.20.21; pendiente de investigar.

2026-11-16: Ocho pruebas de seguridad_IA.tests_camara_demo correctas con DEBUG temporal v?lido. Roboflow simulado; sin llamadas ni im?genes reales.

2026-11-16: Ocho pruebas de c?mara correctas; llamada real de pasarela a Roboflow con imagen blanca sint?tica devolvi? detecciones v?lidas vac?as. Sin prueba de video ni avisos.

2026-11-16: Build frontend correcto y ESLint correcto para componentes principales. Sin validacion visual en navegador.

2026-11-16: Tres pruebas Django de permisos y retirada correctas, build web y ESLint correctos; prueba Flutter sin resultado por bloqueo de herramienta.

2026-11-16: Build frontend y recorrido simulado de guardia y confirmacion de administrador desde monitor correctos; sin cambios en incidencias reales.

2026-11-16: Build frontend y recorrido simulado de seleccion, confirmacion, retorno y consulta de historial correctos; sin modificar datos reales.

2026-11-16: Build frontend y ESLint del menu pasaron; sin validacion visual del usuario.

2026-11-16: API locales de eventos e incidentes devolvieron HTTP 200 con sesion activa; consulta de BD correcta; build, ESLint y flujo simulado incluido error 401 correctos.

2026-11-16: 15 pruebas Django de revision, monitor y piscina y 6 de FCM correctas; recorridos simulados piscina video y camaras y camaras de estacionamiento correctos. Suite AccessTests fallo en inicializacion por grupos existentes y no valida el flujo; no se enviaron avisos reales.

2026-11-16: FCM devolvio ENVIADA para una notificacion ficticia dirigida al unico dispositivo elegible del guardia; recepcion en dispositivo todavia no confirmada.

2026-11-16: Recepcion real de un aviso ficticio confirmada por usuario; toque abre incidencias activas. Flujo individual de estacionamiento y piscina aun no confirmado con entregas reales.

2026-11-16: Recepcion real confirmada por usuario para dos eventos ficticios (estacionamiento y piscina); Firebase acepto ambas entregas. Sin comprobar generacion automatica con video o camara reales.

2026-11-16: Once pruebas Django FCM y revision pasaron con Firebase simulado, incluyendo categorias y mensajes de residente. No se envio push real con los textos nuevos.

2026-11-16: Dos eventos ficticios autorizados siguieron registro y cola habitual; Firebase acepto ambos y usuario confirmo recepcion de textos diferentes. No se proceso cola previa.

2026-11-16: XML del manifest y recursos validos. Intento de compilacion Flutter sin salida durante mas de un minuto, interrumpido; sin APK ni validacion visual nueva.

2026-11-16: Compilacion debug correcta, instalacion actualizada sin borrar datos y prueba FCM individual autorizada: Firebase acepto y usuario confirmo icono y color. Sin procesar cola anterior.

2026-11-16: Nueve pruebas de navegacion Flutter pasaron, incluidas cancelacion y retirada ficticia; APK debug compilada e instalada conservando datos.

2026-11-16: Diez pruebas Flutter aprobadas; incluyen confirmar incidencia antigua sin promoverla por hora de confirmacion y ausencia de accion de retiro en pendientes.

2026-11-16: Build Flutter debug e instalacion adb -r correctos; redireccion USB 8000 presente. Sin confirmacion visual todavia.

2026-11-16: Se verifico que APK anterior no contenia texto nuevo; regeneracion del kernel incorporo el cambio, compilacion e instalacion adb -r correctas.

2026-11-16: Once pruebas Flutter pasaron, incluida actualizacion por gesto con lista vacia; APK recompilada con kernel actualizado e instalada sin borrar datos.

2026-11-16: Build y ESLint frontend correctos; prueba simulada verifica gesto tactil y llamada API, junto con flujo de revision. Sin validacion en dispositivo tactil real.

2026-11-16: Build, ESLint y prueba web simulada correctos: guardia sin pesta?a descartados, administrador la conserva.

2026-11-16: Clips: 12 pruebas Django (incluyen permisos, formato y monitor simulado), 2 pruebas Node de intervalo/b?fer, pruebas simuladas de c?maras y video en navegador y 11 pruebas Flutter de navegaci?n superadas; compilaci?n web correcta. No verificada la reproducci?n en tel?fono ni nube.

2026-11-16: APK debug con reproducci?n de clips compilada e instalada en el tel?fono USB conectado; an?lisis Flutter sin hallazgos. Pendiente comprobaci?n visual y recepci?n de un clip real.

2026-11-16: Compilaci?n web correcta; 4 pruebas Node de regla piscina y clips y prueba de navegador con video/IA simulados superadas. Sin prueba integral con el archivo del usuario.

2026-11-16: En an?lisis de piscina se aclara que la zona incluye el borde y usa el punto inferior de la persona; el texto sobre reinicio del conteo coincide con la regla existente. Compilaci?n web superada.

2026-11-16: Usuario inform? una incidencia de piscina en video; verificada en base local pendiente con clip WebM de 4,0 s, 640 x 360 y 116595 bytes. Reproducci?n visual y entrega push no verificadas.

2026-11-16: Compilaci?n web y 11 pruebas m?viles de navegaci?n satisfactorias; APK debug instalada, pendiente revisi?n visual del resultado.

2026-11-16: flutter pub get --offline y compilaci?n Android exitosos; clase VideoPlayerPlugin confirmada en los DEX de la APK e instalaci?n USB exitosa. Reproducci?n real pendiente de confirmaci?n.

2026-11-16: Usuario confirm? reproducci?n de video en tel?fono. APK reconstruida desde cero, complemento de video presente e instalaci?n USB exitosa; interfaz a?n pendiente de validaci?n visual.

2026-11-16: Mascota: 9 pruebas Django, 11 pruebas Node de reglas, compilacion web y pruebas simuladas en navegador de video y dos camaras con clip superadas. Migracion 0011 local aplicada tras pg_dump validado; sin pruebas de animales o entrega FCM reales.

2026-11-16: Compilacion web y recorrido simulado de incidencias para guardia y administrador superados, incluyendo filtro descartadas en URL.
2026-11-17: teléfono autorizado detectado por ADB, API local /api/me/ respondió HTTP 401 sin autenticación, y adb reverse --list confirmó tcp:8001 a tcp:8000. No se verificó la solicitud desde la app ni el inicio de sesión; curl y wget no disponibles en el teléfono.
2026-11-17: API /api/me/ respondió 401 anónimo, teléfono autorizado y adb reverse confirmó tcp:8001 hacia tcp:8000; falta verificación en la app.
2026-11-17: ADB confirmó enlace 8001→8000 y API respondió HTTP 401 anónimo; kernel APK generado no incluye URL USB literal, sin demostrar configuración efectiva instalada. Flutter build no produjo salida y se detuvo.
2026-11-17: permiso Android concedido, API local 401 anónimo y enlace ADB configurado; opciones de seguridad, cola y envío habilitadas, seis pendientes y una reserva vencida; hay ERROR_ENVIO y cancelaciones por destinatario no válido. No se confirmó el proceso ni recepción.
2026-11-17: dos dispositivos FCM elegibles globalmente, seis entregas pendientes vencidas, tres de cinco notificaciones recientes sin entregas; consulta HTTPS a Firebase falló desde sandbox de red restringida y no demuestra estado del servidor.
2026-11-17: teléfono USB autorizado y permiso de notificaciones concedido; app relanzada tras confirmación del usuario de sesión e internet. Sin confirmación de sincronización ni recepción en este teléfono; usuario sí recibió aviso en otro.
2026-11-18: inspección estática de procesador FCM y componente ZonaVideo; no se ejecutó prueba de interfaz ni se verificó cámara real.
2026-11-18: npm.cmd run build y e2e/zonas_camaras_simuladas.mjs correctos. e2e/imou_simulada.mjs agotó espera de texto de cámaras adicionales antes del dibujo; no demuestra fallo ni funcionamiento de dibujo Imou.
2026-11-18: e2e/mascota_video_simulada.mjs aprobó dibujo en video con regla mascota. e2e/video_fin_simulado.mjs agotó espera de botón de configuración previo al dibujo, sin validar estacionamiento.
2026-11-18: Flutter test --no-pub: 109 aprobadas y 2 omitidas. Flutter analyze --no-pub: 56 observaciones, salida 1. API /api/me/ respondió 401 anónimo; ADB sin dispositivos.
2026-11-18: 24 pruebas Flutter simuladas de navegación, alertas y nuevas acciones aprobadas, incluidas validación de texto, 403 y respuesta no confirmada; análisis de cuatro archivos modificados sin incidencias. Sin prueba real en teléfono, envío o cambios de datos.
2026-11-18: Gradle :app:assembleDebug --offline --rerun-tasks correcto; APK incluye textos de acciones nuevas y URL USB. API local 401 anónimo y ADB sin dispositivos; no se verificó la app en teléfono.
2026-11-18: Windows detectó dispositivo WPD; ADB sin dispositivos aun tras reinicio. API local respondió 401 anónimo, HTTPS Firebase respondió 404, opciones FCM activas, dos dispositivos globales elegibles y cero pendientes; procesador continuo detectado activo. Sin prueba de entrega al teléfono.
2026-11-18: ADB sin dispositivos tras reconexión; consulta de propiedades del dispositivo WPD mostró dispositivo de almacenamiento SSD, por lo que se rectifica la identificación previa como posible teléfono.
2026-11-18: adb install -r informó Success, app en primer plano, enlace USB 8001→8000, permiso Android concedido para usuario principal, red validada y procesador activo. Sin confirmación de registro ni recepción real.
2026-11-18: usuario confirmó sesión guardia, ADB reverse activo; servidor informa dos dispositivos FCM globalmente elegibles y ninguna entrega pendiente. No identifica el dispositivo conectado ni demuestra recepción.
2026-11-18: tras relanzar app, una procedencia FCM de guardia se validó en los diez segundos siguientes; ADB reverse y procesador activos. No se identificó inequívocamente el dispositivo ni se envió push.
2026-11-18: coincidencia local del token FCM sin exponerlo con dispositivo guardia elegible; Firebase aceptó una prueba directa y Android registró notificación y recepción en primer plano. Sin confirmación visual ni validación de cola.
2026-11-18: segundo push directo aceptado por Firebase; dumpsys de Android contiene el texto único del segundo intento y permiso Android concedido. Falta confirmación visual y prueba de cola.
2026-11-18: teléfono autorizado, API responde 401 anónimo y adb reverse confirma 8001→8000. No se ejecutó Flutter run.
