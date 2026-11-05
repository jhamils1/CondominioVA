# Zona temporal de estacionamiento en Imou

**Actualización posterior:** el registro automático optativo fue añadido tras
la aprobación del usuario; el alcance y las pruebas actuales se encuentran en
[registro Imou](REGISTRO_IMOU_LOCAL.md). El resto es el informe de la etapa
anterior, cuando aún no se generaban eventos.

Fecha: 2026-11-05. El usuario aprobó dibujar una zona en la Imou y señalar en
rojo vehículos que permanezcan detenidos, dejando para otra etapa el registro
de eventos y las notificaciones. La implementación reutiliza `ZonaVideo`,
`zonas.js` y `permanencia.js` de la webcam y el video.

## Uso

1. En Seguridad → Eventos e incidencias, iniciar la Imou y activar su IA.
2. Cuando aparezca la imagen analizada, pulsar **Dibujar zona Imou** y marcar
   al menos tres puntos sobre esa imagen. Se pueden deshacer puntos y cancelar.
3. Pulsar **Completar zona Imou**. La zona queda oculta por defecto; se puede
   mostrar, ocultar, modificar o borrar. Por defecto, el tiempo es 5 segundos,
   configurable con enteros entre 2 y 120.
4. Un vehículo prácticamente detenido dentro de la zona durante el tiempo
   indicado se marca en rojo en el fotograma analizado; al salir o al detectar
   movimiento suficiente deja de cumplir la regla. Es un resultado orientativo.

La zona solo vive en memoria mientras la vista de la cámara permanezca abierta.
Al detener la IA se conserva la zona de esa vista, pero se reinicia el
seguimiento; al reiniciar la IA se vuelve a aplicar. Detener la cámara, perder
la fuente, salir de la pestaña o recargar desmonta la vista y elimina la zona.
La ventana en pantalla completa corresponde a la imagen en directo, no al editor.

La regla usa el centro inferior de la caja de vehículos y su posición respecto
al polígono. No identifica un vehículo o propietario. Una pérdida de detección,
un salto de más de dos segundos entre muestras, cambiar la zona o el umbral,
detener la IA o cambiar la resolución reinicia el conteo. Con inferencia lenta
el umbral podría no alcanzarse; el procesamiento se hace por muestras y no
es un seguimiento de seguridad certificado. El fotograma analizado puede ir
retrasado respecto al directo. Se analiza como máximo una imagen a la vez.
No se guardan imágenes ni zonas; no se crean eventos, avisos ni incidencias.

## Verificación

- Compilación del frontend y lint de los componentes modificados correctos.
- Ocho pruebas existentes de geometría y permanencia correctas, incluyendo
  paso, salida, pérdida de detección, dos vehículos y tiempos no confiables.
- Edge con API, imágenes y detecciones simuladas: zona dibujada y oculta,
  mostrar/ocultar, umbral de 2 segundos, recuadro verde → rojo y verde al
  salir, sin creación de eventos; se conservaron alineación, parada de IA,
  falla, parada de cámara y botón de webcam.
- La comprobación no abrió la Imou real ni evaluó precisión con una maqueta.
  Falta que el usuario pruebe en su sesión con su cámara y un vehículo de
  juguete, y valorar rendimiento sostenido antes de conectar notificaciones.

Sin migraciones, instalación de paquetes, cambios de permisos ni uso de FCM.
