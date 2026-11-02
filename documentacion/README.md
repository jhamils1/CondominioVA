# Documentación del condominio

Índice central actualizado el 2026-10-31. Los tres componentes siguen en la raíz; no se reorganiza su código ni se crea otra carpeta de proyectos.

## Lectura recomendada

1. [AGENTS.md](../AGENTS.md): instrucciones del repositorio.
2. [Estado actual y autorización](../memoria/estado-actual.md) y [pendientes](../memoria/pendientes.md): punto de reanudación.
3. [Contexto](../contexto/README.md): arquitectura y reglas vigentes, contrastables con el código.
4. Las fuentes y los informes pertinentes de este índice.

## Fuentes conservadas

| Categoría | Documento / alcance |
| --- | --- |
| Requisitos | [Enunciado del proyecto](requisitos/Enunciado%20Proyecto%20condominio.docx): prioridad de seguridad y demostración |
| Auditorías | [Auditoría técnica original](auditorias/Auditoria_tecnica_seguridad_IA_condominio.docx): fotografía del 2026-10-29, propuesta YOLO histórica |
| Auditorías | [Organización documental](auditorias/ORGANIZACION_DOCUMENTAL_2026-10-31.md): inventario, movimientos y verificación de esta etapa |
| Seguridad | [Guía de roles y notificaciones](seguridad/GUIA_ROLES_SEGURIDAD_NOTIFICACIONES.md): guía original, con límites de su fecha |
| Seguridad | [Propuesta de alta de cuentas](seguridad/PROPUESTA_ALTA_SEGURA_CUENTAS.md): propuesta histórica posteriormente implementada y ampliada |
| Seguridad | [Plan de roles predeterminados y personalizados](seguridad/PLAN_ROLES_PREDETERMINADOS_PERSONALIZADOS.md): análisis de la solicitud y etapas pendientes |
| Seguridad | [Resultado de roles predeterminados](seguridad/RESULTADO_ROLES_PREDETERMINADOS.md): implementación, pruebas y límites de la primera etapa funcional |
| Seguridad | [Estructura de roles personalizados](seguridad/RESULTADO_ESTRUCTURA_ROLES_PERSONALIZADOS.md): almacenamiento preparatorio, contrato propuesto y pruebas aisladas |
| Seguridad | [Primera capacidad personalizada](seguridad/RESULTADO_CAPACIDAD_VISITAS_PERSONALIZADAS.md): visitas, asignación, interruptor y límites de pruebas |
| Seguridad | [Móvil y verificación aislada de roles personalizados](seguridad/RESULTADO_MOVIL_ROLES_PERSONALIZADOS.md): Flutter, PostgreSQL, HTTP y recorrido visual pendiente |
| Seguridad | [Activación local y Android USB](seguridad/ACTIVACION_LOCAL_ROLES_Y_ANDROID_USB.md): respaldo restaurado, migraciones locales, habilitación autorizada y APK actualizada |
| Seguridad | [Integración Android de roles](seguridad/PRUEBA_INTEGRACION_ANDROID_ROLES.md): escenario integral aprobado en app aislada del teléfono, limpieza y Firebase pendiente |
| Seguridad | [Integración web de roles](seguridad/PRUEBA_INTEGRACION_WEB_ROLES.md): recorrido React/Django aprobado en Edge aislado, permisos, revocación, cierre y límites |
| Seguridad | [Diagnóstico push con Firebase actual](seguridad/REVISION_PUSH_FIREBASE_ACTUAL.md): dispositivo de guardia sin registro activo, comprobaciones y continuación sin proyecto adicional |
| Seguridad | [Preparación de Firebase propio](seguridad/PREPARACION_FIREBASE_PROPIO.md): configuración Android candidata y requisitos pendientes para backend y envío |
| Seguridad | [Configuración local de Firebase propio](seguridad/CONFIGURACION_FIREBASE_PROPIO_LOCAL.md): pausa aprobada, APK no instalada, pruebas y riesgos de transición |
| Seguridad | [Prueba push Firebase propio](seguridad/PRUEBA_PUSH_FIREBASE_PROPIO.md): variante y servidor aislados, instalación Android pendiente y limpieza |
| Seguridad | [Prueba push en segundo plano](seguridad/PRUEBA_PUSH_SEGUNDO_PLANO.md): recepción confirmada en app aislada, reintento dirigido y límites |
| Seguridad | [Apertura de notificación push](seguridad/PRUEBA_APERTURA_PUSH.md): apertura confirmada sin controlador Flutter, ensayos previos, limpieza y límites |
| Seguridad | [Push con proceso cerrado](seguridad/PRUEBA_PUSH_PROCESO_CERRADO.md): recepción y apertura desde proceso terminado verificadas en variante temporal, límites y limpieza |
| Seguridad | [Plan de transición Firebase y dispositivos](seguridad/PLAN_TRANSICION_FIREBASE_DISPOSITIVOS.md): inventario de solo lectura, riesgos y etapas para migración gradual |
| Seguridad | [Propuesta aislada de procedencia FCM](seguridad/RESULTADO_PROCEDENCIA_FCM_AISLADA.md): parche, migración temporal, pruebas y límites antes de incorporación |
| Seguridad | [Validación FCM real aislada](seguridad/PRUEBA_VALIDACION_FCM_REAL_AISLADA.md): registro de prueba, rechazo de dato inválido y limpieza, sin entregar avisos |
| Seguridad | [Revisión de tiempos y respaldo FCM](seguridad/REVISION_TRANSICION_FCM_TIEMPOS_RESPALDO.md): carreras de cierre, compatibilidad y restauración temporal del respaldo |
| Seguridad | [Corrección aislada de carrera FCM](seguridad/CORRECCION_CARRERA_FCM_AISLADA.md): solución experimental, pruebas de cierre y límites pendientes |
| Seguridad | [Pruebas adicionales FCM](seguridad/PRUEBAS_ADICIONALES_CIERRE_FCM.md): expiración, concurrencia y dispositivos anteriores |
| Seguridad | [Bloqueos y clientes FCM](seguridad/REVISION_BLOQUEOS_CLIENTES_FCM.md): esperas, DELETE heredado y compatibilidad pendiente |
| Seguridad | [Inicio móvil con red lenta](seguridad/INICIO_MOVIL_RED_LENTA_FCM.md): propuesta aislada y pruebas simuladas |
| Seguridad | [Prueba integrada de inicio FCM](seguridad/PRUEBA_INTEGRADA_INICIO_FCM.md): compilación y bloqueo de instalación Android |
| Seguridad | [Prueba FCM real con espera](seguridad/PRUEBA_INICIO_FCM_REAL_ESPERA.md): recepción en primer plano durante un permiso simulado pendiente |
| Seguridad | [Nuevo inicio FCM en segundo plano](seguridad/PRUEBA_FCM_NUEVO_INICIO_SEGUNDO_PLANO.md): recepción visible en variante aislada |
| Seguridad | [Apertura con el nuevo inicio FCM](seguridad/PRUEBA_APERTURA_NUEVO_INICIO_FCM.md): segundo plano y proceso cerrado en app aislada |
| Seguridad | [Incorporación del inicio móvil FCM](seguridad/INCORPORACION_INICIO_MOVIL_FCM.md): cambio al código y requisitos pendientes de activación |
| Seguridad | [Incorporación local del backend FCM](seguridad/INCORPORACION_BACKEND_FCM_LOCAL.md): respaldo, migraciones, bandeja y estado de envíos |
| Seguridad | [Preparación de app y procesador FCM](seguridad/PREPARACION_APP_Y_PROCESADOR_FCM.md): APK habitual, USB y procesador continuo |
| Seguridad | [Activación local push de guardia](seguridad/ACTIVACION_LOCAL_PUSH_GUARDIA.md): registro, procesador y prueba directa |
| Seguridad | [Prueba automática de cola local](seguridad/PRUEBA_COLA_AUTOMATICA_LOCAL.md): evento manual ficticio, envío y confirmación del guardia |
| Base de datos | [Guía HTML](base-datos/guia_base_datos.html), [esquema](base-datos/esquema_verificado.json), [comparación Word](base-datos/comparacion_diagrama_base_datos.docx) y demás XMI/JSON/scripts conservados íntegramente en `base-datos/` |

