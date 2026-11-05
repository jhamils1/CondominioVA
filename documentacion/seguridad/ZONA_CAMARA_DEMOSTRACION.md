# Zona temporal en cámara local — 2026-11-04

La prueba de cámara en el navegador permite dibujar un polígono temporal,
configurar de 2 a 120 segundos (5 por defecto) y mostrar u ocultar la zona.
Al completar la zona queda oculta. El seguimiento sencillo del navegador
resalta en rojo el recuadro de un vehículo cuando el punto central inferior
permanece dentro y aproximadamente inmóvil durante el umbral. Si deja de
cumplir la regla o se pierde, el recuadro deja de estar rojo en una muestra
posterior. Personas y otros objetos siguen con el recuadro normal.

El tiempo usa un reloj monotónico al capturar cada imagen. Una separación de
más de dos segundos entre capturas reinicia el seguimiento, para no sumar un
periodo sin observar. Si el equipo procesa las imágenes más lento que ese
intervalo, puede no alcanzar el umbral. La pérdida de una detección también
reinicia el conteo. Oclusiones, movimiento de cámara, perspectiva e imprecisión
del modelo afectan el resultado; no prueba una infracción. La zona se borra
al detener o iniciar la cámara, y no se guarda ni asocia a una cámara real.

No se crean eventos ni notificaciones, no se registra evidencia y no es un
trabajador autónomo: requiere la página, el navegador y el procesador local.
Pasaron nueve pruebas Node de reglas y compilación web. No se abrió la cámara
ni se probó la interacción con usuario o una maqueta en esta etapa. Vite
mostró el aviso preexistente de tamaño de paquete.
