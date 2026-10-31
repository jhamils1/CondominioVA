# Cambio de cuenta en móvil: primera etapa simulada

## Alcance

Se agregó una coordinación aislada en Flutter para modelar el cambio de cuenta con servicios ficticios. No está conectada a la pantalla, al almacenamiento seguro, al backend ni al SDK de Firebase. No se instaló ninguna aplicación ni se modificaron dispositivos o registros reales. La bandeja y los flujos existentes mantienen su comportamiento.

El diseño exige consentimiento y una sesión de la cuenta anterior. Registra cada baja confirmada antes de continuar, retiene el estado ante fallos, y bloquea la inscripción de la cuenta nueva hasta haber confirmado las bajas y la invalidación. Si la invalidación tiene un resultado incierto, se detiene sin repetirla automáticamente. Rechaza un token anterior y mantiene el mismo usuario y token durante los reintentos del registro. Se comprueba que la sesión no haya cambiado durante cada operación.

## Pruebas

Se ejecutaron diez pruebas de la coordinación con almacenamiento y servicios en memoria: consentimiento y cuenta, flujo exitoso, baja parcial y reanudación, invalidación incierta, cambios de sesión, reintentos, fallo de almacenamiento y operaciones simultáneas sobre una instancia. También pasaron once pruebas existentes de registro FCM y cierre de sesión: 21 en total.

Las pruebas no conectan con Firebase, el teléfono, la base de datos ni la red. La reanudación probada conserva el mismo almacenamiento simulado en memoria: no verifica persistencia tras reiniciar la aplicación. El bloqueo de concurrencia cubre una instancia, no varias instancias ni procesos.

## Pendiente antes de cualquier uso real

- Diseñar y probar almacenamiento seguro duradero, coordinación compartida y recuperación de estados inciertos.
- Implementar adaptadores reales y verificar que la invalidación afecte únicamente al token esperado, incluida la coordinación con la renovación automática. El SDK y la plataforma deben permitir garantizar esa condición; la simulación por sí sola no lo demuestra.
- Revisar e implementar la auditoría mínima en el backend, sin exponer tokens. Probar la propiedad de registros y la concurrencia en PostgreSQL aislado.
- Desarrollar la interfaz de consentimiento y los mensajes de fallo, manteniendo disponible la bandeja interna.
- Probar con cuentas y dispositivos ficticios. Una prueba en el teléfono actual o un envío push real requiere autorización específica y aclarar la titularidad del registro anterior.

No se creó una recuperación administrativa ni se habilitó la transferencia de registros ajenos. No es posible garantizar retirar avisos previamente entregados o en curso.
