# Cambios realizados

2026-11-07: zonas e historial por cámara adicional, control de permisos y edición web; migración local tras respaldo. [Detalle](../documentacion/seguridad/ZONAS_CAMARAS_CATALOGO.md).

2026-11-07: catálogo mínimo y selector de fuentes adicionales, API protegida y puente local RTSP separado; servicio iniciado sin abrir cámara adicional. [Detalle](../documentacion/seguridad/MONITOR_CAMARAS_CATALOGO.md).

2026-11-07: seguimiento Imou web e independiente tolera interrupciones breves de pistas notificadas; no modifica eventos existentes ni destinatarios. [Detalle](../documentacion/seguridad/AVISOS_REPETIDOS_IMOU.md).

2026-11-07: puente Imou reiniciado con acceso a red local; sin modificar IP ni cámara. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: reiniciado el puente local Imou que ocupaba el puerto; sin modificar cámara ni IP. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: nueva relación persistente monitor–cámara, puente local y acción administrativa de vinculación; sin cambiar la IP real de la cámara. [Detalle](../documentacion/seguridad/MONITOR_IMOU_CATALOGO.md).

2026-11-07: usuario ajustó manualmente IPv4 Ethernet de PC a 192.168.1.107/24; prueba de lectura directa de cámara por cable, sin cambios en dispositivo, proyecto ni registros.

2026-11-07: usuario modificó IP Ethernet de PC a 192.168.77.1/24; diagnóstico encontró candidata ARP en otra subred. Sin cambios en cámara.

2026-11-07: diagnóstico de solo lectura del enlace Ethernet directo; no se cambió red, cámara ni código, solo memoria/documentación.

2026-11-07: prueba de lectura real de los dos perfiles ONVIF de Imou y llamada API con usuario simulado; solo documentación, sin cambios de código o registros.

2026-11-07: consulta de solo lectura ONVIF en Imou autorizada; se actualizó documentación, sin cambiar código, configuración o datos de cámara.

2026-11-07: el selector de conexión muestra el nombre del perfil ONVIF elegido durante el alta, sin cambios de API o base de datos.

2026-11-07: puerto ONVIF anunciado se propone desde búsqueda; alternativa 80 y entrada manual siguen disponibles, sin alterar la cámara.

2026-11-07: consulta puntual de perfiles ONVIF Media 1 al registrar cámara y bloqueo visual de ruta al editar; sin modificar puente Imou, eventos o notificaciones.

2026-11-07: búsqueda reintenta ONVIF una vez y separa registros guardados de respuestas coincidentes, sin cambios de cámara o credenciales.

2026-11-07: descubrimiento ONVIF acotado con selección explícita de IP en registro de cámara; sin cambio de cámaras ni credenciales.

2026-11-07: perfil web Imou Bullet 2E y ruta manual preservada; no modifica el puente ni agrega modelos o endpoints.

2026-11-07: ruta del flujo Imou se muestra al editar el registro vinculado, con acceso administrativo local y sin copiarla ni cambiar la configuración operativa.

2026-11-07: botón y API de prueba puntual RTSP para cámaras de red del catálogo, con proceso de lectura separado y credenciales por entrada estándar; Imou conserva su puente.

2026-11-07: ojos para contrase?a nueva y actual, acceso expl?cito sin cach? y lectura de usuario Imou; no se cambian credenciales del puente ni hay migraci?n.

2026-11-07: usuario/ruta RTSP y contraseña cifrada escribible sin lectura en catálogo; clave independiente en configuración local, migración y pruebas. [Detalle](../documentacion/seguridad/CREDENCIALES_CAMARAS.md).

2026-11-07: botones accesibles para desplegar menús sin cambiar rutas o permisos. [Detalle](../documentacion/seguridad/MENU_MONITOR_CAMARAS.md).

2026-11-06: dos submenús nombrados de cámaras, vista de monitor por roles y vista administrativa de eventos; lógica de eventos compartida, sin cambios de backend. [Detalle](../documentacion/seguridad/MENU_MONITOR_CAMARAS.md).

2026-11-06: botón de prueba Imou consulta automáticamente durante conexión; interfaz precisa que deshabilitar catálogo no detiene monitor. [Detalle](../documentacion/seguridad/VINCULO_IMOU_CATALOGO.md).

2026-11-06: agregar Imou local al catálogo y comprobar imagen por puente existente, con acceso admin local, detección de ambigüedad y sin exponer credenciales. [Detalle](../documentacion/seguridad/VINCULO_IMOU_CATALOGO.md).

