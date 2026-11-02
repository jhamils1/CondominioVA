# Propuesta para corregir el alta de cuentas

**Estado:** propuesta aprobada e implementada para perfiles ya guardados. El detalle de uso y pruebas está en `Condominio-Backend/SEGURIDAD_ALTA_CUENTAS.md`.

## Problema comprobado

Antes del cambio, los formularios auxiliares de empleado, propietario e inquilino generaban contraseñas a partir de datos personales y usaban números fijos para el rol. Los identificadores de grupos pueden variar entre bases. Ese procedimiento fue sustituido; las cuentas creadas anteriormente requieren revisión por separado.

Los flujos tampoco vinculan todas las cuentas de la misma forma: el formulario de propietario intenta conservar el ID de la cuenta, mientras que los servicios de empleado e inquilino inspeccionados no envían una vinculación equivalente al guardar. El serializer de `Inquilino` no incluye el campo `user`; el vínculo real está en `Persona.user`. Una cuenta de guardia solo tiene acceso efectivo cuando está vinculada a un `Empleado` activo, y una de inquilino cuando se vincula a una `Persona` activa de tipo `I` con su registro de inquilino. Por eso crear únicamente el usuario puede dejar una cuenta sin acceso efectivo.

## Cambio propuesto para revisión

1. Conservar las pantallas existentes de gestión de personas y el formulario general de usuarios, pero sustituir el botón auxiliar inseguro por un formulario que solicite nombre de usuario, correo y una contraseña elegida por el administrador. No generar la contraseña a partir de teléfono, nombre ni CI y no imprimirla en logs.
2. Determinar el grupo mediante su nombre reconocido en el backend, sin asumir números. Si falta el grupo o hay duplicados equivalentes, mostrar un error y no crear la cuenta.
3. Garantizar desde Django que la cuenta tenga el rol correspondiente y quede vinculada al `Empleado` o `Persona` adecuado. La creación de cuenta y la vinculación deben ser atómicas dentro de la base de datos: si falla la validación o el vínculo, no dejar una cuenta nueva parcialmente creada.
4. Mantener separados el alta de la persona y la cuenta cuando el administrador no quiera dar acceso. Para un registro existente, permitir vincular una cuenta compatible sin reasignar ni sobreescribir silenciosamente un vínculo ya existente. Evitar asignar acceso a familiares o visitantes.
5. Mantener las subidas de imagen existentes y estudiar su secuencia por separado: la llamada a un servicio externo no puede revertirse con una transacción de base de datos. No enviar imágenes ni crear cuentas reales en las pruebas.
6. Probar con datos ficticios: roles con IDs distintos, grupo inexistente o duplicado, contraseña elegida, error de validación, vínculo ya ocupado, reversión transaccional y autorización de administrador. Probar también alta sin cuenta y regresión de formularios.

## Alcance y riesgos

No se prevé cambiar modelos ni crear migraciones, aunque hay que revisar las validaciones y los consumidores al definir el contrato de la API. El comportamiento del botón de creación de usuario cambiaría y puede afectar la forma actual de registrar personas; el vínculo debe tratarse por tipo y no suponer que todos los empleados son guardias. La configuración en producción y las cuentas existentes no se modificarían automáticamente.

La propuesta fue aprobada. No se migraron datos ni se cambiaron automáticamente cuentas existentes; se requiere revisar las cuentas creadas con el flujo anterior.
