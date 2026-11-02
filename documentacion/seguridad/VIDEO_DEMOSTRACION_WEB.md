# Video de demostración en la web — 2026-11-01

**Nota posterior:** la sección, su ruta y el archivo fijo fueron retirados con
aprobación del usuario el 2026-11-02. Este informe es histórico; ver
[retiro de la demostración](RETIRO_VIDEO_DEMOSTRACION.md).

La pantalla «Eventos e incidencias de seguridad» permite cargar y reproducir
un video público ya procesado. Se avisa que no es cámara en vivo ni genera
alertas. La API entrega exclusivamente el archivo fijo
`seguridad_vision/salidas/demostracion_web.webm`, con `IsAuthenticated` y
`SecurityOperator` (administrador o guardia efectivo), sin caché privada.
No acepta rutas de usuario ni pretende servir grabaciones o evidencias reales.

El archivo WebM fue convertido de la copia MP4 pública creada en la etapa
anterior y se mantiene ignorado por Git. El procesador ahora crea WebM por
defecto; admite MP4 y no sobrescribe archivos. La conversión produjo y leyó
105 fotogramas; Edge headless reprodujo el WebM de 3,5 segundos. La compilación
del frontend pasó, con el aviso existente de tamaño de paquete. Dos pruebas
aisladas verificaron acceso autorizado simulado, rechazo de otros roles y
ausencia de archivo. No se probó una sesión real de navegador en la pantalla.

El servidor que respondió en el puerto local 8000 devolvió 401 para eventos
pero redirigió la nueva ruta anónima al login de Django; por lo tanto no se
confirmó que haya cargado esta versión del backend. Reiniciar el servidor
Django de este proyecto y comprobar la pantalla con una cuenta autorizada.
El proceso de notificaciones es independiente y no se reinició. No se crearon
eventos, datos de base, ni se enviaron avisos.

## Corrección posterior del servidor

Se detectaron dos procesos Django escuchando en 8000. El anterior estaba
iniciado sin recarga y recibía las solicitudes. Se detuvo solo ese proceso;
quedó el servidor actualizado. La ruta de video y la de eventos respondieron
401 a solicitudes anónimas, sin redirección al sitio administrativo. No se
verificó el video con una sesión autenticada: falta la confirmación del usuario.

## Confirmación del usuario — 2026-11-02

El usuario informó que vio el video y proporcionó una captura del panel de
administrador con el reproductor mostrando el video y las detecciones. Esta
confirmación no verifica la sesión de guardia, cámaras en vivo ni alertas.
