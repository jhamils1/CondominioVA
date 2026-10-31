# Preparación de las migraciones de seguridad

## Aplicación autorizada a la base de desarrollo

Tras la aprobación para continuar, se creó la copia actualizada `backups_locales/condominio_pre_migracion_seguridad_20261030_133950_027650.dump` (114235 bytes), y se comprobó su lectura completa. La copia está excluida de Git y puede contener datos privados; no se ha restaurado este archivo concreto. La prueba de restauración de la copia anterior se describe más abajo.

Se volvió a comprobar el destino local `condominio`, el plan exacto, la ausencia de colisiones y que los tres indicadores de notificaciones y FCM estuvieran desactivados. Se aplicaron únicamente `seguridad_IA.0002` y `seguridad_IA.0003`. Se verificaron el historial, las cuatro tablas, las restricciones de unicidad y el índice de la cola. Después de la operación, Django informó cero migraciones pendientes en esa base.

En la base de desarrollo se realizó una prueba con usuarios, guardias, evento y dispositivo ficticios dentro de una transacción revertida al finalizar. Se comprobó el endpoint de creación e idempotencia, la distribución a guardias activos, unicidad de notificaciones, una cola ficticia sin duplicados, la confirmación de incidencia y la notificación al administrador. Se simularon los puntos de envío y no se enviaron mensajes reales. Aunque se revierten las filas de prueba, las secuencias de PostgreSQL pueden avanzar. No se probó concurrencia real.

Las opciones `NOTIFICACIONES_SEGURIDAD_ACTIVAS`, `COLA_FCM_SEGURIDAD_ACTIVA` y `ENVIO_FCM_SEGURIDAD_ACTIVO` permanecieron desactivadas en la configuración de la base y la aplicación. Durante la prueba se habilitó únicamente la lógica interna dentro del proceso de prueba, con envío desactivado; no se cambió el archivo de configuración. La activación en ejecución y las pruebas con dispositivos reales requieren una etapa y aprobación posteriores.

## Resultado de la prueba aprobada en PostgreSQL

Se creó una copia nueva de la base local en `backups_locales/condominio_antes_seguridad_20261030_133858_140514.dump` (114235 bytes), excluida de Git por la regla de la carpeta. Se comprobó la lectura y se restauró en una base PostgreSQL temporal independiente. La restauración de prueba se hizo sin reproducir propietarios ni privilegios originales; por tanto demuestra que el contenido y esquema se pueden restaurar en ese entorno, no una recuperación completa de permisos. El archivo puede contener datos privados y debe conservarse con acceso restringido.

Sobre esa base temporal se aplicaron correctamente las migraciones 0002 y 0003 y se verificaron las cuatro tablas y el historial. Con datos ficticios en una transacción se comprobaron registro e idempotencia de eventos, distribución a todos los guardias activos, unicidad de notificaciones, creación sin duplicados de entregas FCM simuladas y confirmación de incidencia. No se llamó a Firebase. La prueba no cubre concurrencia real ni recepción en dispositivos móviles.

La base temporal `codex_seguridad_prueba_88e2f5f41e834f9b` se eliminó y se confirmó su ausencia. Inmediatamente después de esa prueba las migraciones aún estaban pendientes en `condominio`; la aplicación posterior aprobada se describe al inicio de este documento.

## Entorno y plan observado

El 30 de octubre de 2026 se consultó en modo de solo lectura la base de desarrollo PostgreSQL local `condominio`. El plan de Django para la migración final de seguridad contiene únicamente, en este orden:

1. `seguridad_IA.0002_eventoseguridad_historialeventoseguridad_and_more`.
2. `seguridad_IA.0003_entregafcmseguridad`.

En el momento de esa revisión, las migraciones todavía no se habían aplicado en la base del proyecto. La aplicación posterior aprobada se describe al inicio. La migración de sesiones de administración ya estaba aplicada; el plan no requería repetirla. Las dependencias registradas de usuario, residencial, seguridad y dispositivos FCM estaban resueltas de acuerdo con el plan de Django.

## Cambios previstos

La migración 0002 crea tres tablas vacías: eventos de seguridad, historial de eventos y notificaciones individuales. Incluye referencias a usuarios y a la tabla de incidencias existente, además de una restricción que evita repetir una notificación del mismo tipo para un mismo evento y destinatario. La migración 0003 crea una cuarta tabla vacía para el estado de entrega FCM, vinculada a las notificaciones y a los dispositivos existentes, con restricción de unicidad e índice para consultar entregas pendientes.

Se examinó el SQL que Django genera para PostgreSQL: crea esas tablas, sus índices y restricciones; no contiene órdenes de borrado ni modificaciones de filas o columnas en tablas existentes. Se verificó que las tablas nuevas y el índice explícito de la cola no existen en el esquema actual, que las tablas `auth_user`, `incidente` y `fcm_django_fcmdevice` tienen el identificador compatible y que el usuario conectado dispone de permisos para crear y referenciar lo necesario, así como para crear una base de prueba. Esta revisión no garantiza por sí sola la ejecución correcta ni cubre cambios posteriores en el entorno.

Las referencias protegidas implican que algunos usuarios, incidencias o eventos con historial relacionado no podrán eliminarse directamente. Las nuevas tablas empiezan vacías: no convierten automáticamente las incidencias antiguas en eventos de seguridad.

## Activación y límites

En la revisión, `NOTIFICACIONES_SEGURIDAD_ACTIVAS`, `COLA_FCM_SEGURIDAD_ACTIVA` y `ENVIO_FCM_SEGURIDAD_ACTIVO` estaban desactivadas. Crear las tablas no activa estos indicadores ni envía mensajes. La futura activación de notificaciones y FCM es un paso distinto que requiere pruebas y aprobación; FCM necesita conexión y no se ha validado en un teléfono real. Tampoco se implementa visión artificial al aplicar estas migraciones.

Se ejecutaron ambas migraciones en SQLite temporal en memoria junto con 74 pruebas de backend; todas pasaron con proveedores simulados. La posterior restauración y las pruebas en PostgreSQL se describen al inicio de este documento; aún falta verificar el bloqueo concurrente y la recuperación de propietarios y privilegios. Antes de modificar la base debe obtenerse una copia actualizada.

## Procedimiento propuesto para una etapa aprobada

1. Confirmar nuevamente el destino `condominio` local, el plan exacto, los indicadores desactivados y las ausencias de colisiones.
2. Crear una copia nueva con `pg_dump`, protegerla por contener datos privados y comprobar su lectura. Preparar y verificar una restauración en una base de prueba independiente, con aprobación para crearla y aplicar allí las migraciones; nunca restaurar sobre `condominio`.
3. Probar las dos migraciones y las restricciones en esa copia aislada, sin enviar FCM ni usar servicios externos; comprobar la recuperación y descartar la base de prueba solo con autorización apropiada.
4. Si las comprobaciones pasan y existe aprobación específica para modificar `condominio`, aplicar únicamente las migraciones 0002 y 0003, verificar tablas, claves, historial y permisos con datos ficticios y transacciones reversibles, y mantener las funcionalidades desactivadas hasta una etapa posterior.

En la revisión inicial no se aplicó ninguna migración persistente; la aplicación posterior se documenta al inicio.
