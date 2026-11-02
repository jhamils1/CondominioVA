# Inicio de notificaciones móviles con red lenta: prueba aislada

**Actualización:** la [prueba integrada posterior](PRUEBA_INTEGRADA_INICIO_FCM.md) compiló, pero Android rechazó instalar la variante y no se envió ningún aviso.

Fecha: 2026-11-01 (America/La Paz). Etapa aprobada para revisar y ensayar en una copia aislada. No está desplegada.

## Hallazgo y propuesta

El servicio Flutter de la aplicación habitual inicializa las notificaciones locales, solicita permiso y espera el token y una posible sincronización antes de instalar los manejadores de mensajes y de actualización del token. Si esas esperas demoran, los manejadores también se instalan tarde; la revisión no demuestra que Firebase haya perdido un mensaje real.

En la copia ignorada `Condominio-Backend/backups_locales/movil_notificaciones_aislada_20261101/` se preparó un coordinador de inicio que primero espera la preparación local, después instala los manejadores y finalmente solicita permiso y obtiene/registra el token. Impide instalaciones duplicadas en llamadas repetidas y permite un reintento explícito después de un error sin repetir los manejadores ya instalados. La preparación local sigue siendo previa a los manejadores para no mostrar un aviso antes de que esté listo el canal local.

No se implementó un reintento automático, ni se modificó el tiempo de espera, ni se alteraron cuentas o destinatarios. El registro que responde con `false` se conserva como comportamiento existente y no se trata como excepción por el coordinador. Un fallo al inicializar el componente local o una inicialización local que no termine pueden seguir retrasando los manejadores. Una prueba simulada del coordinador no equivale a una prueba integral del complemento Firebase, Android o iOS.

## Resultados

Cinco pruebas del coordinador comprueban mensajes simulados mientras permiso o red están pendientes, permiso fallido, llamadas repetidas, preparación local y reintento explícito sin duplicados. En conjunto con pruebas existentes de timeout, registro y navegación pasaron **21 pruebas Flutter**; el análisis estático de los tres archivos modificados/de prueba no encontró problemas.

La prueba previa del timeout simula que Flutter deja de esperar a los cinco segundos, conserva el identificador pendiente y recibe después una respuesta de éxito del servidor. No demuestra cancelación real de la solicitud. El backend inicializa Firebase sin fijar `httpTimeout`; el SDK instalado indica 120 segundos de valor por defecto y reintentos. No se ha definido un presupuesto total de tiempo, ni medido una red real; el cambio global de opciones podría afectar otros usos de Firebase y requiere evaluación propia.

Los primeros intentos de comandos Flutter dentro del aislamiento de ejecución quedaron sin salida y se interrumpieron; al usar el SDK local con permisos elevados, las pruebas y el analizador terminaron correctamente. `flutter pub get --offline` creó configuración de paquetes antes de ser interrumpido; los comandos posteriores se ejecutaron con `--no-pub` y finalizaron con código 0.

## Límites y siguiente trabajo

No hubo teléfono, Firebase real, notificaciones enviadas ni cambios en la aplicación instalada, backend habitual, base o sus credenciales. La copia incluye fuentes y recursos de la aplicación, está ignorada por Git y no es un commit. El parche de procedencia FCM previo sigue desactualizado y no debe aplicarse.

Falta probar el inicio integrado con complementos y notificaciones reales en variante aislada, tanto en primer plano como al abrir desde segundo plano o proceso terminado; evaluar el reintento y errores parciales de instalación; definir tiempos coordinados entre móvil, backend y proveedor con mediciones; y resolver la transición de dispositivos y clientes. El funcionamiento simulado no garantiza la entrega ni la navegación en el teléfono habitual.
