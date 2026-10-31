# Preparación de una prueba móvil real

## Diagnóstico del registro del dispositivo

Con autorización del usuario se reiniciaron brevemente el backend y la app de prueba. Se utilizó una instrumentación temporal en memoria que comprobó únicamente si los identificadores enviados pertenecían a la cuenta actual o a otra; no imprimió identificadores ni nombres de titulares. La solicitud mostró que tanto el identificador actual como el anterior corresponden a registros de otra cuenta. No se determinó aquí si corresponden al mismo registro o al mismo titular. El servidor respondió 400 conforme a la protección existente y no reasignó ni desactivó esos dispositivos.

Posteriormente, para ayudar al usuario a identificar la cuenta anterior, se repitió la comprobación de forma temporal y de solo lectura. Ambos registros apuntan a la misma cuenta; no se imprimieron tokens. El diagnóstico respondió sin ejecutar la sincronización y se retiró al restaurar el servidor normal. No se cambió ni desactivó ningún dispositivo. La identidad de la cuenta se comunicó directamente al usuario, sin almacenarla en este informe.

Se retiró la instrumentación reiniciando el backend normal de prueba. Una consulta posterior de solo lectura encontró cero dispositivos activos de `guardia_prueba` y los mismos dos dispositivos Android activos de otras cuentas que había antes. No se enviaron notificaciones. Para habilitar el registro del guardia hace falta definir un procedimiento de cambio de cuenta que compruebe la titularidad o renueve el identificador del teléfono con consentimiento; hacerlo podría interrumpir los avisos de la cuenta anterior en este teléfono. No se ha efectuado esa operación.

## Resultado de la prueba en el teléfono

El usuario inició sesión como `guardia_prueba`, abrió la bandeja y visualizó el detalle del evento ficticio resuelto. Con ello quedó comprobado en el teléfono el acceso a la API, el almacenamiento de sesión y la consulta de alertas mediante el túnel USB. No se ha probado la recepción de una notificación push.

La revisión posterior de solo lectura encontró cero dispositivos Android activos asociados a `guardia_prueba`. El registro del backend mostraba que la solicitud de sincronización respondió 400 con un error genérico. La investigación posterior, descrita al inicio, confirmó el conflicto de titularidad. No se generaron entregas FCM de seguridad enviadas ni se cambió la configuración de la cola o el envío.

## Corrección del almacenamiento seguro

Durante el inicio de sesión en el teléfono apareció `MissingPluginException` para Flutter Secure Storage. Se comprobó que la APK anterior, compilada invocando Gradle directamente, no contenía `GeneratedPluginRegistrant.java`: las dependencias estaban declaradas, pero faltaba el registro de plugins Android. La compilación anterior había sido validada como archivo APK, no mediante una ejecución de los plugins en el teléfono.

Se regeneró el registrador con `flutter pub get --offline --enforce-lockfile`, usando temporalmente `FLUTTER_WINDOWS=false` solo en el proceso para evitar el requisito de enlaces simbólicos de Windows. No se cambiaron `pubspec.yaml` ni `pubspec.lock` ni se alteró la configuración global de Flutter. La nueva compilación se realizó con `flutter build apk --debug --no-pub` y la URL de prueba USB. Se verificó que la APK contiene las clases del registrador y de almacenamiento seguro, y que conserva la URL de prueba. SHA-256 de la nueva APK: `78FCF2208C120213AAC2E7911972F24003232BA54C92BB43C7E62398DBEBF8C5`.

La nueva APK se instaló con `adb install -r` sin desinstalar la aplicación y se inició la actividad. Posteriormente el usuario inició sesión y abrió una alerta, confirmando que el error de almacenamiento seguro no apareció en ese flujo. No se ha enviado una notificación de seguridad real; el envío FCM del backend de prueba permanece desactivado.

## Instalación autorizada en el teléfono

El usuario autorizó instalar y abrir la APK, incluyendo la posible inicialización de Firebase y registro del dispositivo. Se comprobó que el teléfono seguía autorizado, que el túnel USB estaba activo, que el backend de prueba respondía y que el hash del APK coincidía con el revisado. La instalación mediante `adb install -r` terminó con `Success`; no se desinstaló previamente la aplicación. Se inició su actividad y se comprobó que el proceso estaba activo y en primer plano. La actualización no demuestra por sí sola que todos los datos de la app anterior se hayan conservado correctamente.

