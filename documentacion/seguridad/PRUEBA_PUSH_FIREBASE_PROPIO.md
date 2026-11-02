# Prueba push aislada del Firebase propio

Fecha: 2026-10-31. Estado: **entrega dirigida y visualización en primer plano verificadas** en una app y base aisladas. El usuario aprobó la prueba controlada en su teléfono. El proyecto propio es `condominio-seguridad`.

## Resultado final confirmado

En una nueva base temporal, la app de prueba inició sesión con el guardia ficticio, registró un único dispositivo, y el servidor creó un evento, una notificación y una entrega mediante la lógica existente de Django. Firebase aceptó el envío (`ENVIADA`); Flutter recibió en primer plano el mensaje de seguridad con el título y cuerpo esperados. El escenario automatizado terminó con código 0 y `All tests passed`. A continuación, **el usuario confirmó que vio la notificación en el teléfono**.

Los intentos anteriores no habían confirmado entrega: primero el SDK devolvió `SERVICE_NOT_AVAILABLE`; después, al añadir recursos nativos de Firebase a la variante de prueba, se obtuvo el registro del teléfono pero el servidor respondió 502. Una comprobación de lectura con el mismo entorno restringido produjo `TransportError`; es compatible con una falta de acceso de red del servidor, aunque el error 502 original no conservó suficiente detalle para demostrar por sí solo su causa. Se añadió una verificación de red de solo lectura antes de iniciar el servidor temporal y se repitió con la salida de red autorizada; esa verificación y la prueba final pasaron.

La prueba final verifica **primer plano en la app de prueba**, no segundo plano, app cerrada, pulsación para abrir una alerta ni entrega a otras cuentas. Tampoco confirma que el backend habitual haya sido reiniciado ni que los dispositivos registrados en la base habitual pertenezcan al proyecto nuevo. Los push heredados y la cola de seguridad siguen configurados en pausa para procesos nuevos; falta resolver la migración de dispositivos antes de activarlos. Los avisos heredados ocurridos durante la pausa no se reencolan.

Flutter retiró la app de prueba al terminar; se verificó que solo queda la app habitual y mantiene su fecha anterior. Se retiraron el enlace USB 18082, la base SQLite temporal y logs temporales de depuración; el servidor quedó detenido y el puerto cerrado. La app de prueba sigue registrada en Firebase, y el APK generado en la ruta de build sigue siendo la variante de prueba. No se modificaron registros ni cuentas de la base habitual. Como verificación final, pasaron **73 pruebas Flutter**, con dos omitidas por configuración, y el análisis de cinco archivos no reportó problemas.

## Reintento después de desbloquear el teléfono

### Revisión posterior de Cloud Messaging

La captura del usuario muestra **API de Firebase Cloud Messaging V1 habilitada** en el proyecto propio; la API heredada está inhabilitada. El identificador de remitente del proyecto coincide con el de la variante de prueba. Desde el teléfono, las conexiones HTTPS a los dominios de Firebase Installations, registros FCM y FCM recibieron respuestas HTTP; los puertos TCP 5228–5230 de `mtalk.google.com` establecieron conexión. La primera comprobación con `nc -z` fue inválida porque la versión Android no soporta esa opción; se repitió con `nc -w 3 -q 1`. Estas comprobaciones no explican por sí solas el error anterior al obtener token.

Se preparó una nueva base temporal y se solicitó al usuario mantener el teléfono desbloqueado para instalar. Android devolvió nuevamente `INSTALL_FAILED_USER_RESTRICTED`; no se ejecutó la prueba ni se envió mensaje. Se retiraron el enlace 18082 y la base temporal, y se confirmó que solo figura instalada la app habitual. La causa de `SERVICE_NOT_AVAILABLE` continúa sin determinar; la captura descarta únicamente que la API FCM V1 aparezca deshabilitada en la consola.

El usuario confirmó que el teléfono estaba listo. Se inició una nueva base temporal, se instaló la variante independiente y se concedió únicamente a esa app el permiso de notificaciones. La prueba abrió la app e inició sesión como guardia ficticio, pero el SDK FCM no obtuvo un identificador: Android registró `SERVICE_NOT_AVAILABLE`. La prueba terminó sin registrar dispositivo y **sin enviar mensaje**. Este error no identifica por sí solo la causa.

Diagnóstico de solo lectura: Wi-Fi activo, red validada, ping externo correcto, servicios de Google y Play Store habilitados, y reloj del teléfono cercano al del equipo. Esto no prueba que todos los destinos y puertos FCM estén accesibles. La API de Service Usage respondió HTTP 403 a la cuenta de servicio para `fcm.googleapis.com` y `firebaseinstallations.googleapis.com`, por lo que **no se pudo determinar si están habilitadas**; 403 no demuestra que estén deshabilitadas.

