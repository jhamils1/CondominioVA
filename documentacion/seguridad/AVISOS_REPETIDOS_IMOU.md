# Avisos repetidos de Imou — 2026-11-07

El usuario observó varios eventos y avisos push para un vehículo que permanecía en la zona. Una causa posible era la pérdida de seguimiento: la vista web descartaba todas las pistas ante intervalos superiores a dos segundos; el proceso independiente también las descartaba ante errores temporales. No se ha demostrado que esa sea la única causa de todos los eventos observados.

Se conserva hasta diez segundos una pista ya avisada cuando hay pérdidas o demoras breves, siempre que la detección posterior coincida espacialmente; los intervalos sin muestras no se cuentan como permanencia. Se mantiene la detección independiente de vehículos y se permite avisar de nuevo al observar salida y regreso. La tolerancia también se aplica al proceso independiente. No se borraron eventos ni se cambió Firebase o sus destinatarios.

Verificación aislada: 13 pruebas JavaScript, tres pruebas Django del seguimiento, ESLint de los archivos modificados y compilación Vite. Falta prueba con cámara real y teléfono. El seguimiento no identifica matrículas: oclusiones de más de diez segundos, cambios grandes de posición o reinicios pueden causar duplicados; vehículos muy parecidos en la misma ubicación podrían confundirse. El proceso independiente debe reiniciarse para usar la modificación; recargar la web reinicia el seguimiento de la sesión.
