# Destinatarios de avisos de expensas

## Cambio

La señal existente de creación de expensas ya no selecciona el primer contrato activo de una unidad. Busca contratos activos cuya fecha no sea futura y solo continúa si existe exactamente uno. Comprueba que el perfil sea un propietario activo, que tenga una cuenta activa con rol efectivo de propietario o administrador y que la expensa esté dentro del alcance de consulta de esa cuenta mediante `expensas_permitidas`. Solo selecciona sus dispositivos activos.

Si hay cero o varios contratos vigentes, un perfil o cuenta no autorizado, o la expensa no cumple la restricción de fecha, se omite el push. El aviso de diagnóstico es genérico y no incluye datos personales o tokens. La expensa se conserva. No se cambió la señal de objetos perdidos, el formato del mensaje de expensa ni la asignación de contratos.

## Compatibilidad y límites

La aplicación sigue notificando al propietario verificable cuando tiene un dispositivo activo. La corrección deliberadamente deja de enviar avisos que antes se enviaban cuando la relación era ambigua o la cuenta no tenía acceso efectivo. Esos avisos omitidos no se almacenan en una cola ni se reenvían automáticamente cuando se corrigen los datos; no existe todavía una política de recuperación para esa señal antigua.

La fecha del contrato es una restricción provisional, no una prueba definitiva de titularidad histórica. También queda pendiente revisar que la señal existente se ejecuta en `post_save` antes del cierre de la transacción: si una transacción externa se revierte después del envío, el proveedor podría haber recibido un aviso de una expensa que no se conservó. La comprobación de contratos y el envío tampoco se han probado frente a cambios concurrentes en PostgreSQL. Estos límites no se corrigieron en esta etapa para evitar cambiar el ciclo de envío sin diseñar y probar una cola transaccional para expensas.

## Pruebas

`administracion.run_migration_smoke` ejecutó 70 pruebas en SQLite temporal, con FCM simulado. Los casos nuevos cubren propietario único, dispositivos de otro usuario o inactivos, contratos duplicados incluso del mismo propietario, contrato futuro, cuenta y perfil inactivos, rol no autorizado, fecha anterior al contrato, actualizaciones de expensas y error del proveedor. La regresión también comprueba que la señal de objeto perdido sigue invocando el proveedor simulado. `manage.py check` y `git diff --check` pasaron. No hubo envíos reales, cambios de datos del proyecto ni nuevas migraciones.

Archivos modificados: `finanzas/signals.py`, `administracion/tests_access.py`, este informe y la guía general. Las pruebas previas de fase 8 quedan como registro histórico del problema antes de corregirlo.
