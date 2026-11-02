# Preparación de la app habitual y procesador FCM

**Actualización:** tras el reintento se instaló y registró el teléfono; el usuario confirmó recepción y apertura de una [prueba directa de seguridad](ACTIVACION_LOCAL_PUSH_GUARDIA.md). La prueba no crea una incidencia ni comprueba el recorrido real por la cola.

Fecha: 2026-11-01 (America/La Paz). El usuario pidió continuar con la aplicación habitual y los avisos de seguridad.

Se compiló la APK Android habitual desde el código móvil actual, configurada para acceder por USB a `127.0.0.1:8001/api`. Se verificó que el paquete sea `com.condominiun.smart` y que los recursos incluyan el proyecto Firebase previsto. Se configuró el enlace ADB del puerto 8001 del teléfono al 8000 de Django; la comprobación de la API devolvió 401 para la petición anónima. La app habitual no figuraba instalada al comenzar el intento.

El primer intento de instalación terminó con `INSTALL_FAILED_USER_RESTRICTED: Install canceled by user`. No se sabe si Android mostró una confirmación; se solicitó al usuario mantener el teléfono desbloqueado. En ese intento no se instaló la app, no se registró un dispositivo ni se enviaron notificaciones. La compilación está en `condominio-movil/build/app/outputs/flutter-apk/app-debug.apk`; es una build debug para uso local por USB, no una distribución final.

Para hacer posible el procesamiento continuo se amplió `procesar_fcm_seguridad` con `--continuo` e intervalo configurable de 1 a 60 segundos. El comportamiento anterior de un lote se conserva. El modo continuo cierra conexiones antiguas, procesa lotes y reintenta errores de base sin imprimir detalles sensibles; se detiene con interrupción. Las comprobaciones de indicadores impiden arrancarlo si el envío está pausado. Pasaron cuatro pruebas unitarias con base y Firebase simulados, y `manage.py check` no encontró problemas. La primera ejecución de pruebas falló por una clase de test incompatible con `override_settings`; se corrigió y las cuatro pasaron.

El procesador **aún no está iniciado** y la cola y el envío push de seguridad siguen desactivados. No hay dispositivo validado para el Firebase nuevo; los dos registros anteriores no se reasignaron. Los push de expensas y objetos perdidos siguen pausados. El backend local y su bandeja están habilitados, pero no se ha probado la app habitual en el teléfono ni el envío push completo con la base local.

Pendiente: instalación aceptada, inicio de sesión del guardia de prueba por el usuario, confirmar el registro seguro sin exponer el identificador y coordinar activación de cola/envío y ejecución del procesador. Las rutas de recepción y apertura se comprobaron previamente solo con una variante y base aisladas.
