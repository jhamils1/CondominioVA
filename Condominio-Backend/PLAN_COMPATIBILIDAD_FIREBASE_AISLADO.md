# Compatibilidad Firebase y plan de pruebas aisladas

Revisión del 31 de octubre de 2026. Se inspeccionaron archivos y dependencias instaladas, y documentación oficial. Esta etapa no creó proyectos Firebase, no cambió configuraciones, dependencias, bases o dispositivos y no ejecutó llamadas a Firebase ni envíos.

## Versiones y compatibilidad observada

| Componente | Versión o configuración revisada | Resultado |
| --- | --- | --- |
| Flutter / Dart | 3.35.6 / 3.9.2 | El proyecto solicita Dart `^3.8.0`; ambos paquetes Firebase instalados declaran compatibilidad Dart `>=3.2.0 <4.0.0`. Es una comprobación de restricciones, no una validación completa del dispositivo. |
| FlutterFire | `firebase_core` 4.2.1; `firebase_messaging` 16.0.4; interfaz 4.7.4 | La versión instalada usa el flujo `getToken`, `deleteToken` y `onTokenRefresh`. En sus fuentes Dart no se encontraron las API nuevas `register`, `unregister` y `onRegistered` descritas en la guía actual. No se debe activar el modo FID en esta versión sin una revisión y pruebas de compatibilidad. |
| Firebase Android | El `firebase_core` instalado declara Firebase BoM 34.4.0; Gradle del plugin de mensajería usa esa propiedad por defecto | Es la versión declarada por el complemento; no se verificó el grafo real resuelto de Gradle ni su comportamiento en Android. |
| Android | AGP 8.9.1, Kotlin 2.1.0, Google Services 4.4.2; `compileSdk` 36 | `minSdk` y `targetSdk` se heredan de Flutter, no se verificó el manifiesto compilado. La guía actual de Firebase indica Android 7/API 24 o superior; comprobar dispositivo y configuración real antes de probar. |
| Backend | Django 5.2.6, DRF 3.16.1, `firebase-admin` 7.1.0, `fcm-django` 2.3.1 | El código existente registra y envía con `registration_id` y `messaging.Message(token=...)`. La función `send` instalada admite `dry_run`. No se ha verificado la entrega con FID en estas versiones. |
| Almacenamiento | `flutter_secure_storage` 9.2.4 | Su adaptación al cambio de cuenta sigue desconectada; solo se probó con el complemento simulado. |

