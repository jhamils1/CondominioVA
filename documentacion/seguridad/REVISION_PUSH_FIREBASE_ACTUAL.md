# Revisión para prueba push con el proyecto Firebase actual

Fecha: 2026-10-31. El usuario preguntó si era necesario un proyecto Firebase separado y autorizó hacer lo necesario para probar directamente. Esta etapa revisó el entorno sin cambiar dispositivos o enviar mensajes. No se ha demostrado la recepción push.

## Resultado

- La configuración Android local y el Firebase Admin SDK inicializado en un **proceso de diagnóstico nuevo** corresponden al mismo proyecto. Esto verifica sus identificadores, no la validez de credenciales ni el acceso de red a FCM.
- La base configurada es PostgreSQL local. Una consulta en transacción de solo lectura encontró la cuenta `guardia_prueba` activa, **cero dispositivos Android activos de esa cuenta** y dos registros Android activos de otras cuentas. No se imprimieron ni guardaron tokens o nombres de sus titulares. No se verificó que dichos registros correspondan actualmente al teléfono conectado.
- La documentación de una investigación anterior registra un conflicto de titularidad del dispositivo; el backend rechaza que otra cuenta reclame o desactive tokens ajenos. No se intentó sincronizar, desregistrar o reasignar ningún token en esta etapa.
- El teléfono Android conectado tiene instalada la app habitual. En la información del paquete se observó el permiso de notificaciones concedido para un perfil de Android; no se realizó una prueba visual de recepción ni se confirmó el estado del canal de notificaciones. El túnel USB no aparecía en la consulta. El puerto 8000 respondía en localhost y el 8001 estaba cerrado. No se modificó la conexión.
- En el proceso de diagnóstico, las opciones de bandeja, cola y envío de seguridad estaban desactivadas. Esto no demuestra los valores efectivos de un servidor ya iniciado con otro entorno. No se cambió `.env`, no se reinició el backend, no se activó una cola y no se procesó ningún envío.

## Verificación

`administracion.run_migration_smoke` ejecutó **99 pruebas correctas** en SQLite en memoria, con Firebase simulado; incluye protección de dispositivos ajenos, colas, destinatarios y revalidación. La primera ejecución falló una prueba de valor predeterminado porque heredó la activación local de roles personalizados; se repitió con `ROLES_PERSONALIZADOS_ACTIVOS=False` exclusivamente en el proceso de pruebas y pasó con código 0. Una segunda repetición sin canalización confirmó código 0. El valor local no se modificó.

El control del navegador para consultar Firebase no quedó disponible: la aprobación de acceso a la ventana venció. No se creó ni cambió ningún recurso en la nube y no se consultó la lista de aplicaciones de la consola.

## Continuación concreta

No se requiere crear un segundo proyecto Firebase. Una alternativa es registrar una **aplicación Android de prueba independiente dentro del mismo proyecto**, con `applicationId` propio y configuración Firebase que coincida con ese paquete; preparar el código para seleccionar esas opciones explícitamente y un backend de pruebas temporal. Después habría que verificar que su identificador nuevo no pertenezca a un registro previo, dirigirle un aviso genérico y comprobar la recepción, sin tocar la app ni registros actuales. Esta preparación todavía no está implementada ni registrada en Firebase. Firebase indica que cada app Android debe registrarse con su propio nombre de paquete y que el plugin selecciona la configuración que coincide con este: [configuración Android](https://firebase.google.com/docs/android/setup), [plugin Google Services](https://firebase.google.com/docs/android/google-services-plugin-and-file).

Otra opción sería recuperar la cuenta titular del dispositivo y resolver su baja de forma autorizada, pero la identidad y titularidad no se han confirmado y el procedimiento completo de cambio de cuenta no está implementado. Una transferencia o eliminación automática no es apropiada. Ninguna de las opciones anteriores equivale todavía a comprobar la entrega real. La recepción en primer plano y segundo plano tiene comportamientos distintos, que se deberán verificar: [recepción Flutter FCM](https://firebase.google.com/docs/cloud-messaging/flutter/receive-messages).

Para continuar, el usuario puede abrir la [consola Firebase](https://console.firebase.google.com/) con su propia cuenta de Google y avisar cuando vea el proyecto; no debe compartir contraseñas, claves privadas ni tokens. Se verificará el acceso y se completará la preparación de una aplicación de prueba dentro de ese proyecto antes de enviar nada.

### Comprobación posterior de la cuenta de consola

El usuario mostró una consola con el proyecto `smartsales360-fd434`. La comparación local del identificador público de Android indica que **no coincide**: la app del condominio está configurada para `smart-condominiun`. No se cambió ningún proyecto ni se verificó si otra cuenta de Google tiene acceso. Falta que el usuario acceda a la consola con una cuenta autorizada para el proyecto del condominio.

### Comprobación de existencia con la credencial local

Después de que el usuario indicó que no encuentra el proyecto en ninguna de sus cuentas, se consultó en modo de solo lectura la API oficial con la credencial ya configurada en el backend. El primer intento no tuvo transporte de red; el reintento con acceso de red autorizado devolvió **HTTP 200**, confirmando que `smart-condominiun` existe y que esa credencial puede consultar el proyecto. La lista de aplicaciones Android también devolvió 200: la aplicación habitual está registrada y `com.condominiun.smart.prueba` no figura en la respuesta. Ningún token o clave se imprimió; no se crearon aplicaciones ni se cambiaron permisos o dispositivos.

La consulta demuestra acceso de la cuenta de servicio, **no que el usuario controle el proyecto desde su cuenta de Google**, conozca al propietario o tenga autorización para gestionar sus recursos. El usuario necesita acceso administrativo verificable del propietario, o bien puede decidir crear un proyecto Firebase propio y trasladar la configuración en una etapa aprobada. No corresponde crear recursos en un proyecto de titularidad desconocida ni sustituir automáticamente sus credenciales.
