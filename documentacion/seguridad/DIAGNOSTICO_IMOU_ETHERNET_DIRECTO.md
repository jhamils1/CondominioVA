# Diagnóstico Imou Ethernet directo — 2026-11-05

## Revisión posterior — 2026-11-07

Validación posterior con usuario: el usuario configuró manualmente IPv4 Ethernet
de la PC `192.168.1.107/24`, sin puerta de enlace. El dispositivo candidato
`192.168.1.108` respondió por TCP 80 y 554 usando enlace Ethernet, y ONVIF
devolvió un número de serie cuyos cuatro últimos caracteres coinciden con la
etiqueta de la Imou. ONVIF entregó dos perfiles; cada uno produjo un fotograma
RTSP decodificado mediante el lector aislado, sin guardarlos. La consulta HTTP
confirmó IP de origen de Ethernet. No se modificaron la cámara ni el archivo de
conexión del proyecto: monitor/catálogo podrían seguir apuntando a Wi-Fi. Wi-Fi
de PC y cámara no se aislaron completamente; queda pendiente probar operación
integrada con el puente, persistencia y ausencia de internet en la cámara.

Después el usuario configuró la PC en `192.168.77.1/24`, sin puerta de enlace,
y buscó desde la app Imou sin hallar un dispositivo. Una consulta posterior de
ARP para esa interfaz mostró una entrada dinámica `192.168.1.108`, con prefijo
de fabricante coincidente; no confirma identidad ni conectividad. La PC todavía
no comparte esa subred. Se propuso comprobar temporalmente con la PC en
`192.168.1.107/24`, sin puerta de enlace; al finalizar esta observación aún no
se había aplicado el cambio ni se había probado acceso a esa IP.

Con el cable conectado y Wi-Fi de la PC activo, Windows informó el adaptador
físico Ethernet conectado con la configuración IPv4 preexistente `40.0.0.2/24`.
Se envió una consulta ONVIF limitada a esa interfaz: cero respuestas. Una
captura en memoria de 20 segundos mostró tres paquetes DHCP del mismo prefijo
de fabricante de la Imou y siete ARP; otra escucha observó un DHCP DISCOVER con
ese prefijo, pero una MAC diferente de la observada en Wi-Fi. Las interfaces
pueden tener MAC distintas; no se probó que ese solicitante sea la cámara. No se
guardaron paquetes ni se asignó IP, cambió el adaptador o configuró la cámara.
La cuenta del proceso no dispone de privilegios de administrador. Sin DHCP o una
dirección estática conocida para la cámara, el enlace no tiene todavía una IP
de cámara utilizable; una respuesta por Wi-Fi no demostraría conexión por cable.
No hay demostración RTSP sobre Ethernet ni sin internet.

Usuario autorizó probar cámara conectada por cable directamente al PC para una
demostración sin internet. El adaptador Ethernet aparecía conectado y tenía una
configuración preexistente fija `40.0.0.2/24`; Wi-Fi continuaba conectado. La
cámara conocida por Wi-Fi figuraba en otra red, lo que no prueba su dirección
por cable. ONVIF por Ethernet no recibió respuestas.

En escucha DHCP limitada al adaptador Ethernet se observaron solicitudes de un
dispositivo con prefijo de fabricante coincidente con la cámara vista por Wi-Fi;
el prefijo no demuestra por sí solo que sea la cámara. Se enviaron ofertas DHCP
efímeras en ese enlace (dirección de prueba `40.0.0.20`, concesión 180 segundos,
sin router ni DNS). La respuesta mediante sockets no produjo confirmación; una
prueba posterior con Npcap sí observó que el dispositivo solicitó la dirección y
envió la confirmación DHCP. La PC no recibió respuesta a ping ni al puerto RTSP
554 por esa dirección, incluso fuera de la restricción de red. La solicitud DHCP
no demuestra que el dispositivo haya activado la dirección ni que sea la cámara.
Los procesos de prueba finalizaron. No se cambió la configuración de Windows o
la cámara, ni las credenciales del proyecto. No quedó demostrada una transmisión
RTSP por cable ni el funcionamiento sin internet después de reiniciar.

Siguiente paso: diagnosticar por qué no llega o no se acepta la oferta y confirmar
la identidad del dispositivo y la asignación por la interfaz cableada. Evitar
suponer que la cámara tiene una dirección predeterminada o modificar ajustes de
red permanentes antes de verificar compatibilidad y recuperación. El flujo por
webcam sigue siendo alternativa; FCM requiere internet.
