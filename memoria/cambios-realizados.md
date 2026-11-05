# Cambios realizados

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
