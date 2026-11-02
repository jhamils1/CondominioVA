# Prueba de apertura de notificación push

Fecha: 2026-10-31. Se utilizó una cuenta y una aplicación ficticias, un servidor Django y una base de datos temporales y el proyecto Firebase propio de pruebas.

**Resultado de esta etapa:** apertura desde segundo plano confirmada en la variante temporal ejecutada con `lib/main.dart`, sin `flutter drive`. Posteriormente se aprobó y completó la [prueba con proceso terminado](PRUEBA_PUSH_PROCESO_CERRADO.md). La aplicación habitual queda fuera de ambas comprobaciones. Los intentos previos se conservan a continuación para trazabilidad.

El teléfono recibió un aviso en segundo plano. Al tocarlo, el usuario informó que veía el perfil del guardia. El registro de la aplicación confirmó el toque; en un primer ensayo la comprobación automatizada encontró posteriormente la bandeja y el evento ficticio, pero solo después de reanudar el controlador. Esto no demuestra que la navegación fuera visible de forma natural.

Otro ensayo agotó el tiempo. Se detectaron dos servidores temporales compartiendo el puerto; esa interferencia impide atribuir el resultado a un fallo concreto de la aplicación. Se corrigió el servidor de prueba para reservar el puerto en exclusiva y las cinco pruebas del controlador pasaron.

La aplicación temporal se recompiló con una pausa para observar la pantalla después de la comprobación, pero Android canceló su instalación por USB. No se envió otro aviso en ese intento y la apertura quedó pendiente en ese momento.

## Repetición posterior

Con un único servidor temporal, el dispositivo de prueba en segundo plano y un aviso ficticio aceptado por Firebase, el usuario tocó el aviso y vio inicialmente el perfil. Tras liberar el controlador de la prueba, el escenario automatizado verificó la bandeja y el evento, terminó con éxito y el usuario confirmó visualmente que los vio. La apertura inmediata sin la intervención del controlador de pruebas y el comportamiento de la aplicación habitual aún no quedan demostrados; el retraso observado requiere una verificación adicional antes de considerarlos correctos.

La app temporal y el enlace USB se retiraron; la app habitual sigue instalada. La base y el servidor temporales se cerraron y retiraron. El registro de prueba permanece en Firebase.

## Comprobación con inicio normal, sin controlador de Flutter

El usuario aprobó revisar el retraso. Se inspeccionó el SDK Flutter instalado: `IntegrationTestWidgetsFlutterBinding` hereda el control de fotogramas de `LiveTestWidgetsFlutterBinding`, cuya política predeterminada es `fadePointers`, distinta de la ejecución normal. El escenario anterior esperaba una señal del servidor y utilizaba `pump` para actualizar la interfaz. Esto hizo que sus resultados visuales no fueran suficientes para evaluar el comportamiento normal.

Se recompiló la variante aislada con `flutter build apk --debug --no-pub --target=lib/main.dart`, utilizando las definiciones locales de Firebase de prueba. No se ejecutaron `flutter drive`, `testWidgets` ni el escenario de integración. El paquete verificado fue `com.condominiun.smart.pushprueba`, con etiqueta «Condominio - PRUEBA PUSH»; no reemplazó la aplicación habitual. Android rechazó un primer intento de instalación; el usuario pidió repetirlo y la instalación posterior se completó.

Se inició sesión con el guardia ficticio desde la interfaz normal, se comprobó un único dispositivo registrado y se llevó la app a segundo plano. El backend temporal envió un único aviso, aceptado por Firebase. El usuario lo tocó y confirmó que se abrió «Alertas de seguridad». Se inspeccionó una captura temporal que mostraba la bandeja con «Evento enviado a revisión». La consulta de solo lectura al control de finalización confirmó `false`: no se liberó el controlador ni se forzó la navegación después del toque.

La comparación respalda que el retraso anterior estaba asociado al ensayo automatizado; no se reprodujo con el inicio normal. No se modificó el código funcional de navegación para obtener el resultado. No se midió una latencia exacta, ni se demuestra con esta prueba el arranque con la app terminada, todos los modelos Android o la instalación habitual anterior.

Validación complementaria: ocho pruebas de navegación Flutter aprobadas (mensajes válidos, roles excluidos, sesión y reintento), cinco pruebas del controlador aprobadas (incluida exclusividad del puerto) y compilación Android correcta.

Limpieza: aplicación temporal desinstalada; paquete habitual comprobado como instalado; enlace USB 18082, servidor y base ficticia retirados. Captura y log temporales eliminados. El registro de app de prueba sigue en Firebase y la APK local de build corresponde a esta variante. No se cambiaron dispositivos habituales, cuentas reales, interruptores de envío ni la configuración activa del backend habitual.

Para reproducir una comprobación visual manual, usar el inicio normal con la variante y base aisladas; no certificar tiempos de apertura basándose solo en un escenario que requiere liberar el controlador Flutter.

Se cerraron los servidores temporales y se retiraron el enlace USB y las bases ficticias. La aplicación habitual permanece instalada; el registro de la aplicación de prueba sigue en Firebase. La entrega push habitual y la transición de dispositivos del proyecto anterior aún requieren completar su etapa correspondiente.
