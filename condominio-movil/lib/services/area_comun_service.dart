import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/area_comun.dart';
import 'auth_service.dart';

class AreaComunService {
  // Obtener todas las áreas comunes
  static Future<Map<String, dynamic>> getAreas() async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.areasEndpoint}'),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final areas = data.map((json) => AreaComun.fromJson(json)).toList();

        return {
          'success': true,
          'data': areas,
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener áreas: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Obtener un área específica por ID
  static Future<Map<String, dynamic>> getArea(int id) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.areasEndpoint}$id/'),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final area = AreaComun.fromJson(data);

        return {
          'success': true,
          'data': area,
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener área: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Filtrar áreas por estado
  static List<AreaComun> filterAreasByEstado(
    List<AreaComun> areas, {
    bool activas = true,
  }) {
    return areas.where((area) => area.estaActivo == activas).toList();
  }

  // Ordenar áreas por nombre
  static List<AreaComun> sortAreasByNombre(
    List<AreaComun> areas, {
    bool ascending = true,
  }) {
    final sortedAreas = List<AreaComun>.from(areas);
    sortedAreas.sort((a, b) {
      final comparison = a.nombre.compareTo(b.nombre);
      return ascending ? comparison : -comparison;
    });
    return sortedAreas;
  }
}
