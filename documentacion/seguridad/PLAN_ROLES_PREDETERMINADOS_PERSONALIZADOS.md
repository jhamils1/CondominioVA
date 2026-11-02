# Plan de roles predeterminados y personalizados

Revisión estática del 2026-10-31. El usuario solicita conservar cuatro roles predeterminados no editables, que se puedan elegir al asignar cuentas, y permitir roles nuevos con accesos personalizados. Este documento es la primera etapa de análisis y diseño: todavía no cambia acceso, interfaz ni datos y no autoriza automáticamente las siguientes etapas.

## Qué existe

- `administracion/access.py` acepta exactamente un grupo reconocido de `administrador`, `Seguridad` o `guardia de seguridad`, `propietario` o `inquilino`; comprueba perfiles y estado. Un nombre personalizado no obtiene rol efectivo.
- `administracion/serializers/serializersRol.py` admite únicamente esos cuatro significados; `serializersUser.py` rechaza otros grupos. `authentication.py` vuelve a comprobar el rol efectivo al iniciar sesión y autenticar.
- `administracion/views.py` restringe gestión de roles al administrador, impide editar su propio grupo y audita cambios, pero permite editar permisos de otros roles predefinidos. El formulario web muestra permisos de Django, que no son la política principal de la API.
- Las vistas aplican combinaciones de `ApplicationRolePermission`, `AdministratorOnly`, `SecurityOperator`, comparaciones explícitas de rol, filtros de consultas y serializers. Ajustar solo una clase de permiso no protege todas las rutas ni impide exponer datos.
- React `src/auth/access.js` y Flutter `lib/security/access_policy.dart` reconocen cuatro roles por nombre. Flutter rechaza un perfil con rol desconocido. Usuarios, alta de empleados y menús también tienen restricciones que deben adaptarse deliberadamente.
- Los avisos se distribuyen mediante `seguridad_IA/notificaciones.py` a guardias activos y administradores después de confirmación. Un rol personalizado no debe recibir alertas o privilegios de guardia por compartir un nombre o una casilla genérica.
- La captura del usuario muestra que `inquilino` no aparece en esa lista concreta y se ofrece para crear. No se consultó la base en esta revisión; las bases y grupos efectivos pueden variar.

## Diseño propuesto para validación

### Roles predeterminados

Mostrar siempre **Administrador**, **Guardia de seguridad**, **Propietario** e **Inquilino**, junto a una descripción de sus capacidades y un indicador de si su grupo está disponible. No mostrar la edición de sus permisos. Mantener `Seguridad` como alias compatible del guardia; no renombrar grupos existentes silenciosamente. No crear un grupo en la base simplemente por cargar la pantalla. Si falta uno, indicar que requiere configuración y ofrecer un procedimiento explícito y revisado para habilitarlo.

Proteger los roles predeterminados también en la API: no permitir editar sus permisos, renombrarlos o eliminarlos por los endpoints funcionales. Esto no implica alterar los permisos históricos existentes; debe analizarse cualquier vía técnica separada y su impacto. La asignación de un rol a una cuenta sigue siendo una operación administrativa distinta de editar el rol. Mantener el último administrador, la no autoasignación y las restricciones de superusuario.

### Roles personalizados

Crear un rol con nombre propio y un **catálogo limitado de capacidades de aplicación en español**, no con la lista irrestricta de permisos técnicos de Django. Por decisión del usuario, cada rol personalizado comenzará **sin permisos**; el administrador seleccionará los accesos que necesite. Un permiso debe asociar una operación concreta con un alcance de datos claramente definido y respaldado por la API. No publicar una casilla hasta que esa operación y sus filtros estén implementados y probados.

La identidad del rol debe ser estable y separada de su nombre visible. El diseño de almacenamiento puede reutilizar grupos de Django con metadatos o una entidad propia; escoger tras revisar migración, compatibilidad y mantenimiento. No reutilizar ciegamente los 112 permisos históricos. No se define esquema ni migración como hecho implementado.

Cada cuenta seguirá teniendo una identidad y perfil válidos, pero se requiere una decisión de diseño para relacionar el rol personalizado con el tipo de perfil. Los límites de datos sensibles, permisos de gestión de roles, protección de sesiones y notificaciones de seguridad deben definirse antes de habilitar capacidades que los afecten. El nuevo rol no equivale automáticamente a administrador, guardia, residente ni superusuario técnico.

