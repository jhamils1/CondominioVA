/// Build-time isolation for the Android-only offline test variant.
class AppEnvironment {
  static const isolated = bool.fromEnvironment('CONDOMINIO_AISLADO');
  static const isolatedApi = 'http://127.0.0.1:18080/api';
  static const configuredApi = String.fromEnvironment('API_BASE_URL');

  static bool validIsolatedApi(String value) => value == isolatedApi;

  static void validate() {
    if (isolated && !validIsolatedApi(configuredApi)) {
      throw StateError('La variante aislada requiere el backend de prueba local.');
    }
  }
}
