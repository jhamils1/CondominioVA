import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/expensa_model.dart';
import 'auth_service.dart';

class ExpensaService {
  // Obtener todas las expensas del usuario
  static Future<Map<String, dynamic>> getExpensas() async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.expensasEndpoint}'),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final expensas = data.map((json) => Expensa.fromJson(json)).toList();

        return {
          'success': true,
          'data': expensas,
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener expensas: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Obtener una expensa específica por ID
  static Future<Map<String, dynamic>> getExpensa(int id) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.expensasEndpoint}$id/'),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final expensa = Expensa.fromJson(data);

        return {
          'success': true,
          'data': expensa,
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener expensa: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Crear un PaymentIntent para pagar una expensa
  static Future<Map<String, dynamic>> createPaymentIntent(int expensaId) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.createPaymentIntentEndpoint}'),
        headers: ApiConfig.getAuthHeaders(token),
        body: jsonEncode({
          'expensa_id': expensaId,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'data': data,
        };
      } else {
        return {
          'success': false,
          'message': 'Error al crear PaymentIntent: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Verificar el estado de un PaymentIntent
  static Future<Map<String, dynamic>> verifyPaymentIntent(String paymentIntentId) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.verifyPaymentIntentEndpoint}?payment_intent_id=$paymentIntentId'),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'data': data,
        };
      } else {
        final errorBody = response.body;
        print('Error al verificar pago. Status: ${response.statusCode}, Body: $errorBody');
        return {
          'success': false,
          'message': 'Error al verificar pago: ${response.statusCode}',
          'details': errorBody,
        };
      }
    } catch (e) {
      print('Excepción al verificar pago: $e');
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Marcar una expensa como pagada manualmente (método alternativo)
  static Future<Map<String, dynamic>> marcarComoPagada(
    int expensaId,
    String paymentIntentId,
  ) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      // Intenta actualizar usando PATCH
      final response = await http.patch(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.expensasEndpoint}$expensaId/'),
        headers: ApiConfig.getAuthHeaders(token),
        body: jsonEncode({
          'pagada': true,
          'stripe_payment_intent_id': paymentIntentId,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'data': data,
        };
      } else {
        print('Error al marcar como pagada. Status: ${response.statusCode}, Body: ${response.body}');
        return {
          'success': false,
          'message': 'Error al actualizar expensa: ${response.statusCode}',
        };
      }
    } catch (e) {
      print('Excepción al marcar como pagada: $e');
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Filtrar expensas por estado de pago
  static List<Expensa> filterExpensasByEstado(
    List<Expensa> expensas, {
    bool? pagada,
    bool? vencida,
  }) {
    return expensas.where((expensa) {
      bool matchPagada = pagada == null || expensa.pagada == pagada;
      bool matchVencida = vencida == null || expensa.vencida == vencida;
      return matchPagada && matchVencida;
    }).toList();
  }

  // Ordenar expensas por fecha de vencimiento
  static List<Expensa> sortExpensasByVencimiento(
    List<Expensa> expensas, {
    bool ascending = true,
  }) {
    final sorted = List<Expensa>.from(expensas);
    sorted.sort((a, b) {
      if (a.fechaVencimiento == null && b.fechaVencimiento == null) return 0;
      if (a.fechaVencimiento == null) return 1;
      if (b.fechaVencimiento == null) return -1;
      
      final comparison = a.fechaVencimiento!.compareTo(b.fechaVencimiento!);
      return ascending ? comparison : -comparison;
    });
    return sorted;
  }

  // Calcular total de expensas pendientes
  static double calcularTotalPendiente(List<Expensa> expensas) {
    return expensas
        .where((e) => !e.pagada)
        .fold(0.0, (sum, e) => sum + e.montoDouble);
  }
}
