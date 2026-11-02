# Preparación de prueba push en segundo plano

Fecha: 2026-10-31. Estado: **recepción visible en segundo plano confirmada en entorno aislado**. El usuario aprobó el ensayo y confirmó que el teléfono estaba listo.

## Resultado posterior

El usuario solicitó reintentar y aceptó la instalación de la variante aislada. La app inició sesión con el guardia ficticio y registró el único dispositivo en la base temporal. El controlador verificó que estaba en primer plano, la llevó a Inicio y comprobó que ya no estaba en primer plano. Después, el backend creó el evento y procesó una entrega con su cola habitual; Firebase la aceptó.

El usuario pidió un nuevo intento. Se envió **un segundo mensaje ficticio al mismo dispositivo y con el mismo identificador de aviso**, mediante el Admin SDK, después de verificar la base SQLite temporal en modo de solo lectura, el único destinatario, el hash del token y que la app seguía fuera del primer plano. No se cambió la base ni se consultaron dispositivos habituales. Firebase aceptó ese reintento y el usuario confirmó que **vio la notificación**. No se puede atribuir con certeza la notificación visible a la primera entrega o al reintento, ya que ambas usaron el mismo aviso. El reintento directo no crea una segunda entrega en la cola de Django.

Después de la confirmación, se liberó el escenario Flutter, que terminó con código 0 y `All tests passed`. La app de prueba se retiró del teléfono; se verificó que la app habitual sigue instalada con su fecha anterior. Se retiraron el enlace USB, el servidor, la base temporal y el log de depuración. El registro de la app de prueba permanece en Firebase y la APK en la ruta de build es la de prueba.

Esta prueba confirma la visualización de **al menos un aviso recibido mientras la app estaba fuera del primer plano**. No comprueba app cerrada o forzada a detenerse, pulsación de la notificación, apertura de la alerta, ni el funcionamiento del envío con las cuentas y dispositivos habituales. La migración de dispositivos y la activación de los push del sistema habitual siguen pendientes.

## Preparación y pruebas

Se preparó `integration_test/push_background_test.dart` para iniciar sesión con un guardia ficticio, registrar un único dispositivo en el backend temporal y esperar la finalización del ensayo. `administracion/check_push_background.py` comprueba la identidad del servidor y que la app de prueba esté en primer plano, envía la app a inicio mediante ADB, verifica que ya no esté en primer plano y únicamente entonces solicita una entrega ficticia. Un control temporal de finalización mantiene viva la prueba hasta que se revise el resultado. Estos endpoints existen exclusivamente en el URLConf temporal, no en el backend habitual.

La APK debug `com.condominiun.smart.pushprueba` se compiló con Firebase propio; paquete, etiqueta, inicialización nativa y servicio de mensajería se verificaron. Análisis Flutter sin incidencias. Cuatro pruebas unitarias del controlador con ADB y red simulados pasaron, incluidas denegaciones ante actividad desconocida o incorrecta. El servidor temporal verificó su conexión Firebase y las rutas de control rechazaron solicitudes anónimas o finalización sin entrega. Estas pruebas no demuestran la recepción en segundo plano.

Android devolvió `INSTALL_FAILED_USER_RESTRICTED` y el usuario informó que **no apareció ninguna ventana** de instalación. No se instaló la app, no se presionó Inicio y no se envió un mensaje. Se confirmó que el fabricante del teléfono es Xiaomi; esto no identifica la causa de la restricción. Se pidió revisar manualmente las opciones de instalación por USB sin cambiar ajustes automáticamente. Referencia del fabricante para localizar [opciones de desarrollador](https://www.mi.com/global/support/faq/details/KA-168765/).

Se retiraron el enlace USB 18082 y la base SQLite temporal tras verificar su ruta; el servidor se detuvo y se confirmó que el puerto está cerrado. Solo la app habitual figura instalada. Se retiró el log temporal de compilación; el APK de build sigue siendo la variante de prueba. La app de prueba permanece registrada en Firebase para futuros ensayos. No se tocaron cuentas o registros de la base habitual.

## Continuación

Con el usuario revisar qué opción o aviso de instalación por USB aparece en el teléfono. Sin modificar automáticamente configuraciones de seguridad ni eludir restricciones, volver a iniciar `administracion.run_push_test_isolated` con salida de red autorizada y base nueva, verificar APK, conectar únicamente el puerto 18082 e instalar la app de prueba. Ejecutar `flutter drive` con `integration_test/push_background_test.dart` y el archivo de opciones aisladas. Tras el marcador `PUSH_SEGUNDO_PLANO_LISTO`, ejecutar `python -m administracion.check_push_background enviar --dispositivo <teléfono autorizado>`, que falla antes de enviar si no confirma que la app estaba visible y pasó a segundo plano. Confirmar con el usuario si vio la notificación; luego ejecutar la acción `finalizar` del mismo controlador. Registrar por separado aceptación de Firebase, estado de la app, visualización y resultado de la prueba; no interpretar el estado de fondo como prueba de pulsación o apertura.

Al terminar, retirar solamente app y enlace de prueba, servidor y base temporales; verificar la app habitual. No activar el envío habitual ni transferir tokens antiguos como parte del ensayo.
