# Integración web de roles personalizados

Fecha: **2026-10-31**, America/La_Paz. Estado: **escenario integral aprobado**. Etapa autorizada por «continua» después del informe Android. No se modificaron cuentas, configuración `.env`, base habitual, Firebase ni teléfono.

## Alcance y resultado

Se ejecutó React real en Microsoft Edge headless con dos contextos nuevos, administrador y empleado ficticios, contra Django y SQLite temporales. No se simularon las respuestas de roles, autenticación ni visitas. El acceso interactivo del conector de navegador seguía indisponible; se añadió una prueba reproducible de desarrollo con Playwright, sin usar perfiles personales.

Un escenario E2E pasó en **16,5 segundos** (21,9 segundos del ejecutor). Verificó:

1. Login mediante el formulario React, con cuentas exclusivamente ficticias.
2. Los cuatro roles predeterminados visibles y sin botones de edición/eliminación.
3. Crear un rol inactivo y sin permisos; asignación deshabilitada mientras está inactivo.
4. Activar y asignar desde la web a un empleado activo; comprobar una cuenta asignada.
5. Login de ese empleado, nombre del rol y rechazo de rutas de visitas, usuarios, roles, expensas y eventos sin capacidad.
6. Conceder consulta desde React, recargar la sesión y consultar una visita ficticia. Sin controles de modificación ni columnas de documentos/teléfonos.
7. Retirar la capacidad con la sesión abierta: nueva consulta devuelve 403 y no muestra registros; al recargar desaparece la opción del menú.
8. Cerrar sesión desde la interfaz, limpiar credenciales locales y comprobar que access y refresh anteriores reciben 401.
9. Nuevo login, desactivar el rol desde el administrador y comprobar expulsión al recargar y rechazo del siguiente login.

La revisión visual de las tres capturas confirmó el formulario de asignación, la consulta autorizada y la respuesta de denegación, sin desbordamientos que impidieran este recorrido a 1440×1000. No es una evaluación completa de diseño adaptable.

## Cambios

- `Condominio-Frontend/e2e/roles.spec.js`, `e2e/run.mjs`, guía y `playwright.config.js`: escenario, arranque y aislamiento.
- `package.json`/lock: script `test:e2e` y Playwright **1.64.1**, con tres paquetes de desarrollo añadidos. Sin actualización de dependencias existentes.
- `.gitignore` del frontend: resultados e informes locales excluidos.
- Runner `administracion/run_roles_web_isolated.py`: opción exclusiva `--web-check`, servidor temporal, ejecución Playwright y cierre automático. No cambia el URLConf ni las vistas del servidor habitual.
- Memoria, contexto e índice documental actualizados. Sin cambios funcionales en componentes React ni Flutter durante esta etapa.

## Aislamiento y limpieza

Backend en `127.0.0.1:18081`, Vite en `127.0.0.1:15173`. Comprobación de identidad `prueba-aislada` antes del login, Firebase deshabilitado y conexiones externas bloqueadas. Dos perfiles efímeros de navegador, sin lectura del perfil habitual. No se guardan trazas de red con tokens ni videos.

El runner confirmó «Servidor cerrado y directorio temporal eliminado». La comprobación posterior confirmó **18081 y 15173 cerrados**. Las capturas de datos ficticios permanecen en `Condominio-Frontend/test-results/`, ignorado por Git, y se regeneran al repetir el comando. No se creó el rol ficticio en la base local habitual. No se accedió al teléfono.

## Comprobaciones adicionales

| Comprobación | Resultado |
| --- | --- |
| `npm run test:e2e` | 1 escenario aprobado, código 0 |
| Node: `access.test.js`, `closeSession.test.js`, `RolList.test.js` | 9 pruebas aprobadas |
| Runner backend `--check` | 26 solicitudes correctas; permisos, auditoría, revocación y ausencia de dispositivos |
| ESLint de configuración y nuevos scripts | Sin errores |
| `npm run build` | Correcto; advertencia existente por bundle mayor a 500 kB |
| `git diff --check` | Sin errores |

La primera prueba E2E falló porque `check()` espera un cambio inmediato en la casilla controlada por respuesta del servidor; se sustituyó por clic y aserción con espera del estado. El segundo intento completó el flujo pero señaló los rechazos esperados de Stripe por el bloqueo externo. Se documentó esa exclusión concreta, manteniendo el fallo ante cualquier otro error JavaScript. La ejecución final pasó. La primera ejecución SSR falló por acceso denegado de esbuild a sus dependencias en el entorno restringido; se detuvo ese proceso y las nueve pruebas pasaron al repetir con acceso autorizado.

La instalación inicial de npm falló por acceso de red; el reintento autorizado instaló solo la dependencia de desarrollo. `npm audit` informó **6 avisos moderados** en `minimatch` y su cadena de ESLint preexistente, sin solución automática indicada. Ninguno corresponde a Playwright; el diff del lock confirma que no se actualizaron esos paquetes. No se ejecutó `audit fix --force`. Se requiere una etapa de compatibilidad para resolverlos: [aviso GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).

## Límites y siguiente etapa

- El servidor aplica la revocación en la siguiente petición. El menú conserva las capacidades cargadas hasta recargar; no existe sincronización instantánea de permisos entre sesiones. Datos ya visibles no desaparecen por un evento remoto sin nueva consulta/navegación. No se afirma borrado retroactivo de información ya recibida.
- Los roles personalizados solo tienen implementada la capacidad de **consultar visitas pendientes y activas**. Esta prueba no habilita nuevas capacidades ni destinatarios de seguridad.
- Los pagos y el dashboard financiero no se validaron. Stripe intenta cargarse anticipadamente desde módulos importados, y sus errores de carga son esperados en este entorno sin servicios externos. Se recomienda una revisión posterior de carga bajo demanda.
- No cubre todos los endpoints, dispositivos, navegadores ni la creación completa de empleado/cuenta. Los requisitos de perfiles se mantienen en backend.
- Push sigue pendiente de identificar o crear un proyecto Firebase separado, preparar su variante y ejecutar una prueba expresamente autorizada. La bandeja persistente y la entrega push son comprobaciones distintas. Ver [plan Firebase](../../Condominio-Backend/PLAN_COMPATIBILIDAD_FIREBASE_AISLADO.md).

Comando reproducible y requisitos: [guía E2E](../../Condominio-Frontend/e2e/README.md). Referencias de implementación: [servidores de prueba Playwright](https://playwright.dev/docs/test-webserver) y [canal Microsoft Edge](https://playwright.dev/docs/browsers).
