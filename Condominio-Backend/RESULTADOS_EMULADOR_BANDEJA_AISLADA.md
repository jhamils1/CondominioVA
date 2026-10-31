# Prueba de la bandeja móvil en emulador aislado

## Entorno

Se compiló la variante Android de depuración con `CONDOMINIO_AISLADO=true` y el backend local de prueba. Antes de instalarla se verificó el APK: identificador `com.condominiun.smart.prueba` y nombre visible `Condominio - PRUEBA AISLADA`. Se instaló únicamente en el emulador `Medium_Phone_API_36.1`, iniciado sin ventana y en modo de solo lectura; no se instaló en el teléfono conectado.

El emulador usó modo avión y una redirección ADB exclusivamente hacia `127.0.0.1:18080`, donde se ejecutó el backend temporal con datos ficticios. La variante de prueba omite Firebase y Stripe según su configuración y su manifiesto. No se realizó una captura independiente de todo el tráfico de red, de modo que la prueba no constituye una auditoría completa de red.

La primera compilación sin conexión no encontró dos dependencias Android de Flutter en la caché. Se repitió la compilación descargando las dependencias necesarias y terminó correctamente; no se utilizó Firebase para la prueba. Se usó el JDK 21 de Android Studio.

## Resultados observados en la app

1. La cuenta `guardia_ficticio_1` inició sesión. Apareció el aviso de que el registro de notificaciones push no estaba confirmado, como corresponde a la variante sin Firebase.
2. Desde el menú se abrió **Alertas de seguridad** y apareció el evento ficticio como **Sin leer**.
3. Al abrirlo se mostró su descripción y estado `PENDIENTE_REVISION`; al volver a la lista, la alerta apareció como **Leída**.
4. Se cerró la sesión e inició `guardia_ficticio_2`. Su bandeja mostró una alerta del mismo evento como **Sin leer**, verificando que la lectura es individual en el recorrido realizado.

Esta prueba confirma ese recorrido de bandeja y el cambio entre dos cuentas ficticias; no verifica la entrega push, acciones de confirmación de incidencias desde móvil ni todos los casos de permisos. El acceso restringido del propietario se había probado previamente por API en el backend temporal.

## Cierre

Se quitó la redirección ADB, se apagó el emulador y se detuvo el backend. La base temporal de esta ejecución fue eliminada. No se usaron la base real ni el registro del teléfono, y no se enviaron push.

El APK generado está en `condominio-movil/build/app/outputs/apk/debug/app-debug.apk` y corresponde a la variante **aislada**; una compilación posterior podría sobrescribir ese archivo. No debe confundirse con una compilación habitual del proyecto.
