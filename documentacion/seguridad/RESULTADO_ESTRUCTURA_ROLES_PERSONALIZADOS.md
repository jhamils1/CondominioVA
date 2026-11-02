# Estructura preparatoria de roles personalizados

Fecha: 2026-10-31. Etapa 3 autorizada después de los roles predeterminados. Se definió una estructura aislada y un contrato propuesto; **todavía no se pueden crear ni asignar roles personalizados desde la aplicación**. La siguiente etapa requiere aprobación expresa.

## Decisión de diseño

Los cuatro roles actuales continúan usando sus grupos existentes. La futura configuración personalizada se almacena en tablas propias, sin depender de los permisos Django históricos ni cambiar el significado de grupos existentes:

| Registro preparado | Información | Efecto actual |
| --- | --- | --- |
| `RolPersonalizado` | UUID estable, nombre, fecha de creación y estado inactivo por defecto | Solo almacenamiento; no representa un grupo de autenticación y no se asigna a usuarios |
| `CapacidadRolPersonalizado` | Referencia protegida al rol y código de capacidad | Solo almacenamiento; ningún código es consumido actualmente por autorización |

Al crear un registro no se crea ninguna capacidad y `activo` es falso. La tabla impide duplicar nombres según `Lower(Trim(nombre))` en la base y códigos iguales dentro del mismo rol; además impide cadenas vacías. La base bloquea borrar un rol que tiene capacidades. Estas restricciones no sustituyen las validaciones futuras de nombres de solo espacios, nombres reservados/alias de roles base, Unicode, catálogo permitido o concurrencia sobre todas las rutas. La equivalencia Unicode puede variar según el motor y la colación; debe probarse en PostgreSQL.

Los datos están deliberadamente **desconectados** de `assigned_role`, `effective_role`, la autenticación JWT, `Group`, usuarios y todas las vistas. Incluso un registro marcado activo con una capacidad no concede acceso. No se expone API, pantalla, opción de selección ni capacidad activa. La revocación probada es la validación existente al cambiar una cuenta a un grupo desconocido; la revocación de futuros roles personalizados aún no existe.

## Contrato propuesto para una futura capacidad

La siguiente es una propuesta de diseño, no una opción habilitada ni un endpoint nuevo:

| Identificador propuesto | Operación | Alcance y datos | Validaciones futuras |
| --- | --- | --- | --- |
| `visitas.consultar_operativas` | Consultar visitas para una función operativa autorizada | Datos mínimos requeridos para identificar y gestionar visitas; la lista exacta de campos, filtros y período se definirá antes de implementación | Usuario activo con perfil de empleado activo, rol personalizado habilitado y permiso concreto; comprobación tanto en listado como detalle; excluir datos financieros y atributos personales no necesarios |

Este candidato permite una primera prueba acotada; no define aún acceso de escritura, cámaras, incidencias, cuentas ni información financiera. No se ha decidido que todos los empleados tengan cuenta, ni se ha habilitado recepción de alertas a este rol. Antes de publicarlo, verificar la semántica de la vista y serializer reales, establecer alcance exacto de registros y campos y probar solicitudes directas a lista y detalle. Una persona con rol residencial conserva sus reglas actuales; no se deben inferir vínculos de ocupación.

El catálogo autorizado deberá residir en código, con un identificador estable, nombre explicativo, operaciones concretas, alcance de datos y validadores. Los códigos arbitrarios que caben en la tabla no serán aceptados por la futura API ni concederán permisos; hoy no existe ninguna API que los acepte. La tabla no es por sí sola una fuente válida de autorización.

## Contrato de gestión pendiente

Antes de abrir creación o edición de roles en producción, se deberá diseñar e implementar:

1. Solo administradores autorizados podrán crear roles, empezando sin permisos; no se podrán usar nombres de los cuatro roles ni sus alias. La futura interfaz mostrará solamente capacidades implementadas y comprobadas.
2. Definir relación de cuenta, empleado y rol personalizado; identificar si un mismo usuario puede tener más de una función sin saltarse el requisito actual de un solo grupo. No se ha elegido una migración de usuarios ni modificado sus roles.
3. Rechazar permisos no permitidos o con alcance indefinido, asegurar transacciones, auditoría y controles ante escalada y cambios que afecten múltiples usuarios.
4. Comprobar autorización en cada operación y filtros de objeto, no solo en el menú. Adaptar el perfil devuelto por la API, React y Flutter sin asumir que conocen nombres personalizados.
5. Aplicar y probar cambios y bajas de permisos durante la vida de access/refresh tokens; denegar por defecto y definir la política de las operaciones ya iniciadas. Probar concurrencia en PostgreSQL.
6. Conservar la distribución de alertas existente: guardias activos reciben la revisión y administradores la confirmación. Un rol nuevo no recibe alertas por el hecho de consultar visitas.

## Migración preparada y pruebas

Se añadió `administracion/migrations/0005_rolpersonalizado_capacidadrolpersonalizado.py`, que crea dos tablas nuevas; no contiene migración de datos ni modifica grupos existentes. **No se aplicó a la base de desarrollo ni a producción.** Antes de aplicarla a una base persistente hay que identificarla, revisar el historial de migraciones y el SQL, preparar y verificar un respaldo y solicitar aprobación específica.

Pruebas ejecutadas desde `Condominio-Backend`:

- `DEBUG=False; env\Scripts\python.exe -B -m administracion.run_migration_smoke`: **94 pruebas aprobadas**, migraciones solo en SQLite en memoria con proveedores simulados. Incluye valores iniciales, unicidad, ausencia de acceso por registros aislados y rechazo de sesión/token al cambiar a grupo desconocido, además de regresión de roles y notificaciones existentes.
- `makemigrations administracion --check --dry-run` mediante inicialización aislada con SQLite en memoria y Firebase simulado: **sin cambios pendientes** entre modelos y migración.
- No se verificó PostgreSQL para la nueva restricción funcional, no se probó concurrencia ni se activaron Firebase o dispositivos. No se modificaron frontend, móvil, grupos o cuentas reales y no se hicieron pruebas con datos persistentes.

La estructura es preparatoria, no una función de roles personalizados terminada. Falta aplicar una migración autorizada, construir el contrato/API, vincular perfiles, implementar y probar la primera capacidad, administrar cambios y adaptar clientes.
