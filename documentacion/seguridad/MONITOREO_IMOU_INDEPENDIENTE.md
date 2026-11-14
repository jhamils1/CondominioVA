# Monitor Imou independiente — 2026-11-05

El comando Django `monitorear_imou` ejecuta el monitoreo como proceso propio,
fuera del servidor web y del navegador. Lee la configuración compartida de la
única zona Imou, pide fotogramas al puente local y detecciones al proceso local
RF-DETR, y aplica una regla de permanencia equivalente a la de Imou web. Cada
hallazgo utiliza un identificador estable para el reintento, se registra como
origen IA con evidencia JPEG validada, y reutiliza la distribución transaccional
a todos los guardias activos y la cola FCM existente. El actor del historial es
el sistema (`null`), no se suplanta a un usuario humano. Si la zona cambia o se
desactiva antes de registrar el hallazgo, se descarta ese resultado anterior.

Para evitar el registro doble desde la vista Imou del navegador, el proceso usa
exclusión local en `127.0.0.1:28767`. El frontend deja de enviar hallazgos cuando
el puerto está ocupado o no puede consultar el estado; la API también bloquea la
creación web para esa fuente mientras esté ocupado. El puerto ocupado no prueba
que el monitor esté sano; revisar su consola. La vista y la IA web siguen siendo
independientes de la transmisión, y sin el monitor la vista conserva su flujo.

## Inicio manual para desarrollo

Desde la raíz del proyecto, en **terminales separadas**, con la base de datos
local y los ajustes de seguridad existentes habilitados:

```powershell
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\imou_local.py
```

```powershell
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\camara_local.py
```

```powershell
.\Condominio-Backend\env\Scripts\python.exe .\Condominio-Backend\manage.py monitorear_imou
```

Para avisos push, si no está ya ejecutándose, iniciar también el procesador FCM:

```powershell
.\Condominio-Backend\env\Scripts\python.exe .\Condominio-Backend\manage.py procesar_fcm_seguridad --continuo
```

El administrador debe configurar y habilitar el registro en la zona Imou desde
la web; después se puede cerrar la página. Para volver a consultar eventos en la
web se necesitan Django y el frontend. Los procesos anteriores deben permanecer
activos; `Ctrl+C` en sus terminales los detiene. No hay arranque automático tras
reiniciar Windows. FCM y push requieren internet y un teléfono registrado; los
eventos locales pueden quedar en la base y la cola en espera.

## Comprobación y límites

Pruebas aisladas: seguimiento, exclusión, API web bloqueada, evento con evidencia
idempotente, distribución simulada a dos guardias, cambio/desactivación de zona,
y ejecución del comando sin navegador con cámara y modelo simulados. Build y
recorrido Edge simulado comprueban la vista sin duplicación. No se ejecutó el
monitor contra cámara ni base reales ni se envió push real en esta etapa.

Una pérdida prolongada, un reinicio o dos dispositivos pueden volver a generar un
hallazgo: no hay identificación persistente de vehículos ni deduplicación entre
reinicios. Los reintentos pendientes del monitor viven solo en memoria y se
pierden si termina el proceso; no hay almacenamiento local duradero ni control
de servicio de Windows. La fuente Imou sigue requiriendo conectividad RTSP y no
se ha verificado por cable directo. El ritmo, precisión y detección con maqueta
real requieren medición. La detección es orientativa y un guardia debe revisarla.
