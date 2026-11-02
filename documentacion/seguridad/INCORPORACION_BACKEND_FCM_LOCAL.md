# Incorporación local del backend FCM

Fecha: 2026-11-01 (America/La Paz). El usuario solicitó continuar la transición. Alcance: base y servidor locales; **envíos push todavía pausados**.

Se generó un parche actualizado a partir de la propuesta probada en el entorno aislado y se comprobó su aplicabilidad antes de incorporarlo al backend. La protección valida procedencia de los identificadores FCM, evita reasignar identificadores ajenos y coordina registro, baja y cierre por sesión. El parche antiguo no debe aplicarse. El [parche actualizado](PROPUESTA_FCM_ACTUALIZADA.patch) representa el estado anterior a esta incorporación; ya se aplicó y no debe aplicarse de nuevo.

Se creó un respaldo de la base PostgreSQL local configurada con instantánea consistente y se restauró en un PostgreSQL temporal: coincidieron los recuentos de 40 tablas públicas. El archivo permanece en `backups_locales/respaldo_fcm_20261101_153254_035fc56c.dump`, ignorado por Git, con SHA-256 `b29860a2418b3350ce5b97e13e1dbbbd3a0e6afc05ba645f8ea3631122733e07`. Contiene datos privados; no se comprobó cifrado o ACL. La comparación de recuentos no verifica cada valor y la restauración excluyó propietarios y permisos originales. El respaldo no contiene archivos multimedia ni configuración.

Se aplicaron las migraciones aditivas `administracion.0007_sesion_version_fcm` y `finanzas.0003_procedencia_fcm` en esa base local. La operación comparó antes y después los recuentos de usuarios, dispositivos y notificaciones y no detectó cambios. Se respaldó la configuración local antes de habilitar la validación de procedencia para el Firebase propio y la bandeja interna de seguridad. La cola y el envío FCM de seguridad permanecen desactivados; el envío legado de expensas y objetos también permanece pausado según decisión anterior.

En una consulta local se observaron dos dispositivos activos, ninguno validado todavía para el Firebase nuevo, y cero entregas FCM de seguridad pendientes o reservadas. No se cambiaron sus titulares ni se enviaron mensajes. La bandeja del guardia de prueba respondió HTTP 200 con autenticación forzada en un cliente de prueba; no demuestra inicio de sesión real ni la interfaz del navegador.

Se inició Django local en `127.0.0.1:8000`, sin recarga automática, y la ruta de perfil devolvió HTTP 401 sin autenticación. El proceso se ejecuta en segundo plano; no se verificó el frontend en esta etapa. La app habitual no estaba instalada en comprobaciones anteriores; tampoco se instaló ahora.

## Verificaciones y límites

- Pasaron 100 pruebas de acceso en SQLite aislado, 19 de procedencia y 17 de cierre y bloqueo en PostgreSQL temporal. En ambos PostgreSQL temporales se aplicó, revirtió y reaplicó la migración de procedencia. Firebase fue simulado en esas suites.
- Django `check` terminó sin incidencias y `makemigrations --check --dry-run` no detectó cambios pendientes para administración y finanzas. Un proceso nuevo confirmó las migraciones aplicadas, bandeja y procedencia habilitadas, y cola/envíos pausados.
- El primer intento de habilitar bandeja se detuvo sin modificar `.env` porque la variable no existía; se ajustó el ejecutor para añadirla y el siguiente intento terminó correctamente. Los respaldos de configuración se guardaron en la carpeta local ignorada por Git; no se muestran sus contenidos.
- Las rutas genéricas antiguas de alta/edición de dispositivos quedan bloqueadas; clientes que dependan de ellas requieren actualización. El registro exige Firebase disponible y validación por proyecto. Falta verificar cierre administrativo concurrente, todos los clientes, iOS, red lenta y política de reintentos. La prueba en teléfono de la etapa previa fue aislada, no comprueba este servidor habitual.
- Sin dispositivos validados no hay receptores push elegibles. Además, los indicadores de cola y envío siguen desactivados y el comando `procesar_fcm_seguridad` procesa un lote y termina: no se ha configurado un trabajador continuo. Activarlos sin resolver el registro y la operación del procesador no completa las notificaciones móviles. La bandeja depende de que el servidor local esté funcionando.

Los cambios del repositorio y los nuevos archivos aún no están en un commit. No se inició visión artificial, no se usaron cuentas reales para enviar mensajes y no se modificaron los datos de titulares de dispositivos.
