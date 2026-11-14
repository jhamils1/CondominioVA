# Pérdidas breves de detección en Imou

Fecha: 2026-11-05.

El usuario informó que un automóvil dentro de la zona no siempre se marcaba en rojo. La captura mostraba una detección roja y, por separado, registro automático detenido. Se verificó en el código que una única imagen sin el automóvil descartaba su seguimiento y reiniciaba el conteo; también se reinicia cuando las muestras están separadas por más de dos segundos. No se midieron las pérdidas ni la latencia de su cámara real durante esta etapa.

Se añadió tolerancia opcional a la pérdida de detección, habilitada únicamente para Imou. Durante hasta dos segundos desde la última observación se conserva una pista ausente, sin dibujar cajas antiguas ni sumar el intervalo sin detección. Al recuperarla se exige más coincidencia de posición y tamaño que entre imágenes consecutivas. Una detección nueva de la misma clase descarta la pista perdida si su identidad es ambigua. La recuperación conserva el aviso ya emitido para no repetirlo. Las salidas de zona, desplazamientos y pérdidas prolongadas reinician el conteo. El límite de separación de muestras no se amplió y el comportamiento predeterminado de webcam y video sigue siendo estricto.

En Imou se muestra amarillo y tiempo acumulado mientras el automóvil está dentro y aún no alcanza el umbral; rojo cuando lo cumple. Un punto en el centro inferior de la caja muestra la posición que se compara con la zona del suelo. Se distinguen ausencia de vehículos, punto fuera de zona y ritmo insuficiente de análisis. Si hay cambios sin guardar, el mensaje del registro indica expresamente que debe pulsarse **Guardar configuración Imou**. No se cambiaron pesos, umbral del detector, permisos, base de datos ni Firebase.

## Verificación

- Trece pruebas Node: geometría, seguimiento previo, ausencia breve, conservación de tiempo sin contar la ausencia, recuperación sin segundo aviso, expiración, desplazamiento, salida y retroceso del reloj.
- Recorrido Edge con cámara/API simuladas: una muestra sin vehículo no mantiene el dibujo anterior; la recuperación vuelve a rojo sin esperar todo el umbral. Conserva verificación de zona, roles, reintentos y evidencia.
- ESLint y build correctos; Vite conserva el aviso sobre tamaño del paquete.

Pendiente: comprobar con la maqueta real y observar el contador/punto inferior. Esta corrección no mejora por sí misma la clasificación del modelo, no garantiza identidad de los objetos y no confirma ocupación si el vehículo no es detectado o las muestras llegan demasiado separadas. La zona necesita cubrir el lugar de contacto con el suelo, no ajustarse al contorno visual de la carrocería.
