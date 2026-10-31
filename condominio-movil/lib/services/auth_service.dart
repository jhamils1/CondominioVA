import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../security/access_policy.dart';

class AuthService {
  static const _storage = FlutterSecureStorage();
  
  // Login
  static Future<Map<String, dynamic>> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.loginEndpoint}'),
        headers: ApiConfig.defaultHeaders,
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        
        // Guardar tokens de forma segura (tu backend usa 'access' y 'refresh')
        await _storage.write(key: 'access_token', value: data['access']);
        await _storage.write(key: 'refresh_token', value: data['refresh']);
        
        return {
          'success': true,
          'message': 'Login exitoso',
          'data': data,
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['detail'] ?? error['error'] ?? 'Error en el login',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }
  
  // Logout
  static Future<Map<String, dynamic>> logout({
    http.Client? client,
    Future<String?> Function(String)? readToken,
    Future<void> Function(String)? deleteToken,
  }) async {
    final read = readToken ?? (String key) => _storage.read(key: key);
    final delete = deleteToken ?? (String key) => _storage.delete(key: key);
    var serverConfirmed = false;
    try {
      final refreshToken = await read('refresh_token');
      final accessToken = await read('access_token');
      
      if (refreshToken != null && accessToken != null) {
        final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.logoutEndpoint}');
        final headers = ApiConfig.getAuthHeaders(accessToken);
        final body = jsonEncode({'refresh': refreshToken});
        final response = await (client == null
            ? http.post(uri, headers: headers, body: body)
            : client.post(uri, headers: headers, body: body))
            .timeout(const Duration(seconds: 5));
        serverConfirmed = response.statusCode == 205;
        
      }
      
    } catch (_) {
      // La eliminación local se intenta incluso sin conexión.
    }
    var cleared = true;
    for (final key in ['access_token', 'refresh_token']) {
      try {
        await delete(key);
      } catch (_) {
        cleared = false;
      }
    }
    return {
      'success': cleared,
      'serverConfirmed': serverConfirmed,
      'message': cleared ? 'Sesión local cerrada' : 'No se pudieron borrar los datos de sesión del dispositivo.',
    };
  }
  
  // Obtener perfil del usuario
  static Future<Map<String, dynamic>> getUserProfile({
    http.Client? client,
    Future<String?> Function()? readToken,
  }) async {
    try {
      final token = await (readToken ?? getAccessToken)();
      
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }
      
      final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.userProfileEndpoint}');
      final headers = ApiConfig.getAuthHeaders(token);
      final response = await (client == null
          ? http.get(uri, headers: headers)
          : client.get(uri, headers: headers)).timeout(const Duration(seconds: 10));
      if (response.statusCode == 401) {
        return {'success': false, 'message': 'La sesión venció o no está autorizada. Inicia sesión de nuevo.'};
      }
      if (response.statusCode == 403) {
        return {'success': false, 'message': 'La cuenta no tiene acceso autorizado.'};
      }
      if (response.statusCode != 200) {
        return {'success': false, 'message': 'No se pudo consultar el perfil. Intenta nuevamente.'};
      }
      final user = validarUsuarioActual(jsonDecode(response.body));
      if (user == null) {
        return {'success': false, 'message': 'La respuesta del perfil no contiene un rol válido.'};
      }
      return {
        'success': true,
        'data': user,
      };
    } catch (_) {
      return {
        'success': false,
        'message': 'No se pudo conectar al servidor. Intenta nuevamente.',
      };
    }
  }
  
  // Verificar si el usuario está autenticado
  static Future<bool> isAuthenticated() async {
    final token = await _storage.read(key: 'access_token');
    return token != null;
  }
  
  // Obtener token de acceso
  static Future<String?> getAccessToken() async {
    return await _storage.read(key: 'access_token');
  }
  
  // Método alias para compatibilidad con FCMService
  static Future<String?> getToken() async {
    return await getAccessToken();
  }
  
  // Guardar token FCM
  static Future<void> saveFCMToken(String fcmToken) async {
    await _storage.write(key: 'fcm_token', value: fcmToken);
  }
  
  // Obtener token FCM
  static Future<String?> getFCMToken() async {
    return await _storage.read(key: 'fcm_token');
  }
  
  // Eliminar token FCM
  static Future<void> deleteFCMToken() async {
    await _storage.delete(key: 'fcm_token');
  }

  static Future<String?> getPendingFCMToken() => _storage.read(key: 'fcm_pending');
  static Future<void> savePendingFCMToken(String token) => _storage.write(key: 'fcm_pending', value: token);
  static Future<void> deletePendingFCMToken() => _storage.delete(key: 'fcm_pending');
}
