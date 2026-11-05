# Registro desde cámara local de prueba — 2026-11-04

En la cámara local, tras marcar una zona temporal, el operador puede activar
el registro automático. Al superar el umbral, el navegador solicita un evento
por la API existente autenticada; el evento se registra con origen MANUAL y
la descripción identifica expresamente la cámara de prueba, el tiempo estimado
y que no hay cámara identificada, ubicación ni evidencia adjunta. El evento
queda pendiente de revisión y usa la distribución existente a guardias. Push
depende de cola, procesador, Firebase y dispositivos habilitados.

La opción comienza desactivada y se desactiva al iniciar o detener la cámara,
editar o borrar zona, cambiar el umbral o fallar un registro. Un fallo guarda
el mismo UUID y contenido en memoria para reintentar sin duplicar por una
respuesta perdida. Al cerrar o recargar se pierden los pendientes. Durante un
seguimiento continuo se envía como máximo un evento por identidad temporal;
al perderse o reiniciarse el seguimiento puede generarse otro para el mismo
vehículo. Esta deduplicación limitada no garantiza evitar duplicados. La
separación mayor de dos segundos entre muestras reinicia el seguimiento.

Es una demostración local que requiere la página y el navegador abiertos,
no guarda zonas, fotos ni video, no identifica cámaras y no corresponde a un
servicio independiente de ingestión de eventos de IA. No certifica detección
ni persistencia offline. No se ha abierto la cámara ni se ha enviado aviso en
esta etapa. Pasaron diez pruebas Node de reglas y preparación de datos, y la
compilación web con aviso previo de tamaño. No se probó el recorrido de
interfaz, entrega o reintento; falta validación por el usuario con su cámara.

## Comprobación simulada posterior

En Edge headless se utilizó un flujo de cámara sintético y una API simulada:
se dibujó, ocultó y volvió a mostrar una zona, se generó un hallazgo, se
simuló un error en el registro y se reintentó. La opción se desactivó tras el
fallo y el reintento repitió exactamente el mismo contenido e identificador;
se detuvo la cámara simulada y desaparecieron sus controles de zona. El test
`node e2e/camara_simulada.mjs` usa el build local, no abre la cámara física,
no accede a Django, base de datos, Firebase ni teléfono. No comprueba la
entrega push ni la precisión real del modelo o la cámara del usuario.
