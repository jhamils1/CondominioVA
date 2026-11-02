# Demostración de cámara local — 2026-11-02

Se preparó una prueba con inicio y detención por el usuario dentro de «Eventos
e incidencias». El navegador solicita permiso de cámara solamente al iniciar.
Los fotogramas se envían a Django local por la API autenticada, que permite
administradores o guardias y exige conexión desde la misma máquina; Django los
reenvía a un proceso de RF-DETR Nano separado en 127.0.0.1. Ese proceso usa
un token aleatorio efímero guardado bajo recursos ignorados por Git.

Se analiza una imagen por vez, se dibujan detecciones en la web y no se crean
incidencias, notificaciones ni grabaciones. Es una demostración de desarrollo,
no un mecanismo de cámaras en producción: el control por dirección de cliente
no es una política de acceso aplicable detrás de proxies, y el archivo local de
token no establece aislamiento entre cuentas del mismo equipo. No habilitarla
como servicio remoto sin un diseño de autenticación y despliegue apropiado.

Verificaciones: compilación frontend correcta (con aviso de tamaño de paquete);
tres pruebas aisladas de permisos, validación de imagen y conexión no local;
solicitud anónima al proceso rechazada; estado autenticado del proceso correcto;
una imagen del video público produjo 10 detecciones. No se abrió la cámara real
ni se verificó el flujo completo con sesión real: el usuario recibió instrucciones
para probarlo y conceder permiso. No se ha probado velocidad sostenida,
reconocimiento de juguetes ni operación completamente sin internet.

El procesador local y el frontend fueron iniciados para la prueba actual. Los
procesos pueden terminar al reiniciar el equipo. Las instrucciones de inicio
están en `Condominio-Backend/seguridad_vision/README.md`. No se cambió la base
de datos, ni se enviaron avisos.

## Confirmación posterior del usuario

El usuario informó que vio la cámara y los recuadros en el navegador. No
especificó qué objetos se detectaron ni confirmó el comportamiento al detener
la cámara. Las pruebas anteriores con imágenes públicas y las limitaciones
indicadas siguen siendo las mismas.
