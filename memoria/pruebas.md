# Pruebas y verificación

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
