# Roles y permisos Fase 2

## Alcance

Esta etapa protege los endpoints existentes del backend mediante los grupos de
Django y verificaciones de rol realizadas en el servidor. No instala
dependencias, crea migraciones ni modifica los grupos o usuarios de ninguna
base de datos. No implementa cámaras, RF-DETR, notificaciones de seguridad ni
el ciclo de revisión de incidencias.

## Roles actuales

Se reconocen los grupos `administrador`, `Seguridad` o `guardia de seguridad`,
`propietario` e `inquilino`, sin distinguir mayúsculas. Cada usuario debe
pertenecer a exactamente un grupo reconocido y tener la cuenta activa. No se
utilizan `is_staff`, `is_superuser` ni los permisos antiguos del grupo como
sustituto de la política de la API. Una cuenta técnica sin grupo conserva el
comportamiento de Django Admin, pero no recibe automáticamente acceso a la API.
El Django Admin técnico admite superusuarios sin rol de residente o guardia;
una cuenta no superusuaria con un rol funcional no puede entrar aunque tenga
`is_staff`. Ninguna cuenta con rol de guardia, propietario o inquilino entra al
Django Admin, incluso si también es superusuario. Se exige ser superusuario
técnico: otras cuentas `is_staff` que no sean superusuarios ya no pueden entrar.
Debe revisarse la clasificación de cuentas técnicas antes de desplegar.

Los propietarios e inquilinos requieren una `Persona` activa y del tipo
correspondiente; los inquilinos también requieren el registro `Inquilino`. Un
guardia requiere un `Empleado` activo vinculado. Una persona de tipo familiar
o visitante no puede autenticarse en la API. Si falta un vínculo o el rol es
ambiguo, la API deniega el acceso hasta que administración corrija el caso.

El usuario se puede crear antes de asociarlo con una persona o empleado, pero
no puede iniciar sesión hasta que la vinculación sea válida. El administrador
puede vincular un usuario con rol de guardia al campo `user` de un empleado. El
rol de aplicación nunca asigna `is_superuser` o `is_staff` automáticamente.

## Endpoints y datos

- Usuarios, roles, permisos, cargos y empleados: administrador.
- Personas: administrador; guardia recibe campos reducidos; residentes solo
  consultan su perfil mediante su vínculo.
- Vehículos: administrador; guardia consulta; propietarios e inquilinos
  consultan y gestionan sus vehículos. Se impide reasignarlos a otra persona.
- Visitas: administrador y guardia registran y actualizan; los residentes ven
  visitas donde son la persona que recibe. El guardia consulta visitantes,
  pero la creación y modificación de registros de visitantes es administrativa.
- Incidentes: administrador y guardia. El guardia no ve datos de multa ni
  responsable y no puede asignarlos o eliminarlos. El flujo de confirmación y
  las alertas quedan para etapas posteriores.
- Contratos, expensas y multas: administrador; propietario consulta los que
  puede relacionar con sus registros. Un inquilino recibe listas vacías cuando
  el modelo no permite identificar una relación inequívoca. El guardia no
  accede a finanzas. La consulta de expensas utiliza contratos activos, como
  en el comportamiento anterior; la política para históricos está pendiente.
- Pagos: el propietario o administrador solo puede crear y comprobar un pago
  relacionado con una expensa visible y el identificador de pago registrado.
- Áreas comunes y reservas: se conserva el acceso autenticado de residentes a
  las funciones existentes, con reservas limitadas a la persona vinculada.
- ALPR y reconocimiento facial: administrador y guardia. Enrolamiento y
  diagnóstico: administrador.
- `GET /api/me/`: datos mínimos del usuario autenticado y su rol vigente.
  React y Flutter todavía no consumen este endpoint; se adaptarán en su etapa.

Los métodos de modificación exigen rol de administrador salvo las operaciones
expresamente indicadas. El servidor filtra los querysets y no confía en el rol
enviado por un cliente. El token de acceso y el de renovación vuelven a
comprobar la cuenta, el rol y el perfil asociado. Las cuentas inactivas o sin
rol válido no obtienen acceso con tokens emitidos previamente.

## Cambios de cuenta y auditoría

