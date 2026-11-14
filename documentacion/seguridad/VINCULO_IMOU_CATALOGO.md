# Integración inicial del catálogo con la Imou — 2026-11-06

El administrador puede pulsar **Agregar Imou configurada** desde la PC donde
está Django: se crea un registro auditado a partir de la IPv4 y el puerto del
archivo local existente. No se leen esos valores al navegador como credenciales,
no se copian contraseñas a la base y el botón no crea duplicados en una solicitud
posterior. La coincidencia del catálogo con la configuración actual es una
comparación dinámica de IP y puerto, no una relación persistente por identidad;
si hay varios registros iguales se considera ambigua y se bloquea la prueba.

Solo un administrador conectado localmente puede iniciar **Probar conexión**.
El backend valida registro habilitado y coincidencia única y reutiliza el puente
Imou existente; la web no puede seleccionar una IP arbitraria para la prueba.
Devuelve solo disponible, conectando o no disponible, sin imagen ni secretos.
La vista de video sigue en **Seguridad → Eventos e incidencias**. Deshabilitar
un registro del catálogo impide esta prueba, pero no detiene el puente ni el
monitor existente. Cambiar IP/puerto en catálogo tampoco cambia el archivo local.

Pruebas: 13 pruebas Django aisladas con puente falso, incluyendo roles, acceso
local, duplicados, auditoría y ausencia de imagen en la respuesta; ESLint y build
correctos; Edge simulado agrega Imou, prueba conexión y abre enlace al monitor.
Sin migración nueva ni registros reales creados. Una comprobación autorizada del
puente real devolvió 503 y el puerto RTSP configurado no respondió desde la PC;
no se guardó imagen ni se generó evento. La base local no tenía registros de
cámara al iniciar la etapa. Se requiere encender/conectar la cámara y volver a
probar para validar la integración real.

Esta etapa no implementa conexión genérica RTSP, múltiples cámaras, credenciales
editables, video por cable directo, control del monitor ni relación de zonas y
eventos por cámara. El archivo local sigue siendo la única fuente de conexión de
la Imou y su contenido debe permanecer privado. La ausencia de regla única en la
base no garantiza exclusión en altas simultáneas; si ocurren duplicados la prueba
se rechaza de manera conservadora. No se modificó Firebase ni los destinatarios.

## Corrección de la prueba — 2026-11-06

El usuario indicó que el monitor mostraba video pero la prueba quedaba en
«conectando». El puente cierra después de cuatro segundos sin solicitudes y el
botón solo preguntaba una vez; eso podía impedir completar el arranque. Ahora
la web consulta automáticamente hasta 12 veces, con pausas de un segundo, y
muestra resultado o mensaje de espera agotada. Las solicitudes se detienen al
salir de la pantalla. No modifica la cámara, credenciales, IA ni notificaciones.

El usuario confirmó visualización real en eventos. Después se comprobó también el
puente real: recibió un JPEG, sin guardar imagen ni crear evento. El recorrido
Edge simulado verificó dos respuestas «conectando» seguidas de «disponible»;
ESLint y build pasaron. Falta que el usuario confirme el resultado desde el botón.
La opción de habilitar/deshabilitar sigue limitada al catálogo y se indica
explícitamente; controlar la vista y el monitor es una etapa distinta.
