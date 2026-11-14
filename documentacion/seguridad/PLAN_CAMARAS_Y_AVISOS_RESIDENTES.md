# Plan: cámaras y futuros avisos a residentes

Actualizado: 2026-11-06. Este plan recoge la conversación y separa lo implementado
de lo pendiente. Cada etapa termina con pruebas, documentación e informe; se
requiere aprobación explícita antes de avanzar a la siguiente.

## Organización y decisiones

- `camaras`: catálogo y futura configuración de dispositivos de red o locales;
  menú principal **Cámaras**, administrado por el administrador.
- `seguridad_IA`: eventos, incidencias, evidencias, notificaciones y reglas;
  **Seguridad → Eventos e incidencias** muestra monitoreo y eventos. El dibujo de
  zonas debe estar en su configuración de análisis, no en el catálogo.
- `seguridad_vision`: servicios locales de cámara y procesamiento, separados de
  las peticiones web; conservar el monitor independiente existente.
- Objetivo futuro: una o varias cámaras de distintas marcas, por Wi-Fi, red
  cableada o cámara local según compatibilidad. Registrar una cámara no demuestra
  compatibilidad, conexión ni capacidad de procesar varias a la vez. La conexión
  Imou directa PC–Ethernet sin router aún no está resuelta.
- Administrador gestiona cámaras y zonas. Guardia consulta las cámaras y evidencias
  autorizadas y revisa eventos, sin configurar dispositivos ni dibujar zonas.
  Todos los guardias activos reciben los avisos iniciales; el administrador recibe
  el aviso posterior a la confirmación. La autorización por cámara está pendiente.
- En eventos se prevé seleccionar cámara y ver debajo sus eventos con imágenes,
  no videos. La zona se asocia a la cámara seleccionada y puede ocultarse durante
  el monitoreo. Actualmente solo existe zona Imou compartida; no fingir soporte N.

## Etapas

Actualización 2026-11-07: los datos de acceso de cámaras de red ya pueden
guardarse cifrados; la conexión RTSP genérica y su prueba siguen pendientes.
La Imou existente no fue migrada a esta configuración. [Detalle](CREDENCIALES_CAMARAS.md).

1. **Catálogo de cámaras — implementado en esta etapa.** Nombre, ubicación,
   tipo red/local, fabricante, modelo, IPv4, puerto RTSP y habilitación del registro;
   API y pantalla solo para administrador, con auditoría. No prueba conexión, no
   guarda credenciales, no registra automáticamente la Imou y no controla la
   cámara. Sin borrar registros: se deshabilitan en el catálogo. Migración aditiva.
2. **Conexión segura de una cámara.** Diseñar custodia de credenciales y ruta del
   flujo sin revelar secretos; validar acceso a red y evitar conexiones arbitrarias.
   Probar Imou conservando el archivo y la integración existentes, y luego adaptar
   el servicio, con una transición compatible y sin afectar notificaciones.
3. **Varias fuentes y autorización.** Identidad por cámara, estado real, selección,
   permisos de visualización para guardias y monitor por fuente; medir recursos,
   reconexión y operación sin navegador. Sin limitar los destinatarios de alertas
   por asignación. La webcam local requiere tratamiento específico.
4. **Zonas por cámara.** Migración planificada con respaldo para conservar la zona
   Imou; crear, reemplazar, cancelar y eliminar con guardado y errores claros.
   Definir concurrencia, permisos y evidencia con pruebas sin afectar el servicio.
5. **Eventos vinculados.** Relacionar nuevas incidencias con su cámara preservando
   eventos históricos cuyo campo cámara es texto; mantener API web/móvil y avisos.
   Probar una sola creación, evidencias, entrega y fallos/reintentos.
6. **Avisos al afectado — pendiente de definición y aprobación.** Flujo propuesto:
   IA genera evento, guardia revisa y confirma/descarta; en caso confirmado, el
   guardia busca el vehículo, comprueba persona relacionada y elige enviar aviso
   específico. Administrador recibe confirmación y supervisa. Identificación y
   confirmación son acciones distintas; no atribuir responsabilidad automáticamente.
   Registrar quién notificó, destinatario, fecha y correcciones; residentes no
   acceden a cámaras o incidencias internas. En visitas, definir si corresponde
   contactar al visitante o al anfitrión; no inferirlo automáticamente.
7. **Matrículas — después.** Ya existe Plate Recognizer Cloud con entrada de imagen
   y búsqueda en `Vehiculo`; no está conectado automáticamente al monitor. Evaluar
   lectura de fotogramas relevantes, cuotas, calidad y revisión humana. Cloud y
   Firebase requieren internet. El modelo de vehículo vincula una persona y la
   visita no vincula vehículo directamente; el formulario actual selecciona
   propietarios. Definir registro seguro de vehículos visitantes y permisos
   acotados de guardia antes de modificarlo.

## Resultado y comprobación de la etapa 1

Las pruebas usan cámara y datos ficticios: API comprueba roles, campos, auditoría,
alta, edición, deshabilitación y ausencia de eliminación; Edge simulado comprueba
la pantalla y el acceso de guardia. Compilación Vite y ESLint correctos. La
migración `camaras.0001` se aplicó en PostgreSQL `condominio` local tras respaldo
`backups_locales/antes_camaras_20261106_223908.dump`, cuyo listado fue verificado;
no se realizó restauración de prueba. No se crearon registros reales ni se enviaron
notificaciones. La Imou no fue vinculada: eso requiere una etapa posterior.