El backend de prueba permanece en `127.0.0.1:8001`, con notificaciones internas activas para el proceso, cola y envío FCM desactivados y sin credenciales funcionales de Firebase en ese proceso. La app instalada puede intentar inicializar Firebase y obtener un identificador directamente desde el teléfono, conforme a la autorización. La primera consulta posterior a la apertura mostró cero dispositivos activos asociados a `guardia_prueba`; falta que el usuario inicie sesión y se compruebe nuevamente. No se ha creado ni enviado una notificación push real.

## APK de depuración compilada

Después de que el usuario autorizó las dependencias restantes, Gradle descargó componentes transitivos de Google Maven y Maven Central, así como archivos del repositorio oficial de Flutter requerido por el proyecto. Se compiló correctamente la tarea `:app:assembleDebug` con la URL de prueba `http://127.0.0.1:8001/api`. El archivo generado es `condominio-movil/build/app/outputs/apk/debug/app-debug.apk` (105121582 bytes; SHA-256 `CD9813D44B460B75743BF5FD1EBCC221092C2815506F0426547CA2E6EA55DC2E`). El archivo APK se pudo leer íntegramente, contiene soporte ARM64 y la dirección local de prueba; se verificó que el manifiesto es de depuración y aplica la excepción HTTP de loopback. La compilación informó características de Gradle obsoletas, pero terminó correctamente.

Al finalizar la compilación, el teléfono seguía autorizado y el túnel USB 8001 seguía activo. En ese momento no se había instalado la APK; la instalación posterior autorizada se describe al inicio. La APK apunta a localhost a través de USB y no es una versión de producción.

La app incluye Firebase y, al abrirse, su código puede intentar inicializarlo, solicitar un token y registrar el dispositivo al existir una sesión; el backend de prueba conserva desactivados la cola y el envío de seguridad. El usuario autorizó la instalación y apertura posteriores. La recepción real no se ha comprobado y no se ha autorizado un envío push real.

## Teléfono conectado y preparación de la APK

En el diagnóstico inicial el usuario autorizó descargar dos componentes de Google Maven y ambos quedaron en caché. Una comprobación posterior con Gradle sin conexión y el Java de Android Studio confirmó que aún faltaban componentes transitivos requeridos por `stripe_android`. Más adelante el usuario autorizó descargarlos y se obtuvo la APK según se describe al inicio. La comprobación sin conexión con el Java predeterminado de la máquina había fallado; se repitió con el JDK de Android Studio, que sí permitió identificar las dependencias faltantes.

El usuario conectó y autorizó un teléfono Android 13 por USB. Se configuró `adb reverse` del puerto 8001 del teléfono al mismo puerto de la computadora y se verificó la conexión TCP al backend local. El backend temporal se reinició para cargar el código actual, con notificaciones internas activas únicamente en ese proceso, cola y envío FCM desactivados y sin credenciales funcionales de Firebase. El túnel depende de la conexión USB y puede necesitar volver a configurarse si se desconecta el dispositivo.

Se detectó que la aplicación del condominio ya estaba instalada; no se abrió ni se sustituyó. Al principio, la compilación usando solo la caché informó que faltaban los artefactos Gradle `google-services:4.4.2` y `strict-version-matcher-plugin:1.2.4`. Un primer intento de descarga fue rechazado por la revisión automática porque la autorización previa era para compilar sin descargas; el usuario autorizó posteriormente esas descargas. Flutter también había indicado licencias Android pendientes, por lo que incluso después de resolver las dependencias podría ser necesaria su revisión y aceptación manual.

Antes de instalar una APK habrá que confirmar cómo probarla sin reemplazar inesperadamente la instalación existente y cómo evitar la inicialización y el registro reales de Firebase durante la prueba de conectividad. No se autorizó ni se realizó un envío push real en esta etapa.

## Preparación posterior para Android por USB

El usuario eligió un teléfono Android por USB. Al volver a consultar ADB y Flutter no se detectó ningún dispositivo autorizado ni pendiente de autorización, por lo que todavía no se configuró `adb reverse`, no se instaló la app y no se probó la conexión física.

La URL del backend móvil ahora admite `--dart-define=API_BASE_URL=...` al compilar, conservando la dirección anterior cuando no se proporciona. La variante Android de depuración incorpora una política de red que permite HTTP solo para `127.0.0.1` y `localhost`; esta excepción no se agregó al manifiesto de producción. Esto está pensado para un backend limitado al equipo local y un túnel USB, no para el uso operativo. La configuración predeterminada anterior de la URL se mantiene, pero si se usa una dirección HTTP de red en una compilación de depuración puede quedar bloqueada por la nueva política; debe comprobarse el entorno que se utilice.

