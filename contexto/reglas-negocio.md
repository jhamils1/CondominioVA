# Reglas de negocio

Fuentes verificadas el 2026-10-31: [modelos de administración](../Condominio-Backend/administracion/models.py), [residencial](../Condominio-Backend/residencial/models.py), [vehículos y unidades](../Condominio-Backend/residencial/modelsVehiculo.py), [finanzas](../Condominio-Backend/finanzas/models.py) y [aislamiento de datos](../Condominio-Backend/SEGURIDAD_DATOS_FASE3.md).

| Área | Relación o regla confirmada |
| --- | --- |
| Condominio | La gestión respalda la prioridad de seguridad del enunciado; no se verificó un aislamiento multicliente/multicondominio |
| Unidades | `Unidad.bloque` referencia `Bloque`; la unidad tiene código único y unicidad de número por bloque |
| Propietarios | `Persona` tipo `P`; los contratos enlazan propietario y unidad |
| Inquilinos | `Inquilino` hereda `Persona`, referencia propietario y tiene fechas; no tiene vínculo inequívoco de ocupación con unidad |
| Familiares | Heredan `Persona`; `persona_relacionada` enlaza propietario o inquilino; sin cuentas propias de acceso |
| Visitantes | Heredan `Persona`, tipo `V`; sin cuentas de acceso |
| Empleados | Modelo separado con cargo y vínculo opcional a usuario; cargo laboral no determina rol de aplicación |
| Vehículos | `Vehiculo.persona` enlaza `Persona`, sin restricción de tipo en esa FK; puede representar vehículos de visitantes; no duplicar catálogo |
| Visitas | `visitante` y `recibe_persona` enlazan personas; fecha de entrada/salida; no hay FK a vehículo ni unidad |
| Contratos | `contrato.propietario` y `contrato.unidad`; no suponer que es el contrato de ocupación de un inquilino |
| Expensas | Pertenecen a unidad; importe y estado de pago con referencias Stripe; no atribuyen por sí mismas responsabilidad histórica |
| Mascotas | `Mascota.persona`; una detección de perro/gato no identifica por sí misma al dueño |
| Seguridad | Evento pendiente requiere revisión; confirmar crea/vincula incidencia sin imputar automáticamente responsable ni multa |

## Decisiones aprobadas y límites

- Una persona registrada no necesita necesariamente cuenta. El empleado puede finalizar su alta sin ella; si la necesita, se crea o vincula desde el flujo de registro. El empleado se guarda antes y puede permanecer si falla el alta de cuenta.
- Cuenta de empleado: uno de los cuatro roles existentes, con requisitos de perfil. Para propietario/inquilino exige perfil residencial activo con CI exacto coincidente; el inquilino requiere además su registro especializado. No crear un rol de mantenimiento.
- Todos los guardias activos reciben las notificaciones iniciales; la asignación futura de cámaras no limitará esa distribución. El administrador recibe el aviso posterior a confirmación. Residentes no reciben incidencias de seguridad.
- Las expensas históricas anteriores al vínculo vigente permanecen restringidas hasta definir atribución. El filtro por fecha de contrato es provisional, no una prueba definitiva de titularidad.
- Se aprobó el enfoque de ocupación inquilino–unidad con fechas; diseño, migración y carga de datos continúan pendientes de su etapa.
- Registrar matrícula o reconocer rostro no prueba autorización física de entrada, identidad del conductor, vivienda única ni responsabilidad por un hecho.

Quedan por definir la baja coordinada de empleados/cuentas no guardia, titularidad histórica, reglas de incidentes IA, evidencias, retención y destinatarios administrativos/financieros. No inferir esas decisiones a partir de campos existentes.

2026-11-15: excepción solicitada para posibles estacionamientos de Imou: el aviso preliminar se dirige a guardias y administradores, sin convertirlo en incidencia confirmada. Los demás eventos mantienen la distribución previa.
