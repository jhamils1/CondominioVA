# Incorporación del inicio móvil FCM

Fecha: 2026-11-01 (America/La Paz). El usuario solicitó avanzar con los cambios necesarios, sin prolongar las pruebas innecesariamente.

Se incorporó al código móvil habitual el coordinador de inicio ya probado en la variante aislada: prepara notificaciones locales, instala los manejadores de mensajes y actualización de token, y después espera permisos y registro. Se añadieron las pruebas del coordinador. Los controles instrumentados exclusivos de la prueba no se incorporaron. El coordinador evita escuchas duplicadas y admite un reintento explícito tras un fallo; no incorpora reintento automático.

Se ejecutaron 21 pruebas Flutter de inicio, timeout, registro y navegación; todas pasaron. `flutter analyze` no encontró problemas en los archivos modificados y sus pruebas. La variante aislada equivalente había recibido avisos reales y abierto alertas en segundo plano y con proceso cerrado, pero el código habitual incorporado en esta etapa no se compiló ni instaló en el teléfono y no se probó allí.

Para la demostración sigue siendo necesario completar la transición backend/dispositivos al proyecto Firebase y activar los envíos de forma coordinada. Las protecciones de procedencia y cierre están preparadas y probadas solo en la copia aislada; el parche anterior es obsoleto y no debe aplicarse. El respaldo anterior no acredita qué base utilizará el servidor efectivo. No se modificaron ni migraron datos del backend, credenciales, dispositivos o configuración de envíos en esta etapa.

En la comprobación de esta etapa no se encontró un servidor escuchando en los puertos locales 8000/8001 ni había un enlace ADB inverso. La aplicación Android habitual no aparecía en consultas previas, sin que se haya establecido cuándo dejó de estar instalada. La aplicación requiere una URL alcanzable para el backend y el envío push por Firebase requiere conexión al servicio; las pruebas hechas no establecen que el push habitual ya esté activo. Los envíos de expensas y objetos perdidos se habían pausado por decisión del usuario; el estado del proceso real debe comprobarse al iniciarlo.

No se instaló ninguna app ni se enviaron notificaciones reales. El proyecto conserva otros cambios locales sin commit.
