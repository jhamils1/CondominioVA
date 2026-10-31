# Preparación de la activación de notificaciones internas

## Prueba local iniciada posteriormente

El usuario creó y vinculó la cuenta `guardia_prueba`. Se comprobó que tiene rol efectivo de guardia, un empleado activo, que es destinataria y que no tiene privilegios técnicos. La creación de la cuenta aparece en la auditoría.

Con autorización posterior se inició un backend de prueba en `127.0.0.1:8001` con notificaciones internas activadas únicamente en su proceso y ambos indicadores FCM desactivados. Se inició una web de prueba en `127.0.0.1:5174`, configurada para ese backend. No se cambió `.env`; las instancias originales conservan su propia configuración. El backend de prueba se inició sin credenciales funcionales de Firebase para evitar envíos desde ese proceso. Las instancias comparten la base de desarrollo: las acciones de interfaz que creen incidencias o eventos fuera de una transacción de prueba sí quedan guardadas.

Una prueba de API en PostgreSQL, dentro de una transacción revertida, verificó que una notificación de revisión llega a `guardia_prueba`, que el guardia puede consultarla y confirmar la incidencia, y que `admin` recibe la notificación de confirmación. Se forzó la autenticación de las cuentas en la prueba; no se verificó su contraseña ni una sesión real de navegador. Los envíos FCM se simularon y no se dejaron filas del evento ficticio; las secuencias de PostgreSQL pueden avanzar. Se comprobó que la web de prueba responde por HTTP y que el backend responde a solicitudes. Aún falta la prueba manual del usuario en el navegador.

El usuario confirmó que pudo abrir la página de notificaciones con `guardia_prueba`. En la etapa siguiente se agregó en la web un formulario para registrar eventos manuales mediante la API existente; el servidor sigue comprobando el rol y registrando el actor. Un reintento sin cambiar los datos reutiliza el identificador del evento para evitar duplicados. El formulario advierte si no hay guardias activos. La compilación y ESLint de los archivos modificados y las siete pruebas existentes de permisos y cierre de sesión pasaron. No se automatizó la interacción del formulario en navegador; la prueba manual posterior se describe en el siguiente párrafo. Los eventos creados desde el formulario persisten en la base de desarrollo.

El usuario realizó después la prueba manual: creó el evento ficticio, recibió y abrió la notificación, confirmó la incidencia y la llevó a resuelta. Una consulta de solo lectura verificó la notificación leída por `guardia_prueba`, la notificación de confirmación para `admin` y las acciones `CREADO`, `CONFIRMADA`, `EN_ATENCION` y `RESUELTA` en el historial. No se generaron entregas FCM. El evento de prueba permanece en la base de desarrollo. En ese momento la notificación histórica mostraba «Evento pendiente de revisión» incluso después de resolverse; el detalle sí mostraba el estado actual.

En una etapa posterior aprobada se corrigió el texto histórico a «Evento enviado a revisión», que describe la acción sin afirmar que sigue pendiente. Se verificó mediante una consulta de solo lectura que la notificación ya existente devuelve el nuevo texto con el evento resuelto, y pasaron las 74 pruebas de backend en SQLite temporal. Se reinició el backend local de prueba con notificaciones internas habilitadas y FCM deshabilitado. La corrección no modifica registros, requiere migración ni afecta mensajes push.

## Estado revisado

Esta sección conserva la situación de la revisión anterior, antes de que se creara el guardia de prueba.

El 30 de octubre de 2026 la base PostgreSQL local `condominio` tenía las migraciones de seguridad aplicadas. La consulta de destinatarios se realizó en modo de solo lectura: había **0 guardias activos autorizados** y **1 administrador activo autorizado**. Existía un grupo compatible con el rol de guardia, pero no había empleados activos sin cuenta. No se consultaron ni documentaron nombres de personas ni credenciales. Estas cantidades pueden cambiar y deben comprobarse nuevamente antes de una prueba con cuentas reales.

Los tres indicadores de seguridad y FCM estaban desactivados. La revisión no activó el servicio, no modificó la base y no envió mensajes. En la etapa anterior se verificaron los flujos con guardias ficticios dentro de una transacción revertida en PostgreSQL, sin contacto con Firebase.

## Qué ocurrirá al habilitar las notificaciones internas

`NOTIFICACIONES_SEGURIDAD_ACTIVAS=True` habilita los endpoints de eventos e historial de notificaciones de seguridad para administradores y guardias autorizados. Un evento manual pendiente crea una notificación individual para cada guardia activo autorizado; si no hay guardias, queda marcado como pendiente sin guardias y un administrador puede solicitar una redistribución manual. Un guardia puede confirmar o descartar un evento, y la confirmación crea una incidencia y notificaciones internas a los administradores activos. Si no hay administradores activos, no hay escalamiento automático previsto.

También cambia el flujo existente de incidencias: una incidencia creada manualmente por un guardia queda vinculada a un evento confirmado y genera notificaciones internas a los administradores. La edición de una incidencia vinculada actualiza el evento y registra el cambio en su historial. Estos son cambios persistentes si las operaciones se realizan fuera de una transacción de prueba. Las incidencias anteriores no se transforman automáticamente.

Los propietarios e inquilinos no acceden a las notificaciones o eventos internos de seguridad. Las listas web se cargan al abrir la pantalla; no hay actualización en tiempo real. La página de incidencias permite registrar incidencias manuales ya confirmadas. Posteriormente se agregó el formulario de eventos pendientes descrito arriba. No hay procesamiento de video ni detección automática en esta etapa.

Mantener `COLA_FCM_SEGURIDAD_ACTIVA=False` y `ENVIO_FCM_SEGURIDAD_ACTIVO=False` evita preparar y enviar push de seguridad. Las notificaciones internas son visibles en la web para el destinatario autorizado; aún no hay pantalla móvil de historial ni se ha validado push en un dispositivo físico. Otras funcionalidades anteriores pueden usar Firebase y deben evaluarse por separado.

## Condiciones para una prueba útil

1. Contar con al menos un guardia activo, con cuenta y perfil de empleado relacionados, y un administrador activo. La base actual no cumple la primera condición. Crear o vincular una cuenta real requiere identificar al empleado y actuar por el flujo administrativo autorizado; no se ha inventado una persona ni una contraseña.
2. Verificar que frontend y backend de prueba usan la base local correcta y que las migraciones estén aplicadas. Mantener ambos indicadores FCM desactivados.
3. Para una prueba controlada, se puede habilitar temporalmente el primer indicador solo en el proceso de Django de desarrollo, sin escribir el archivo `.env`; reiniciar el proceso sin ese ajuste desactiva el servicio nuevamente. El entorno del proceso tiene prioridad sobre `.env`, por lo que debe verificarse el valor efectivo. Los eventos realmente creados durante una prueba de interfaz persistirán y podrían ser visibles a otros usuarios autorizados; no deben insertarse pruebas permanentes sin acuerdo.
4. Comprobar en el navegador, con cuentas de prueba autorizadas, la visualización de notificaciones propias, restricciones de residentes, revisión por guardia, aviso al administrador e historial; verificar que no se envió push. La existencia de cuentas, información concreta del empleado y comportamiento en navegador siguen pendientes de comprobación.

Desactivar el indicador vuelve a responder 503 para los nuevos endpoints; no borra los eventos, incidencias ni notificaciones existentes. En esta etapa no se cambiaron indicadores ni cuentas.
