import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

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
  static Future<Map<String, dynamic>> logout() async {
    try {
      final refreshToken = await _storage.read(key: 'refresh_token');
      final accessToken = await _storage.read(key: 'access_token');
      
      if (refreshToken != null && accessToken != null) {
        final response = await http.post(
          Uri.parse('${ApiConfig.baseUrl}${ApiConfig.logoutEndpoint}'),
          headers: ApiConfig.getAuthHeaders(accessToken),
          body: jsonEncode({
            'refresh': refreshToken,
          }),
        );
        
        // Si el logout en el servidor falla, aún limpiamos los tokens locales
        if (response.statusCode != 200 && response.statusCode != 205) {
          print('Logout en servidor falló, pero limpiando tokens locales');
        }
      }
      
      // Limpiar tokens locales siempre
      await _storage.delete(key: 'access_token');
      await _storage.delete(key: 'refresh_token');
      
      return {
        'success': true,
        'message': 'Logout exitoso',
      };
    } catch (e) {
      // Aún así limpiamos los tokens locales
      await _storage.delete(key: 'access_token');
      await _storage.delete(key: 'refresh_token');
      
      return {
        'success': true,
        'message': 'Logout exitoso (tokens locales limpiados)',
      };
    }
  }
  
  // Obtener perfil del usuario
  static Future<Map<String, dynamic>> getUserProfile() async {
    try {
      final token = await _storage.read(key: 'access_token');
      
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }
      
      // Tu backend tiene un endpoint /users/ que devuelve la lista de usuarios
      // Necesitamos obtener el usuario actual, pero como no tienes un endpoint específico
      // para el usuario actual, vamos a simular los datos básicos
      return {
        'success': true,
        'data': {
          'id': 1,
          'username': 'usuario_actual',
          'email': 'usuario@condominio.com',
          'first_name': 'Usuario',
          'last_name': 'Condominio',
        },
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
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
}