Se intentó un único reintento de instalación, que Android volvió a rechazar con `INSTALL_FAILED_USER_RESTRICTED`. No se reintentó ni modificó la configuración del teléfono. Flutter retiró la app de prueba al finalizar el primer intento; al cierre solo figuraba la app habitual con la misma fecha de actualización previa. Se retiraron enlace 18082, servidor y base temporal tras comprobar la ruta, y se borraron los logs temporales que podían contener una URL de depuración. No se modificaron cuentas ni dispositivos de la base habitual. El registro de la app de prueba sigue en Firebase para el diagnóstico posterior.

Siguiente paso: revisar con el usuario la pestaña **Configuración del proyecto → Cloud Messaging** y el estado visible de la API de Firebase Cloud Messaging, sin modificarla automáticamente. También pueden ser relevantes la propagación de un proyecto nuevo, conectividad específica de FCM o compatibilidad de Google Play Services. Evitar afirmar una causa hasta verificarla y no enviar un aviso a tokens ajenos.

## Preparación y aislamiento

- Se registró en el proyecto Firebase propio la app Android independiente `com.condominiun.smart.pushprueba`, alias `Condominio prueba push`. La aplicación habitual `com.condominiun.smart` no se cambió ni desinstaló. La app de prueba sigue registrada en Firebase para continuar el ensayo; no se envió ningún mensaje y no se alteró la app habitual en la nube.
- Configuración pública de la app de prueba guardada en el directorio local ignorado `Condominio-Backend/backups_locales/firebase_preparacion_20261031/push_prueba_defines.json`. La clave privada del servidor permanece fuera del repositorio. No se imprimieron tokens ni credenciales.
- Variante Flutter/Android de prueba separada, solo debug, con Firebase explícito, Stripe desactivado, API obligatoria `http://127.0.0.1:18082/api` y comprobación del proyecto. Rechaza combinarse con la variante aislada sin red o ejecutarse en release/profile. La aplicación normal conserva su configuración.
- `administracion.run_push_test_isolated` crea una base SQLite temporal, un único guardia ficticio y un servidor ligado a loopback. El endpoint temporal deniega anónimos y solo permite una prueba cuando existe exactamente un dispositivo activo del guardia ficticio. Crea un evento interno y usa la cola y el procesador existentes para una única entrega; no se ejecuta el worker en segundo plano. No conecta a la base real ni cambia tokens de usuarios reales.
- `integration_test/push_firebase_test.dart` prepara login ficticio, espera el registro propio y una entrega FCM en primer plano. No se ha completado en Android y no demuestra recepción ni apertura en segundo plano.

## Resultado

La compilación de la variante terminó correctamente. Se verificaron paquete, etiqueta, servicios Android de mensajería y ausencia de inicialización Firebase automática prematura; el análisis de cuatro archivos Flutter no mostró problemas. Las 71 pruebas Flutter previas pasaron con dos omitidas; dos pruebas adicionales de entorno pasaron tanto con valores por defecto como con proyecto/URL deliberadamente incorrectos. Una prueba HTTP al servidor temporal comprobó 401 anónimo y 409 ante ausencia de dispositivo: no hubo envío.

En el teléfono autorizado la instalación devolvió `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user`. Esto describe la respuesta de Android, no permite concluir si se mostró una ventana de confirmación ni quién la rechazó. Se solicitó al usuario desbloquear el teléfono y avisar si aparece una confirmación. No se instalaron la app ni permisos de notificación; no se envió ninguna alerta.

Se retiró el enlace USB temporal 18082 y se detuvo el servidor. Como la interrupción no ejecutó la limpieza automática, se verificó la ruta concreta del directorio temporal y se eliminó su base ficticia. Comprobación final: puerto 18082 cerrado; únicamente la app habitual permanece instalada. La APK de salida sigue siendo la variante de prueba, no la normal. El backend habitual y su configuración siguen con los límites de la etapa anterior; no se reinició el servidor existente.

## Continuación

Esperar respuesta del usuario y comprobar la pantalla del teléfono. No cambiar ajustes de seguridad del teléfono ni intentar eludir la restricción. Con el teléfono desbloqueado y autorización vigente, iniciar una base temporal nueva, verificar su identidad y que no existan dispositivos, añadir únicamente el enlace 18082, instalar solo `com.condominiun.smart.pushprueba`, permitir notificaciones de esa app y ejecutar la prueba; si Android vuelve a impedir la instalación, identificar la causa con el usuario. Al terminar, retirar únicamente el enlace/app de prueba y cerrar/eliminar el servidor y su base temporal. Comprobar la app habitual y no tocar sus datos. Registrar si FCM aceptó el envío, si el mensaje llegó a Flutter y si se mostró visualmente; son resultados distintos.

Fuentes: [API de registro de apps Firebase](https://firebase.google.com/docs/reference/firebase-management/rest/v1beta1/projects.androidApps/create) y [recepción FCM Flutter](https://firebase.google.com/docs/cloud-messaging/flutter/receive-messages).
