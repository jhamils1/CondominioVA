# Registro automático desde video — 2026-11-04

Al analizar un archivo, el usuario puede activar «Registrar automáticamente
los hallazgos de este video y avisar a los guardias». Viene desactivado y se
desactiva al seleccionar otro archivo. Al alcanzar el umbral, el navegador
utiliza la API autenticada existente de eventos y la cuenta del operador.
El evento se registra como MANUAL, porque el backend actual no dispone de
una ingesta de servicio IA verificada; la descripción identifica el análisis
de una grabación, el minuto, el tiempo aproximado y la falta de fecha,
ubicación y evidencia verificadas. La fecha de evento es la del registro.

Por cada identidad temporal del seguimiento se envía como máximo una vez por
análisis. Si falla o se pierde la respuesta, puede reintentarse desde la
pantalla con el mismo UUID y contenido; el backend existente compara el
contenido y distribuye una sola vez. Los pendientes quedan solo en memoria y
se pierden al cerrar o recargar. El seguimiento es básico: una pérdida puede
crear una nueva identidad; otro análisis crea otros UUID. Por ello pueden
existir duplicados y no es una deduplicación operativa entre ejecuciones.

La creación usa el flujo actual: evento pendiente, notificaciones internas a
guardias y cola push cuando esté activada. No confirma incidencias ni atribuye
responsabilidad; el guardia revisa. La entrega móvil requiere procesador activo,
Firebase, red y dispositivo válido. Esta etapa no cambia backend ni bases de
datos, no activa cámaras, no almacena videos y no constituye servicio IA
continuo; el cálculo y sus reintentos dependen de la página abierta.

Pruebas: ocho pruebas Node de geometría, seguimiento y contenido de evento,
compilación web y 100 pruebas de acceso/backend con SQLite en memoria y
proveedores simulados correctas. El primer intento con `manage.py test` falló
por usar un runner incompatible con las pruebas `unittest.TestCase`; se
utilizó el ejecutor aislado propio del proyecto. Vite conserva aviso de tamaño.
No se probó el recorrido web completo ni se enviaron eventos en esta etapa.
