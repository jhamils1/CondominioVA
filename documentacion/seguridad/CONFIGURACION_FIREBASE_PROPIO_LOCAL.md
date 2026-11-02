# Configuración local del Firebase propio

Fecha: 2026-10-31. El usuario aprobó continuar y eligió pausar temporalmente los push de expensas y objetos perdidos durante la transición.

## Preparación realizada

- El código Android `google-services.json` y el bloque Android de `firebase_options.dart` coinciden con `condominio-seguridad` y el paquete `com.condominiun.smart`. Las opciones iOS anteriores se conservaron; iOS no está migrado. Copias exactas anteriores y candidatas están en `Condominio-Backend/backups_locales/firebase_preparacion_20261031/`, ignorado por Git.
- Una copia de la clave privada validada se guardó fuera del repositorio, bajo la carpeta local del usuario `CondominioSeguridad/credenciales`; el original permanece en Descargas. No se imprimió su contenido. No compartir, subir ni versionar la clave. La copia no implica cifrado especial ni demuestra restricciones ACL adicionales.
- `.env` local fue respaldado sin modificar su contenido previo y se añadieron la ruta de la clave nueva, `ENVIO_FCM_LEGADO_ACTIVO=False`, `COLA_FCM_SEGURIDAD_ACTIVA=False` y `ENVIO_FCM_SEGURIDAD_ACTIVO=False`. Ninguna de estas opciones estaba definida en `.env` antes; el respaldo está en el directorio ignorado. Si las variables existen en el entorno del proceso, pueden prevalecer sobre `.env`: comprobarlas antes de operar.
- Se añadió un interruptor `ENVIO_FCM_LEGADO_ACTIVO` para detener únicamente las llamadas push antiguas de expensas y objetos perdidos; predeterminado `True` para preservar el comportamiento de otros entornos. Se mantuvo el resto de las operaciones. Durante la pausa esos avisos **no se encolan ni se envían automáticamente después**; los registros de expensas y objetos perdidos permanecen en su base.
- La configuración se validó en **un nuevo proceso Django**: Firebase inicializó el proyecto nuevo y los tres indicadores de envío comprobados estaban desactivados. Un servidor ya ejecutándose puede conservar variables y configuración anteriores; se debe reiniciar y verificar su entorno antes de asumir que está usando el proyecto nuevo o que la pausa está vigente. No se detuvo ni reinició el servidor existente.
- La APK debug se compiló con el proyecto Firebase nuevo y `API_BASE_URL=http://127.0.0.1:8001/api`; sus recursos y paquete se verificaron con `aapt`. El puerto 8001 y el enlace USB no estaban activos al final de la etapa. Esta APK **no debe instalarse o usarse como operativa hasta preparar su conexión y resolver el registro FCM anterior**. Está en `condominio-movil/build/app/outputs/flutter-apk/app-debug.apk`, una ruta de build ignorada por Git. No se instaló en el teléfono.

## Pruebas y límites

- 100 pruebas backend en SQLite aislado, incluidos la pausa sin pérdida de registros y el comportamiento anterior cuando está activa: aprobadas.
- Cinco pruebas unitarias de selección de credenciales: aprobadas. Proceso de Django con configuración local: proyecto nuevo y pausa verificados.
- Flutter: 71 pruebas aprobadas, dos omitidas por configuración. Compilación debug correcta y recursos de APK verificados. Primera lectura de recursos `aapt` falló por un comando sin valores y luego por la codificación Windows; se corrigió con `--values` y lectura de bytes.
- Primera invocación de compilación dentro del entorno restringido no produjo salida y se interrumpió; el intento con acceso permitido compiló correctamente. Se interrumpió también una llamada al wrapper de Dart sin salida; el ejecutable Dart directo validó sintaxis sin cambios.
- No se tocaron dispositivos FCM, cuentas ni registros de base de datos. No se envió ningún push. Firebase inicializado en un proceso y APK compilada no demuestran entrega real.

## Pendiente

Los dos dispositivos activos del entorno anterior no tienen una atribución de proyecto en la base. No se deben enviar al proyecto nuevo ni transferirlos automáticamente a otra cuenta. El teléfono tiene historial de token de otra cuenta y el código conserva el rechazo de tokens ajenos. Antes de reactivar cualquiera de los push se requiere un plan probado de identificación y registro de dispositivos para el proyecto nuevo, incluidos los clientes antiguos y el flujo de cierre/cambio de cuenta.

La siguiente etapa debe preparar un backend y una instalación de prueba que no alteren el registro anterior, conectar el teléfono autorizado, comprobar que el destinatario sea el correcto y hacer la prueba de recepción; mantener apagados los envíos masivos y no suponer que el servidor anterior se reinició. Una aceptación de Firebase no prueba recepción visible. La activación definitiva y la recuperación de avisos anteriores requieren su propia revisión.

Para volver a la configuración local previa, comparar primero los archivos activos con esta etapa y restaurar desde las copias solo si no hay cambios posteriores. El `.env` contiene secretos: no mostrarlo en pantalla ni compartirlo. La operación de restauración no debe tocar dispositivos ni la base.