Las rutas en texto literal de los documentos históricos se interpretan desde la raíz del repositorio o el componente indicado; no se reescribió su contenido. Usar los enlaces de este índice para navegar.

## Vigencia y discrepancias

- La auditoría de octubre 29 precede a roles, sesiones, bandejas y cuentas posteriores. No aplicar sus propuestas como si fueran código actual. La orientación actual para evaluación es RF-DETR Nano; aún no integrado.
- La guía original menciona funciones móviles o revocación como pendientes; informes posteriores registran avances. Ver [revisión de pendientes](../Condominio-Backend/REVISION_PENDIENTES_ROLES_NOTIFICACIONES.md) y [contexto vigente](../contexto/estado-proyecto.md).
- La regla histórica de cuenta solo para guardia fue ampliada: empleado de cualquier cargo puede tener uno de cuatro roles si cumple perfil; la cuenta sigue siendo opcional. La fuente actual es [cuentas de empleados](../Condominio-Backend/ROLES_CUENTAS_EMPLEADOS.md).
- Notas antiguas de migración solo temporal fueron complementadas por informes de aplicación local autorizada. No implican estado actual de otra base ni autorización para migrar.
- No se encontraron documentos de nombre idéntico en los destinos. Los informes de temas parecidos corresponden a etapas diferentes y no se eliminaron como duplicados.

