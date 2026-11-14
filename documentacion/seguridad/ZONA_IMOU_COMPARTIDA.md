# Zona compartida de la Imou local

Fecha: 2026-11-05.

La única fuente Imou local dispone de una configuración común con polígono normalizado, tiempo mínimo y opción de registro automático. Los administradores activos pueden guardarla; los guardias activos pueden consultarla, pero la API rechaza sus modificaciones. Propietarios e inquilinos no tienen acceso. El servidor valida el polígono y el tiempo y registra cada cambio con el usuario y la fecha. No existe todavía un inventario de cámaras ni una asignación individual por guardia.

En la web, el administrador dibuja la zona, selecciona el tiempo y la opción de registro, y pulsa **Guardar configuración Imou**. El guardia recibe la configuración al activar la cámara y la IA; no ve los botones de dibujo, borrado o guardado. Los clientes consultan cambios aproximadamente cada cinco segundos. La zona permanece en la base al cerrar el navegador o detener la cámara; la transmisión y el análisis siguen dependiendo de que la sesión esté abierta y de los procesos locales existentes. Si no se puede cargar la configuración, el registro automático se desactiva en esa sesión.

El análisis se sigue realizando en el navegador con el procesador local, y los eventos usan el flujo y los destinatarios existentes. No es vigilancia autónoma ni verificación independiente del servidor de cada detección. Varias sesiones que analicen simultáneamente la misma cámara pueden generar eventos duplicados; la sincronización tiene latencia y los cambios concurrentes de administradores usan el último guardado. Están pendientes seguimiento centralizado, deduplicación robusta, autorización individual por cámara y resolución de conflictos entre ediciones. No se modificó la configuración de Firebase.

## Migración y pruebas

Se verificó que la base configurada era PostgreSQL local `condominio`. Antes de aplicar la migración aditiva `seguridad_IA.0005` se creó `Condominio-Backend/backups_locales/antes_zona_imou_20261105_124436.dump` y se comprobó su lectura con `pg_restore --list`. El archivo contiene datos privados; esta comprobación no equivale a una restauración completa. La migración creó dos tablas y no alteró registros existentes.

Se ejecutaron seis pruebas Django en SQLite temporal, que cubren validación, lectura por guardia, rechazo de escritura por guardia y residentes, historial y API de cámara; `makemigrations --check` no encontró cambios pendientes. Build y ESLint del frontend fueron correctos. Un recorrido de navegador con cámara y API simuladas verificó el guardado, la carga de la zona para guardia, controles deshabilitados, detección y reintento. No se probó el recorrido nuevo con la cámara física ni se enviaron avisos reales en esta etapa.
