# Prueba integrada FCM con permiso pendiente

Fecha: 2026-11-01 (America/La Paz). Tras el rechazo anterior el usuario solicitó reintentar. Resultado: **aprobada para recepción en primer plano en la variante instrumentada**.

La aplicación de prueba `com.condominiun.smart.pushprueba` se instaló por USB y se ejecutó con el código de inicio preparado en la copia aislada. El backend de la copia aislada usó una base SQLite temporal, un guardia ficticio, comprobación de procedencia y el proyecto Firebase propio de prueba. Se verificó en lectura la conexión al proyecto y el servidor exigió que solo existiera un dispositivo ficticio activo antes de enviar.

La prueba automatizada mantuvo pendiente, artificialmente, la solicitud de permiso del coordinador de inicio. Después del inicio de sesión del guardia ficticio y el registro del dispositivo, el servidor envió un único aviso de seguridad de prueba. Firebase lo aceptó; la prueba recibió el mensaje y confirmó que el manejador propio de la aplicación lo observó mientras la espera seguía pendiente. El escenario terminó con `All tests passed`. El mecanismo de espera y observación se añadió únicamente a la variante instrumentada, no al código habitual.

Esto comprueba recepción por el manejador en primer plano con una espera simulada del permiso. No demuestra recepción con red físicamente degradada, que el usuario haya visto la notificación visual, apertura desde segundo plano o proceso cerrado con esta versión, ni el funcionamiento de la instalación habitual. La prueba anterior con app terminada usó la versión previa y no verifica este cambio. No se midió una latencia de red ni se definieron tiempos de espera coordinados.

Se detuvo el servidor, se retiró el enlace USB y se eliminó la base temporal identificada. Un intento explícito de desinstalar el paquete de prueba devolvió `DELETE_FAILED_INTERNAL_ERROR`; la consulta posterior `pm path` no encontró ese paquete, por lo que no puede atribuirse la ausencia al intento de desinstalación. El paquete habitual `com.condominiun.smart` tampoco apareció en la consulta, igual que en el intento anterior; no se sabe cuándo dejó de estar instalado y no se ejecutó un comando de desinstalación dirigido a él. No se modificó la base habitual ni se activaron sus envíos.

La copia Flutter, su APK y la copia del backend permanecen ignoradas por Git y sin commit. La prueba no incorpora los cambios al sistema habitual; el parche previo sigue desactualizado y no debe aplicarse.
