/// Build-time isolation for the Android-only offline test variant.
class AppEnvironment {
  static const isolated = bool.fromEnvironment('CONDOMINIO_AISLADO');
  static const pushTest = bool.fromEnvironment('CONDOMINIO_PUSH_PRUEBA');
  static const isolatedApi = 'http://127.0.0.1:18080/api';
  static const configuredApi = String.fromEnvironment('API_BASE_URL');

  static bool validIsolatedApi(String value) => value == isolatedApi;

  static void validate() {
    if (isolated && pushTest) {
      throw StateError('Las variantes de prueba no se pueden combinar.');
    }
    if (pushTest && configuredApi != 'http://127.0.0.1:18082/api') {
      throw StateError('La prueba push requiere su backend local aislado.');
    }
    if (isolated && !validIsolatedApi(configuredApi)) {
      throw StateError('La variante aislada requiere el backend de prueba local.');
    }
  }
}
