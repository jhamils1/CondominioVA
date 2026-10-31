# Revisión de pendientes: roles y notificaciones

Revisión del 31 de octubre de 2026, contrastada con el prompt del proyecto, el código actual y los informes posteriores. Es una fotografía del código y de las pruebas disponibles; no certifica la configuración efectiva de cada servidor ni la situación de todas las cuentas o bases de datos.

## Funcionalidad existente

- Django calcula el rol efectivo a partir de un único grupo reconocido, cuenta activa y, para residentes o guardias, el perfil vinculado correspondiente. El administrador de aplicación no recibe automáticamente privilegios de superusuario técnico. Familiares y visitantes no se admiten como perfiles de acceso a la API.
- Las consultas sensibles se filtran por rol y relación. Entre otras restricciones, los residentes no acceden a eventos ni alertas internas de seguridad y el guardia no accede a finanzas. Las sesiones tienen revocación en el backend; la configuración aplicada debe comprobarse por entorno.
- Los eventos manuales pueden crear una notificación interna individual para cada guardia activo. El backend permite confirmar, descartar con motivo, atender y resolver; la confirmación notifica a administradores y las transiciones se registran. La web incluye vistas para este flujo.
- Flutter consulta el rol al backend y ofrece una bandeja de seguridad para guardias y administradores. La prueba reciente en emulador comprobó el inicio de sesión de dos guardias ficticios, el detalle del evento y la lectura independiente. El guardia también fue probado previamente en el teléfono con la bandeja interna.
- Hay cola y reintentos FCM de seguridad preparados, filtros de destinatario y protección contra la reasignación de tokens ajenos. Se probaron situaciones de competencia por dispositivos en PostgreSQL aislado. La entrega real y toda su operación aún no están verificadas.
- Los informes existentes registran que las migraciones de seguridad y de sesiones se aplicaron a la base local de desarrollo con aprobación en una etapa anterior. No se consultó nuevamente dicha base durante esta revisión; no se debe extrapolar ese estado a otra base o a producción.

## Pendientes prioritarios

1. **Unidad y contratos de inquilinos.** El código actual no vincula de manera inequívoca un inquilino con una unidad y un período de ocupación. Por seguridad, varias consultas relacionadas quedan vacías o restringidas. Ya se eligió una relación de ocupación con fechas; falta diseñarla, revisar datos y casos límite, y solicitar aprobación específica antes de aplicar una migración.
2. **Datos históricos de propietarios.** La fecha del contrato actual es una restricción provisional para expensas; no determina de forma concluyente el propietario histórico. Se decidió mantener restringidas las expensas anteriores hasta definir la regla. No hay que habilitarlas mediante inferencias.
3. **Avisos reales.** La bandeja interna y los envíos FCM son cosas distintas. El envío de alertas de seguridad sigue sin validarse de extremo a extremo en Firebase y con dispositivos autorizados; el procesador requiere ejecución programada y supervisión. La opción de cambio de cuenta para un token de titularidad incierta sigue bloqueada y no está integrada. Los indicadores de seguridad tienen valor predeterminado desactivado, pero no se verificaron los valores de los procesos que estén ejecutándose.
4. **Notificaciones administrativas y financieras.** Existen señales anteriores para expensas y objetos perdidos, pero no un sistema general completo con bandeja, reglas y seguimiento para residentes. La señal de objeto perdido consulta todos los dispositivos; falta definir destinatarios apropiados. La señal de expensas omite casos ambiguos y no reencola automáticamente; su envío puede ocurrir antes de que finalice la transacción.
5. **Móvil.** La bandeja muestra y marca alertas como leídas, pero no permite confirmar, descartar, atender o resolver eventos. La web sí ofrece esas operaciones. El editor móvil de perfil actualmente muestra un mensaje de éxito sin guardar; el cambio de contraseña utiliza un flujo antiguo que debe revisarse y no debe considerarse validado. La renovación automática de sesión móvil tampoco está implementada según el servicio revisado.
6. **Cámaras y evidencias.** No hay un subsistema completo de cámaras, asignación de acceso, zonas, grabaciones ni evidencias protegidas en el flujo de eventos. Los campos de cámara y ubicación de un evento son texto, no una gestión de dispositivos o permisos de cámara. Tampoco existe configuración general de reglas de notificación. RF-DETR y el procesamiento de video quedaron expresamente fuera de esta etapa.
7. **Auditoría y operación.** Existen registros administrativos e historial de eventos, pero no son inmutables a nivel de base de datos ni cubren necesariamente cambios directos por todas las vías. Deben definirse consulta, retención y protección frente a administradores técnicos. El código de ajustes mantiene `ALLOWED_HOSTS` con `*` y `CORS_ALLOW_ALL_ORIGINS=True`; requiere configuración por entorno antes de una puesta en producción. También deben revisarse las rutas antiguas que incluyen tokens FCM en la URL.
8. **Cobertura integral.** Los tests y recorridos existentes no demuestran todos los permisos sobre todos los registros, clientes y despliegues. Faltan, entre otras, pruebas completas de concurrencia para sesiones y cola FCM, pruebas de recepción push autorizadas y comprobaciones sobre las bases y configuraciones reales elegidas para despliegue. FCM no garantiza entrega o lectura por el usuario.

## Pruebas de esta revisión

- Backend: 82 pruebas de `administracion.run_migration_smoke`, con migraciones aplicadas únicamente a SQLite en memoria y servicios externos simulados: pasaron.
- Web: siete pruebas de reglas de acceso y cierre de sesión: pasaron.
- Flutter: veinte pruebas de perfil por rol, rutas protegidas y bandeja con servicios simulados: pasaron.
- En la etapa anterior se verificó el recorrido de la bandeja en un emulador con backend y datos temporales; no se probaron notificaciones push.

Las pruebas de esta revisión no ejecutaron acciones sobre una base persistente, Firebase ni un dispositivo. No se modificó código de la aplicación; este informe es el único archivo nuevo de la revisión.

## Orden sugerido

1. Diseñar la relación de ocupación inquilino–unidad y el acceso a sus visitas y datos contractuales. Mantener las expensas históricas restringidas. Antes de aplicar cualquier migración, presentar esquema, compatibilidad, riesgos y respaldo para aprobación.
2. Corregir el editor de perfil móvil que comunica un éxito inexistente y revisar el flujo de contraseña antes de exponerlo como funcional.
3. Definir destinatarios y persistencia para notificaciones administrativas y financieras y corregir el alcance de objetos perdidos.
4. Elegir si el guardia necesita revisar y atender eventos desde el móvil; si es así, diseñar la interfaz sobre la API existente, sin duplicar reglas.
5. Preparar entrega FCM y pruebas en un proyecto y dispositivo separados cuando el usuario lo solicite. Tratar después cámaras, evidencias y futura IA según su alcance aprobado.

Cada paso constituye una etapa separada con sus propias pruebas, documentación y aprobación. Ninguna de estas propuestas autoriza migrar una base real, activar Firebase o modificar el teléfono actual.
