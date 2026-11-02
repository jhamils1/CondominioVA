---
name: auditoria-django
description: Auditar el backend Django existente del condominio y contrastar modelos, relaciones, API y permisos con evidencia. Usar para auditorías o revisión de compatibilidad; no implica autorización para modificar código o datos.
---

# Auditoría Django del condominio

## Cuándo utilizar

Al revisar el backend existente, preparar una etapa de cambios o comprobar discrepancias entre documentación y código. Leer `AGENTS.md`, `memoria/estado-actual.md` y el contexto pertinente desde la raíz del repositorio.

## Procedimiento

1. Confirmar raíz, rama, cambios locales y alcance: solo lectura o cambios autorizados.
2. Examinar modelos y migraciones de administracion, residencial, finanzas y seguridad_IA, configuración seleccionada y cliente compartido core. No importar ajustes para una lectura estática si eso inicializa servicios.
3. Seguir cada ruta desde URL hasta vista, serializer, permiso, consulta y relación real. Distinguir campo declarado de restricción efectiva en API/base. Buscar duplicaciones y consumidores web/móvil antes de proponer reemplazos.
4. Revisar rol efectivo, alcance por objeto, exposición de datos, errores, transacciones, auditoría e integraciones externas. DRF tiene un default permisivo en la revisión de 2026-10-31: verificar permisos explícitos, no presumir protección.
5. Separar hallazgos comprobados, riesgos, recomendaciones y decisiones pendientes, con rutas verificadas. Las migraciones presentes no demuestran que estén aplicadas en una base concreta.

## Restricciones

En auditorías de lectura no editar código ni ejecutar migraciones, instalar paquetes, activar servicios o modificar datos. No leer/imprimir secretos, datos biométricos ni cuentas reales para ilustrar ejemplos. Preservar trabajo local. Para validación dinámica autorizada, revisar primero el aislamiento del ejecutor y documentar alcance y límites de las pruebas.

## Resultado esperado

Informe con evidencia, discrepancias, impacto en los tres clientes, pruebas realmente ejecutadas y siguiente etapa propuesta. Actualizar memoria al finalizar trabajo significativo; no marcar recomendaciones como implementadas ni avanzar a una etapa no aprobada.
