import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class DashboardService {
  static const _storage = FlutterSecureStorage();

  // Obtener headers con autenticación
  static Future<Map<String, String>> _getAuthHeaders() async {
    final token = await _storage.read(key: 'access_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Resumen financiero general del dashboard
  static Future<Map<String, dynamic>> obtenerResumenFinanciero() async {
    try {
      final headers = await _getAuthHeaders();
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/resumen/'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': jsonDecode(response.body),
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener resumen financiero',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Gráfico de estado de expensas (Pagadas vs Pendientes) - Dona/Pie
  static Future<Map<String, dynamic>> obtenerGraficoExpensasEstado() async {
    try {
      final headers = await _getAuthHeaders();
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/grafico-expensas/'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': jsonDecode(response.body),
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener gráfico de expensas',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Gráfico de ingresos mensuales - Barras/Líneas
  static Future<Map<String, dynamic>> obtenerGraficoIngresosMensuales(
      {int? anio}) async {
    try {
      final headers = await _getAuthHeaders();
      final uri = Uri.parse('${ApiConfig.baseUrl}/grafico-ingresos/')
          .replace(queryParameters: anio != null ? {'año': anio.toString()} : null);

      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': jsonDecode(response.body),
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener gráfico de ingresos',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Gráfico de ranking de morosos - Barras horizontal
  static Future<Map<String, dynamic>> obtenerGraficoMorososRanking(
      {int limite = 10}) async {
    try {
      final headers = await _getAuthHeaders();
      final uri = Uri.parse('${ApiConfig.baseUrl}/grafico-morosos/')
          .replace(queryParameters: {'limite': limite.toString()});

      final response = await http.get(uri, headers: headers);

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': jsonDecode(response.body),
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener gráfico de morosos',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Gráfico comparativo anual - Líneas
  static Future<Map<String, dynamic>> obtenerGraficoComparativoAnual() async {
    try {
      final headers = await _getAuthHeaders();
      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}/grafico-comparativo/'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        return {
          'success': true,
          'data': jsonDecode(response.body),
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener gráfico comparativo',
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
