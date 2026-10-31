# Fase 8: pruebas integrales y revisión de seguridad

> Informe histórico de esa etapa: el perfil y los menús móviles se adaptaron después, y se corrigió la selección ambigua de destinatarios de expensas. Consulta `SEGURIDAD_ROLES_MOVIL.md` y `SEGURIDAD_AVISOS_EXPENSAS.md` para el estado posterior y las pruebas nuevas.

## Resultado y alcance

Se ejecutaron 55 pruebas del backend sobre una base SQLite desechable en memoria, usando las migraciones del proyecto y proveedores externos simulados. Cuatro pruebas de la política de navegación frontend pasaron, igual que `manage.py check`, ESLint de los dos archivos frontend ajustados en esta etapa y `npm run build`. `git diff --check` no encontró errores de espacios.

La cifra de pruebas aprobadas **no significa que todos los requisitos estén cumplidos**: algunas pruebas confirman limitaciones existentes para evitar ocultarlas. No se hizo una prueba interactiva con usuarios reales, prueba en PostgreSQL, prueba de carga o concurrencia, envío real a FCM, ni prueba funcional de Flutter. No se han aplicado migraciones a la base de datos del proyecto ni activado notificaciones de seguridad.

## Comprobaciones realizadas

- Las pruebas verificaron acceso denegado sin autenticación, cuenta inactiva, token de acceso expirado, refresh en lista negra, comprobación del rol vigente y rechazo de intentos de obtener privilegios mediante datos manipulados del cliente.
- Se comprobó una matriz de listas para administrador, guardia, propietario e inquilino, con 403 en accesos prohibidos; un propietario no puede leer vehículos, unidades o expensas ajenas por ID. El administrador de aplicación no recibe automáticamente privilegios de superusuario técnico.
- Los eventos se distribuyen a guardias activos, los falsos positivos requieren motivo, las transiciones se registran y la confirmación notifica al administrador. Los residentes no acceden al historial de seguridad. Las entregas FCM se probaron con mocks, incluidos token inválido, errores transitorios, límite de reintentos y cambio de rol. No se envió información a Firebase.
- La regresión cubrió unidades, contratos, expensas, vehículos, visitas, pago simulado y reconocimiento de placa y rostro con proveedores simulados. Las notificaciones existentes de expensas y objetos perdidos se probaron con el envío FCM simulado; se verificó que se siga invocando el proveedor, no la entrega a un dispositivo real.
- Las cuatro pruebas frontend ejercitan la función de permisos por ruta; no prueban los componentes renderizados ni la seguridad del backend por sí solas. El backend es la barrera de autorización.

## Correcciones de esta etapa

- Se eliminaron del backend registros de reconocimiento y enrolamiento que incluían respuestas de Luxand, candidatos, nombres e identificadores de rostros. La respuesta de API se mantuvo para no alterar consumidores; su campo `raw` sigue requiriendo revisión de minimización.
- Se eliminó del frontend la impresión de fragmentos de imagen en base64 y de errores Axios completos del módulo de reconocimiento. Se evitaron algunos datos sensibles en la pantalla de diagnóstico de pago, incluidos el secreto de cliente y los parámetros sensibles por nombre.
- Se reemplazaron impresiones con emojis en las señales existentes por mensajes de log genéricos. Una prueba reprodujo que la consola Windows con codificación cp1252 podía lanzar `UnicodeEncodeError`, afectar el envío o fallar al registrar un objeto perdido. Las señales siguen usando los destinatarios previos.

## Hallazgos pendientes antes de usar o desplegar

1. **No hay todavía evidencia protegida** para este flujo. Tampoco está integrado RF-DETR ni existe un panel de cámaras completo.
2. **Flutter no cumple aún el requisito de menús por rol:** `AuthService.getUserProfile()` devuelve datos simulados y `PerfilPage` muestra opciones sin consultar el rol. El backend sigue rechazando accesos no autorizados, pero la experiencia móvil no está validada. El análisis Flutter no terminó en este entorno y no se probaron dispositivos reales.
3. **Migraciones y eliminación en cascada:** las migraciones 0002 y 0003 no están aplicadas en la base del proyecto. Una prueba aislada confirmó que, cuando falta la tabla de eventos, eliminar una persona con incidencia relacionada puede fallar al evaluar la cascada. La eliminación directa de incidencias devuelve 503 si detecta la tabla ausente. Antes de desplegar, revisar compatibilidad y aplicar migraciones solo con aprobación y respaldo en una base identificada.
4. **Notificación antigua de expensa ambigua:** si una unidad tiene varios contratos activos, la señal selecciona el primero y puede enviar al propietario equivocado. Una prueba reproduce ese comportamiento sin enviar un mensaje real. No se cambió la política en esta etapa para no alterar la funcionalidad existente sin decidir cómo tratar el caso. La señal de objeto perdido también difunde a todos los dispositivos registrados y necesita revisión de destinatarios.
5. **Cierre de sesión:** el backend invalida el refresh, pero un access token ya emitido sigue funcionando hasta vencer; el cierre web limpia almacenamiento local sin llamar al logout del servidor. Los tokens web permanecen en `localStorage`, expuestos ante XSS. Corregirlo requiere acordar el contrato de sesión y validar web y móvil.
6. **Configuración de despliegue:** hay `CORS_ALLOW_ALL_ORIGINS=True` y `ALLOWED_HOSTS` incluye `*`. Cambiarlos sin conocer los orígenes y hosts reales podría interrumpir clientes; se requiere configurar valores por entorno antes de producción.
7. **Logs y respuesta de reconocimiento:** se redujeron algunos registros sensibles, pero quedan otros `console.log`/`console.error` en distintos módulos y el reconocimiento devuelve `raw` del proveedor a operadores autorizados. Revisar minimización y consumidores antes de modificar contratos.
8. **Notificaciones móviles de seguridad:** no se ha probado su recepción real, FCM no garantiza entrega exactamente una vez y no hay programador configurado para procesar la cola. La pantalla móvil no navega al historial al pulsar la alerta.
9. **Contrato antiguo ALPR:** el frontend conserva funciones para enviar una URL y consultar `/lecturas-placas/`, pero la vista ALPR inspeccionada acepta el archivo multipart y no se encontró una ruta para ese listado. No se han corregido estos contratos en esta etapa; revisar consumidores antes de cambiarlos.
10. **Calidad global:** `npm run lint` sigue fallando con 74 errores y 4 advertencias en otros archivos; el build genera un paquete principal mayor a 500 kB. El análisis Flutter y las pruebas de dispositivo siguen pendientes.

## Comandos y archivos

Backend: `.\env\Scripts\python.exe -B -m administracion.run_migration_smoke` y `manage.py check`. Frontend: `node --test src/auth/access.test.js`, `npx eslint src/api/recognitionApi.jsx src/pages/pago/PagoDebugPage.jsx`, `npm run lint` y `npm run build`. El primer comando fuerza SQLite en memoria antes de ejecutar cualquier migración; la base desaparece al terminar.

Creados: este informe. Modificados: `administracion/tests_access.py`, `finanzas/signals.py`, `seguridad_IA/views.py`, `core/luxand.py`, `src/api/recognitionApi.jsx` y `src/pages/pago/PagoDebugPage.jsx`. No se eliminaron archivos, no se agregaron dependencias y no se enviaron datos reales a servicios externos.
