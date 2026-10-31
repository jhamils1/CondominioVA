# Pruebas aisladas de concurrencia de dispositivos en PostgreSQL

Se ejecutaron seis escenarios contra PostgreSQL 17.6 en una instancia temporal nueva. El ejecutor creó un directorio temporal y una contraseña aleatoria, inició un servidor en un puerto local libre, verificó que el directorio de datos coincidiera con el temporal, aplicó las migraciones y detuvo el servidor al finalizar. No utilizó la instancia PostgreSQL existente ni la base del proyecto. Firebase fue simulado y no se accedió al teléfono.

## Resultados

Las seis pruebas pasaron:

1. Dos cuentas intentaron registrar el mismo token inexistente; solo una lo consiguió.
2. Una cuenta usó la ruta antigua y otra la sincronización para el mismo token inexistente; solo una lo consiguió.
3. Una cuenta dio de baja su token mientras otra intentaba registrarlo; el registro permaneció desactivado y con su propietario original.
4. La misma protección se comprobó con la ruta antigua de eliminación.
5. Una cuenta ejecutó simultáneamente una baja y una sincronización; ambas solicitudes terminaron y se mantuvo un solo registro propio. El estado final depende del orden de las operaciones.
6. Dos cuentas intentaron hacer rotaciones que afectaban al token de la otra; ambas solicitudes fueron rechazadas y los registros conservaron su propiedad y estado.

En las dos primeras pruebas se utilizó una barrera después de las consultas de bloqueo para reproducir que ambas solicitudes vieran inicialmente un token inexistente. Las otras pruebas arrancan simultáneamente, aunque el sistema operativo y PostgreSQL determinan su orden interno. Los rechazos 400 en los resultados son esperados.

## Alcance y limitaciones

Las pruebas verifican las rutas y escenarios indicados con dos hilos y una base recién creada; no prueban todas las posibles intercalaciones, carga sostenida, otros clientes o modificaciones directas desde el administrador de Django. La restricción única del token, los bloqueos por cuenta y la desactivación lógica contribuyen al comportamiento observado.

No se resolvió la recuperación de una invalidación Firebase de resultado incierto ni se validó la persistencia segura en Android real. La coordinación móvil sigue desconectada del flujo real y su bloqueo no cubre múltiples procesos. El uso de tokens en las URL de rutas antiguas continúa pendiente de migración.

Para repetir estas pruebas en esta instalación, ejecutar desde `Condominio-Backend`: `env\Scripts\python.exe -B -m administracion.run_device_postgres_isolated`. Requiere PostgreSQL 17 en la ruta indicada por el ejecutor, permisos para crear una instancia temporal y conexiones a su puerto de bucle local; no necesita credenciales de la base del proyecto. El ejecutor siempre crea su propia instancia y comprueba su directorio de datos antes de migrar.
