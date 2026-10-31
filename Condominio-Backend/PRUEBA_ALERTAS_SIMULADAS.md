# Prueba simulada de alertas de seguridad

Se continuó con una prueba automatizada sin modificar el dispositivo asociado a otra cuenta y sin enviar mensajes a Firebase. Los datos del backend se crearon exclusivamente en una base SQLite en memoria y se eliminaron al terminar la ejecución.

La nueva prueba de integración registra un evento ficticio, crea una entrega para un dispositivo ficticio del guardia, comprueba que el dispositivo ficticio de un propietario no reciba la alerta, reserva la entrega y sustituye la llamada a Firebase por una simulación. Verifica que los datos del mensaje contienen solamente el tipo y los identificadores de evento y notificación, y que el texto privado del evento no se incluye en el cuerpo. El estado `ENVIADA` observado en esta prueba representa únicamente la respuesta simulada; no significa que Firebase ni un teléfono hayan recibido nada.

Pasaron 78 pruebas del backend y 29 pruebas Flutter de bandeja, permisos, dispositivos y navegación con respuestas simuladas. Las pruebas móviles incluyen el rechazo de roles residentes y la apertura de la bandeja desde un aviso simulado. No se generó ninguna alerta visible en el teléfono por esta ejecución y no se ha comprobado recepción push real.

El teléfono de prueba conserva el conflicto de titularidad documentado en `PREPARACION_PRUEBA_MOVIL_REAL.md`; no se cambió ni se desactivó el dispositivo de la otra cuenta. Para verificar un push real será necesario un dispositivo propio disponible o un procedimiento de cambio de cuenta expresamente autorizado y probado, seguido de una autorización específica para el envío.
