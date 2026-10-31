# Revisión de alertas de seguridad en el móvil

> Actualización: posteriormente se implementó una bandeja móvil de consulta de alertas y se mejoró el ciclo de vida del registro de dispositivos. Consulta `SEGURIDAD_BANDEJA_MOVIL.md` y `SEGURIDAD_DISPOSITIVOS_MOVIL.md` para el estado actual; el resto de este documento conserva la revisión anterior.

## Estado revisado

El backend ya crea notificaciones internas para cada guardia activo cuando se registra un evento pendiente, y para administradores al confirmar una incidencia. Existe una cola de entrega por dispositivo y un comando de procesamiento separado. Las migraciones necesarias están aplicadas en PostgreSQL local. Las pruebas del backend usan Firebase simulado: 74 pruebas pasaron en SQLite temporal durante esta revisión.

La aplicación Flutter solicita permisos, intenta obtener el identificador FCM y registrar el dispositivo después del inicio de sesión; también tiene código para mostrar un aviso local en primer plano. Android incluye el permiso de notificaciones. Pasaron 18 pruebas Flutter existentes de perfil, permisos y cierre de sesión; no prueban recepción FCM. No se ha verificado el funcionamiento en un teléfono real ni se ha enviado un aviso real.

La base local consultada en modo de solo lectura tenía **cero dispositivos FCM activos asociados a `guardia_prueba`** y cero entregas de seguridad pendientes. La configuración persistente mantiene desactivadas las opciones de notificaciones de seguridad, cola y envío. La instancia temporal del backend en el puerto 8001 habilita solo las notificaciones internas, mantiene la cola y el envío desactivados y se inició sin credenciales funcionales de Firebase. La alerta ficticia usada en la web ya se resolvió y no generó entrega FCM; no se enviará automáticamente cuando se active la cola.

## Lo que falta o necesita corrección

1. **Pantallas móviles de seguridad.** No existe una pantalla de historial o detalle de alertas en Flutter. Al tocar un aviso, el código solo imprime información y no navega a una pantalla protegida. Es necesario consumir las API existentes, controlar estados de carga/error y validar rol y autorización en el servidor antes de abrir detalles. Propietarios e inquilinos deben permanecer fuera.
2. **Registro y ciclo de vida del dispositivo.** Falta probar alta, permisos rechazados, cambio de cuenta, desconexión y rotación de token en teléfonos. Al renovar el token, el código guarda el nuevo antes de comprobar su registro y no desactiva explícitamente el anterior; un fallo puede dejar dispositivos antiguos activos. Si la baja al cerrar sesión falla, el dispositivo también puede quedar registrado. No se debe reasignar silenciosamente un dispositivo de otra cuenta.
3. **Información de diagnóstico.** El servicio Flutter imprime títulos y cuerpos de avisos recibidos. Algunas notificaciones financieras antiguas contienen datos personales y montos, por lo que conviene sustituir esos mensajes de depuración por registros genéricos sin contenido ni tokens. El inicio de sesión también muestra excepciones de registro FCM en la consola.
4. **Conectividad y configuración.** La URL del backend móvil está fijada en el código a una dirección de red local y al puerto 8000. El backend de prueba para seguridad está ligado a `127.0.0.1:8001`, accesible solo desde el propio equipo; un teléfono físico no puede conectarse a esa dirección del equipo mediante `127.0.0.1`. Antes de una prueba real hay que preparar una dirección accesible desde el dispositivo y verificar el entorno, sin publicar innecesariamente el servicio. FCM requiere internet.
5. **Procesamiento en segundo plano.** Existe `procesar_fcm_seguridad`, pero no hay un servicio programado y supervisado configurado para ejecutarlo periódicamente. La cola solo se crea si está habilitada cuando se genera la notificación. Enviar requiere habilitar los tres indicadores y credenciales Firebase válidas; no deben habilitarse sin una prueba acordada y destinatarios controlados.
6. **Plataforma y entrega.** Android tiene configuración y permiso declarados, pero aún no hay prueba física. La configuración de iOS y APNs debe revisarse y verificarse antes de afirmar que funciona en iPhone. `ENVIADA` significa que Firebase aceptó la solicitud, no que el teléfono mostró el aviso; puede haber duplicados en algunos reintentos. No se ha probado concurrencia de la cola en PostgreSQL.

Los indicadores de seguridad no controlan otros envíos anteriores de la aplicación: por ejemplo, las señales de expensas y objetos perdidos usan FCM por su cuenta. Cualquier prueba con Firebase real debe evitar activar o disparar accidentalmente esos flujos.

## Etapas propuestas

1. Implementar y probar con servicios simulados una bandeja móvil protegida para guardias y administradores, con apertura del detalle y validación de permisos. No activar FCM ni enviar mensajes reales.
2. Corregir y probar la gestión de registro, rotación y baja de dispositivos y los logs, manteniendo los controles de privacidad y de cuentas. Definir el comportamiento cuando la baja o el registro fallen sin conexión.
3. Preparar un entorno de prueba y un dispositivo controlado, comprobar la URL, permisos y credenciales sin exponer secretos, y probar la cola y el trabajador. Cualquier envío real requiere una aprobación específica posterior y un teléfono identificado para la prueba.

Cada etapa termina con pruebas, documentación y aprobación antes de seguir. Esta revisión no modificó la aplicación, las opciones de FCM ni los datos de la base.
