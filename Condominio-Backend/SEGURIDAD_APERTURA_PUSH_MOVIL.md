# Apertura de alertas desde notificaciones móviles

## Funcionamiento preparado

La app reconoce los mensajes cuyo tipo es `seguridad` y que contienen identificadores UUID de notificación y evento. Los toques recibidos desde FCM al abrir o reanudar la app, y desde una notificación local mostrada en primer plano, solicitan abrir la **bandeja de alertas**. La ruta no se toma del contenido del mensaje: está fijada por la aplicación. La notificación local conserva solo los identificadores necesarios en su payload, sin el contenido de la alerta.

Antes de abrir la bandeja se consulta el perfil actual y se verifica el rol de administrador o guardia. La ruta protegida vuelve a verificarlo y el backend filtra las notificaciones por destinatario. La app abre la bandeja general, no el detalle señalado por el mensaje; el usuario selecciona allí una notificación propia. Si no hay sesión o falla la consulta de perfil, el toque queda pendiente en memoria y se reintenta después de iniciar sesión. Si la cuenta verificada tiene un rol no autorizado, se descarta. La navegación no funciona sin la conexión necesaria para comprobar el perfil y consultar las alertas.

Si la bandeja ya está abierta, otro toque no apila una pantalla duplicada; el usuario puede usar **Actualizar** para consultar nuevas alertas. El toque pendiente no se guarda en disco: si el proceso se cierra antes de iniciar sesión, podría perderse. Tampoco se añadió navegación para las notificaciones administrativas o financieras anteriores.

## Pruebas y límites

Pasaron 29 pruebas Flutter con mensajes, perfiles y servicios simulados. Cubren aviso recibido antes de montar la interfaz, payload de notificación local, sesión pendiente y reintento, cambios concurrentes durante la verificación, roles de residentes, datos inválidos y protección de la ruta. Estas pruebas verifican la lógica de navegación y la bandeja; no reproducen Firebase ni el comportamiento real del sistema operativo.

No se activó Firebase, no se enviaron mensajes reales, no se cambió el backend ni la base de datos y no se probaron teléfonos físicos. La prueba real requiere un entorno y un dispositivo controlados, conectividad, una configuración válida y autorización específica antes de enviar. La bandeja sigue sin permitir confirmar o resolver incidencias desde el móvil.