La API deberá ser la autoridad, negar por defecto operaciones no mapeadas y verificar autenticación, actividad, permisos, acción y alcance del objeto. El frontend y el móvil mostrarán únicamente capacidades devueltas por el servidor y tendrán comportamiento seguro con respuestas antiguas o desconocidas. La ocultación de botones no es control de seguridad. El cambio de rol/permisos deberá tener efecto comprobado en solicitudes y renovación de sesión existentes; documentar comportamiento para operaciones ya iniciadas.

El administrador autorizado gestionará estos roles sin poder elevarse por vías indirectas, modificar su propio acceso o retirar el último administrador. Se auditarán creación, cambios, asignación, bajas y actor sin credenciales. Cambiar permisos de un rol puede afectar a todos los usuarios que lo tienen; la interfaz debe mostrar el impacto y las operaciones deben ser transaccionales. Definir desactivación y usuarios vinculados antes de habilitar eliminación.

## Etapas propuestas

1. **Análisis y diseño — esta etapa.** Revisar controles actuales, impactos, riesgos y pruebas; documentar sin cambios funcionales.
2. **Roles predeterminados.** Diseñar visualización de los cuatro y protección en backend, resolver sin escritura implícita el grupo ausente, probar asignación, bloqueo por API y regresión. Entregar documentación y detener para aprobación.
3. **Contrato y almacenamiento de roles personalizados.** Definir catálogo pequeño con operación y alcance por capacidad, modelo de identidad/perfil, restricciones y estrategia de transición. Preparar migración solo si es necesaria; probar aislamiento y revocación sin ejecutar sobre base persistente sin autorización.
4. **Una primera capacidad de extremo a extremo.** Elegir una operación concreta de bajo alcance, implementar controles de API y objeto, asignación y visualización web, probar que un rol sin permiso recibe denegación. No prometer permisos que aún no tengan protección de servidor.
5. **Ampliación y móvil.** Incorporar capacidades adicionales una por una, pantallas y navegación Flutter, sesiones y pruebas cruzadas. Integrar alertas solo si el usuario aprueba destinatarios y reglas específicas.

Cada etapa requiere aprobación antes de avanzar, pruebas, documentación e informe. Las etapas propuestas pueden ajustarse al revisar las dependencias, sin presentar una función parcial como completa.

## Pruebas necesarias

- Roles base y alias no editables por API; solo administrador gestiona roles personalizados. Inquilino ausente visible como no configurado sin crear datos.
- Login, JWT, cierre, revocación y casos de rol desconocido/inactivo; compatibilidad de cuatro roles y perfiles actuales.
- Permisos definidos contra todos los endpoints y métodos equivalentes; pruebas de solicitudes directas, campos, datos propios y ajenos, búsquedas, descargas y serialización.
- Permisos personalizados vacíos al crear; cambio de acceso con sesiones abiertas; no escalada de privilegios, último administrador y rol propio protegido.
- Roles asignados a múltiples cuentas; nombres duplicados/normalizados, concurrencia y auditoría de cambios; error y rollback. Pruebas PostgreSQL aisladas para bloqueos cuando correspondan.
- Web y Flutter: menús, estados de falta de permisos, errores de carga, clientes antiguos, usuario sin perfil, acceso denegado y regresión.
- Los avisos iniciales siguen llegando a todos los guardias activos y el aviso de confirmación a administradores, sin incluir automáticamente usuarios de rol personalizado.

## Riesgos y límites

Los filtros actuales dependen de nombres de rol: un rol nuevo con una casilla de lectura no tiene definido qué registros puede ver. Los permisos Django antiguos del grupo propietario no deben eliminarse, copiarse o interpretarse como prueba de acceso funcional sin revisar dependencias. La base observada por una captura podría no ser la utilizada en otra ejecución.

No se han consultado cuentas ni permisos reales, modificado código, ejecutado pruebas funcionales, creado grupos ni aplicado migraciones. La revisión estática no certifica que todas las rutas existentes estén protegidas. Las notificaciones push, cámaras y RF-DETR siguen fuera de este alcance.