2026-11-06: app Django `camaras`, migración, API auditada y catálogo web solo administrador; no conecta dispositivos ni guarda credenciales. [Detalle](../documentacion/seguridad/PLAN_CAMARAS_Y_AVISOS_RESIDENTES.md).

2026-11-05: comando independiente Imou, seguimiento, exclusión local, estado de ocupación y adaptación web; sin migraciones ni pruebas con servicios reales. [Detalle](../documentacion/seguridad/MONITOREO_IMOU_INDEPENDIENTE.md).

2026-11-05: diagnóstico de Ethernet directo documentado; sin cambios permanentes de red, cámara o aplicación. [Detalle](../documentacion/seguridad/DIAGNOSTICO_IMOU_ETHERNET_DIRECTO.md).

2026-11-05: frontend guarda automáticamente zona, tiempo y registro Imou; muestra estado, conserva última configuración confirmada ante errores y permite reintento. Sin cambios al backend ni Firebase en esta etapa. [Detalle](../documentacion/seguridad/GUARDADO_AUTOMATICO_ZONA_IMOU.md).

2026-11-05: estado de registro Imou visible en monitoreo, guardado accesible con cambios pendientes, confirmación y bloqueo durante envío pendiente. Sin modificaciones a Firebase ni reglas de detección. [Detalle](../documentacion/seguridad/REGISTRO_IMOU_CONFIGURACION_PENDIENTE.md).

2026-11-05: seguimiento Imou con recuperación breve conservadora; contador, punto de contacto, mensaje de muestreo lento y cambios sin guardar. [Detalle](../documentacion/seguridad/ESTABILIDAD_SEGUIMIENTO_IMOU.md).

2026-11-05: configuración compartida Imou, historial, validación, permisos y adaptación de interfaz. [Detalle](../documentacion/seguridad/ZONA_IMOU_COMPARTIDA.md).

2026-11-05: eliminada la segunda imagen en configuración Imou; la imagen analizada ocupa la misma vista de cámara. [Detalle](../documentacion/seguridad/REDISENO_CENTRO_SEGURIDAD.md).

2026-11-05: interfaz de monitoreo y eventos, configuración de análisis y miniaturas de evidencia existente; controles de IA y cámara independientes. [Detalle](../documentacion/seguridad/REDISENO_CENTRO_SEGURIDAD.md).

2026-11-05: añadidos modelo/migración de evidencia privada, validación JPEG y descarga protegida; Imou adjunta fotograma y web/Flutter lo muestran. Respaldo y migración local verificados; sin cambios de Firebase ni datos de prueba persistentes. [Informe](../documentacion/seguridad/EVIDENCIA_IMOU.md).

2026-11-05: Imou registra hallazgos de forma optativa mediante la API existente; añade etiqueta de fuente y reintento UUID estable. Se amplió prueba backend y Edge, sin migraciones ni cambios del modelo/API del servidor. [Informe](../documentacion/seguridad/REGISTRO_IMOU_LOCAL.md).

2026-11-05: `AnalisisImou.jsx`, `CamaraImou.jsx` y CSS muestran zona editable y usan el seguimiento existente; extendida prueba Edge. Sin cambios de backend, dependencias o permisos. [Informe](../documentacion/seguridad/ZONA_IMOU_TEMPORAL.md).

