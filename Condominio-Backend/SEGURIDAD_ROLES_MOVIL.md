# Perfil y navegación móvil por rol

## Cambios

La aplicación móvil obtiene el usuario y el rol efectivo desde `GET /api/me/`, usando el token almacenado en el almacenamiento seguro existente. Ya no muestra el perfil ficticio que devolvía el servicio anterior. La respuesta se valida y solo se aceptan los cuatro roles reconocidos. Como el endpoint actual no devuelve correo ni nombre completo, el perfil muestra el nombre de usuario y el rol, sin inventar esos datos.

Los menús existentes y las rutas nombradas se filtran con una misma política. Administrador puede abrir el dashboard financiero; guardia puede acceder a reconocimiento facial, pero no a expensas ni dashboard; propietario puede consultar expensas propias; inquilino no accede a expensas ambiguas; ambos residentes quedan fuera del reconocimiento facial y del dashboard financiero. La política también cierra rutas desconocidas y roles desconocidos. Las rutas vuelven a consultar el perfil antes de abrirse, y el menú lo consulta nuevamente al abrirse. Si la consulta falla, no se muestra la pantalla protegida y se permite reintentar.

Estos controles son de interfaz: el backend continúa validando cada solicitud. Si el rol cambia mientras una pantalla ya está abierta, la navegación se actualiza al volver a comprobarlo; las peticiones protegidas dependen de la autorización vigente en Django. La app requiere conectividad con el backend para verificar el perfil; no se ha implementado una sesión offline. Un token vencido exige volver a iniciar sesión, pues no se añadió renovación automática.

## Límites

- La app aún no tiene un panel móvil de eventos, incidencias o historial de alertas. La recepción push real y la navegación al tocar una notificación siguen pendientes de prueba e implementación.
- Las opciones anteriores de editar perfil y cambiar contraseña no se rediseñaron: el editor actual muestra una confirmación simulada y la pantalla de contraseña usa un flujo antiguo sin endpoint verificado y espera un argumento. No deben considerarse funcionalidades completas.
- No se probó la aplicación en un teléfono, con la base del proyecto, ni con Firebase real. La dirección del backend sigue configurada en código y debe coincidir con el entorno del dispositivo.
- Se resolvieron dependencias ya registradas en el lockfile y presentes en caché mediante `flutter pub get --offline --enforce-lockfile`. El comando terminó con código 1 porque Windows requiere soporte de enlaces simbólicos para plugins; no se cambió la configuración del sistema ni se modificaron `pubspec.yaml` o `pubspec.lock`. El análisis y las pruebas indicados sí pudieron ejecutarse. No se ha validado una compilación de plataforma.

## Pruebas

`flutter test --no-pub test/protected_route_test.dart test/current_user_service_test.dart test/perfil_roles_test.dart`: 14 pruebas superadas con HTTP y perfiles simulados. Cubren los cuatro menús, sesión ausente, 401/403, desconexión, respuestas inválidas, rutas restringidas, reintento y cambio de rol al abrir el menú. Una prueba Dart independiente verifica también la matriz de roles. `flutter analyze --no-pub` sobre los 10 archivos y pruebas modificadas pasó sin observaciones. Las 63 pruebas del backend se ejecutaron nuevamente en SQLite temporal y pasaron; no se usaron datos reales ni se enviaron mensajes.

## Archivos

Creados: `condominio-movil/lib/security/access_policy.dart`, `protected_route.dart`, `test/access_policy_standalone.dart`, `test/protected_route_test.dart`, `test/current_user_service_test.dart`, `test/perfil_roles_test.dart` y este informe. Modificados: `condominio-movil/lib/config/api_config.dart`, `lib/services/auth_service.dart`, `lib/pages/perfil_page.dart`, `lib/main.dart`, la guía general y la nota histórica de fase 8. No se modificó el backend ni se aplicaron migraciones a la base del proyecto.
