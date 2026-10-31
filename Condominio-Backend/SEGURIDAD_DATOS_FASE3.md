# Fase 3: aislamiento de datos por usuario

## Alcance

Se mantienen los controles de roles de la fase 2 y se refuerza el acceso a datos residenciales y financieros. El administrador conserva sus consultas generales. No se ha añadido ningún modelo, migración ni dependencia.

## Reglas aplicadas

- Para viviendas y bloques, el propietario necesita exactamente un contrato activo, no futuro, asociado a la unidad y a su usuario. Si hay varios contratos activos simultáneos, se restringe la unidad hasta aclarar los datos.
- Las expensas y multas pasan por el mismo filtro de unidad y, adicionalmente, la fecha de emisión de la expensa debe ser igual o posterior a la fecha del contrato activo. Las expensas anteriores quedan restringidas al propietario; el administrador conserva acceso.
- Esta fecha es una medida provisional: el modelo no registra explícitamente el período de titularidad ni el responsable de la expensa. Un contrato activo con fecha posterior al inicio real, o datos incorrectos, puede ocultar expensas legítimas; la fecha del contrato por sí sola no demuestra la titularidad histórica. Se requiere una solución de datos y una regla histórica definitiva antes de considerar resuelta la atribución.
- Los contratos del propietario siguen filtrados por su persona. Los vehículos de residentes siguen filtrados por su propia persona. Antes de subir la imagen de un vehículo se comprueba el acceso al objeto y la persona indicada.
- El propietario solo ve visitas donde figura como receptor; la respuesta no incluye el CI del visitante y la búsqueda no permite consultar ese dato oculto. No existe un vínculo de visita con unidad que permita verificar la unidad visitada.
- El inquilino no puede consultar unidades, contratos, expensas, multas ni visitas de una unidad mientras no exista una relación verificable con ella. Conserva el acceso a su perfil y vehículos propios. Su perfil ya no expone el CI del propietario ni el identificador biométrico.
- El usuario decidió añadir más adelante una relación de ocupación entre inquilino y unidad, con fechas. Diseñar y aplicar el esquema correspondiente requiere aprobación específica para las migraciones; esta fase no lo crea ni presupone datos.
- La búsqueda de inquilinos y familiares del propietario utiliza solamente nombres y apellidos, para evitar búsquedas sobre números de identidad o teléfonos no visibles.
- La verificación de un pago comprueba primero que la expensa sea accesible y que el identificador esté asociado a ella, antes de consultar Stripe. También verifica los metadatos antes de marcarla pagada.
- El registro y actualización de dispositivos FCM rechazan un token ya asignado a otra cuenta, evitando una transferencia silenciosa. Un cambio legítimo de cuenta en el mismo dispositivo requiere un proceso explícito posterior; no se ha implementado aquí.

## Pruebas y límites

Desde el directorio del backend: `.\env\Scripts\python.exe -B -m administracion.run_access_tests`. Las pruebas usan SQLite en memoria, crean tablas temporalmente sin ejecutar migraciones, y simulan los servicios externos. Cubren datos propios y ajenos, contratos terminados y simultáneos, unidades múltiples, expensas históricas, inquilinos sin unidad vinculada, visitas, pagos y dispositivos FCM. `manage.py check` comprueba configuración de Django; no valida PostgreSQL ni concurrencia real.

Los controles de dispositivos utilizan bloqueo de fila cuando el dispositivo existe y la unicidad disponible en el modelo FCM. La concurrencia y el cambio legítimo de cuenta deben verificarse con PostgreSQL y el flujo móvil antes del despliegue. Los permisos históricos de grupos de Django señalados en fase 2 no se han modificado. El frontend y Flutter requieren adaptación y pruebas posteriores; los campos restringidos pueden afectar clientes existentes.
