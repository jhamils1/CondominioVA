import 'package:flutter_test/flutter_test.dart';
import 'package:smart_condominium/config/app_environment.dart';
import 'package:smart_condominium/config/firebase_push_test_options.dart';

void main() {
  test('la variante push falla si usa otro backend o se combina con la variante sin red', () {
    final invalid = AppEnvironment.pushTest &&
        (AppEnvironment.isolated ||
            AppEnvironment.configuredApi != 'http://127.0.0.1:18082/api');
    if (invalid) {
      expect(AppEnvironment.validate, throwsStateError);
    } else {
      expect(AppEnvironment.validate, returnsNormally);
    }
  });

  test('opciones Firebase de prueba exigen el proyecto correcto y todos los campos', () {
    final valid = FirebasePushTestOptions.projectId == 'condominio-seguridad' &&
        FirebasePushTestOptions.apiKey.isNotEmpty &&
        FirebasePushTestOptions.appId.isNotEmpty &&
        FirebasePushTestOptions.senderId.isNotEmpty;
    if (valid) {
      expect(FirebasePushTestOptions.current.projectId, 'condominio-seguridad');
    } else {
      expect(() => FirebasePushTestOptions.current, throwsStateError);
    }
  });
}
