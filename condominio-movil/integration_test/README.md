# Prueba Android de roles personalizados

Usa exclusivamente el backend desechable `administracion.run_roles_web_isolated --port 18080`. No utilizar la base habitual, cuentas reales ni el APK normal. El test comprueba el modo aislado y la identidad del servidor antes de crear registros o borrar almacenamiento de la aplicación de prueba.

Se añadieron `integration_test` del SDK y sus dependencias de desarrollo; no se actualizaron las dependencias existentes. El caso utiliza el almacenamiento seguro nativo, peticiones HTTP a Django y widgets reales de la aplicación. No simula Firebase: su inicialización está deshabilitada por la variante.

## Preparación

Desde `Condominio-Backend`:

```powershell
.\env\Scripts\python.exe -B -m administracion.run_roles_web_isolated --port 18080
```

Desde `condominio-movil`, con el SDK/dependencias disponibles:

```powershell
flutter build apk --debug --no-pub --target=integration_test/roles_personalizados_test.dart --dart-define=CONDOMINIO_AISLADO=true --dart-define=API_BASE_URL=http://127.0.0.1:18080/api
```

Verificar que el APK corresponda a `com.condominiun.smart.prueba`, denominado `Condominio - PRUEBA AISLADA`. La ruta habitual de salida queda sobrescrita por este APK de pruebas; no confundirlo con la compilación normal.

Elegir un emulador iniciado o un teléfono autorizado específicamente para esta prueba. Sustituir `<dispositivo-autorizado>` por su identificador ADB; no omitir la selección si hay varios conectados:

```powershell
adb -s <dispositivo-autorizado> reverse tcp:18080 tcp:18080
flutter drive --no-pub --driver=test_driver/integration_test.dart --target=integration_test/roles_personalizados_test.dart --use-application-binary=build/app/outputs/flutter-apk/app-debug.apk --dart-define=CONDOMINIO_AISLADO=true --dart-define=API_BASE_URL=http://127.0.0.1:18080/api -d <dispositivo-autorizado>
```

La prueba requiere una base temporal nueva por ejecución. No repetir sobre una instancia que conserve el rol creado por un intento anterior: detenerla y volver a iniciarla.

## Qué se comprueba

1. Crear mediante la API un rol inactivo y sin capacidades; activarlo y asignarlo a un empleado ficticio.
2. Iniciar sesión desde el formulario Android y leer la sesión desde almacenamiento seguro nativo.
3. Comprobar ausencia de menús de visitas, seguridad y finanzas cuando no corresponde; comprobar rechazo de API de visitas/usuarios/FCM.
4. Habilitar la capacidad desde la API administrativa, abrir el menú y consultar la visita ficticia mediante la pantalla real.
5. Revocar la capacidad con la sesión abierta; actualizar la lista y comprobar denegación y retirada del dato anterior.
6. Cerrar sesión desde el menú, verificar borrado local y rechazo del token anterior; comprobar que desactivar el rol rechaza acceso y refresh de una sesión nueva.

El controlador tiene un límite de cinco minutos para esperar resultados. Las credenciales incluidas corresponden solo a las cuentas ficticias del runner; nunca añadir contraseñas reales. No imprime respuestas de autenticación.

## Cierre

Detener el servidor con Ctrl+C y comprobar el mensaje de eliminación de su directorio temporal. Retirar únicamente el enlace `tcp:18080` del dispositivo de prueba, sin usar `reverse --remove-all`. Cerrar el emulador de prueba o retirar exclusivamente la instalación `com.condominiun.smart.prueba` creada para la ejecución, conforme a la autorización del dispositivo. No desinstalar `com.condominiun.smart`.

El resultado de compilación o de pruebas unitarias no demuestra que este recorrido Android haya pasado. Consultar el [informe de ejecución](../../documentacion/seguridad/PRUEBA_INTEGRACION_ANDROID_ROLES.md).
