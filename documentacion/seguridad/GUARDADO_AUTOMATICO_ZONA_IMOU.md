# Guardado automático de la zona Imou — 2026-11-05

La configuración de la única zona Imou existente se guarda automáticamente:
completar el dibujo crea o reemplaza la zona; cancelar conserva la anterior;
eliminar pide confirmación y guarda una zona vacía con el registro automático
desactivado. El tiempo válido se guarda al salir del campo o pulsar Enter y la
opción de registro al cambiarla. La visualización de cámara e IA sigue separada.
El administrador configura y el guardia consulta; Django continúa validando la
autorización. Los eventos previos y evidencias no se eliminan.

Durante una escritura se pausa el registro y se indica que se está guardando. La
regla nueva se aplica tras respuesta satisfactoria. Ante error se conserva en
pantalla la última configuración confirmada, se mantiene el registro pausado y
se ofrece reintentar. Una respuesta perdida no permite saber si el servidor ya
aplicó el cambio; se muestra como guardado no confirmado. Las ediciones se
bloquean mientras se guarda o hay un evento pendiente. Se evita aplicar respuestas
GET anteriores a una escritura. La resolución entre administradores simultáneos
continúa siendo último guardado prevalece; no hay control de concurrencia fuerte.

Pruebas: build Vite, ESLint, 13 pruebas Node y recorrido Edge con cámara y API
simuladas: creación, persistencia, tiempo válido e inválido, activación, fallo y
reintento, cancelación, reemplazo fallido y exitoso, eliminación cancelada,
fallida y reintentada, evento con evidencia y rol de guardia. No se modificó la
configuración real, ni se enviaron eventos ni notificaciones reales durante estas
pruebas. Falta que el usuario pruebe el flujo con su cámara y teléfono.
