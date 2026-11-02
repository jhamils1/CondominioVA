# Revisión de tiempos, clientes y respaldo para transición FCM

Fecha: 2026-10-31 (America/La_Paz). El usuario aprobó revisar estos puntos antes de incorporar el parche. **Resultado: no incorporar ni activar todavía la propuesta**, porque se reprodujo una carrera de cierre de sesión en la copia aislada.

## Tiempo de espera y carrera de cierre

El registro móvil espera hasta cinco segundos por la respuesta HTTP. El SDK Firebase Admin instalado es 7.1.0 y su tiempo HTTP predeterminado es 120 segundos si no se configura `httpTimeout`; el código revisado no lo configura explícitamente. El servidor habitual ya iniciado puede tener otro entorno no verificado. Una validación real anterior tardó 2058 ms, pero es una sola observación, no un límite garantizado. [Referencia oficial de Firebase Admin](https://firebase.google.com/docs/reference/admin/python/firebase_admin).

El tiempo de espera de Dart deja de esperar la respuesta, pero la operación original puede completar después. [Referencia oficial de Dart](https://api.dart.dev/dart-async/Future/timeout.html). La [prueba móvil](../../condominio-movil/test/fcm_timeout_race_test.dart), con un servidor simulado lento, confirmó que la app devuelve fallo y conserva el identificador anterior y el candidato pendiente aunque la respuesta llegue después.

En un PostgreSQL temporal, con dos solicitudes HTTP concurrentes, una cuenta autorizada ficticia y Firebase simulado, se reprodujeron dos órdenes:

1. La sincronización queda esperando validación; la baja del identificador todavía inexistente devuelve éxito; se revoca la sesión; termina la sincronización y crea un dispositivo activo.
2. La baja devuelve éxito; termina la sincronización y crea el dispositivo; después se revoca la sesión. El dispositivo permanece activo.

Ambos son **defectos reproducidos de la propuesta aislada**, no pruebas de que haya ocurrido con una cuenta o teléfono real. El ejecutor y las pruebas diagnósticas se conservan en la copia ignorada `Condominio-Backend/backups_locales/proveniencia_fcm_aislada_20261031/`. Las pruebas se diseñaron para evidenciar el comportamiento inseguro; que terminen en verde **no significa que el comportamiento sea correcto**. No se ejecutó ningún envío real.

El cierre móvil intenta desregistrar antes de llamar al logout. El backend comprueba la sesión al comienzo de la solicitud y el rol de nuevo antes de guardar, pero la propuesta no coordina la operación completa de baja, sincronización y revocación. Revalidar la sesión solo al final impediría el primer orden, pero no necesariamente el segundo. Aumentar el timeout tampoco corrige la carrera.

Además, `FCMService.initialize()` instala los manejadores de mensajes después de solicitar permiso, obtener el identificador y posiblemente registrar el dispositivo. Conviene comprobar con red lenta si esto retrasa el tratamiento inicial de avisos; esta revisión está basada en código y no demuestra pérdida de notificaciones.

## Compatibilidad observada

- El código Flutter actual utiliza `devices/sincronizar/` y `devices/desregistrar/`. En las fuentes web examinadas no aparecieron llamadas a las rutas de dispositivos. Esto no identifica clientes externos o versiones anteriores que no estén en el repositorio.
- La APK habitual instalada en el teléfono se inspeccionó **solo en memoria**, sin leer datos privados ni guardar una copia. Contiene indicios de las cadenas de sincronización y desregistro y del identificador Firebase anterior; no se encontró el identificador nuevo en los binarios inspeccionados. Esto orienta la revisión, pero la búsqueda de cadenas no demuestra por sí sola qué rutas se ejecutan ni la configuración efectiva en todos los escenarios.
- La propuesta bloquea las rutas genéricas anteriores de creación y edición. Cualquier cliente que todavía las necesite debe actualizarse o contar con una transición compatible y segura. No se ha confirmado la compatibilidad de todos los teléfonos ni de iOS.
- El registro sigue rechazando la reasignación de tokens que pertenecen a otra cuenta. La identidad del propietario anterior del teléfono sigue sin establecerse; no usar la transición para saltar ese bloqueo.

## Respaldo realizado

Se creó `Condominio-Backend/backups_locales/respaldo_fcm_20261031_225449_a6f2f26c.dump` mediante `pg_dump` de la base PostgreSQL local configurada para un proceso diagnóstico nuevo. Se utilizó una instantánea exportada y se restauró en una instancia PostgreSQL temporal con credenciales ficticias. Coincidieron los recuentos de las **40 tablas públicas** entre la instantánea de origen y la restauración. Se verificó el archivo y su huella:

`SHA-256: 60a5500c24d0d2014bacc9496c74c997c5aad97e470465aa13bafaac0b89fd1e`

La instancia temporal y su copia de datos se retiraron; el archivo `.dump` permanece en la carpeta ignorada por Git. **Contiene información privada de la base**, incluidos registros de usuarios y dispositivos: conservarlo con acceso restringido y no subirlo ni compartirlo. No se ha verificado cifrado adicional ni una política específica de permisos de archivo.

Este respaldo refleja la base al inicio de su instantánea; no contiene cambios posteriores. No se ha demostrado que el proceso Django que ya escucha en 8000 use la misma configuración de base. El respaldo no incluye código, archivos multimedia, `.env`, claves privadas ni servicios externos. Se restauró con `--no-owner --no-acl` en una instancia con permisos de administración: no comprueba la restauración de propietarios y privilegios originales. Comparar recuentos tampoco garantiza por sí solo igualdad de cada valor. Antes de cualquier incorporación real se debe identificar la base y procesos efectivos, realizar un respaldo actualizado y validar también permisos y demás archivos necesarios.

El primer intento del ejecutor falló antes de crear el respaldo por la ruta de importación; se corrigió en el ejecutor local y el segundo terminó correctamente. El script de revisión permanece en `Condominio-Backend/backups_locales/revision_respaldo_fcm.py` y está ignorado por Git.

## Siguiente etapa propuesta

1. Diseñar e implementar en la copia aislada un protocolo de cierre y registro coordinado por sesión. Debe impedir ambos órdenes reproducidos, incluso si una baja ocurrió antes de que existiera el dispositivo, y conservar dispositivos y sesiones ajenos. Evaluar una transición de sesión a estado de cierre o generación de operación, bloqueos y orden consistente con logout y refresh; no asumir que un solo filtro de sesión o un aumento de timeout basta.
2. Añadir pruebas de concurrencia PostgreSQL para ambos órdenes, dos teléfonos de la misma cuenta, cuentas diferentes, token ajeno, respuestas perdidas, repetición, revocación y caída de red. Las pruebas diagnósticas actuales deben invertirse para exigir que no quede un registro activo tras el cierre coordinado.
3. Definir y probar límites de espera y carga en cliente y backend con mediciones; garantizar que un timeout no se presente como una baja confirmada. Revisar el inicio de los manejadores FCM bajo red lenta sin interrumpir la autenticación.
4. Volver a validar la propuesta con la app y Firebase aislados y, separadamente, acordar la compatibilidad de clientes antiguos. Identificar el proceso/base habituales y preparar un respaldo actualizado y restaurable antes de una migración o despliegue autorizados.

## Comprobaciones realizadas

Dos pruebas diagnósticas reprodujeron las carreras en PostgreSQL temporal con Firebase simulado. Pasaron 26 pruebas Flutter relacionadas, incluida la nueva prueba del timeout, y el analizador de Flutter no encontró problemas en ella. El respaldo se restauró y se compararon recuentos; el temporal se retiró. `git apply --check` confirmó que el parche anterior sigue aplicable, pero **contiene el problema descrito** y no debe aplicarse todavía. No se modificaron datos habituales, sus dispositivos, el servidor en ejecución, sus variables ni la app instalada.
