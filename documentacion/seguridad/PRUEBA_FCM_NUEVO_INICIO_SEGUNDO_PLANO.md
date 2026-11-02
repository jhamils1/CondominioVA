# Notificación con el nuevo inicio móvil en segundo plano

Fecha: 2026-11-01 (America/La Paz). Resultado: **recepción visible confirmada en una variante aislada instrumentada**.

Se compiló la variante de prueba con el coordinador de inicio nuevo y se instaló en el teléfono autorizado. Un servidor Django de la copia aislada usó una base temporal, un guardia ficticio y el proyecto Firebase de prueba. La aplicación registró el único dispositivo ficticio; el controlador confirmó que estaba en primer plano, la envió a inicio y verificó que ya no lo estaba. Luego se generó un único aviso ficticio: Firebase lo aceptó y el usuario confirmó que vio «Seguridad del condominio» en la barra del teléfono. Se detectó además un registro de notificación del paquete de prueba. El escenario Flutter se finalizó y terminó con `All tests passed`.

El escenario usa el controlador de integración Flutter y comprueba recepción visible en segundo plano, no la apertura del aviso ni una app con proceso terminado. No se simuló red lenta en este escenario; la recepción del manejador durante permiso pendiente se comprobó por separado en [primer plano](PRUEBA_INICIO_FCM_REAL_ESPERA.md). La aplicación y la base habituales no se probaron ni se activaron sus envíos.

Se detuvo el servidor temporal, se retiró el enlace USB, se eliminó la base ficticia y el registro temporal de compilación y se comprobó que el puerto 18082 no escuchara. Una consulta posterior no encontró el paquete temporal; no se determinó el mecanismo exacto de su retirada. Las copias y APK de prueba permanecen ignoradas por Git, sin commit. La aplicación habitual no se encontró en comprobaciones previas; no se determinó la causa. El parche antiguo sigue desactualizado y no debe aplicarse.
