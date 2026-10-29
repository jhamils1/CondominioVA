import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/reserva_area_comun.dart';
import 'auth_service.dart';

class ReservaService {
  // Obtener todas las reservas del usuario
  static Future<Map<String, dynamic>> getReservas() async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.reservasEndpoint}'),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final reservas =
            data.map((json) => ReservaAreaComun.fromJson(json)).toList();

        return {
          'success': true,
          'data': reservas,
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener reservas: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Obtener una reserva específica por ID
  static Future<Map<String, dynamic>> getReserva(int id) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final response = await http.get(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.reservasEndpoint}$id/'),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final reserva = ReservaAreaComun.fromJson(data);

        return {
          'success': true,
          'data': reserva,
        };
      } else {
        return {
          'success': false,
          'message': 'Error al obtener reserva: ${response.statusCode}',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Crear una nueva reserva
  static Future<Map<String, dynamic>> crearReserva({
    required int areaComun,
    required String fechaReserva,
    required String horaInicio,
    required String horaFin,
  }) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final body = {
        'area_comun': areaComun,
        'fecha_reserva': fechaReserva,
        'hora_inicio': horaInicio,
        'hora_fin': horaFin,
      };

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.reservasEndpoint}'),
        headers: ApiConfig.getAuthHeaders(token),
        body: jsonEncode(body),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final reserva = ReservaAreaComun.fromJson(data);

        return {
          'success': true,
          'data': reserva,
          'message': 'Reserva creada exitosamente',
        };
      } else {
        // Intentar extraer el mensaje de error del backend
        String errorMessage = 'Error al crear la reserva';
        try {
          final errorData = jsonDecode(response.body);
          if (errorData is Map) {
            // Manejar errores de validación
            if (errorData.containsKey('non_field_errors')) {
              errorMessage = errorData['non_field_errors'][0];
            } else if (errorData.containsKey('detail')) {
              errorMessage = errorData['detail'];
            } else {
              // Tomar el primer error disponible
              final firstKey = errorData.keys.first;
              final firstError = errorData[firstKey];
              if (firstError is List && firstError.isNotEmpty) {
                errorMessage = firstError[0];
              } else {
                errorMessage = firstError.toString();
              }
            }
          }
        } catch (e) {
          errorMessage = 'Error al crear la reserva: ${response.statusCode}';
        }

        return {
          'success': false,
          'message': errorMessage,
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Cancelar/Eliminar una reserva
  static Future<Map<String, dynamic>> cancelarReserva(int id) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'No hay token de acceso',
        };
      }

      final response = await http.delete(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.reservasEndpoint}$id/'),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 204) {
        return {
          'success': true,
          'message': 'Reserva cancelada exitosamente',
        };
      } else {
        // Intentar extraer el mensaje de error
        String errorMessage = 'Error al cancelar la reserva';
        try {
          final errorData = jsonDecode(response.body);
          if (errorData is Map && errorData.containsKey('error')) {
            errorMessage = errorData['error'];
          }
        } catch (e) {
          errorMessage = 'Error al cancelar la reserva: ${response.statusCode}';
        }

        return {
          'success': false,
          'message': errorMessage,
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
      };
    }
  }

  // Filtrar reservas por estado
  static List<ReservaAreaComun> filterReservasByEstado(
    List<ReservaAreaComun> reservas,
    String estado,
  ) {
    return reservas.where((r) => r.estadoReserva == estado).toList();
  }

  // Obtener reservas activas (pendientes o confirmadas)
  static List<ReservaAreaComun> getReservasActivas(
    List<ReservaAreaComun> reservas,
  ) {
    return reservas.where((r) => r.estaActiva).toList();
  }

  // Ordenar reservas por fecha
  static List<ReservaAreaComun> sortReservasByFecha(
    List<ReservaAreaComun> reservas, {
    bool ascending = false,
  }) {
    final sortedReservas = List<ReservaAreaComun>.from(reservas);
    sortedReservas.sort((a, b) {
      final comparison = a.fechaReserva.compareTo(b.fechaReserva);
      return ascending ? comparison : -comparison;
    });
    return sortedReservas;
  }
}
