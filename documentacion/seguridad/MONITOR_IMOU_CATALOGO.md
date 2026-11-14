# Monitor Imou y catálogo — 2026-11-07

La cámara Imou existente puede vincularse de forma persistente a un registro del catálogo. Una vez vinculada, el puente local actualizado obtiene la IP, el puerto, la ruta RTSP y las credenciales cifradas desde ese registro. El administrador podrá editar la IP en Gestión de cámaras sin editar el archivo privado. La vinculación mantiene la zona Imou compartida y no crea una cámara nueva.

La acción **Vincular al monitor** copia al catálogo las credenciales y la ruta de la configuración local existente. Requiere administrador local, una única cámara Imou coincidente y datos compatibles; rechaza conflictos. Sin vinculación se mantiene el funcionamiento anterior. Si existe una vinculación inválida, la conexión falla sin utilizar otra cámara por sorpresa. El puente debe reiniciarse para cargar su código actualizado.

Se aplicó la migración aditiva `camaras.0003_monitorimou` a la base PostgreSQL local. Antes se creó `Condominio-Backend/backups_locales/antes_monitor_catalogo_20261107_143244.dump`; se comprobó que el listado del respaldo se puede leer, no se ha ensayado una restauración. Al finalizar la revisión, la cámara aún no estaba vinculada y la IP de su registro seguía siendo la de Wi-Fi. No se cambió la IP de la cámara ni se probó la vista real mediante el catálogo.

Pasos pendientes: reiniciar el puente local, vincular la cámara desde Gestión de cámaras, confirmar la imagen, y después cambiar la IP del catálogo para probar Ethernet. La conectividad sin Wi-Fi de la cámara sigue pendiente. La implementación vincula una sola cámara al monitor Imou actual; selección de múltiples cámaras, zonas independientes y monitor genérico son etapas posteriores. Las notificaciones push por Firebase requieren conexión a Internet.

Verificación en entorno aislado: 34 pruebas Django, cuatro pruebas del puente, migraciones sin cambios pendientes, compilación y ESLint del frontend y recorrido web simulado del catálogo. No sustituye una prueba de cámara real después de vincular.

## Activación posterior — 2026-11-07

Se comprobó que ya existe el vínculo persistente y se reinició el puente local anterior. El puente actualizado responde en el endpoint del catálogo. Una consulta al flujo a través de Django quedó en estado 202 (conectando) tras ocho intentos: todavía no se ha confirmado un fotograma real con la configuración del catálogo. La dirección registrada seguía siendo la de Wi-Fi; no se modificó la configuración de red ni se envió una notificación de prueba.

Después se comprobó que el puerto RTSP respondía en Wi-Fi y Ethernet desde Windows, pero el puente ejecutado en entorno restringido no recibía imagen. Se reinició el puente con acceso a la red local y Django recibió un fotograma (HTTP 200) utilizando el catálogo y la IP Wi-Fi, sin guardarlo. No se comprobó la vista en el navegador ni el monitor usando Ethernet o sin Wi-Fi.
