# Permanencia en video seleccionado — 2026-11-04

En la prueba de video se puede marcar una zona y elegir un umbral de 2 a 120
segundos (5 por defecto). El análisis toma una muestra cada 0,5 segundos y
compara el punto central inferior de cada caja de vehículo con el polígono.
Un seguimiento sencillo asocia detecciones de la misma clase entre muestras;
al permanecer el punto aproximadamente estable durante el umbral se muestra
una posible permanencia, el recuadro cambia a rojo y aparece un enlace al
momento del video. Se permite analizar sin zona, sin calcular permanencia.

El cálculo es provisional y ocurre en memoria del navegador, para un único
archivo. No identifica personas, placas ni vehículos reales. Una pérdida de
detección reinicia el conteo; vehículos que se cruzan, oclusión, cambios de
escala, cámara en movimiento y fluctuaciones de cajas pueden causar errores
o duplicados. El umbral espacial es de 3 % de la dimensión normalizada desde
el inicio del periodo, no una velocidad física. El usuario debe revisar el
resultado. Cambiar zona o tiempo invalida resultados anteriores. Las muestras
pueden omitir movimientos breves. No se guarda ninguna zona ni resultado, no
se aplica a cámara en vivo y no se crean eventos, evidencias o notificaciones.

Verificación: siete pruebas Node de geometría y seguimiento pasaron: límite y
exterior, vehículo quieto, movimiento, pérdida, clases y dos vehículos;
compilación de Vite correcta con el aviso previo de tamaño. Son datos
sintéticos; no se verificó con el video del usuario ni se midió precisión o
rendimiento. No se modificó base de datos ni se ejecutó la cámara.
