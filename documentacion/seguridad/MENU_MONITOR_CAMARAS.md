# Menú de cámaras y vistas por rol — 2026-11-06

El usuario solicitó reorganizar Cámaras con **Monitor en vivo** y **Gestión de
cámaras**; mencionó tres submenús pero nombró dos, que son los implementados.
La ruta de monitor está disponible para administrador y guardia; la de gestión,
solo para administrador. **Seguridad → Eventos e incidencias** es una vista
separada para administrador, sin el bloque de video. El guardia conserva lista,
evidencia, registro manual, confirmación, descarte y atención en el monitor y
sus notificaciones existentes. No se duplicó el código de eventos: ambas vistas
usan el mismo componente y la misma API.

La restricción de la ruta administrativa es de interfaz. El backend conserva el
acceso existente a la API de eventos para guardias activos porque el monitor y
el móvil necesitan sus operaciones; propietarios e inquilinos siguen sin acceso.
La gestión de cámaras continúa protegida en backend para administrador. No se
implementó asignación de cámara por guardia, ni selección basada en catálogo ni
filtrado de eventos por cámara. Siguen disponibles Imou y webcam según el flujo
anterior. El botón del catálogo **Abrir monitor** apunta a la nueva ruta.

Pruebas: cinco verificaciones de rutas por rol con Node, ESLint, build Vite y
cuatro recorridos Edge simulados: menú por roles, bloqueo de gestión y vista
administrativa al guardia, confirmación desde monitor, cámara Imou, webcam,
video y reintentos. No se usaron dispositivos, usuarios, alertas ni Firebase
reales. No se cambió backend, Flutter, procesos de visión o configuración de IA.
La vista debe revisarse con el usuario en su sesión.

## Navegación por teclado — 2026-11-07

Los controles que despliegan los menús son botones accesibles con teclado y
comunican si están abiertos. Se conservaron sus opciones y las rutas existentes.
Pasaron las cinco pruebas Node de roles, ESLint, build Vite y el recorrido Edge
simulado de catálogo, navegación con Enter y revisión del guardia. No se usaron
cámaras ni cuentas reales. No se añadió un tercer submenú no especificado.
