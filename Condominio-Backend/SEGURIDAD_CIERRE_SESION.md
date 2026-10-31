# Cierre de sesión: revisión y resultados

> Nota: este documento describe la revisión anterior. La revocación inmediata implementada después y sus condiciones de activación se detallan en `SEGURIDAD_REVOCACION_SESIONES.md`.

El backend acepta el cierre solo si el token de renovación pertenece a la cuenta autenticada, invalida ese token mediante la lista negra y registra la acción. Un token inválido o de otra cuenta recibe una respuesta 400 genérica. La interfaz web solicita el cierre al backend y limpia las credenciales locales incluso si falla la conexión. La aplicación móvil hace lo mismo e informa además si no pudo desregistrar el dispositivo de notificaciones. Los avisos aparecen en la pantalla de ingreso. El desregistro de FCM y la solicitud de cierre móvil tienen un límite de espera de cinco segundos cada uno.

## Limitaciones importantes

- La confirmación del servidor significa que el **token de renovación** quedó invalidado. Los tokens de acceso ya emitidos siguen siendo válidos hasta que vencen; actualmente su duración configurada es de 60 minutos. Un token copiado antes del cierre podría utilizarse durante ese intervalo. Las comprobaciones de rol y estado del usuario siguen aplicándose a cada solicitud.
- Si el cierre remoto falla, el dispositivo borra sus credenciales locales, pero el token de renovación podría seguir siendo válido hasta su vencimiento o revocación. Si el desregistro FCM falla, el dispositivo podría seguir registrado para recibir notificaciones. El aviso no implica que se haya reintentado en segundo plano.
- No se ha probado con Firebase real, teléfonos físicos ni datos de producción. No se cambió el esquema ni se aplicaron migraciones a la base del proyecto.

## Propuesta para una etapa posterior

Para revocar el acceso inmediatamente se propone registrar una sesión por dispositivo con un identificador único, asociarlo tanto al token de renovación como al de acceso, comprobar su estado en autenticación y renovación y marcarla revocada al cerrar sesión. El cambio requeriría almacenamiento persistente, migración, controles de concurrencia y pruebas con múltiples dispositivos; además añadiría una consulta al almacenamiento por solicitud. La sesión de otro dispositivo de la misma cuenta no debería cerrarse automáticamente.

Antes de crear o aplicar una migración hace falta aprobación explícita. También debe decidirse qué hacer con tokens emitidos antes de introducir el identificador de sesión: permitirlos temporalmente hasta su vencimiento deja una ventana de riesgo, mientras que rechazarlos obliga a volver a iniciar sesión. No se implementó ninguna de esas alternativas en esta etapa.

## Validación

Las pruebas del backend se ejecutaron con datos ficticios en SQLite temporal; comprueban la invalidación del token de renovación, la permanencia del token de acceso hasta su vencimiento y el rechazo de tokens ajenos o inválidos. La web incluye pruebas para cierre confirmado, fallo de conexión y ausencia de tokens. La prueba móvil simula confirmación, rechazo, desconexión y error al borrar almacenamiento. No se enviaron notificaciones reales.

Resultados: 72 pruebas del backend, 7 de la web y 10 de Flutter superadas. ESLint de los archivos web modificados y la compilación de Vite pasaron; Vite advirtió sobre el tamaño de un paquete. El análisis Flutter terminó con 31 observaciones informativas existentes en el código de login y FCM (uso de `print` y contexto tras operaciones asíncronas), sin errores de compilación reportados. Las pruebas móviles no sustituyen una ejecución en dispositivo físico.
