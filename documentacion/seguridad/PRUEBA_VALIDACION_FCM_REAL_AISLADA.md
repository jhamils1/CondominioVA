# Validación de procedencia con Firebase real y app aislada

Fecha: 2026-10-31 (America/La_Paz). El usuario aprobó comprobar la validación con Firebase y la app de prueba aislada. Resultado: **registro temporal aceptado por Firebase mediante `dry_run`**, sin enviar una notificación y sin migrar la instalación habitual.

Actualización posterior: se reprodujeron [dos carreras de cierre de sesión](REVISION_TRANSICION_FCM_TIEMPOS_RESPALDO.md); esta validación positiva no demuestra que la propuesta sea segura para incorporarse todavía.

## Preparación y límites

Se ejecutó la propuesta de procedencia desde la copia aislada del backend, con SQLite temporal y el proyecto Firebase `condominio-seguridad`. Los indicadores de notificaciones, cola y envío quedaron desactivados en ese proceso. El servidor temporal expuso únicamente autenticación, perfil, sincronización y diagnóstico; la ruta de envío de prueba respondió 404. Una barrera adicional rechazó cualquier llamada `messaging.send` que no fuera `dry_run=True`, que contuviera una notificación o que apuntara a otro proyecto; también bloqueó las rutas de envío múltiple usadas por el SDK.

La cuenta era un guardia ficticio y la única instalación destinataria era `com.condominiun.smart.pushprueba`. La base temporal no contenía dispositivos ni validaciones antes del ensayo. La prueba no consultó ni alteró los dos dispositivos habituales de propietarios, su historial o la base habitual. El servidor 8000 y su entorno no fueron reiniciados ni comprobados. El teléfono recibió una app temporal; el primer intento de instalación fue cancelado y el usuario autorizó repetirlo.

## Resultado real

1. El servidor verificó acceso de lectura al proyecto Firebase. El estado de diagnóstico anónimo fue rechazado.
2. La app temporal inició sesión con el guardia ficticio y solicitó el registro usando su propio identificador FCM. La validación real se aceptó en **2058 ms**; el servidor informó un único dispositivo propio, activo y elegible, con una prueba de procedencia. La pantalla de perfil del guardia ficticio se verificó visualmente. Esa duración es una sola muestra y no garantiza que la operación siempre termine dentro del tiempo de espera del cliente.
3. Se envió al endpoint aislado un identificador inventado. Firebase lo rechazó y la base conservó exactamente el dispositivo anterior, sin crear otro. La primera versión de la propuesta devolvió HTTP 503 porque trataba `InvalidArgumentError` como fallo temporal, aunque Firebase indicó que la entrada era inválida.
4. Se corrigió **solo en la copia aislada** la clasificación de `InvalidArgumentError` a respuesta HTTP 400. Una llamada posterior de validación real, en proceso separado y con identificador inventado, confirmó el rechazo como 400; el endpoint HTTP corregido se comprobó en pruebas simuladas, no en una segunda ejecución HTTP real. La propuesta de parche se actualizó y volvió a pasar `git apply --check`.

No se envió una notificación push: `dry_run` consulta al proveedor pero no entrega mensajes. No se probó con tokens de un proyecto anterior, registros ajenos, cuenta real, sesión vencida, iOS ni el teléfono habitual como instalación habitual. La validación de proyecto no demuestra propiedad física del teléfono ni identidad de su usuario.

## Pruebas y limpieza

Pasaron tres pruebas del filtro que impide envíos reales, 19 pruebas del control y concurrencia en PostgreSQL temporal con Firebase simulado, y 100 regresiones adaptadas en SQLite. La migración se aplicó, revirtió y reaplicó solo en PostgreSQL temporal. Los valores y errores del proveedor no se imprimieron ni guardaron; únicamente se registraron recuentos, resultado y tiempos agregados.

Se desinstaló la app temporal, se retiró el enlace USB, se detuvo el servidor y se eliminó su base SQLite ficticia y la captura temporal. Se comprobó que el paquete habitual sigue instalado. El registro de la app de prueba permanece en Firebase. La copia y el ejecutor de ensayo están en `Condominio-Backend/backups_locales/proveniencia_fcm_aislada_20261031/`, carpeta ignorada por Git; el [parche revisable](PROPUESTA_PROCEDENCIA_FCM.patch) está en documentación y tampoco está comprometido.

## Pendiente

Antes de integrar y activar: revisar límites de espera y frecuencia, compatibilidad de clientes que usan las rutas antiguas, recuperación de errores y colas, titularidad de dispositivos históricos, respaldo restaurable y configuración real de los procesos. Preparar la transición en una etapa aprobada; esta prueba no activa la protección ni los envíos del backend habitual.
