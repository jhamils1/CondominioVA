# Backend y base temporales para probar la bandeja

## Preparación

Se agregó `administracion.run_isolated_inbox`: inicia Django con una base SQLite nueva dentro de un directorio temporal, configura una clave de sesión temporal e impide inicializar Firebase. Desactiva la cola y el envío FCM y bloquea las conexiones salientes del proceso que no apunten a `127.0.0.1`.

La configuración de rutas de este entorno solo expone inicio y cierre de sesión, consulta del usuario, lista y lectura de notificaciones, y detalle de eventos. No expone las rutas de dispositivos, reconocimiento ni administración. Crea dos guardias activos, un propietario y un evento ficticio; cada ejecución genera una contraseña temporal distinta. Los datos y la base temporal se descartan al detener el proceso normalmente.

El modo de servidor preparado escucha únicamente en `127.0.0.1:18080`, la dirección configurada para la variante Android aislada. Se ofrece para una etapa de prueba posterior, pero **no se dejó ningún servidor ejecutándose** ni se conectó un dispositivo. El puerto estaba disponible durante la comprobación; esto puede cambiar.

## Pruebas y resultados

Se ejecutó el modo automático, que levantó un servidor HTTP local en un puerto temporal, efectuó solicitudes reales contra ese servidor y lo detuvo. Comprobó:

- Inicio de sesión de las tres cuentas ficticias, rechazo de una contraseña incorrecta y denegación sin sesión.
- Una notificación independiente para cada guardia por el mismo evento.
- Consulta del detalle por el guardia y lectura individual: la alerta del segundo guardia permanece sin leer.
- Denegación del propietario a la bandeja y al detalle de seguridad, y rechazo cuando un guardia intenta marcar la notificación del otro.
- Ausencia de la ruta de dispositivos y de elementos en la cola push. Una conexión externa simulada fue bloqueada antes de salir del proceso.

Las 82 pruebas de regresión del backend también pasaron en SQLite en memoria. En el primer intento, el ejecutor antiguo leyó un valor `DEBUG` no booleano del entorno y se detuvo; la repetición se ejecutó con `DEBUG=False` únicamente para ese proceso y pasó. No se modificó el archivo de configuración del usuario.

## Repetición y límites

Desde `Condominio-Backend`, ejecutar `env\Scripts\python.exe -B -m administracion.run_isolated_inbox` para la prueba automática. El comando con `--serve` prepara el servidor temporal y muestra credenciales **ficticias y efímeras** en la terminal; `Ctrl+C` lo detiene. No debe utilizarse para datos reales ni exponerse en red. La base y el secreto cambian en cada ejecución.

La prueba verificó la API local, no la interfaz Flutter ni el tráfico en un dispositivo. SQLite y el servidor WSGI de demostración no sustituyen una configuración de producción. No se crearon proyectos Firebase, no se enviaron notificaciones, no se usó la base del proyecto ni se accedió al teléfono.

Una etapa posterior puede compilar la variante de prueba y verificarla en un emulador autorizado, confirmando que el puente de red apunta al servidor aislado y que no hay tráfico Firebase. Las pruebas con un teléfono físico o un proyecto Firebase requieren su aprobación correspondiente.
