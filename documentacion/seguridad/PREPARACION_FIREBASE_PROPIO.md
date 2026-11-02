# Preparación de Firebase propio

Fecha: 2026-10-31. El usuario creó el proyecto `condominio-seguridad`, registró la aplicación Android `com.condominiun.smart` y descargó su `google-services.json`. El archivo descargado se comprobó sin mostrar sus claves: proyecto, paquete y opciones requeridas están presentes.

## Preparado

En el directorio local ignorado `Condominio-Backend/backups_locales/firebase_preparacion_20261031/` se conservaron copias de las configuraciones Android anteriores y se prepararon los archivos nuevos `google-services.nuevo.json` y `firebase_options.nuevo.dart`. Se modificó solamente el bloque Android de la copia propuesta de opciones Flutter; la configuración anterior de iOS se conservó. Las copias no activan Firebase ni son una migración de iOS.

Se compararon los identificadores de proyecto, aplicación y remitente y la clave de la configuración cliente entre ambos archivos propuestos, sin imprimir valores. Se verificó que las dos configuraciones activas coinciden con sus copias anteriores; `dart format --output=none` sobre la propuesta pasó sin cambios. Una llamada inicial al wrapper `dart.bat` quedó bloqueada y se interrumpió; el ejecutable Dart directo finalizó correctamente. No se hizo compilación ni prueba de dispositivo con el proyecto nuevo.

## Pendiente

El usuario descargó una clave de cuenta de servicio del proyecto nuevo en Descargas. Con la autorización dada para preparar la conexión, se revisó localmente sin imprimirla ni copiarla al repositorio. Un proceso temporal validó la estructura y la clave; una consulta de solo lectura a Firebase respondió HTTP 200 para el proyecto nuevo. Esto verifica la credencial y el acceso de consulta, no la entrega de mensajes. [Guía oficial de Admin SDK](https://firebase.google.com/docs/admin/setup).

El backend ahora admite `FIREBASE_CREDENTIALS_PATH` para indicar un archivo privado de cuenta de servicio. Conserva la prioridad anterior de `FIREBASE_CREDENTIALS_JSON`; si no se indica ninguno, mantiene el archivo anterior como antes. No se añadió el valor de la ruta a `.env` y la configuración activa sigue apuntando al proyecto anterior. Cinco pruebas unitarias cubren prioridad, rutas y errores; las 99 pruebas de seguridad pasaron en SQLite aislado con proveedores simulados. Un proceso Django temporal con la ruta de la clave nueva y colas desactivadas inicializó el proyecto correcto; no cambió el servidor habitual ni sus variables.

Antes de activar las configuraciones deben verificarse proyecto y credencial, preparar reversión, coordinar Android y servidor, y tratar el registro previo del teléfono sin reasignar tokens ajenos. La configuración de Flutter `firebase_options.dart` se usa en primer y segundo plano, por lo que cambiar únicamente el JSON Android sería insuficiente. [Configuración oficial Flutter](https://firebase.google.com/docs/flutter/setup).

Se cambió el código de selección de credenciales del backend conservando el comportamiento por defecto, pero no se modificaron los archivos activos de Firebase Android, `.env`, base de datos ni teléfono; no se activaron colas ni se enviaron notificaciones. La clave original sigue en Descargas; es sensible y debe guardarse en una ubicación privada fuera del repositorio antes de configurar el servidor de forma permanente. La prueba push real sigue pendiente.
