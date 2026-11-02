# Prueba de integración Android de roles y revisión Firebase

Fecha: 2026-10-31. Continuación solicitada por el usuario después de confirmar con capturas el inicio de sesión de `guardia_prueba` y `admin` en la aplicación habitual. Las capturas muestran nombres, roles y menús diferentes; no certifican recepción push ni todas las autorizaciones de API.

## Preparado y comprobado

- Nueva prueba `condominio-movil/integration_test/roles_personalizados_test.dart` y controlador `test_driver/integration_test.dart`. Utilizan el formulario, navegación, consulta y cierre de sesión de la app, almacenamiento seguro nativo y un servidor Django temporal. El test no acepta la configuración normal.
- Runner temporal ampliado con elección explícita de puerto `18080` para Android o `18081` para web y un identificador de entorno expuesto únicamente en su URLConf temporal. No se añadieron rutas a la API habitual.
- Dependencia de desarrollo `integration_test` del SDK Flutter, con siete incorporaciones de desarrollo/transitivas en el lockfile. No se actualizaron dependencias previas.
- Escenario HTTP de 26 solicitudes aprobado tras el cambio del runner; directorio y servidor de esa comprobación eliminados.
- Regresión móvil: 71 pruebas correctas, 2 omitidas por configuraciones alternativas ya verificadas en la etapa previa. Análisis de los archivos de integración/controlador sin observaciones.
- APK aislada compilada. Se comprobó `com.condominiun.smart.prueba`, nombre visible de prueba y ausencia de `FirebaseInitProvider`, `FlutterFirebaseMessagingInitProvider`, `FlutterFirebaseMessagingReceiver` y `FirebaseInstanceIdReceiver` en su manifiesto.

## Ejecución Android: aprobada en teléfono autorizado

El emulador existente se inició sin ventana, sin guardar snapshots y en modo de solo lectura. Hubo dos arranques; el segundo limitó memoria a 1536 MB y dos núcleos después de detener la primera instancia. Android no terminó de arrancar. `flutter drive` rechazó instalar el APK con `device is still booting` en sus tres intentos. El test no llegó a ejecutarse en el emulador. Se cerró esa instancia y se detuvo el Gradle inactivo para liberar recursos.

Se propuso usar la variante separada en el teléfono conectado. La revisión automática rechazó inicialmente cambiar su enlace de red y ejecutar allí la prueba sin una autorización específica de sustitución del emulador. El usuario respondió **«Sí, autorizo la prueba aislada en mi teléfono»**, incluyendo instalación, enlace `18080` y retirada posterior. Solo entonces se procedió.

Se ejecutó `flutter drive` con el APK aislado ya verificado, seleccionando explícitamente el teléfono autorizado. **Un escenario funcional integral aprobado**, con salida final `All tests passed` y código 0. El contador adicional de `tearDownAll` es del framework, no otra prueba funcional. El recorrido ejecutado en Android duró aproximadamente once segundos después de instalar y conectar el controlador.

Se comprobó:

1. Creación/activación/asignación mediante API administrativa del rol ficticio, inicialmente sin capacidad.
2. Inicio de sesión desde el formulario real y persistencia de access/refresh en almacenamiento seguro nativo de la app aislada.
3. Ausencia de menús no autorizados y rechazo 403 de visitas, usuarios y dispositivos.
4. Concesión del permiso, actualización del menú y lectura de la visita ficticia en la pantalla Android.
5. Revocación del permiso con sesión abierta: actualizar la lista muestra denegación y retira los datos antes visibles.
6. Cierre desde el menú, eliminación local de los tokens y rechazo del access anterior; desactivar el rol rechaza access y refresh de otra sesión válida.

No se probó entrega push: se verificó precisamente que FCM permanezca deshabilitado en esta variante. Los cambios administrativos se hicieron por API en la base temporal; este resultado no sustituye el recorrido interactivo React en navegador.

### Limpieza verificada

Flutter retiró la instalación aislada al finalizar; un intento adicional de desinstalarla devolvió `DELETE_FAILED_INTERNAL_ERROR`, y se comprobó después que solo permanece `com.condominiun.smart`. Su fecha de actualización continúa siendo 16:50:57, igual que antes de la prueba. Se retiró exclusivamente el enlace `18080`; continúa `8001 -> 8000` para la aplicación habitual.

Ctrl+C del terminal automatizado no detuvo el servidor. Se identificó su proceso y carpeta de esta ejecución, se detuvo ese proceso y se eliminó únicamente su directorio temporal, verificando previamente que estaba dentro del destino temporal esperado. El primer intento de limpieza desde un contexto distinto no podía leer la carpeta; se completó desde el mismo contexto que la creó. La base habitual y otras carpetas no se modificaron. No quedaron roles o cuentas ficticios de esta prueba en la base local del proyecto.

Durante la preparación, `flutter pub get --offline` resolvió las dependencias desde el SDK/caché, pero terminó con un error de enlaces simbólicos de Windows. No se cambió el modo de desarrollador de Windows. El análisis y la compilación Android posterior con `--no-pub` sí terminaron correctamente. Este resultado no valida una compilación Windows.

Los pasos reproducibles y el alcance del test están en [su guía](../../condominio-movil/integration_test/README.md). La APK que ahora ocupa la ruta de salida de build es la aislada; la aplicación habitual instalada en el teléfono no se reemplazó.

## Firebase

Se examinaron solo los identificadores de proyecto de los archivos locales habituales: configuración Android, opciones Flutter y credencial de servidor. Coinciden en el mismo proyecto. No se encontraron configuraciones separadas de prueba en el proyecto ni herramientas Firebase/gcloud instaladas en PATH para consultar proyectos de la cuenta. El usuario indicó que no recuerda si existe otro proyecto.

Esto no prueba que un proyecto separado no exista en la cuenta de Google: **no se consultó la consola cloud**. No se imprimieron claves, no se inicializó Firebase para la prueba y no se enviaron mensajes. La variante actual está diseñada para omitir FCM, por lo que tampoco sirve como prueba de entrega push.

Para continuar con push debe identificarse o crearse el proyecto de pruebas y preparar una variante específica conectada a él, con backend/base y destinatario aislados, conforme al [plan existente](../../Condominio-Backend/PLAN_COMPATIBILIDAD_FIREBASE_AISLADO.md). No reutilizar el registro del teléfono asociado a una cuenta previa desconocida.
