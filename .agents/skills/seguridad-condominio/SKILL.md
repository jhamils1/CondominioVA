---
name: seguridad-condominio
description: Revisar o implementar cambios autorizados de roles, datos de residentes, cuentas, incidencias y notificaciones del condominio, preservando la política aprobada y la trazabilidad.
---

# Seguridad del condominio

## Cuándo utilizar

Para cambios o revisiones de autorización, perfiles, notificaciones e incidencias. Consultar `contexto/roles-permisos.md`, `contexto/reglas-negocio.md` y `memoria/estado-actual.md` desde la raíz antes de actuar.

## Procedimiento

1. Identificar actor, operación y objetos afectados; inspeccionar el rol efectivo, los permisos y filtros existentes en Django. Comprobar consumidores React y Flutter.
2. Mantener cuatro roles y separar administrador de aplicación de superusuario técnico. Empleado y cuenta son distintos: cuenta opcional, cargo no decide rol, requisitos residenciales y de identidad se validan en backend.
3. Distinguir detección pendiente, revisión, incidencia confirmada y atribución de responsabilidad. No inferir culpable ni multa por detección. Descarte y resolución requieren la justificación exigida por el flujo existente.
4. Mantener aviso inicial a todos los guardias activos, aviso al administrador tras confirmación y exclusión de residentes de incidencias internas. No confundir bandeja persistente con entrega push.
5. Probar acceso propio/ajeno, perfil inactivo, rol incompatible, errores parciales, reintentos y auditoría cuando sean pertinentes al cambio. Usar datos ficticios y proveedores simulados; recepción real requiere entorno y autorización específicos.

## Restricciones

No confiar en ocultar menús como autorización. No ampliar datos históricos o de inquilinos sin relación comprobable. No reasignar tokens ajenos, conceder staff/superusuario automáticamente, borrar historial o revelar información personal. No modificar cuentas reales ni migrar por una solicitud de auditoría. No activar procesamiento de cámaras como parte de permisos/notificaciones.

## Resultado esperado

Cambio acotado o informe con reglas verificadas, pruebas y límites, efectos entre clientes y trazabilidad sin secretos. Actualizar memoria y solicitar la aprobación de la siguiente etapa cuando corresponda; no inventar capacidades ausentes.
