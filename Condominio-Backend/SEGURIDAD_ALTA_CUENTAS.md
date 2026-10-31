# Alta y vinculación segura de cuentas

## Cambios

Se sustituyeron los botones que generaban contraseñas desde datos personales y usaban IDs de rol fijos en los formularios de empleado, propietario e inquilino. La persona se puede seguir registrando sin cuenta. Para crear o vincular una cuenta, primero se guarda el perfil, se vuelve a editar y se usa el nuevo bloque **Cuenta de acceso**; en empleados se identifica como **Cuenta de guardia**, sin convertir automáticamente a todos los empleados en guardias.

El administrador puede elegir un nombre de usuario, correo y contraseña, o seleccionar una cuenta existente con el rol compatible. El backend determina el grupo por nombre, exige que exista exactamente uno, comprueba tipo y estado del perfil y no permite sobrescribir un vínculo existente. Al vincular una cuenta existente exige que esté activa, no sea una cuenta técnica y no pertenezca ya a otro perfil. La selección en interfaz puede incluir cuentas ya vinculadas; el backend las rechaza.

`POST /api/provisionar-cuenta/` está limitado a administradores. Para `modo=crear` recibe `tipo`, `perfil_id`, `username`, `email` y `password`; para `modo=vincular` recibe `tipo`, `perfil_id` y `usuario_id`. Los tipos son `empleado`, `propietario` e `inquilino`; el tipo empleado implica asignar explícitamente el rol de guardia. La cuenta y su vínculo se crean en una transacción y se registra la operación en la auditoría existente. Si falla cualquier paso, la cuenta nueva no se conserva. Las contraseñas no se imprimen ni forman parte de la respuesta.

No se cambiaron modelos, datos reales, migraciones ni la forma existente de subir imágenes. El bloque de cuenta opera sobre el perfil ya guardado; si hay cambios pendientes en el formulario deben guardarse primero. Si se crea la cuenta y luego se cancela la edición del perfil, la vinculación ya se ha completado. La nueva operación no modifica automáticamente cuentas creadas por el flujo anterior.

## Verificación y límites

Las pruebas usan SQLite en memoria y datos ficticios. Cubren los tres tipos, IDs de grupo distintos, grupo faltante o duplicado, contraseña inválida, roles incompatibles, cuentas técnicas o ya vinculadas, perfiles inactivos, denegación para guardias, creación de perfiles sin cuenta y reversión cuando falla el registro de auditoría. No se han probado las pantallas interactivamente con navegador, la concurrencia real en PostgreSQL ni las subidas de imágenes a proveedores reales. Se recomienda revisar las cuentas creadas con contraseñas predecibles anteriormente mediante un administrador autorizado.

Archivos principales: `administracion/provision.py`, `administracion/urls.py`, `administracion/tests_access.py`, `src/components/CuentaPerfil.jsx`, `src/api/userApi.jsx` y los formularios `EmpleadoForm.jsx`, `PropietarioForm.jsx` e `InquilinoForm.jsx`.
