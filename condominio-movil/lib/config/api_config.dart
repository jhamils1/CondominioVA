import 'app_environment.dart';

class ApiConfig {
  // Se puede elegir la dirección al compilar; se conserva la anterior por defecto.
  static const String baseUrl = AppEnvironment.isolated ? AppEnvironment.isolatedApi : String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://192.168.0.15:8000/api',
  );

  // Stripe Publishable Key (para procesar pagos)
  static const String stripePublishableKey =
      'pk_test_51SCSisI3tY5WxOmuTTztMavxqjus7yM7HqcaquLTF5QPuIKTsAG2pZNR8PelhLZRgYezrB83bgM4k85Z82TnvJcL00URzQuCpw';

  // Endpoints específicos (basados en tu backend real)
  static const String loginEndpoint = '/login/';
  static const String logoutEndpoint = '/logout/';
  static const String userProfileEndpoint = '/me/';
  static const String refreshTokenEndpoint = '/refresh/';
  static const String devicesEndpoint = '/devices/'; // Para registrar dispositivos FCM
  static const String expensasEndpoint = '/expensas/'; // Para gestionar expensas
  static const String createPaymentIntentEndpoint = '/create-payment-intent/'; // Para crear PaymentIntent
  static const String verifyPaymentIntentEndpoint = '/verify-payment-intent/'; // Para verificar pago
  static const String areasEndpoint = '/areas/'; // Para gestionar áreas comunes
  static const String reservasEndpoint = '/reservas/'; // Para gestionar reservas

  // Headers por defecto
  static Map<String, String> get defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Headers con autenticación
  static Map<String, String> getAuthHeaders(String token) => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer $token',
  };
}
