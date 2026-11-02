# Activación local de roles y conexión Android USB

Fecha: 2026-10-31. Esta etapa actualiza el estado de la [verificación anterior](RESULTADO_MOVIL_ROLES_PERSONALIZADOS.md).

## Alcance y autorización

El usuario pidió resolver el funcionamiento web/móvil y luego autorizó expresamente «activar los roles personalizados en la base local de desarrollo y habilitar el grupo Inquilino». La revisión automática inicialmente rechazó esa activación por requerir autorización específica; no se ejecutó el paso rechazado hasta recibirla. No se autorizó una ampliación general del catálogo de capacidades ni cambios de roles de cuentas existentes.

## Cambios completados

- Se identificó Django en `127.0.0.1:8000` y la aplicación Android configurada para `127.0.0.1:8001/api`. El teléfono conectado no tenía un enlace inverso ADB. Se estableció `tcp:8001 -> tcp:8000`.
- Se confirmó que la base es PostgreSQL local de desarrollo `condominio`. Se creó `Condominio-Backend/backups_locales/condominio_antes_roles_20261031_164708.dump`, de 136939 bytes. El directorio está excluido de Git. El archivo contiene datos privados: conservarlo localmente, no adjuntarlo a informes públicos.
- El respaldo se restauró íntegramente en una instancia PostgreSQL 17 temporal. Allí se ensayaron `administracion.0005` y `0006`; las 34 tablas anteriores comparadas conservaron cantidad y huella de contenido. Se excluyeron de esa comparación las tres tablas de metadatos que Django actualiza al migrar. La instancia temporal se cerró y eliminó.
- Se aplicaron únicamente esas dos migraciones aditivas a la base local, con la misma comprobación de preservación. Se añadieron las tres tablas de roles personalizados; no se ejecutaron migraciones de otras aplicaciones.
- Se habilitó el grupo `inquilino` mediante la vista de roles existente y su auditoría, con el administrador autorizado. Quedó sin permisos técnicos y sin cuentas asignadas.
- Se añadió/actualizó exclusivamente `ROLES_PERSONALIZADOS_ACTIVOS=True` en el `.env` local. El valor predeterminado del código sigue siendo `False` para otros entornos. Se solicitó la recarga automática de Django y se comprobó su nuevo proceso en el mismo puerto.
- Se compiló la aplicación actual con `flutter build apk --debug --no-pub --dart-define=API_BASE_URL=http://127.0.0.1:8001/api` y se instaló con `adb install -r`. Android confirmó `Success` y actualización a las 16:50:57; se conservaron datos, sin desinstalar ni borrar almacenamiento. La aplicación mantiene `versionCode=1`.
- Se añadió [conectar-usb.ps1](../../condominio-movil/conectar-usb.ps1), que comprueba un único teléfono autorizado y la respuesta de Django antes de establecer el enlace. No inicia servidores ni altera cuentas.

## Comprobaciones y límites

El teléfono recibió `HTTP/1.1 401 Unauthorized` al consultar `/api/me/` sin credenciales: demuestra que el trayecto USB llega a Django, no que un usuario haya iniciado sesión. Se verificó antes y después de la recarga del backend.

Una comprobación local de la vista administrativa con `APIRequestFactory` y autenticación forzada devolvió 200 para roles personalizados. Se confirmó el indicador leído desde configuración local, los cuatro roles disponibles, el rol administrativo de `admin`, cero roles personalizados creados, cero asignaciones personalizadas y ninguna migración objetivo pendiente. Esta comprobación no utiliza la contraseña del usuario ni demuestra una interacción React completa en navegador.

La compilación y la instalación Android fueron correctas. No se introdujeron credenciales ni se verificó visualmente un inicio de sesión en la aplicación instalada. Continúan pendientes el recorrido visual web, la prueba integral móvil de rol personalizado y la entrega push en Firebase separado. No se enviaron notificaciones de prueba ni se reasignaron dispositivos FCM.

La capacidad personalizada disponible sigue siendo **consultar visitas pendientes y activas**. Los nuevos roles nacen inactivos y sin permisos; asignarlos requiere una cuenta de empleado compatible. Activar el catálogo no concede esa capacidad a ninguna cuenta existente.

## Uso y recuperación

Recargar la página web `/admin/roles` para que consulte el estado actualizado y volver a abrir la aplicación Android. Mantener Django funcionando y el cable USB conectado. Si se pierde el enlace tras desconectar/reiniciar, ejecutar desde `condominio-movil`:

```powershell
.\conectar-usb.ps1
```

Para deshabilitar solo los roles personalizados, establecer `ROLES_PERSONALIZADOS_ACTIVOS=False` y reiniciar Django; esto no borra tablas ni datos, pero las cuentas exclusivamente personalizadas perderían acceso. No revertir migraciones ni restaurar el respaldo sobre la base activa sin revisar los datos posteriores y obtener autorización. El respaldo y el manifiesto de comprobación permanecen en `backups_locales/`, sin commit ni publicación.
