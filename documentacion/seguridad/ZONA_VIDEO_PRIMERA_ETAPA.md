# Marcado de zona en video — 2026-11-04

Actualización: se añadieron brevemente instrucciones y un enlace al video
público anterior; luego se retiraron a petición del usuario. El video no se
restauró y se conserva el editor temporal de zona.

En «Eventos e incidencias de seguridad → Analizar un video desde un archivo»,
el usuario puede pausar el video y elegir «Dibujar zona». Se añaden al menos
tres puntos sobre el video original; «Completar zona» valida el contorno y lo
muestra en ambas vistas. Se pueden deshacer puntos, cancelar, cambiar o borrar
la zona. También se pueden añadir puntos mediante flechas y Enter al enfocar
el área de dibujo.

Las coordenadas son proporcionales a la imagen para mantener la alineación
al cambiar el tamaño de la pantalla. Se rechazan polígonos sin área, con
puntos consecutivos repetidos o lados que se crucen. La zona se conserva
únicamente en la sesión de la página asociada al video seleccionado y se
elimina al elegir otro video o recargar; no se guarda en Django ni se asocia
a una cámara. Es una primera etapa visual, no una configuración persistente.

No se ha implementado comprobar vehículos dentro de la zona, permanencia,
seguimiento, evidencia, eventos o alertas. La opción existente de cámara web
no tiene todavía este editor. Los análisis de video por muestras siguen siendo
una demostración, no un procesador continuo de cámaras.

Verificación: dos pruebas Node de geometría y compilación frontend correctas.
En Edge headless, con sesión y API simuladas y video sintético temporal, se
comprobó rechazo de zona incompleta, marcado de cuatro puntos, visualización
del mismo contorno en ambas vistas, cambio de tamaño y limpieza al seleccionar
otro archivo. El video sintético y el servidor temporal se retiraron al final.
Falta la comprobación manual del usuario y evaluar la utilidad con su maqueta.
Vite mostró el aviso preexistente de tamaño del paquete.
