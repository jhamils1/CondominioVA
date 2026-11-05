# Registro automático de hallazgos Imou

**Actualización posterior:** los eventos nuevos de Imou pueden incluir el
fotograma privado y consultarse en web y móvil. Ver [evidencia](EVIDENCIA_IMOU.md).
El resto documenta la etapa previa, cuando aún no se adjuntaba imagen.

Fecha: 2026-11-05. El usuario decidió probar la zona real más adelante y aprobó
conectar el registro de hallazgos y los avisos al guardia. Se implementó la
etapa en el flujo local existente, sin envíos reales durante su verificación.

## Uso y alcance

En Seguridad → Eventos e incidencias: iniciar la Imou, activar IA, dibujar y
completar la zona, definir el tiempo y activar **Registrar automáticamente los
hallazgos de la Imou y avisar a los guardias**. Está desactivado al iniciar.
Tras habilitarlo, se reinicia el conteo; al cumplir el umbral el navegador crea
un evento pendiente, usando el UUID y API autenticada existentes. El campo
`camara` contiene el texto `Imou (vista local)` como etiqueta informativa, no
una identidad persistente o asignación verificada de cámara. La descripción
indica que la ubicación no se verificó y que no hay evidencia adjunta.

El backend actual asigna `origen=MANUAL` a esta API, con actor humano; no se
afirma que sea ingesta autónoma de IA. No crea una incidencia confirmada ni una
multa. El backend crea notificaciones para **todos los guardias activos** y,
si la cola está activa, las encola para los dispositivos habilitados. El
administrador recibe el aviso correspondiente tras la confirmación del guardia;
propietarios e inquilinos no reciben la alerta interna. La entrega en móvil
depende del procesador, Firebase, internet, dispositivos y permisos; un evento
registrado no confirma recepción de push. En esta sesión se comprobó un
procesador continuo en ejecución, con procesos padre/hijo; no hay arranque
automático tras reiniciar Windows.

La cámara, IA, sesión, navegador y página deben permanecer activos y visibles.
No se guardan zona, imagen ni video; la fuente no sigue funcionando como
vigilancia automática con la página cerrada. La regla es una estimación y
necesita revisión humana. Una pérdida de seguimiento, cambio de configuración o
nuevo inicio puede crear duplicados; pausas entre muestras de más de dos
segundos reinician el conteo y pueden impedir que se alcance el umbral.

El registro se desactiva al detener IA o cámara, perder la fuente, ocultar la
pestaña, cambiar o borrar la zona, cambiar el tiempo o fallar un envío. Un fallo
o tiempo de espera de 15 segundos conserva en memoria el identificador y
contenido exactos; **Reintentar evento Imou** usa el mismo UUID. Se puede
reintentar incluso después de detener la cámara, siempre que la página siga
abierta. Los reintentos no se conservan al salir o recargar; la interfaz lo
indica. Un error podría ocurrir después de guardar el evento: no generar un UUID
nuevo para reintentar. Una zona no validada con la cámara real puede producir
falsos positivos o no detectar un vehículo.

## Verificación

- Build frontend y lint correctos; 10 pruebas Node de zona, permanencia y
  contenido de eventos correctas. Edge con imagen, cámara y API simuladas:
  sin creación antes de activar, detección, fallo 503, desactivación,
  conservación al detener IA, reintento con el mismo UUID y contenido,
  éxito y desactivación al cambiar el umbral. No se usaron datos reales.
- Edge con webcam y API simuladas verificó su flujo y reintento anteriores.
- Cuatro pruebas Django en SQLite **en memoria**, con datos ficticios y envío
  Firebase simulado, comprobaron payload Imou, origen MANUAL, estado pendiente,
  dos guardias, exclusión de residentes y administrador del aviso inicial,
  idempotencia, cola FCM y confirmación por guardia. No se modificó la base local.
- Se observó el procesador FCM continuo activo sin enviar notificaciones. Se
  conserva la confirmación previa del usuario de recepción móvil desde video;
  **todavía no se ha probado el envío de una detección real de Imou**.

Sin cambios de modelos, migraciones, permisos, configuración Firebase ni app
móvil. La prueba de extremo a extremo con la maqueta queda pendiente para que
el usuario la haga cuando quiera.
