import '../config/api_config.dart';

/// Configuración de Stripe para la aplicación
class StripeConfig {
  // Clave pública de Stripe (se usa en el cliente)
  static String get publishableKey => ApiConfig.stripePublishableKey;

  // Configuración para el SDK de Stripe (cuando se implemente)
  static const String merchantDisplayName = 'Smart Condominium';
  static const String merchantCountryCode = 'US';
  static const String currency = 'usd';

  /// Verifica si la configuración de Stripe está completa
  static bool get isConfigured {
    return publishableKey.isNotEmpty && publishableKey.startsWith('pk_');
  }

  /// Obtiene el ambiente (test o producción)
  static bool get isTestMode {
    return publishableKey.contains('_test_');
  }

  static String get environment {
    return isTestMode ? 'Test Mode' : 'Production';
  }
}
