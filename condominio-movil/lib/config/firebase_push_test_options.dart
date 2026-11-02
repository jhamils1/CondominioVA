import 'package:firebase_core/firebase_core.dart';

/// Solo la variante Android debug para pruebas del proyecto Firebase propio.
class FirebasePushTestOptions {
  static const apiKey = String.fromEnvironment('FIREBASE_TEST_API_KEY');
  static const appId = String.fromEnvironment('FIREBASE_TEST_APP_ID');
  static const senderId = String.fromEnvironment('FIREBASE_TEST_SENDER_ID');
  static const projectId = String.fromEnvironment('FIREBASE_TEST_PROJECT_ID');

  static FirebaseOptions get current {
    if (projectId != 'condominio-seguridad' ||
        apiKey.isEmpty || appId.isEmpty || senderId.isEmpty) {
      throw StateError('Configuración de prueba push ausente o incompatible.');
    }
    return const FirebaseOptions(apiKey: apiKey, appId: appId,
        messagingSenderId: senderId, projectId: projectId);
  }
}
