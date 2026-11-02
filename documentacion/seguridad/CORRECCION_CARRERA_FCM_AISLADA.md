# Corrección aislada de la carrera FCM al cerrar sesión

**Actualización:** las [pruebas adicionales](PRUEBAS_ADICIONALES_CIERRE_FCM.md) detectaron y corrigieron en la copia dos defectos de expiración y rotación; el parche anterior sigue obsoleto.

Fecha: 2026-11-01 (America/La Paz). Etapa aprobada para la copia aislada. No está desplegada.

En `Condominio-Backend/backups_locales/proveniencia_fcm_aislada_20261031/`, copia ignorada por Git, se añadió una versión de operaciones FCM por sesión. La baja incrementa esa versión incluso si el identificador aún no existe; una sincronización iniciada antes de la baja comprueba la versión tras la validación externa y se rechaza si cambió. También se comprueban nuevamente sesión y vencimiento antes de guardar. Limpiar un pendiente no cierra la sesión y permite un registro posterior deliberado.

La procedencia guarda la última sesión que registró el dispositivo. El cierre bloquea sesión y usuario, desactiva los dispositivos vinculados a esa sesión, registra la acción y revoca la sesión en la misma transacción. Si otra sesión ya vinculó el dispositivo, la sesión anterior no puede desactivarlo. Las bajas y rotaciones rechazan dispositivos atribuidos a otra sesión. La validación externa continúa fuera de los bloqueos. Se preparó una migración adicional de sesión y se actualizó la migración aislada de procedencia; no se aplicaron a la base habitual.

## Pruebas y límites

- Siete pruebas con JWT real y PostgreSQL temporal, Firebase simulado: los dos órdenes inicialmente vulnerables, registro posterior a una baja, cierre sin baja previa, otras sesiones y cuentas, token ajeno y reversión ante fallo de auditoría. Todas pasaron. Se aplicó, revirtió y reaplicó la migración aislada de procedencia.
- Pasaron 19 pruebas adicionales de procedencia y carreras en PostgreSQL temporal y 100 regresiones de acceso en SQLite en memoria. Las pruebas antiguas con autenticación forzada se adaptaron para incluir una sesión ficticia, ya que el nuevo control requiere sesión. En una primera ejecución sin adaptar fallaron seis pruebas; tras adaptar la preparación pasaron las 100. Se repitió sin canalización y el proceso terminó con código 0.
- La atribución al último registro por sesión es una decisión técnica de la propuesta. Queda por comprobar más casos: expiración mientras se espera a Firebase o un bloqueo, revocación administrativa, cierre simultáneo, respuestas perdidas, dispositivos existentes sin sesión asociada y compatibilidad de clientes en situaciones de rotación o reinstalación. Un fallo de red que impida confirmar el cierre tampoco demuestra una baja en el servidor.
- No se midió ni modificó el timeout, no se probó el inicio de manejadores con red lenta ni se hizo esta validación con el teléfono o Firebase reales. No se ha hecho una revisión completa de bloqueos ni una prueba de carga. La copia y pruebas están ignoradas y no tienen commit.

El [parche anterior](PROPUESTA_PROCEDENCIA_FCM.patch) está **desactualizado y contiene la carrera original**. No aplicarlo; hay que preparar un parche actualizado después de completar la revisión. Antes de una incorporación se debe identificar la base y el servidor efectivos, actualizar el respaldo y acordar la transición de clientes y dispositivos. No se modificaron el backend en ejecución, su base de datos, la app instalada, cuentas reales ni envíos push en esta etapa.
