# Registro de empleado y cuenta de guardia en una misma ventana

> Actualización posterior: por decisión del usuario, la sección ahora permite elegir cualquiera de los cuatro roles existentes. Los roles residenciales exigen un perfil compatible con la misma cédula. Consulta `Condominio-Backend/ROLES_CUENTAS_EMPLEADOS.md`; el texto siguiente describe la versión anterior de esta etapa.

Al guardar un empleado nuevo, la ventana continúa abierta y permite crear una cuenta de guardia o vincular una cuenta compatible existente. También se puede finalizar sin cuenta. La edición de empleados ya existentes conserva su flujo anterior. La sección aclara que la cuenta obtiene acceso de guardia.

El empleado se guarda primero mediante la API existente; después se llama al servicio existente de vinculación. Son **dos operaciones**, no una transacción conjunta. Si falla la cuenta, el empleado queda guardado y la ventana muestra el error. Si se pierde la respuesta del servidor, se advierte revisar si ya existe el empleado o si la cuenta quedó vinculada antes de reintentar. Durante las solicitudes de cuenta se deshabilita el botón de finalizar.

El rol de guardia se asigna por la lógica existente del backend, no por el nombre del cargo. El backend actual acepta asociar una cuenta de guardia a un empleado activo sin comprobar el nombre del cargo. La opción está destinada a empleados autorizados para seguridad; habilitar cuentas con otros roles para otros cargos requiere definir esa política y adaptar el backend. No se introdujo un rol nuevo ni se habilitaron cuentas automáticamente.

## Verificación

- `npm.cmd run build`: compilación correcta; se mantiene la advertencia de paquete principal mayor a 500 kB.
- ESLint de `EmpleadoPage.jsx` y `CuentaPerfil.jsx`: sin errores.
- Siete pruebas existentes de acceso y cierre de sesión: pasaron.
- Prueba de renderizado de `CuentaPerfil`: confirma que un empleado guardado presenta opciones para crear o vincular una cuenta de guardia. Es una prueba de renderizado, no una prueba interactiva de la secuencia completa ni de la API real.

No se cambió el backend ni se crearon empleados o cuentas reales durante esta etapa. No se verificó el flujo completo en un navegador con un servidor de prueba.
