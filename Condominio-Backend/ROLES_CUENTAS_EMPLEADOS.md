# Cuentas de empleados con los cuatro roles existentes

## Comportamiento

Al registrar un empleado de cualquier cargo, la ventana permite crear o vincular una cuenta y solicita seleccionar explícitamente **administrador, guardia, propietario o inquilino**. La cuenta es opcional. El nombre del cargo no determina el rol. El rol de administrador concede acceso administrativo completo en la aplicación; la interfaz lo advierte. No se asignan `is_staff` ni `is_superuser` al crear la cuenta.

Para seleccionar propietario o inquilino debe existir un perfil residencial activo de ese tipo con la **misma cédula exacta** del empleado. Además, para inquilino debe existir el registro `Inquilino`. Esta verificación evita vincular por accidente los datos de otra persona. Si el perfil residencial no tiene cuenta, se puede crear una y el backend vincula la misma cuenta a ambos registros en una transacción. Si el perfil ya tiene una cuenta compatible, debe elegirse **Vincular cuenta existente**; el backend comprueba que sea la cuenta de ese mismo perfil. Los registros residenciales existentes no se crean ni modifican automáticamente salvo para establecer la cuenta en el caso de creación.

La vinculación también comprueba que el empleado esté activo y aún no tenga cuenta, que el usuario existente esté activo, tenga el rol elegido y no sea técnico, y que los perfiles asociados coincidan con la persona. Las operaciones de creación y vinculación se auditan sin contraseñas. Si falla la auditoría, la transacción revierte la cuenta y los vínculos de esa solicitud. El empleado pudo haberse guardado previamente: su creación y la creación o vinculación de cuenta son dos solicitudes distintas.

El backend sigue exigiendo que exista exactamente un grupo de Django compatible con el rol seleccionado. Si falta el grupo `inquilino` u otro, o si hay varios grupos que representan el mismo rol, mostrará un error: esta etapa no crea ni modifica grupos existentes. Para compatibilidad, un cliente antiguo que invoque el endpoint de empleado sin enviar el nuevo campo `rol` conserva el comportamiento anterior de guardia; el formulario actualizado exige selección explícita y siempre envía el rol.

Cuando se cambia un empleado mediante su endpoint, se comprueba la compatibilidad del usuario y que la cédula coincida con el perfil residencial que ya tenga asociado. El rol residencial sigue aplicando únicamente el alcance de datos de ese residente, no permisos administrativos o de seguridad. La relación de ocupación de inquilinos con unidades sigue pendiente, como antes.

## Pruebas y límites

- Pasaron 89 pruebas del backend en SQLite temporal, incluidas creación de administrador sin privilegios técnicos, creación y vinculación con perfiles residenciales, rechazo por identidad o perfil incompatible, cambios directos y rollback de una vinculación ante fallo.
- Pasaron cinco pruebas de la web, incluida una prueba de renderizado que comprueba las cuatro opciones de rol. Esta última no ejecuta una interacción completa con navegador y API.
- La compilación del frontend y ESLint de los archivos correspondientes pasaron; el build mantiene una advertencia de tamaño del paquete.
- No se crearon cuentas reales, no se ejecutaron migraciones en bases persistentes ni se modificaron grupos de la base del proyecto. No se añadió un rol de mantenimiento.

El empleado se puede desactivar por separado de su cuenta; la revisión del ciclo de baja y de revocación para administradores o residentes vinculados a empleados sigue siendo una cuestión operativa que debe definirse y probarse antes de depender de ella. La prueba interactiva del formulario completo sigue pendiente.