Se validó el XML de la configuración de depuración, pasaron 17 pruebas móviles con la URL de prueba y el análisis de los consumidores de la configuración no informó problemas. Tras añadir una comprobación explícita, las cuatro pruebas de perfil pasaron tanto con la URL configurada como con el valor predeterminado. La configuración Android todavía no se ha compilado ni verificado en un teléfono.

El plan para el teléfono autorizado es comprobar de nuevo el backend de prueba, reiniciarlo si fuera necesario para cargar los endpoints actuales y establecer el túnel USB hacia el puerto 8001. La compilación de prueba podrá usar `--dart-define=API_BASE_URL=http://127.0.0.1:8001/api`. La cola y el envío FCM deben seguir desactivados durante la prueba de conectividad; el envío real requiere una aprobación posterior. Las licencias Android siguen pendientes de revisión personal.

Referencia técnica: Android documenta que el tráfico HTTP está deshabilitado por defecto en aplicaciones que apuntan a Android 9 o superior y que la configuración de seguridad de red permite excepciones específicas: https://developer.android.com/privacy-and-security/security-config .

## Estado observado el 31 de octubre de 2026

- Flutter detectó Windows, Chrome y Edge, pero **ningún teléfono o emulador Android en ejecución**. Hay un emulador Android instalado llamado `Medium_Phone_API_36.1`; no se inició y no se verificó si incluye Google Play Services.
- `flutter doctor` detectó el SDK de Android y Android Studio. Informó que faltan por aceptar algunas licencias de Android. La aceptación debe realizarla la persona usuaria después de leerlas; no se aceptaron ni se instalaron componentes en esta etapa.
- Los identificadores de proyecto de la configuración Flutter/Android y las credenciales locales del backend coinciden. No se mostraron las credenciales ni se conectó a Firebase para verificar su validez o sus permisos. El backend temporal del puerto 8001 se había iniciado deliberadamente sin credenciales funcionales de Firebase, con cola y envío de seguridad desactivados.
- `guardia_prueba` no tenía un dispositivo FCM activo al último recuento. Registrar un dispositivo real y enviar una notificación requiere una prueba posterior y autorización específica para el envío.

## Conexión necesaria

La app fija actualmente su URL de API en código a una dirección de red local y el puerto 8000. El backend temporal de prueba estaba ligado a `127.0.0.1:8001` de la computadora, por lo que un teléfono no puede usar esa dirección del equipo directamente. No se ha cambiado la URL ni se ha expuesto un servidor en la red.

Para un Android por USB puede evaluarse `adb reverse` con el backend ligado a localhost; para el emulador hay que verificar su dirección de acceso al equipo anfitrión y que tenga los servicios de Google necesarios. En ambos casos se necesita preparar una forma de seleccionar la URL de desarrollo y comprobar la política de conexiones HTTP de la compilación de prueba, sin debilitar la configuración de producción. El acceso físico de red y el envío FCM son cosas distintas: FCM requiere internet aunque el backend esté en la red local.

## Pasos posteriores propuestos

1. Elegir teléfono Android por USB, emulador o iPhone. Si se usa Android físico, conectar el teléfono y aceptar manualmente la autorización de depuración solo si el propietario desea hacerlo. Si se usa emulador, confirmar que dispone de Google Play Services. No se ha configurado iOS/APNs ni una compilación iOS en este equipo Windows.
2. Revisar las licencias Android con `flutter doctor --android-licenses` y decidir personalmente si aceptarlas. Después verificar que Flutter detecta el dispositivo.
3. Preparar una URL de desarrollo configurable y comprobar acceso al backend sin activar FCM. Reiniciar el backend de prueba para cargar los endpoints de dispositivo actuales. No usar datos de producción ni exponer tokens.
4. Instalar y ejecutar una compilación de prueba solo después de confirmar el dispositivo y el entorno; verificar inicio de sesión, permisos y registro del dispositivo sin enviar mensajes. Revisar otras funciones antiguas que también usan FCM para evitar dispararlas durante la prueba.
5. Antes de activar cola, credenciales y trabajador para un envío real, acordar el dispositivo y destinatario concretos, revisar el contenido genérico y pedir una aprobación explícita. Verificar recepción, apertura y baja; no interpretar la aceptación de Firebase como confirmación de lectura.

La revisión inicial se limitó a inspecciones y documentación. Los cambios posteriores para USB se describen al inicio. No se modificaron licencias, firewall, credenciales ni base de datos; no se inició un emulador ni se enviaron notificaciones.
