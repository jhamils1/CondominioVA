# Variante Android aislada sin Firebase: primera preparación

## Cambios

Se preparó una variante Android de depuración que se activa con `--dart-define=CONDOMINIO_AISLADO=true`. Para ella, Gradle añade `.prueba` al identificador de la aplicación y configura el nombre visible `Condominio - PRUEBA AISLADA`. La configuración habitual conserva su identificador y la integración existente con Google Services.

La variante aislada no aplica el complemento Google Services, retira del manifiesto generado los proveedores y receptores automáticos de Firebase examinados, deshabilita su inicialización automática y omite las inicializaciones Dart de Firebase y Stripe. Las operaciones de registro FCM se deshabilitan en este modo. Se mantiene el acceso a la bandeja interna, pero no se ha probado todavía la app con un backend o dispositivo.

Para evitar usar por accidente el backend habitual, el modo aislado exige que `API_BASE_URL` sea exactamente `http://127.0.0.1:18080/api`; rechaza el arranque si no coincide. En un emulador o teléfono de prueba, esa dirección se refiere al propio dispositivo: necesitaría una redirección local preparada hacia un backend **aislado**. El puerto por sí mismo no demuestra que el backend sea de prueba; debe verificarse antes de cualquier conexión. No se configuró ni inició ese backend en esta etapa.

Gradle bloquea tareas `release` y `profile` para esta variante, incluso cuando se invocan mediante una tarea agregada. La variante está prevista para Android: el aislamiento nativo no se implementó para iOS u otras plataformas.

## Comprobaciones

- 21 pruebas Flutter con el modo aislado y servicios ficticios; pasaron. Se comprobó que FCM devuelve estado deshabilitado y que la configuración usa la URL local.
- Prueba adicional con una URL no permitida: se rechazó la inicialización esperada.
- 16 pruebas de regresión con la configuración normal: pasaron; las dos pruebas específicas de modo aislado se omitieron intencionalmente.
- Análisis estático de los archivos modificados: sin observaciones.
- Gradle procesó el manifiesto de depuración sin conexión. El manifiesto resultante mostró `com.condominiun.smart.prueba` y el nombre de prueba, y no incluyó los proveedores y receptores Firebase retirados. Se confirmó en modo de simulación que la tarea Google Services de la configuración habitual sigue existiendo.
- Se comprobó el rechazo de tareas `assembleRelease` y `assemble` con el modo aislado. Estos fallos fueron intencionales.

La comprobación Gradle utilizó el JDK 21 de Android Studio; el Java predeterminado instalado devolvió un error de compatibilidad con la versión de Gradle. Se procesó el manifiesto y parte de la compilación Flutter, pero **no se construyó ni instaló un APK completo**, no se ejecutó el modo en Android y no se verificó tráfico de red. No se creó un proyecto Firebase ni se accedió al teléfono, Firebase o una base real.

## Próximos pasos sujetos a aprobación

Preparar un backend y base ficticios aislados, comprobar su identidad y habilitar la redirección solo hacia ellos. Después compilar y examinar el APK de prueba, y probarlo únicamente en un emulador o dispositivo de pruebas autorizado. Verificar en ejecución la ausencia de tráfico Firebase y el acceso a la bandeja interna; el manifiesto y los tests unitarios no sustituyen esa prueba. Una posterior integración con un proyecto Firebase separado exige su propia configuración y aprobación: esta variante no está preparada para realizar llamadas FCM reales.
