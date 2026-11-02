# Decisiones técnicas

Registro consolidado el 2026-10-31. Cuando no existe fecha exacta comprobable de aprobación se indica expresamente; no usar la fecha del archivo como prueba de aprobación.

| Fecha | Estado | Decisión y justificación | Consecuencia / fuente |
| --- | --- | --- | --- |
| Anterior al 2026-10-31; fecha exacta pendiente | Aprobada | Mantener Django, React y Flutter existentes para conservar funciones | No reconstruir componentes; [arquitectura](arquitectura.md) |
| Anterior al 2026-10-31; fecha exacta pendiente | Aprobada | Cuatro roles funcionales y separación de superusuario técnico | Permisos en backend y perfiles efectivos; [roles](roles-permisos.md) |
| Anterior al 2026-10-31; fecha exacta pendiente | Aprobada | Aviso inicial a todos los guardias activos; administrador después de confirmación | Revisión humana antes de incidencia, residentes excluidos |
| Anterior al 2026-10-31; fecha exacta pendiente | Aprobada como enfoque; pendiente implementación | Ocupación inquilino–unidad con fechas para conservar historial | No ampliar datos de inquilinos sin vínculo verificable ni migrar sin aprobación |
| Anterior al 2026-10-31; fecha exacta pendiente | Aprobada | Mantener expensas históricas restringidas hasta definir titularidad | El filtro por contrato actual es provisional |
| Anterior al 2026-10-31; fecha exacta pendiente | Aprobada e implementada según informe | Rechazar sesiones anteriores sin identificador; volver a iniciar sesión | [Revocación](../Condominio-Backend/SEGURIDAD_REVOCACION_SESIONES.md) |
| Anterior al 2026-10-31; fecha exacta pendiente | Aprobada e implementada según código/informe | Empleados con cualquiera de cuatro roles si cumplen perfil; cuenta opcional | Cargo no impone acceso; limpieza puede no tener cuenta; [cuentas](../Condominio-Backend/ROLES_CUENTAS_EMPLEADOS.md) |
| 2026-10-31 (consolidación de solicitud) | Aprobada como orientación, evaluación pendiente | RF-DETR Nano local separado de Django | Sustituye orientación YOLO anterior; no hay integración ni comparación de rendimiento realizada |
| 2026-10-31 (informes de preparación) | Aprobada para pruebas aisladas; entrega real pendiente | Separar pruebas de cuentas/dispositivos habituales | Variante Android y base temporal probadas sin Firebase externo |
| 2026-10-31 | Aprobada y ejecutada en esta etapa | Organizar documentación, contexto, memoria y skills preservando componentes | [Informe documental](../documentacion/auditorias/ORGANIZACION_DOCUMENTAL_2026-10-31.md) |
| 2026-11-01 | Preferencia vigente del usuario | Desarrollar en el entorno local de desarrollo, con comprobaciones breves y necesarias, evitando pruebas extensas o entornos aislados innecesarios | Preservar datos existentes y respetar las aprobaciones entre etapas |
| 2026-11-01 | Preferencia vigente; limpieza pendiente de concretar | Identificar los datos y recursos temporales de cada demostración y retirarlos al finalizar cuando sea seguro | El usuario quiere realizar sus pruebas manuales; no borrar datos preexistentes o historial sin identificar su alcance ni confundir datos de prueba con pruebas automatizadas |
| Fecha pendiente | Propuesta / confirmar | Despliegue futuro Railway y sincronización local/nube | Hay referencias y archivos de despliegue, no certificación operativa |

Alternativas históricas: YOLO figura en la auditoría inicial, pero no se integra en esta etapa; no se ha documentado una comparación experimental con RF-DETR. La obligatoriedad de cuenta para todos los empleados fue considerada y no se adoptó: la decisión vigente es opcional. No se incorpora un rol de mantenimiento.

Estas preferencias no autorizan modificar producción, hacer migraciones destructivas ni eliminar datos existentes de procedencia desconocida. Identificar el alcance de los envíos reales y la limpieza. Mantener las pruebas automatizadas útiles; retirar datos temporales no implica borrar el código de prueba. Si una verificación necesita más que una comprobación breve, explicar el motivo.

Pendientes: licencias de modelos, pesos y exportadores; compatibilidad y hardware objetivo; diseño de cámaras/evidencias; retención; baja de cuentas vinculadas; destinatarios de avisos administrativos/financieros; configuración de despliegue. No se afirma una razón de rendimiento o licenciamiento no medida para la selección de RF-DETR.