2026-11-05: reorganizados `CamaraImou.jsx` y `AnalisisImou.jsx` con `CamaraImou.css`; ampliada prueba simulada de alineación. Sin cambios de backend ni reglas de visión. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: añadido `AnalisisImou.jsx` y conectado a `CamaraImou.jsx`, usando la API existente. Actualizada prueba Edge y documentación. No se cambiaron backend, permisos, dependencias ni app móvil. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: añadidos puente `imou_local.py`, pasarela `api_imou_local.py`, ruta autenticada y componente `CamaraImou.jsx`; pruebas Python/Edge y documentación. Sin dependencias nuevas, migraciones ni cambios móviles. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: corregida únicamente la clave en la configuración privada ignorada de la Imou con autorización; documentada lectura real satisfactoria. No se incluye la clave en informes ni se cambió código funcional. [Resultado](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: documentado resultado de autenticación Imou por Wi-Fi (401). Sin cambios funcionales ni en configuración de la cámara; clave ingresada localmente por el usuario. [Detalle](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: añadido `output/pdf/caratula_indice_condominio_automatico.docx`, conservando el Word anterior renombrado por el usuario. Incluye carátula, TOC nativo y estructura de títulos para redactar.

2026-11-05: añadido `seguridad_vision/probar_imou.py`, plantilla local ignorada `recursos/imou.local.ini` y guía de conexión Wi-Fi/RJ45. Sin cambios en Django, frontend, móvil ni base de datos. [Informe](../documentacion/seguridad/CONEXION_IMOU_LOCAL.md).

2026-11-05: preparada versión Word editable de la carátula y el índice; ver límite de comprobación visual en [estado actual](estado-actual.md#carátula-e-índice-académico--2026-11-05).

2026-11-05: añadido `output/pdf/caratula_indice_condominio.pdf` y registro documental de la adaptación académica. Solo carátula e índice; los sprints son una propuesta de organización del informe, no evidencia de ejecución histórica. [Resultado](estado-actual.md#carátula-e-índice-académico--2026-11-05).

2026-11-05: se documentó la confirmación del usuario de una notificación recibida en el teléfono; sin cambios adicionales de código. [Informe](../documentacion/seguridad/REACTIVACION_FCM_VIDEO_2026_11_05.md).

2026-11-05: procesadas tres entregas pendientes de prueba y procesador FCM continuo iniciado sin cambios de configuración. [Informe](../documentacion/seguridad/REACTIVACION_FCM_VIDEO_2026_11_05.md).

2026-11-05: añadida prueba `Condominio-Frontend/e2e/video_fin_simulado.mjs` para comprobar fin de reproducción y ausencia de solicitudes adicionales, sin cambios en el reproductor. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

2026-11-04: añadida prueba reproducible de cámara y registro con navegador y API simulados en `Condominio-Frontend/e2e/camara_simulada.mjs`. [Informe](../documentacion/seguridad/REGISTRO_CAMARA_DEMOSTRACION.md).

2026-11-04: opción y reintento en la cámara web de prueba, con contenido que identifica la procedencia y sin cambios en backend. [Informe](../documentacion/seguridad/REGISTRO_CAMARA_DEMOSTRACION.md).

2026-11-04: editor y capa de zona en `CamaraDemostracion.jsx`, con regla temporal de permanencia y descarte de intervalos largos. [Informe](../documentacion/seguridad/ZONA_CAMARA_DEMOSTRACION.md).

2026-11-04: registro automático optativo en frontend y preparación de evento para API existente, sin migraciones ni cambios backend. [Informe](../documentacion/seguridad/REGISTRO_AUTOMATICO_VIDEO.md).

2026-11-04: se procesó un lote de una entrega FCM existente del guardia de prueba, sin cambios de código o configuración. [Informe](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

2026-11-04: botón de preparación desde hallazgo y formulario manual con descripción del origen y efectos del envío; sin cambios de backend. [Informe](../documentacion/seguridad/VIDEO_PREPARAR_EVENTO.md).

2026-11-04: seguimiento en memoria y visualización de posibles vehículos detenidos en video; zona y resultados siguen temporales. [Informe](../documentacion/seguridad/PERMANENCIA_VIDEO.md).

2026-11-04: se retiraron la guía y el enlace de muestra añadidos en el cambio anterior, conservando el editor de zona. [Detalle](../documentacion/seguridad/ZONA_VIDEO_PRIMERA_ETAPA.md).

## 2026-11-04: editor temporal de zona

Se añadieron componentes y validaciones de zona al frontend, sin cambios en backend o datos. [Informe](../documentacion/seguridad/ZONA_VIDEO_PRIMERA_ETAPA.md).

## 2026-11-02: limpieza del video fijo

Eliminados componente, ruta, pruebas exclusivas y archivos públicos de muestra; el script general ahora exige una entrada explícita. [Informe](../documentacion/seguridad/RETIRO_VIDEO_DEMOSTRACION.md).

## 2026-11-02: video analizado con controles nativos

Se sustituyó el lienzo con botones externos por video nativo con capa de detecciones y botón de ampliación dentro del visor. Sin cambios de backend o datos. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: controles de vista analizada

La vista anotada incluye reproducción, pausa, posición, sonido y pantalla completa; no se generó un video nuevo ni se modificó el backend. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: comparación de videos

Se actualizó la pantalla React para mostrar ambas vistas y reutilizar las detecciones durante la reproducción; no hay archivo anotado ni cambios de backend. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: selección de video en web

Nueva sección React para elegir y analizar un archivo de video sin guardar el archivo completo ni producir eventos. [Informe](../documentacion/seguridad/VIDEO_ARCHIVO_DEMOSTRACION.md).

## 2026-11-02: confirmación de cámara

Se documentó la confirmación del usuario; sin cambios de código o datos en esta etapa.

## 2026-11-02: controles de cámara de prueba

Nuevo procesador local, pasarela restringida y controles React. Se iniciaron el procesador y frontend locales; no se modificó la base de datos. [Informe](../documentacion/seguridad/CAMARA_LOCAL_DEMOSTRACION.md).

## 2026-11-02: registro de demostración

Se documentó la confirmación del usuario; no se modificaron código, datos ni configuración.

## 2026-11-01: corrección operativa local

Se detuvo el proceso Django anterior sin recarga que atendía el puerto 8000, conservando el servidor actualizado. Sin cambios de código ni datos. [Informe](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## 2026-11-01: visualización web de muestra

Se añadieron la ruta protegida y el reproductor, además de soporte WebM en el procesador local. El video público convertido permanece ignorado por Git. [Informe](../documentacion/seguridad/VIDEO_DEMOSTRACION_WEB.md).

## 2026-11-01: procesamiento de video

Nuevo script independiente y documentación en `Condominio-Backend/seguridad_vision`; no se modificaron datos de Django. [Informe](../documentacion/seguridad/VIDEO_COMPLETO_RFDETR.md).

## 2026-11-01: continuidad y pruebas

Se registraron las preferencias del usuario en contexto y memoria. No se modificaron las habilidades, código, base de datos ni dispositivos.

## 2026-11-01: prueba RF-DETR aislada

Se añadió `Condominio-Backend/seguridad_vision` con script de prueba y documentación. Los recursos descargados y entorno virtual se ignoran en Git. [Informe](../documentacion/seguridad/PRUEBA_INICIAL_RFDETR.md).


2026-11-01: creado evento manual etiquetado de prueba en base local con su historial, notificaciones y entrega; quedó pendiente y sin incidencia. Ejecutores de prueba y verificación en carpeta local ignorada. [Informe](../documentacion/seguridad/PRUEBA_COLA_AUTOMATICA_LOCAL.md).

2026-11-01: diagnóstico móvil seguro incorporado; app debug habitual instalada y dispositivo de guardia validado; cola y procesador de seguridad activados sin activar push financiero. [Informe](../documentacion/seguridad/ACTIVACION_LOCAL_PUSH_GUARDIA.md).

2026-11-01: añadido modo continuo probado al comando FCM, compilada app habitual y configurado enlace USB; no activados cola/envíos. [Informe](../documentacion/seguridad/PREPARACION_APP_Y_PROCESADOR_FCM.md).

2026-11-01: protección FCM y migraciones incorporadas al backend local; activada procedencia y bandeja, conservados los envíos pausados. Respaldo y pruebas documentados. [Informe](../documentacion/seguridad/INCORPORACION_BACKEND_FCM_LOCAL.md).

2026-11-01: incorporado coordinador de inicio FCM y sus pruebas al móvil habitual, sin los controles de prueba Android. [Informe](../documentacion/seguridad/INCORPORACION_INICIO_MOVIL_FCM.md).

2026-11-01: comprobación de apertura FCM con inicio normal, guiones de prueba en copia ignorada y documentación; sin incorporar cambios al código habitual. [Informe](../documentacion/seguridad/PRUEBA_APERTURA_NUEVO_INICIO_FCM.md).

2026-11-01: ejecutada prueba FCM aislada en segundo plano; no se incorporó código ni se activaron envíos habituales. [Informe](../documentacion/seguridad/PRUEBA_FCM_NUEVO_INICIO_SEGUNDO_PLANO.md).

2026-11-01: ejecutada prueba FCM real aislada con observador de ensayo y guardia ficticio; sin incorporación al código o base habituales. [Informe](../documentacion/seguridad/PRUEBA_INICIO_FCM_REAL_ESPERA.md).

2026-11-01: instrumentación de prueba integrada en copias ignoradas de Flutter y backend; no incorporada a aplicación habitual. [Informe](../documentacion/seguridad/PRUEBA_INTEGRADA_INICIO_FCM.md).

2026-11-01: coordinador de inicio FCM y pruebas añadidos únicamente a copia Flutter ignorada; documentación y memoria actualizadas. [Informe](../documentacion/seguridad/INICIO_MOVIL_RED_LENTA_FCM.md).

2026-11-01: ajustada la baja DELETE y añadidas pruebas de expiración y concurrencia únicamente en copia ignorada; informe y memoria actualizados. [Informe](../documentacion/seguridad/REVISION_BLOQUEOS_CLIENTES_FCM.md).

2026-11-01: corregidas expiración JWT y rotación tras sesión revocada solo en copia aislada; ampliadas las pruebas y la documentación. [Informe](../documentacion/seguridad/PRUEBAS_ADICIONALES_CIERRE_FCM.md).

2026-11-01: versión FCM de sesión, atribución de dispositivo y cierre transaccional preparados únicamente en copia ignorada; documentación y pruebas actualizadas. El parche anterior no incluye estos cambios. [Informe](../documentacion/seguridad/CORRECCION_CARRERA_FCM_AISLADA.md).

2026-10-31: añadida prueba móvil del timeout; creados diagnóstico de concurrencia y ejecutor de respaldo en carpetas locales ignoradas, respaldo local y documentación. No se cambió el código funcional ni se aplicó el parche FCM al backend habitual. [Detalles](../documentacion/seguridad/REVISION_TRANSICION_FCM_TIEMPOS_RESPALDO.md).

2026-10-31: añadido ejecutor de validación real sin envíos a la copia aislada; corregida allí la respuesta para `InvalidArgumentError` y actualizado el parche revisable. Prueba real y documentación completadas; sin aplicar cambios al backend habitual. [Informe](../documentacion/seguridad/PRUEBA_VALIDACION_FCM_REAL_AISLADA.md).

2026-10-31: preparados en copia aislada control FCM por proyecto, filtros de envío, migración y pruebas; añadido parche revisable al directorio de documentación. No se sustituyó código del backend habitual. [Detalles](../documentacion/seguridad/RESULTADO_PROCEDENCIA_FCM_AISLADA.md).

2026-10-31: creado el plan de transición Firebase tras inventario agregado de solo lectura y pruebas simuladas; actualizados índice y memoria. Ningún cambio funcional, de configuración o de datos en esta etapa. [Plan](../documentacion/seguridad/PLAN_TRANSICION_FIREBASE_DISPOSITIVOS.md).

2026-10-31: controlador local ampliado con `enviar-cerrada`, comprobación de PID y cierre exclusivo de la variante temporal; cuatro pruebas nuevas, nueve aprobadas en total. Prueba manual de arranque desde notificación completada. Documentación y memoria actualizadas; código funcional móvil y dispositivos habituales sin cambios en esta etapa. [Informe](../documentacion/seguridad/PRUEBA_PUSH_PROCESO_CERRADO.md).

2026-10-31: verificación de apertura push sin cambios de código funcional. Se compiló la variante temporal desde `lib/main.dart`, se comprobó su navegación real y se retiró del teléfono al terminar. Actualizados informe, índice y memoria; corregidos textos de memoria dañados por codificación en las dos entradas anteriores. [Informe](../documentacion/seguridad/PRUEBA_APERTURA_PUSH.md).

2026-10-31 — Ejecutado escenario aislado de push en segundo plano y un reintento dirigido solicitado por el usuario; resultado visible confirmado. Sin cambios de código durante este reintento; limpieza local completada. [Informe](../documentacion/seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md).

2026-10-31 — Añadidos escenario Flutter y controlador aislado con pruebas simuladas para push en segundo plano; endpoint de finalización exclusivo del servidor temporal. No se modificaron datos o dispositivos habituales. Instalación rechazada; ensayo de recepción pendiente. [Informe](../documentacion/seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md).

2026-10-31 — Ajustados recursos nativos Firebase en variante de prueba, diagnóstico seguro y comprobación de red del servidor temporal. Ejecutada prueba aislada de recepción en primer plano; app/enlace/base/logs temporales retirados. App de prueba sigue registrada en Firebase. [Resultado](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

2026-10-31 — Registrados resultados de consola FCM y conectividad del teléfono. Sin cambios de código o configuración; nuevo intento de instalación rechazado y recursos de prueba retirados. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

2026-10-31 — Ejecutado test push aislado autorizado, sin cambios de código en este intento. Inicio de sesión ficticio correcto, obtención FCM fallida y limpieza de app/enlace/base/logs. Ningún aviso enviado. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

2026-10-31 — Añadida variante debug `CONDOMINIO_PUSH_PRUEBA`, opciones Firebase explícitas, manifiesto, restricciones y pruebas Flutter; runner temporal `run_push_test_isolated` y prueba de integración push. Registrada app de prueba distinta en Firebase propio. Ningún cambio a datos/dispositivo habituales; instalación rechazada, prueba pendiente. [Informe](../documentacion/seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md).

2026-10-31 — Configuraciones Android y `.env` locales apuntan al Firebase propio; respaldo ignorado y clave en carpeta local de usuario. Añadido `ENVIO_FCM_LEGADO_ACTIVO` con comportamiento previo por defecto y prueba de pausa sin perder registros; flag local False por decisión del usuario. APK debug compilada, no instalada. [Informe](../documentacion/seguridad/CONFIGURACION_FIREBASE_PROPIO_LOCAL.md).

2026-10-31 — Añadidos `condominioBACK/firebase_credentials.py`, pruebas de selección y documentación de `FIREBASE_CREDENTIALS_PATH`; settings conserva prioridad JSON y fallback previo. Credencial nueva validada en proceso aislado; no copiada al repositorio ni activada en `.env`. [Preparación](../documentacion/seguridad/PREPARACION_FIREBASE_PROPIO.md).

2026-10-31 — Preparadas copias Android/Firebase anteriores y configuración candidata del proyecto propio en directorio ignorado; documentación y memoria. Ninguna configuración activa o cuenta modificada. [Detalle](../documentacion/seguridad/PREPARACION_FIREBASE_PROPIO.md).

2026-10-31 — Añadida evidencia de consulta de existencia y listado de apps mediante API Firebase en solo lectura; sin cambios funcionales o de nube. [Diagnóstico](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

2026-10-31 — Documentada la comparación entre el proyecto visible en la consola del usuario y el configurado en Android; no coinciden. Sin cambios en el código o en Firebase. [Diagnóstico](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

2026-10-31 — Diagnóstico de push con proyecto Firebase habitual: inspección de código, configuración y registros en solo lectura, comprobación de teléfono, 99 pruebas simuladas y documentación. Sin cambios de código funcional, `.env`, registros, teléfono ni nube; no hubo envío. [Informe](../documentacion/seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md).

2026-10-31 — Añadidos Playwright 1.64.1, configuración, `e2e/` y script `test:e2e`; resultados ignorados. Runner Django temporal ampliado con `--web-check` y limpieza. Sin cambios funcionales en React/Flutter, cuentas habituales o `.env`. Escenario E2E aprobado; [informe web](../documentacion/seguridad/PRUEBA_INTEGRACION_WEB_ROLES.md).

2026-10-31 — Añadidos `condominio-movil/integration_test/roles_personalizados_test.dart`, su guía y `test_driver/integration_test.dart`; dependencia de desarrollo `integration_test` del SDK y lockfile. Runner temporal de roles ampliado con puerto Android e identidad verificable, sin modificar URLConf habitual. Prueba integral Android aprobada, artefactos operativos retirados y documentación actualizada. [Informe](../documentacion/seguridad/PRUEBA_INTEGRACION_ANDROID_ROLES.md).

2026-10-31 — Activación local autorizada: respaldo restaurado/verificado, migraciones `0005`/`0006` aplicadas a `condominio`, grupo Inquilino habilitado por flujo auditado sin asignar cuentas, indicador `.env` activado y Django recargado. Enlace USB y APK Android actualizada, nuevo `condominio-movil/conectar-usb.ps1`. Scripts de operación y respaldo en directorio privado ignorado por Git; informe y memoria actualizados. [Detalle](../documentacion/seguridad/ACTIVACION_LOCAL_ROLES_Y_ANDROID_USB.md).

2026-10-31 — Soporte Flutter de rol personalizado: política, rutas, perfil/login, consulta de visitas y restricción de registro FCM; pruebas de servicios/widgets. Runners aislados PostgreSQL y HTTP, prueba de carrera asignación/dispositivo y ajuste del perfil ficticio de las pruebas PostgreSQL anteriores. En la continuación se añadió `--check` con escenario HTTP y cierre automático, y configuración explícita del runner PostgreSQL. Documentación y memoria actualizadas; ninguna activación persistente. [Informe](../documentacion/seguridad/RESULTADO_MOVIL_ROLES_PERSONALIZADOS.md).

2026-10-31 — Primera capacidad de rol personalizado: `administracion/roles_personalizados.py`, `access.py`, `models.py`, `authentication` mediante comprobaciones existentes, serializadores de usuario, vistas/URLs y migración `0006`; `residencial/views_visita.py` y su serializer; `finanzas/devices.py`; componentes y reglas web de roles, navegación y consulta. Función desactivada por defecto; 99 pruebas backend, siete frontend, lint y build. [Informe](../documentacion/seguridad/RESULTADO_CAPACIDAD_VISITAS_PERSONALIZADAS.md).

2026-10-31 — `administracion/models.py`, migración `0005_rolpersonalizado_capacidadrolpersonalizado.py` y `tests_access.py`: almacenamiento preparatorio de roles y capacidades, inactivo y sin integración de acceso, con pruebas aisladas. Contrato y límites en [informe](../documentacion/seguridad/RESULTADO_ESTRUCTURA_ROLES_PERSONALIZADOS.md).

2026-10-31 — `administracion/views.py`, `serializers/serializersRol.py` y `tests_access.py`: bloqueo de edición de roles base y creación explícita sin permisos técnicos, con pruebas. `src/pages/rol/RolPage.jsx`, `RolList.jsx`, `rolesPredeterminados.js` y `RolList.test.js`: nueva vista de roles y estados. Motivo, resultados y limitaciones: [informe](../documentacion/seguridad/RESULTADO_ROLES_PREDETERMINADOS.md).

2026-10-31 — Nuevo `documentacion/seguridad/PLAN_ROLES_PREDETERMINADOS_PERSONALIZADOS.md` y actualización de memoria/índice: análisis y diseño de la solicitud de roles personalizados. El código, grupos y permisos existentes no se modificaron. Validación documental registrada en `memoria/pruebas.md`.

Ampliación del 2026-10-31: `contexto/estado-proyecto.md` incorpora los requisitos del ingeniero; `contexto/README.md` los identifica en el índice. Se actualiza memoria para registrar la aclaración y la verificación del original. Motivo: hacer explícita la fuente principal del objetivo académico sin duplicar ni alterar el Word. No se modifica código.

Fecha de consolidación: 2026-10-31. Este registro no reemplaza Git ni inventa el detalle de cambios anteriores.

## Organización documental de esta etapa

| Archivo o conjunto | Cambio y motivo | Resultado / comprobación |
| --- | --- | --- |
| `AGENTS.md` | Nuevo punto de entrada con reglas y lectura de memoria | Enlaces locales y alcance revisados |
| `contexto/*.md` | Ocho documentos estables sobre estado, arquitectura, reglas, roles, IA, decisiones e integraciones | Contrastados con fuentes locales; hechos separados de planes |
| `memoria/*.md` | Seis documentos para continuidad entre sesiones | Estado, historial, cambios, pendientes y pruebas con evidencia |
| `.agents/skills/*/SKILL.md` | Tres habilidades de auditoría, seguridad y visión | Validación de estructura y referencias |
| `documentacion/README.md` | Índice y catálogo de informes conservados | Evita duplicar o mover documentación interna de componentes |
| Cuatro originales de `documentacion/` | Traslado a requisitos, auditorías y seguridad | Mismos nombres y contenido; comparación SHA-256 |
| `documentacion/auditorias/ORGANIZACION_DOCUMENTAL_2026-10-31.md` | Auditoría previa e informe final de la organización | Detalle de archivos, movimientos, Git y límites |

No se modificaron `.gitignore`, código, configuración de ejecución, base de datos ni infraestructura. `base-datos/` se conserva completa.

## Cambios funcionales anteriores relevantes

Fecha exacta pendiente de reconstrucción desde historial: `administracion/provision.py`, serializer de empleado, pruebas de acceso, `CuentaPerfil.jsx` y `EmpleadoPage.jsx` incorporaron el alta opcional y roles de empleados. Evidencia: [informe de cuentas](../Condominio-Backend/ROLES_CUENTAS_EMPLEADOS.md). Los cambios de permisos, sesiones, bandejas y FCM tienen sus informes enlazados en [historial](historial-trabajo.md) e [índice documental](../documentacion/README.md). No se atribuyen a esta etapa.

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

2026-11-14: Se verifico la prueba de integracion de aviso residente en Android real, sin modificar cuentas reales. Servidor, enlace USB, variante de app y base temporal con registro del dispositivo retirados; app habitual conservada.

2026-11-14: Agregada prueba de integracion para aviso en segundo plano y apertura desde Android, con cuenta ficticia y backend aislado. Se retiraron servidor, enlace USB, app de prueba y base temporal con registro del telefono; app habitual conservada.

2026-11-14: En la base local se crearon registros marcados PRUEBA de propietario, guardia, cargo, vehiculo e incidencia con evidencia ficticia y trazabilidad. Se envio una unica entrega a la cuenta ficticia; no se alteraron cuentas existentes. App habitual conservada.

2026-11-14: Agregado tema visual compartido para panel y paginas publicas, contrastes de graficos y comportamiento responsive del menu; se conservaron los flujos existentes y el estilo propio de camaras y eventos de seguridad.

2026-11-14: Nueva variante visual de peligro para acciones destructivas compartidas y botones especificos; colores de editar y cancelar ajustados con estados de hover, sin alterar operaciones.

2026-11-14: Nueva eliminacion transaccional de roles personalizados sin asignaciones: registra auditoria y retira capacidades propias. La UI bloquea la accion mientras haya cuentas, maneja fallos y protege la cancelacion; la API de roles principales no cambia.

2026-11-14: Pruebas PostgreSQL de dispositivos usan validacion FCM simulada, sesiones validas y rechazo del alta heredada; los escenarios de carrera conservan las comprobaciones de pertenencia. No se cambio la logica de produccion.

2026-11-14: Restablecida credencial de la cuenta ficticia y abierta su sesion en variante movil de prueba. No se guardo la contrasena ni se cambio codigo de produccion en esta etapa.

2026-11-14: Limpieza de prueba local: dos cuentas y perfiles ficticios desactivados, dispositivo ficticio desactivado, sesiones ficticias revocadas; variante movil de prueba desinstalada y servidor temporal detenido. No se borraron historiales.

2026-11-14: Nuevo tema Flutter oscuro/claro azul, acceso desplazable, perfil y bandejas renovadas, y contraste en dashboard y otras pantallas. APK debug compilado; no instalado ni se altero la aplicacion habitual.

2026-11-14: Actualizada aplicacion Android habitual mediante instalacion de reemplazo sin borrar datos, con APK debug de la nueva apariencia y configuracion USB existente. No se cambiaron permisos ni logica de proveedor.

2026-11-14: Actualizacion de interfaz Android instalada y apariencia confirmada por el usuario en su telefono.

2026-11-14: Instalada la aplicacion debug habitual en segundo Android y configurada conexion USB al backend local. No se modificaron cuentas ni se desinstalo otra aplicacion.

2026-11-14: Barra inferior Flutter por rol; hoja de ajustes con tema, perfil y cierre de sesion; filtros de notificaciones nuevas y leidas y consulta periodica condicionada a pantalla visible. Detalle de alertas muestra campos opcionales ya autorizados. Backend sin cambios en esta etapa.

2026-11-14: Recompilado e instalado el APK debug con barra de navegacion y conexion USB en el segundo telefono. No hubo cambios adicionales de backend ni de cuentas.

2026-11-14: Barra movil corregida instalada y sus cuatro opciones observadas en la cuenta de guardia del telefono conectado.

2026-11-14: La barra inferior instalada fue confirmada por el usuario en el segundo Xiaomi.
# 2026-11-14 — Navegación móvil y estados de incidencias

Panel de ajustes derecho con cierre de sesión visible, separación de eventos por estado y consulta del detalle y evidencia mediante las API autorizadas existentes. La apertura de notificaciones conserva su bandeja y no altera el estado del evento; los avisos de residentes mantienen su separación por lectura.

# 2026-11-14 — Revisión web de incidencias

Ante la aclaración del usuario, el historial contiene únicamente incidencias confirmadas (incluidas en atención y resueltas); los falsos positivos se conservan en una vista separada.

Separación de pendientes e historial revisado; el detalle conserva evidencia y acciones de atención. El guardia verifica placa y destinatario, y confirma explícitamente el aviso antes de usar las API existentes para prepararlo y encolarlo. Se informa de fallos parciales y la ausencia de confirmación de recepción.

# 2026-11-14 — Video grabado y seguimiento

Video e Imou comparten colores y seguimiento con tolerancia de pérdida; el polígono solo aparece durante la edición. Con zona definida el registro automático de eventos está activado inicialmente y se puede desactivar; se adjunta fotograma, se identifica la fuente grabada y se advierte sobre guardias ausentes y repeticiones.

