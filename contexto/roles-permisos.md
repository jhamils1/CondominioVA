# Roles, actores y permisos

2026-11-13: el usuario determin? que el monitor en vivo es exclusivo del administrador; el guardia conserva revisi?n de eventos e incidencias. Solicita un aviso m?vil al propietario o inquilino tras identificaci?n y confirmaci?n humana; implementaci?n y reglas de destinatario pendientes. Esta decisi?n actualiza las referencias anteriores al monitor para guardia.

Revisión: 2026-10-31. Fuente de aplicación: [access.py](../Condominio-Backend/administracion/access.py), permisos y filtros en las vistas, [provision.py](../Condominio-Backend/administracion/provision.py) y [cuentas de empleados](../Condominio-Backend/ROLES_CUENTAS_EMPLEADOS.md).

Los cuatro actores funcionales con cuenta son **administrador, guardia de seguridad, propietario e inquilino**. El superusuario técnico de Django es un actor de mantenimiento técnico separado. Familiares, visitantes y empleados sin cuenta son entidades del dominio; un visitante puede participar en un caso de uso físico de ingreso sin iniciar sesión. Firebase, Stripe y proveedores de reconocimiento son sistemas externos, no roles humanos.

## Matriz de acceso

La tabla distingue la política aprobada de los límites actuales; las capacidades futuras no se otorgan por documentarlas.

| Capacidad | Administrador | Guardia | Propietario | Inquilino |
| --- | --- | --- | --- | --- |
| Usuarios, roles y permisos | Gestionar en aplicación | No | No | No |
| Empleados, viviendas, gestión general | Administrar | Solo consultas operativas autorizadas | Datos propios permitidos | Datos propios permitidos |
| Perfil y vehículos propios | Gestión administrativa | Consulta operativa | Sí, alcance propio | Sí, alcance propio |
| Contratos, expensas y pagos | Gestión administrativa | No | Propios, filtros y límites históricos | Finanzas/contratos restringidos |
| Unidad y visitas residenciales | Gestión | Operación de visitantes | Alcance propio autorizado | Pendiente relación de ocupación para alcance de unidad |
| Eventos e historial de seguridad | Supervisar | Consultar y operar | No | No |
| Confirmar, descartar, atender y resolver | Supervisar; no sustituye revisión del guardia | Sí; motivo/observación cuando corresponda | No | No |
| Aviso inicial de revisión | No como destinatario inicial | Todos los guardias activos | No | No |
| Aviso de confirmación | Sí | Consulta operativa del evento | No | No |
| Cámaras, zonas, grabaciones y evidencias | Política de administración; módulo pendiente | Solo autorización operativa futura | No | No |
| Reglas generales de notificación | Política de administración; pendiente | No | No | No |

La operación de estados está disponible en web. La bandeja Flutter consulta alertas/detalle y lectura; no implementa esas acciones de revisión. La tabla no certifica cada endpoint ni reemplaza las restricciones concretas de las vistas.

Desde 2026-11-05 la imagen de evidencia de eventos nuevos puede consultarse por
API autenticada por administradores o guardias activos. La autorización
individual por cámara aún no está implementada; propietarios e inquilinos no
tienen acceso. [Implementación y pruebas](../documentacion/seguridad/EVIDENCIA_IMOU.md).

## Requisitos efectivos

La página «Roles y accesos» presenta los cuatro roles predeterminados sin edición. La API rechaza cambios o eliminación de esos grupos; si uno falta, puede habilitarse mediante una acción explícita sin crear cuentas y sin permisos técnicos adicionales. Las reglas de aplicación continúan definidas en backend y los permisos históricos de grupos existentes se conservan. Esta protección afecta la API funcional; no reemplaza el control del administrador técnico de Django. Ver [resultado de la etapa](../documentacion/seguridad/RESULTADO_ROLES_PREDETERMINADOS.md).

En etapas posteriores se implementó la primera capacidad web/backend de roles personalizados, bajo `ROLES_PERSONALIZADOS_ACTIVOS=False` por defecto. El administrador puede crear roles inicialmente inactivos y sin permisos, configurar consulta de visitas pendientes/activas y asignarlos exclusivamente a empleados compatibles sin dispositivos registrados. Flutter reconoce este rol y habilita su consulta solo con la capacidad recibida del backend; omite registro FCM. Se verificaron pruebas SQLite, PostgreSQL temporal, HTTP, widgets, un recorrido integral Android aislado en teléfono autorizado y un escenario React/Django real en Edge headless con cuentas temporales. La entrega push sigue pendiente. En web, el servidor rechaza nuevas consultas tras revocar permisos; el menú refleja las capacidades nuevas al recargar, sin sincronización remota instantánea. El 2026-10-31, con autorización específica y respaldo restaurado/verificado, se aplicaron las migraciones y activó el indicador en la base local de desarrollo. Inquilino quedó habilitado sin asignaciones. Esto no activa otros entornos. Ver [primera capacidad](../documentacion/seguridad/RESULTADO_CAPACIDAD_VISITAS_PERSONALIZADAS.md), [activación local](../documentacion/seguridad/ACTIVACION_LOCAL_ROLES_Y_ANDROID_USB.md), [prueba Android](../documentacion/seguridad/PRUEBA_INTEGRACION_ANDROID_ROLES.md) y [prueba web](../documentacion/seguridad/PRUEBA_INTEGRACION_WEB_ROLES.md).

`assigned_role` exige usuario autenticado/activo y exactamente un grupo reconocido. Los nombres se normalizan; `Seguridad` y `Guardia de seguridad` representan el rol guardia. `effective_role` requiere empleado activo para guardia, Persona activa tipo P para propietario, y Persona activa tipo I con `Inquilino` para inquilino. Los perfiles F/V quedan excluidos. El cargo del empleado no decide el rol.

El administrador de aplicación no recibe automáticamente `is_staff` o `is_superuser`. Ser superusuario técnico tampoco reemplaza los requisitos de rol de la aplicación. No asignar permisos mediante identificadores de grupos supuestos.

## Cuenta de empleado opcional

La última decisión del usuario mantiene **Finalizar sin cuenta**: limpieza u otros cargos pueden registrarse sin acceso. Si se necesita cuenta, puede elegirse cualquiera de los cuatro roles cumpliendo el perfil correspondiente. Esta decisión amplía la regla histórica que solo contemplaba cuentas de guardia; no autoriza a todos los empleados a ver seguridad o finanzas. No hay rol de mantenimiento en esta etapa.

Para residentes vinculados a empleados se exige identidad coincidente y perfil activo; para inquilinos, su registro adicional. Las operaciones de cuenta/vínculo se hacen en una transacción, pero no incluyen el alta previa del empleado. Desactivar el empleado no debe suponerse equivalente a desactivar una cuenta administrativa o residencial: ese ciclo sigue pendiente.

Aplicar permisos en backend y limitar datos por relación; ocultar un menú no protege una API. Propietarios e inquilinos no acceden a incidencias internas, cámaras ni grabaciones. El guardia no gestiona usuarios, roles, contratos o finanzas ni elimina evidencia/historial.
