# Selección de cámaras registradas

Etapa de visualización: el monitor consulta un catálogo mínimo de cámaras de red activas para administrador y guardia conectados localmente. Las respuestas no incluyen IP, rutas ni credenciales. La Imou vinculada mantiene su propio puente, zona, IA y eventos; la cámara de laptop mantiene su flujo. Las cámaras adicionales se seleccionan por nombre y se visualizan mediante un puente RTSP/JPEG separado, sin IA, sin grabación y sin crear alertas. El acceso individual por cámara y zonas por cámara siguen pendientes: actualmente el guardia autorizado local puede consultar todas las cámaras de red activas.

El servicio escucha únicamente en 127.0.0.1:28768, usa un token local y acepta como máximo cuatro fuentes concurrentes. Django obtiene las credenciales cifradas desde el catálogo, valida IP privada y datos de conexión y los pasa al puente local; no se envían al navegador. El puente solo abre una fuente cuando se solicita una imagen; libera la lectura tras inactividad. La interfaz muestra una cámara adicional a la vez, sin detener automáticamente las vistas Imou o laptop ya iniciadas. Para iniciar el puente desde la raíz del proyecto:

```powershell
.\Condominio-Backend\seguridad_vision\.venv\Scripts\python.exe .\Condominio-Backend\seguridad_vision\camaras_catalogo.py
```

El servicio también se inició en la sesión local durante esta etapa. Si se reinicia la PC, hay que iniciarlo nuevamente. El soporte actual requiere RTSP IPv4 privada, ruta y credenciales compatibles; ONVIF no garantiza compatibilidad y el lector no maneja cámaras sin credenciales. No se cambió la base de datos ni la configuración de la Imou.

Verificación: 28 pruebas Django en SQLite temporal, prueba del puente con fuentes simuladas que comprueba autenticación y separación, ESLint y compilación Vite. Falta verificar interfaz y video con una segunda cámara física autorizada; no se probó carga real ni funcionamiento simultáneo bajo condiciones de producción. Las zonas, eventos y permisos individuales son etapas posteriores.