## Cómo mantener la documentación

Colocar nuevos requisitos en `requisitos/`, auditorías en `auditorias/` y políticas/guías de seguridad en `seguridad/`. Mantener la organización interna existente de `base-datos/`. Los informes ya presentes en los componentes permanecen allí y se enlazan abajo; no duplicarlos para centralizar su consulta.

Cada nuevo informe debe indicar fecha, estado (propuesta, implementado, verificado), evidencia y límites. Para una decisión vigente actualizar `contexto/`; para un avance actualizar `memoria/`. Preservar originales históricos y señalar qué fuente los complementa o sustituye. No guardar secretos, datos personales, fotografías faciales o grabaciones en estos documentos.

## Catálogo de documentación de componentes

Las fuentes siguientes se conservan en su ubicación original. Son evidencia de su etapa, no una certificación de funcionamiento actual. Los README de módulos siguen cerca del código que describen.

### Condominio-Backend

- [DISENO_CAMBIO_CUENTA_MOVIL.md](../Condominio-Backend/DISENO_CAMBIO_CUENTA_MOVIL.md): Diseño: cambio seguro de cuenta en un teléfono
- [DISENO_RECUPERACION_INVALIDACION_INCIERTA.md](../Condominio-Backend/DISENO_RECUPERACION_INVALIDACION_INCIERTA.md): Recuperación ante una invalidación de Firebase incierta
- [INVESTIGACION_RECUPERACION_FCM.md](../Condominio-Backend/INVESTIGACION_RECUPERACION_FCM.md): Alternativas para recuperar un cambio de cuenta con resultado FCM incierto
- [PLAN_COMPATIBILIDAD_FIREBASE_AISLADO.md](../Condominio-Backend/PLAN_COMPATIBILIDAD_FIREBASE_AISLADO.md): Compatibilidad Firebase y plan de pruebas aisladas
- [PREPARACION_ACTIVACION_NOTIFICACIONES.md](../Condominio-Backend/PREPARACION_ACTIVACION_NOTIFICACIONES.md): Preparación de la activación de notificaciones internas
- [PREPARACION_MIGRACIONES_SEGURIDAD.md](../Condominio-Backend/PREPARACION_MIGRACIONES_SEGURIDAD.md): Preparación de las migraciones de seguridad
- [PREPARACION_MIGRACION_SESIONES.md](../Condominio-Backend/PREPARACION_MIGRACION_SESIONES.md): Preparación de migración de sesiones
- [PREPARACION_PRUEBA_MOVIL_REAL.md](../Condominio-Backend/PREPARACION_PRUEBA_MOVIL_REAL.md): Preparación de una prueba móvil real
- [PRUEBA_ALERTAS_SIMULADAS.md](../Condominio-Backend/PRUEBA_ALERTAS_SIMULADAS.md): Prueba simulada de alertas de seguridad
- [README.md](../Condominio-Backend/README.md): CONDOMINIO
- [RESULTADOS_BACKEND_BANDEJA_AISLADO.md](../Condominio-Backend/RESULTADOS_BACKEND_BANDEJA_AISLADO.md): Backend y base temporales para probar la bandeja
- [RESULTADOS_CAMBIO_CUENTA_SIMULADO.md](../Condominio-Backend/RESULTADOS_CAMBIO_CUENTA_SIMULADO.md): Cambio de cuenta en móvil: primera etapa simulada
- [RESULTADOS_EMULADOR_BANDEJA_AISLADA.md](../Condominio-Backend/RESULTADOS_EMULADOR_BANDEJA_AISLADA.md): Prueba de la bandeja móvil en emulador aislado
- [RESULTADOS_PERSISTENCIA_AUDITORIA_MOVIL.md](../Condominio-Backend/RESULTADOS_PERSISTENCIA_AUDITORIA_MOVIL.md): Cambio de cuenta: persistencia y auditoría preparadas
- [RESULTADOS_POSTGRES_CONCURRENCIA_DISPOSITIVOS.md](../Condominio-Backend/RESULTADOS_POSTGRES_CONCURRENCIA_DISPOSITIVOS.md): Pruebas aisladas de concurrencia de dispositivos en PostgreSQL
- [RESULTADOS_VARIANTE_ANDROID_AISLADA.md](../Condominio-Backend/RESULTADOS_VARIANTE_ANDROID_AISLADA.md): Variante Android aislada sin Firebase: primera preparación
- [REVISION_ALERTAS_MOVIL.md](../Condominio-Backend/REVISION_ALERTAS_MOVIL.md): Revisión de alertas de seguridad en el móvil
- [REVISION_PENDIENTES_ROLES_NOTIFICACIONES.md](../Condominio-Backend/REVISION_PENDIENTES_ROLES_NOTIFICACIONES.md): Revisión de pendientes: roles y notificaciones
- [REVISION_RECUPERACION_CONCURRENCIA_MOVIL.md](../Condominio-Backend/REVISION_RECUPERACION_CONCURRENCIA_MOVIL.md): Revisión de recuperación, concurrencia y auditoría de dispositivos
- [ROLES_CUENTAS_EMPLEADOS.md](../Condominio-Backend/ROLES_CUENTAS_EMPLEADOS.md): Cuentas de empleados con los cuatro roles existentes
- [SEGURIDAD_ALTA_CUENTAS.md](../Condominio-Backend/SEGURIDAD_ALTA_CUENTAS.md): Alta y vinculación segura de cuentas
- [SEGURIDAD_APERTURA_PUSH_MOVIL.md](../Condominio-Backend/SEGURIDAD_APERTURA_PUSH_MOVIL.md): Apertura de alertas desde notificaciones móviles
- [SEGURIDAD_AVISOS_EXPENSAS.md](../Condominio-Backend/SEGURIDAD_AVISOS_EXPENSAS.md): Destinatarios de avisos de expensas
- [SEGURIDAD_BANDEJA_MOVIL.md](../Condominio-Backend/SEGURIDAD_BANDEJA_MOVIL.md): Bandeja móvil de alertas de seguridad
- [SEGURIDAD_CIERRE_SESION.md](../Condominio-Backend/SEGURIDAD_CIERRE_SESION.md): Cierre de sesión: revisión y resultados
- [SEGURIDAD_DATOS_FASE3.md](../Condominio-Backend/SEGURIDAD_DATOS_FASE3.md): Fase 3: aislamiento de datos por usuario
- [SEGURIDAD_DISPOSITIVOS_MOVIL.md](../Condominio-Backend/SEGURIDAD_DISPOSITIVOS_MOVIL.md): Registro y baja de dispositivos móviles
- [SEGURIDAD_FCM_FASE6.md](../Condominio-Backend/SEGURIDAD_FCM_FASE6.md): Fase 6: preparación de Firebase Cloud Messaging
- [SEGURIDAD_INCIDENCIAS_FASE7.md](../Condominio-Backend/SEGURIDAD_INCIDENCIAS_FASE7.md): Fase 7: revisión y atención de incidencias
- [SEGURIDAD_NOTIFICACIONES_FASE5.md](../Condominio-Backend/SEGURIDAD_NOTIFICACIONES_FASE5.md): Fase 5: notificaciones persistentes de seguridad
- [SEGURIDAD_PRUEBAS_FASE8.md](../Condominio-Backend/SEGURIDAD_PRUEBAS_FASE8.md): Fase 8: pruebas integrales y revisión de seguridad
- [SEGURIDAD_REVOCACION_SESIONES.md](../Condominio-Backend/SEGURIDAD_REVOCACION_SESIONES.md): Revocación inmediata de sesiones
- [SEGURIDAD_ROLES_FASE2.md](../Condominio-Backend/SEGURIDAD_ROLES_FASE2.md): Roles y permisos Fase 2
- [SEGURIDAD_ROLES_MOVIL.md](../Condominio-Backend/SEGURIDAD_ROLES_MOVIL.md): Perfil y navegación móvil por rol
- [DASHBOARD_README.md](../Condominio-Backend/finanzas/DASHBOARD_README.md): Dashboard Financiero - API Documentation

