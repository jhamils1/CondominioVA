import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/objeto_perdido_model.dart';
import 'auth_service.dart';

class ObjetoPerdidoService {
  // Obtener todos los objetos perdidos
  static Future<Map<String, dynamic>> getObjetosPerdidos({String? estado}) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      String url = '${ApiConfig.baseUrl}/objetosPerdidos/';
      if (estado != null) {
        url += '?estado=$estado';
      }

      final response = await http.get(
        Uri.parse(url),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final objetos = data.map((json) => ObjetoPerdido.fromJson(json)).toList();

        return {
          'success': true,
          'data': objetos,
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener objetos perdidos: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Obtener un objeto perdido específico
  static Future<Map<String, dynamic>> getObjetoPerdido(int id) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/objetosPerdidos/$id/'),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final objeto = ObjetoPerdido.fromJson(data);

        return {
          'success': true,
          'data': objeto,
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener objeto: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }
}
