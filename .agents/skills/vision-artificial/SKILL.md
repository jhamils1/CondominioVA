---
name: vision-artificial
description: Diseñar, evaluar o integrar en una etapa autorizada la visión local del condominio con RF-DETR Nano, fuentes USB o RTSP, seguimiento por cámara y eventos para Django. No usar como permiso implícito para instalar o ejecutar modelos.
---

# Visión artificial del condominio

## Cuándo utilizar

En una tarea explícita de arquitectura, evaluación o implementación del trabajador de video. Leer `contexto/seguridad-ia.md`, `contexto/decisiones-tecnicas.md` y `memoria/estado-actual.md`. La documentación de 2026-10-31 describe un plan, no una integración existente.

## Procedimiento

1. Revisar código real y alcance autorizado; conservar Plate Recognizer y Luxand existentes sin atribuirles operación offline.
2. Antes de instalar, exportar o seleccionar pesos, comprobar en fuentes oficiales vigentes licencias de código/pesos, clases, versiones y compatibilidad del hardware/runtime. No prometer clases o rendimiento sin medir.
3. Mantener inferencia en un servicio independiente de las peticiones web. Diseñar USB inicial, video de demostración y futura IP/RTSP con identificación y seguimiento separados por cámara, reconexión y límites de concurrencia.
4. Medir FPS, latencia, memoria RAM/VRAM y consumo con carga representativa; controlar colas y descarte de trabajo obsoleto. Evitar enviar cada fotograma a Django.
5. Agrupar detecciones relevantes en eventos con identidad estable, tiempo, fuente y evidencia protegida. Diseñar autenticación e idempotencia de ingestión sin duplicar modelos existentes ni asumir rutas que no existen.
6. Preparar recursos locales, persistencia de eventos pendientes y sincronización tras pérdida de internet. Diferenciar disponibilidad del trabajador, backend y proveedores. Probar recuperación antes de afirmar soporte offline.
7. Mantener revisión humana y política de destinatarios en backend; cámara asignada no limita alertas iniciales a los demás guardias activos.

## Restricciones

Una habilidad es una guía, no un ejecutor automático. No instalar dependencias, descargar pesos, abrir cámaras, subir grabaciones, cambiar infraestructura o migrar datos fuera del alcance aprobado. No copiar rostros ni datos reales a documentación. No confundir detección/identificación con autorización física ni responsabilidad por una incidencia.

## Resultado esperado

Diseño o implementación acotada con estado explícito, fuentes de compatibilidad/licencia, mediciones realmente efectuadas, límites y pruebas reproducibles. Registrar pendientes y actualizar memoria; proponer la siguiente etapa sin ejecutarla automáticamente.
