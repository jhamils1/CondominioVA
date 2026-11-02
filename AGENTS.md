# Instrucciones del proyecto

Este archivo es el punto de entrada de las instrucciones del repositorio. Es un único proyecto existente con `Condominio-Backend/`, `Condominio-Frontend/` y `condominio-movil/`. La gestión ya está desarrollada en gran parte; se mantiene, corrige y amplía con seguridad inteligente.

## Al comenzar

1. Leer [estado actual](memoria/estado-actual.md) y [pendientes](memoria/pendientes.md).
2. Consultar [contexto](contexto/README.md) según la tarea y [documentación](documentacion/README.md) para requisitos, auditorías y diagramas. Contrastar siempre con el código real.
3. Revisar rama y `git status --short` antes de modificar; conservar trabajo local.
4. Consultar las habilidades pertinentes: [auditoría Django](.agents/skills/auditoria-django/SKILL.md), [seguridad del condominio](.agents/skills/seguridad-condominio/SKILL.md) y [visión artificial](.agents/skills/vision-artificial/SKILL.md).

## Durante el trabajo

- Trabajar por etapas pequeñas; cuando el usuario exija aprobación entre etapas, esperar aprobación explícita antes de avanzar. Una propuesta pendiente no autoriza implementarla.
- Revisar la implementación existente; no reconstruir módulos sin justificación y aprobación. Mantener compatibilidad entre API, web y móvil.
- Distinguir empleado de cuenta: la cuenta es opcional. Los cuatro roles y sus requisitos están en [roles y permisos](contexto/roles-permisos.md). Cargo laboral y rol de acceso son distintos.
- No ejecutar migraciones destructivas ni modificar producción sin autorización. Identificar entorno, respaldo y alcance antes de una migración persistente.
- No exponer valores de `.env`, tokens, contraseñas, claves, datos personales ni biométricos. No usar servicios, cuentas o dispositivos reales para pruebas sin autorización correspondiente.
- Ejecutar comprobaciones relacionadas con el cambio. No declarar una funcionalidad verificada solamente porque existe código o una pantalla.
- Preservar los tres componentes en la raíz y `documentacion/base-datos/`. La organización documental no autoriza cambiar código ni configuración de ejecución.

## Al terminar

Actualizar `memoria/estado-actual.md`, historial, cambios, pendientes y pruebas con hechos comprobados, alcance, fecha y límites. Actualizar `contexto/` solo cuando cambie una decisión estable o se verifique arquitectura nueva. No copiar conversaciones ni repetir informes completos: enlazar las fuentes. La memoria es documentación del repositorio que debe leerse y mantenerse; no garantiza recuerdo automático entre sesiones.
