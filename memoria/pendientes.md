# Pendientes

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
