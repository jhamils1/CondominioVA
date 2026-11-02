# Apertura push con el proceso de la app cerrado

Fecha: 2026-10-31 (America/La_Paz). Etapa aprobada por el usuario. Resultado: **aprobado en el teléfono autorizado y la variante temporal**.

Se reutilizó la APK debug compilada desde `lib/main.dart`, sin controlador Flutter, con paquete `com.condominiun.smart.pushprueba`, Firebase propio y una base Django temporal en 18082. La cuenta y el único dispositivo destinatario eran ficticios y exclusivos del ensayo. No se modificaron cuentas o dispositivos habituales ni se activaron sus envíos.

## Comprobación

1. La instalación se completó con confirmación del usuario y se inició sesión desde la interfaz normal del guardia ficticio.
2. Se llevó la app a segundo plano. `am kill` terminó exclusivamente el proceso de la variante temporal; `pidof` confirmó su ausencia antes del envío. Se envió un único aviso y Firebase lo aceptó.
3. Firebase reactivó el proceso para recibir el mensaje. El usuario confirmó que veía la notificación y que todavía no la había tocado. Se volvió a terminar únicamente ese proceso y se verificó su ausencia inmediatamente antes de pedir el toque.
4. Al tocar el aviso, el usuario confirmó «Alertas de seguridad con el evento». Se inspeccionó una captura temporal que mostraba esa bandeja y «Evento enviado a revisión». El registro del nuevo proceso contenía el marcador de arranque desde notificación utilizado en `getInitialMessage()`.

No fue necesario volver a introducir credenciales: la sesión ficticia seguía vigente en el almacenamiento de la app. El ensayo no prueba la recuperación con sesión vencida o revocada ni mide una latencia exacta.

## Cambios y pruebas

Se amplió únicamente el controlador local `administracion/check_push_background.py`: acción `enviar-cerrada`, comprobación de proceso y cierre del paquete temporal. Rechaza la operación si la app está visible, ADB no permite comprobar el proceso o el proceso continúa activo; no envía si no se verifica el cierre. Nueve pruebas unitarias pasaron, incluidas cuatro nuevas para proceso presente/ausente, errores ADB, rechazo del cierre en primer plano, destino exacto del cierre y bloqueo del envío ante cierre no confirmado. Las pruebas no usan teléfonos ni Firebase.

No se cambió código funcional de Flutter ni la política de roles. La APK es la misma variante con inicio normal verificada en la etapa anterior.

## Alcance y limpieza

Se probó terminar el proceso con `am kill`, no «Forzar detención» en Ajustes ni la política particular de deslizar la app en el gestor de tareas de cada fabricante. Firebase documenta que forzar la detención desde Ajustes en Android requiere abrir manualmente la aplicación para volver a recibir mensajes; también distingue `getInitialMessage()` para aperturas desde estado terminado. [Documentación oficial de recepción Flutter](https://firebase.google.com/docs/cloud-messaging/flutter/receive-messages).

App temporal desinstalada, enlace USB 18082 retirado, servidor detenido, base ficticia y captura temporal eliminadas. Se verificó que el paquete habitual sigue instalado y el puerto temporal queda cerrado. El registro de la app de prueba permanece en Firebase y la APK local es la variante de prueba. El backend y la instalación habituales no quedaron migrados por este ensayo; los envíos pausados y los dispositivos del proyecto anterior requieren su etapa de transición.