Firebase indica que los registros por token y por FID coexisten durante la transición, pero advierte que no se deben usar ambos métodos de gestión simultáneamente en una misma app. Antes de cambiar versiones o esquema hay que verificar la ruta completa y diseñar una transición; no se recomienda actualizar automáticamente. [FCM en Flutter](https://firebase.google.com/docs/cloud-messaging/flutter/get-started) y [gestión de registros](https://firebase.google.com/docs/cloud-messaging/manage-tokens).

## Aislamiento necesario antes de cualquier prueba real

1. Crear, en una etapa autorizada, un proyecto Firebase de prueba distinto y limitado a datos ficticios. Firebase recomienda proyectos separados por entorno. Registrar en una hoja de control los identificadores del proyecto de prueba y del entorno habitual sin publicar credenciales. [Entornos de Firebase](https://firebase.google.com/docs/projects/dev-workflows/overview-environments).
2. Usar una base Django y un backend de prueba completamente independientes; usuarios, eventos y dispositivos deben ser ficticios. Configurar credenciales de servicio únicamente del proyecto de prueba fuera del repositorio, con acceso mínimo. Antes de permitir envíos, verificar de forma explícita que el identificador del proyecto cargado por el Admin SDK sea el de prueba y que la base sea la aislada; ante duda, detenerse.
3. Preparar una variante Android de prueba con **applicationId diferente** y nombre visible distinto, para que no sobrescriba ni comparta datos de la app instalada. Registrar esa variante en Firebase de prueba y comprobar que coincidan su `google-services.json`, sus opciones Flutter y el proyecto esperado. Actualmente `main.dart` inicializa Firebase con `DefaultFirebaseOptions.currentPlatform`, también en segundo plano: cambiar solamente `google-services.json` no garantiza cambiar esas opciones. Preparar selección explícita por variante para ambos procesos y validarla antes de instalar. [Configuración de FlutterFire](https://firebase.google.com/docs/flutter/setup) y [múltiples proyectos](https://firebase.google.com/docs/projects/multiprojects).
4. Usar un emulador Android con Google Play y notificaciones habilitadas, o un dispositivo de prueba distinto y autorizado. La guía oficial indica imagen de emulador con Google Play. No instalar la variante sobre la aplicación existente ni usar el teléfono o registro actual de Patricia. [Requisitos de FlutterFire](https://firebase.google.com/docs/flutter/setup).
5. Configurar un endpoint de API que apunte únicamente al backend aislado. El proyecto tiene un valor predeterminado en `API_BASE_URL`; la variante de prueba debe fallar si no se proporciona una dirección permitida, sin recurrir a ese valor por defecto. Verificar también workers y variables del backend para que no utilicen credenciales reales.
6. No registrar tokens, contraseñas ni credenciales en consola, historial, capturas o documentación. Verificar permisos de notificaciones, conectividad y versiones resueltas sin exponer identificadores. No asumir que un emulador local sustituye FCM: la validación de entrega o `dry_run` usa el servicio real del proyecto de prueba.

## Plan de pruebas propuesto

Cada fase requiere aprobación antes de acciones externas o pruebas sobre un dispositivo:

1. **Sin Firebase externo:** mantener las pruebas simuladas existentes; añadir pruebas de que la variante rechace configuraciones mezcladas y que la bandeja interna esté disponible con push pendiente. Probar persistencia y bloqueo entre procesos sin tocar cuentas reales.
2. **Proyecto de prueba, sin entrega:** una vez creado y verificado el aislamiento, verificar inicialización y permisos con cuentas ficticias. Una llamada `dry_run` consulta Firebase pero no entrega el mensaje; probarla solo con un identificador de prueba y autorización para esa llamada. No usar un resultado como prueba de propiedad del teléfono. [Admin SDK Python](https://firebase.google.com/docs/reference/admin/python/firebase_admin.messaging).
3. **Entrega de prueba:** con aprobación específica, enviar un mensaje genérico únicamente al emulador o dispositivo de prueba autorizado. Comprobar primer plano, segundo plano, permiso denegado, sesión cerrada, apertura de alerta y acceso por roles. Registrar resultados sin tokens. La aprobación de la presente etapa no autoriza estos envíos.
4. **Cambio de cuenta ficticio:** con cuentas A y B de prueba, comprobar la baja de A, la pertenencia de identificadores, fallos de red, respuesta perdida, reinicios, renovación, concurrencia y envíos en curso. Verificar que B no pueda registrar un token ajeno y que la bandeja de B siga disponible. El estado incierto debe seguir bloqueado salvo que se identifique y valide un mecanismo fiable de recuperación; comparar tokens no basta.
5. **Posible migración a FID:** revisar versiones nuevas de FlutterFire, Firebase Android, Admin SDK y `fcm-django`; probar en una variante independiente sin mezclar los dos sistemas de gestión en una misma app. Evaluar usuarios existentes, migraciones, auditoría, despliegue y reversión. Es una investigación posterior, no un cambio aprobado en esta etapa.

## Criterios para detenerse

No continuar si la app o el servidor apuntan al proyecto habitual, si la instalación de prueba puede sobrescribir la actual, si la base no es aislada, si la cuenta o el dispositivo no son ficticios o autorizados, o si no hay una forma confiable de controlar el destinatario. La privacidad de los envíos ya aceptados no puede garantizarse mediante una baja posterior.

## Resultado y límites

La inspección confirma que las versiones instaladas satisfacen los rangos básicos de Dart y que el código actual sigue basado en tokens. No se verificó una compilación de la variante de prueba, el grafo Gradle efectivo, la compatibilidad completa con FID, ni un envío real. El siguiente paso propuesto es preparar una variante aislada y pruebas sin Firebase externo, sujeto a aprobación.
