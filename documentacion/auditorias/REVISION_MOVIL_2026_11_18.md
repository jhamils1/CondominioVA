# Revisión de la aplicación móvil

Fecha: 2026-11-18. Alcance: revisión estática de funciones principales, API de seguridad y ejecución de pruebas Flutter con proveedores simulados. No es una auditoría exhaustiva de todos los servicios ni una prueba integral con cuentas reales.

## Resultados

- `flutter test --no-pub --reporter expanded`: 109 pruebas aprobadas y dos omitidas. Incluyen roles, navegación, sesión, incidencias y registro FCM simulado.
- `flutter analyze --no-pub`: 56 observaciones, incluidas advertencias de importaciones sin uso y avisos de código obsoleto; terminó con código 1.
- Django respondió a `/api/me/` con 401 sin autenticación. ADB no detectó teléfono durante la revisión, pese a que el usuario informó haberlo conectado. No se instaló ni ejecutó la app en dispositivo.

## Hallazgos

1. Privacidad: `condominio-movil/lib/services/recognition_service.dart` y `lib/pages/reconocimiento_facial_page.dart` imprimen respuestas y resultados de reconocimiento; `lib/services/expensa_service.dart` imprime cuerpos de error de pagos. Pueden incluir datos sensibles en registros. Se recomienda retirar esos mensajes o reducirlos a códigos no sensibles.
2. Conectividad: `lib/config/api_config.dart` usa una dirección LAN fija por defecto; para USB la compilación debe definir `API_BASE_URL=http://127.0.0.1:8001/api` y ADB debe enlazar ese puerto con el 8000 de Django. El permiso HTTP para loopback citado corresponde a la variante debug, no acredita una distribución final.
3. Notificaciones: login intenta registrar el dispositivo, pero permite iniciar sesión si el registro falla y muestra un aviso temporal. En la sesión anterior el usuario recibió un aviso en otro teléfono; no se confirmó registro ni recepción en el teléfono conectado entonces. La navegación de push abre la lista, no el detalle específico.
4. Incidencias: el móvil permite confirmar eventos pendientes para el guardia, pero descartar, atender y resolver permanecen en la web según la política documentada. La lista actualiza cada 30 segundos con la pantalla visible; no es tiempo real continuo.
5. Acceso: las rutas Flutter verifican perfil y rol; las vistas de eventos de Django aplican `SecurityOperator`. La existencia del control y las pruebas simuladas no certifican todos los escenarios de permisos y datos reales.
6. El inicio de sesión en `lib/services/auth_service.dart` no establece un tiempo límite en la petición HTTP; puede quedar esperando si la red no responde. No se validó la duración real de esa espera.

No se modificaron cuentas, configuraciones de Firebase, datos, ni código de la aplicación. Sigue pendiente probar en el teléfono autorizado los recorridos de inicio de sesión, funciones por rol y recepción y apertura de push, sin usar datos o envíos reales fuera del alcance autorizado.
