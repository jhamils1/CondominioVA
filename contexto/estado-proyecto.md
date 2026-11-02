# Estado del proyecto

Revisión documental y estática: 2026-10-31. Sistema existente de gestión y seguridad de un condominio con backend Django, web React y móvil Flutter. El objetivo central del [enunciado](../documentacion/requisitos/Enunciado%20Proyecto%20condominio.docx) es automatizar vigilancia y alertas mediante visión artificial, conservando viviendas, habitantes y expensas. Una demostración solo administrativa no satisface ese objetivo.

## Requisitos del ingeniero que orientan el proyecto

Fuente primaria: [Enunciado Proyecto condominio](../documentacion/requisitos/Enunciado%20Proyecto%20condominio.docx). El usuario confirmó que recoge lo indicado por el ingeniero. Este resumen forma parte del contexto de trabajo; el Word conserva el texto original y debe consultarse para aclarar su alcance.

1. **Priorizar seguridad y automatización.** La gestión administrativa debe existir, pero no constituye por sí sola el objetivo ni una demostración suficiente del proyecto.
2. **Conservar la gestión de casas, habitantes y expensas**, como soporte para conocer el condominio y operar su seguridad.
3. **Aplicar visión artificial para identificar situaciones relevantes y emitir alertas.** El enunciado menciona vehículos estacionados en lugares prohibidos, perros o gatos en lugares donde no deberían estar, objetos perdidos y uso inapropiado de áreas comunes. Son situaciones a analizar; no demuestra que todas puedan resolverse con un detector de objetos ni define aún sus reglas de reconocimiento.
4. **Registrar incidencias y utilizar las cámaras para revisar lo ocurrido**, reduciendo la búsqueda manual de hechos en grabaciones.
5. **Incluir el control de ingreso de vehículos y el registro de vehículos visitantes**, buscando automatizar el control del condominio.
6. **Conocer cómo funciona el condominio y demostrar que el sistema funciona.** El ingeniero plantea una instalación con video real que pueda observarse remotamente o una simulación mediante una especie de maqueta. El escenario y los criterios concretos de la demostración siguen por definir.

### Separación entre requisitos y solución técnica

El ingeniero no especifica en este enunciado Django, React, Flutter, YOLO, RF-DETR Nano, Firebase ni la matriz de cuatro roles. Esas son tecnologías existentes o decisiones posteriores del proyecto, documentadas en [arquitectura](arquitectura.md), [decisiones técnicas](decisiones-tecnicas.md) y [roles](roles-permisos.md). Tampoco debe presentarse la selección de un modelo como cumplimiento de los casos de seguridad: faltan reglas, integración y demostración.

Al proponer nuevas etapas, indicar qué requisito anterior ayudan a cumplir y qué evidencia demostraría el resultado. Una prueba de bandeja o de permisos no equivale a demostrar detección mediante cámaras. Los estados siguientes describen la implementación actual, no sustituyen los requisitos del ingeniero.

## IMPLEMENTADO Y VERIFICADO

Verificado en código y respaldado por informes de pruebas previas, no vuelto a ejecutar en esta etapa:

- Roles efectivos y permisos por acción y datos; administrador de aplicación separado del superusuario técnico. Fuentes: `administracion/access.py`, `authentication.py` y [revisión](../Condominio-Backend/REVISION_PENDIENTES_ROLES_NOTIFICACIONES.md).
- Creación/vinculación de cuentas de empleados con cuatro roles, identidad residencial cuando corresponde y cuenta opcional. Fuente: [informe de cuentas](../Condominio-Backend/ROLES_CUENTAS_EMPLEADOS.md).
- Eventos manuales, notificaciones internas individuales, confirmación por guardia, descarte motivado, atención, actuaciones, resolución e historial. Fuentes: `seguridad_IA/notificaciones.py` y `api_notificaciones.py`.
- Bandeja web y móvil; lectura individual comprobada en emulador aislado según [resultados](../Condominio-Backend/RESULTADOS_EMULADOR_BANDEJA_AISLADA.md).

## PARCIALMENTE IMPLEMENTADO

- Existen modelos y APIs de personas, empleados, cargos, vehículos, bloques, unidades, visitas, mascotas, áreas comunes, reservas, objetos perdidos, contratos, expensas, multas e incidentes. Su existencia está confirmada; esta etapa no certifica todos sus recorridos ni el estado de datos reales.
- Plate Recognizer y Luxand tienen clientes y vistas de reconocimiento por fotografías. Identificación no equivale a autorización de ingreso.
- Cola FCM, reintentos y registro de dispositivos preparados; recepción push real y operación integral pendientes. La bandeja interna no demuestra entrega push.
- Aislamiento de residentes implementado con restricciones provisionales por falta de ocupación de inquilino y titularidad histórica completa.
- Auditoría administrativa e historial de eventos disponibles; no equivalen a un registro inmutable de todas las vías de modificación.

## EN CORRECCIÓN

Línea de trabajo abierta, sin corrección funcional autorizada durante la organización: edición de perfil móvil que comunica éxito sin persistir, flujo móvil antiguo de contraseña, recuperación incierta de dispositivos FCM y notificaciones administrativas/financieras incompletas. Consultar [pendientes](../memoria/pendientes.md).

## PLANIFICADO

Relación de ocupación inquilino–unidad con fechas; RF-DETR Nano para evaluar e integrar en servicio local separado; USB primero y RTSP posteriormente; eventos y evidencias privadas; preparación local/nube. No son funcionalidades ya entregadas.

## NO IMPLEMENTADO

Procesamiento continuo RF-DETR/YOLO, gestión integral de cámaras y zonas, seguimiento por cámara, ingestión autenticada del trabajador IA, evidencia privada y consulta de grabaciones en el flujo de eventos, sincronización offline del trabajador y configuración general de reglas de notificación. Las acciones de revisar/atender incidencias existen en web; la bandeja móvil revisada no las ofrece.
