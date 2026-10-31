# Cambio de cuenta: persistencia y auditoría preparadas

## Alcance

Se preparó un almacén de estado para la coordinación de cambio de cuenta usando la dependencia existente `flutter_secure_storage`. Guarda una estructura versionada y valida sus campos y fases al leer o escribir. Si encuentra datos corruptos, falla y no los interpreta como un cambio inexistente. Se mantienen los resultados inciertos como pendientes, sin repetir automáticamente la invalidación ni continuar con el registro nuevo.

Este almacén no está conectado a la interfaz, a Firebase ni al coordinador de producción. Todavía no existe una operación de reconciliación para una invalidación incierta: el proceso queda bloqueado. Las pruebas emplean la plataforma simulada del complemento, no el almacenamiento Android real. Recrear una instancia con el mismo simulador no demuestra persistencia ante reinicios del teléfono ni confirma garantías de escritura atómica del sistema operativo.

Las acciones `sincronizar` y `desregistrar` del backend ahora registran en el historial administrativo existente la creación, reactivación y desactivación efectivas de dispositivos. Se anota el actor, un identificador interno del registro y una descripción genérica, sin token ni contenido de notificaciones. La auditoría y el cambio se ejecutan en la misma transacción. Las repeticiones sin cambio no crean registros adicionales. Las rutas tradicionales de creación y edición del viewset no están cubiertas por esta auditoría y deben revisarse antes de considerar el historial completo.

## Verificación

- Flutter: 21 pruebas con servicios y almacenamiento simulados, incluyendo recuperación entre instancias, estado corrupto, progreso inválido, reintentos y aislamiento de cuentas.
- Django: 80 pruebas sobre una base SQLite temporal en memoria, incluyendo auditoría mínima, repetición idempotente, reversión ante fallo de auditoría y rechazo de dispositivo ajeno. No se consultó ni cambió la base real.
- No se realizaron llamadas a Firebase, instalaciones, pruebas en el teléfono ni envíos de notificaciones.

## Pendientes antes de integrar o probar en un dispositivo real

1. Verificar almacenamiento y recuperación tras reinicios reales en un dispositivo de prueba autorizado; definir retención y eliminación del estado completado sin perder una baja pendiente.
2. Coordinar todas las instancias y la renovación de tokens. El bloqueo actual solo serializa operaciones de una instancia del coordinador, no procesos ni clientes distintos.
3. Determinar cómo comprobar e invalidar de forma segura el token actual frente a renovaciones concurrentes; no asumir que el SDK ofrece una operación atómica de comparación e invalidación. Diseñar la recuperación de resultados inciertos.
4. Completar la cobertura de auditoría en los demás caminos de modificación de dispositivos y verificar concurrencia sobre PostgreSQL aislado; SQLite no prueba sus bloqueos.
5. Incorporar interfaz de consentimiento y adaptadores reales solo después de revisar esos límites. Sin acceso y autorización de la cuenta anterior, mantener su dispositivo intacto y las notificaciones internas de la nueva cuenta disponibles.
