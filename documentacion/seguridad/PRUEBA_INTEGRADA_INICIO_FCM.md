# Prueba integrada de inicio FCM: instalación Android rechazada

**Actualización:** el usuario solicitó repetir la instalación y la [prueba posterior](PRUEBA_INICIO_FCM_REAL_ESPERA.md) confirmó la recepción en primer plano durante la espera simulada.

Fecha: 2026-11-01 (America/La Paz). El usuario autorizó continuar las pruebas pendientes de notificaciones, incluyendo la variante aislada y el teléfono USB previamente autorizado.

Se preparó una prueba de integración en la copia Flutter ignorada que mantiene pendiente la solicitud simulada de permiso y exige que el manejador propio del servicio observe un aviso real de Firebase antes de liberar la espera. El servidor se preparó desde la copia aislada del backend, con una base SQLite temporal, un guardia ficticio, proyecto Firebase de prueba y verificación de procedencia activada. Se confirmó por consulta de solo lectura que el proyecto Firebase de prueba respondía. No se envió ningún aviso.

La APK de la prueba compiló correctamente; `aapt` identificó su paquete como `com.condominiun.smart.pushprueba`. Flutter intentó instalarla tres veces y Android respondió `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user`; la aplicación no llegó a iniciarse y la prueba integrada no se ejecutó. No se conoce la causa de la cancelación ni si apareció un diálogo. Flutter indicó que intentó desinstalar una versión anterior de la variante durante su reintento; no se ejecutó un comando de desinstalación dirigido a la aplicación habitual.

Tras el intento, la consulta a `pm` no encontró el paquete de prueba ni `com.condominiun.smart` en el teléfono conectado. La presencia del paquete habitual se había comprobado en un ensayo anterior, pero no se verificó inmediatamente antes de este intento; por ello no se puede determinar cuándo o por qué dejó de aparecer ni afirmar que este intento lo eliminó. No se reinstaló ninguna app ni se borraron datos de usuario de forma intencional.

Se detuvo el servidor de prueba, se retiró el enlace USB 18082, se eliminó la carpeta temporal de SQLite identificada por esta ejecución y se verificó que el puerto no quedara escuchando. No se modificó la base habitual ni se activaron sus envíos. Las fuentes, pruebas instrumentadas y APK de ensayo permanecen en la copia ignorada por Git, sin commit. La compilación generó la APK bajo esa copia; no reemplazó la APK de la carpeta habitual.

Pendiente: volver a intentar cuando la instalación USB sea aceptada, comprobar recepción durante la espera simulada y luego los escenarios de segundo plano y proceso terminado con la nueva versión. El resultado anterior de 21 pruebas simuladas no sustituye esta prueba integrada. Hay que volver a iniciar una base temporal nueva y verificar destino y Firebase antes de cualquier envío. El parche previo sigue desactualizado y no debe aplicarse.