### Condominio-Frontend

- [README.md](../Condominio-Frontend/README.md): condominio
- [RECONOCIMIENTO_FACIAL_GUIDE.md](../Condominio-Frontend/RECONOCIMIENTO_FACIAL_GUIDE.md): Guía de Reconocimiento Facial - Frontend
- [REGISTRO_EMPLEADO_CUENTA_GUARDIA.md](../Condominio-Frontend/REGISTRO_EMPLEADO_CUENTA_GUARDIA.md): Registro de empleado y cuenta de guardia en una misma ventana
- [SEGURIDAD_FRONTEND_FASE4.md](../Condominio-Frontend/SEGURIDAD_FRONTEND_FASE4.md): Fase 4: frontend y administración de roles
- [README.md](../Condominio-Frontend/src/pages/contratos/README.md): Sistema de Gestión de Contratos
- [README.md](../Condominio-Frontend/src/pages/expensas/README.md): Sistema de Gestión de Expensas
- [README.md](../Condominio-Frontend/src/pages/incidentes/README.md): Sistema de Gestión de Incidentes
- [README.md](../Condominio-Frontend/src/pages/multas/README.md): Sistema de Gestión de Multas

### condominio-movil

- [README.md](../condominio-movil/README.md): movil
- [RESERVAS_README.md](../condominio-movil/RESERVAS_README.md): Sistema de Reservas de Áreas Comunes - Implementación Móvil
- [README.md](../condominio-movil/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md): Launch Screen Assets
