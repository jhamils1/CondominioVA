# Integraciones externas

Revisión de código y declaraciones locales: 2026-10-31. **Activa** requeriría comprobar operación real; esta etapa no hizo llamadas a proveedores. Las integraciones con código se clasifican como parciales o pendientes de verificar, aunque hayan sido utilizadas antes. Solo se documentan nombres de variables.

| Integración / finalidad | Consumidores y archivos responsables | Configuración por nombre | Estado y errores |
| --- | --- | --- | --- |
| Plate Recognizer Cloud: matrículas | Web → `seguridad_IA/views.py`, `AlprScanView`; modelos de lecturas | `PLATE_TOKEN`, `PLATE_REGIONS` | Parcial; timeout HTTP y reintento ante 429 en petición; no es cola offline; vigencia del servicio no comprobada |
| Luxand Cloud: rostros y enrolamiento | `core/luxand.py`, `seguridad_IA/views.py`, `administracion/views.py`; clientes web y móvil | `LUXAND_TOKEN`, `LUXAND_COLLECTION`, `LUXAND_COLLECTION_EMPLEADOS` | Parcial; timeouts y captura de errores, flujos duplicados y contratos que requieren revisión; no garantiza autorización física |
| Firebase Cloud Messaging: push | `seguridad_IA/fcm_delivery.py`, comandos de procesamiento, `finanzas/signals.py`; Flutter `lib/services/fcm_service.dart` y registro de dispositivos | `FIREBASE_CREDENTIALS_JSON`, `FCM_SERVER_KEY`; configuración Firebase nativa del móvil | Parcial; cola/reintentos de seguridad y controles de dispositivo existentes; recepción real y recuperación incierta pendientes |
| Stripe: pagos | `finanzas/views_payments.py`, modelos de expensa; web y `lib/services/stripe_payment_service.dart` | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `FRONTEND_URL`; web `VITE_STRIPE_PUBLISHABLE_KEY` | Parcial; validación de acceso/metadatos documentada, manejo de errores de pago requiere prueba integral por entorno |
| ImgBB: imágenes | Flujos de carga en administración y clientes existentes | `IMGBB_API_KEY`; web `VITE_IMGBB_API_KEY` | Parcial; cargas externas no revierten con transacción SQL; no se auditó aquí cada contrato/error |
| Cloudinary: imágenes/documentos | Configuración Django y cargas en módulos existentes | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Parcial; operación y retención por verificar; no es evidencia privada por el hecho de almacenar una URL |
| Railway: alojamiento | Referencias en ajustes y archivos de despliegue del backend | Configuración de entorno, entre otras `DATABASE_URL`, `SECRET_KEY`, `DEBUG` | Plan a confirmar; no se consultó cuenta, servicio, logs ni despliegue activo |

Todos estos proveedores remotos requieren internet. No confundir la futura inferencia local con disponibilidad offline de reconocimiento facial, ALPR Cloud, pagos o push.

Los interruptores `NOTIFICACIONES_SEGURIDAD_ACTIVAS`, `COLA_FCM_SEGURIDAD_ACTIVA` y `ENVIO_FCM_SEGURIDAD_ACTIVO` separan bandeja, cola y envío. Tienen predeterminados desactivados; no se inspeccionaron valores efectivos. La URL web se configura mediante `VITE_API_URL`; revisar configuración de `lib/config/` al preparar el móvil para cada entorno.

Los valores `VITE_` llegan al navegador y no deben contener secretos privados. Las rutas antiguas de dispositivos con tokens en URL, errores externos que exponen demasiado detalle y configuración permisiva de hosts/CORS deben revisarse antes de producción. No se rotaron claves ni se cambió configuración durante la organización.

Fuentes: [guía histórica](../documentacion/seguridad/GUIA_ROLES_SEGURIDAD_NOTIFICACIONES.md), [compatibilidad Firebase](../Condominio-Backend/PLAN_COMPATIBILIDAD_FIREBASE_AISLADO.md), [pendientes revisados](../Condominio-Backend/REVISION_PENDIENTES_ROLES_NOTIFICACIONES.md). Revalidar versiones, licencias y requisitos oficiales antes de una futura actualización; esta etapa no realiza esa investigación externa.