El administrador puede activar o desactivar una cuenta mediante `is_active` y
asignar un `role_id` válido. No puede cambiar su propio rol ni desactivar su
cuenta. Se impide retirar el último administrador activo. La API no elimina
cuentas: utiliza desactivación para evitar las cascadas actuales hacia Persona
o Empleado. No modifica cuentas técnicas ajenas por esta API.

Los inicios de sesión, cierres de sesión, creación y actualización de cuentas,
cambios de rol, cambios de permisos de rol y operaciones de incidencia se
registran en el `LogEntry` existente de Django, sin guardar contraseñas ni
tokens. No existe una API que permita a un guardia editar ese registro. Este
registro existente no es una auditoría inmutable a nivel de base de datos;
debe reforzarse para las etapas posteriores y el acceso técnico controlado.
Los intentos de autenticación fallidos producen un mensaje genérico en logs.

## Limitaciones y compatibilidad

- Los grupos existentes de la base auditada conservan sus 112 permisos de
  Django hasta que se apruebe y ejecute una transición de datos. La política de
  la API no usa esos permisos antiguos. Estos permisos siguen siendo relevantes
  para otras superficies de Django. El Django Admin impide el acceso de cuentas
  no superusuarias que tienen roles funcionales. No debe suponerse que los
  permisos fueron corregidos en la base.
- La dirección `Persona`–`Inquilino`–`Unidad` no permite determinar de forma
  única la unidad o las obligaciones de un inquilino. No se exponen datos
  financieros ajenos por inferencia. Se necesita decisión y esquema aprobado.
- Los usuarios sin grupo funcional autorizado, incluidas cuentas técnicas sin
  grupo, no pueden acceder a la API de aplicación. No se modifica su acceso al
  administrador técnico de Django. Debe planificarse su clasificación antes de
  despliegues y comprobarse que exista un administrador funcional operativo.
- El frontend actual obtiene roles consultando `/api/users/`, que ahora es
  administrativo. Un residente puede iniciar sesión, pero el menú o etiqueta
  de rol aún puede mostrar información incorrecta hasta la fase de frontend.
- El dashboard financiero de Flutter será denegado a residentes y guardias.
  La experiencia de error y los menús deben adaptarse en las fases de cliente.
- El registro de visitantes y vehículos para un ingreso no tiene una relación
  directa en el modelo actual. La operación completa debe diseñarse con las
  decisiones de negocio y migraciones correspondientes.
- Siguen pendientes la revisión de logs sensibles en clientes y vistas
  existentes, la política de acceso de las superficies técnicas de Django,
  la inmutabilidad de auditoría, las alertas y FCM de seguridad.
- El acceso del propietario a inquilinos relacionados solo muestra registros
  activos con fecha de inicio y fecha de fin vigentes. Los registros con
  fechas ausentes no se exponen hasta decidir su tratamiento.
- `AllowAny` continúa como valor predeterminado por compatibilidad; los
  endpoints sensibles auditados declaran permisos explícitos. Cualquier vista
  nueva debe declarar su política y cubrirse con pruebas antes de publicarse.
- Antes de crear o ejecutar migraciones o modificar permisos en grupos de la
  base real, debe explicarse el impacto y obtenerse la aprobación requerida.

## Pruebas reproducibles

En una terminal, desde `Condominio-Backend` y con su entorno virtual:

```powershell
python -B -m administracion.run_access_tests
python -B manage.py check
```

El primer comando fuerza una base SQLite en memoria, crea el esquema temporal
con `schema_editor` sin ejecutar migraciones y usa credenciales ficticias.
No usa la base configurada, no hace llamadas a Stripe, Luxand o Plate
Recognizer, y no envía notificaciones. La inicialización de Firebase se simula
en esa prueba y no verifica la configuración ni la entrega de FCM.
El segundo comando revisa la configuración real de Django sin migrar datos.

Las pruebas cubren acceso anónimo, perfiles y roles, aislamiento, incidencias,
cambio de rol, usuario activo, autenticación y renovación, pago simulado y
reconocimiento simulado. No sustituyen una prueba integral con PostgreSQL,
React, Flutter, FCM y proveedores externos en un entorno de ensayo.
