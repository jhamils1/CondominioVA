import 'dart:convert';

import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

class AlertaSeguridad {
  final String id;
  final String eventoId;
  final String mensaje;
  final String creada;
  final bool leida;

  const AlertaSeguridad({required this.id, required this.eventoId,
    required this.mensaje, required this.creada, required this.leida});

  factory AlertaSeguridad.fromJson(dynamic data) {
    if (data is! Map<String, dynamic> || !_validId(data['id']) ||
        !_validId(data['evento']) || data['mensaje'] is! String ||
        data['creada'] is! String ||
        (data['leida_en'] != null && data['leida_en'] is! String)) {
      throw const FormatException('Notificación inválida');
    }
    return AlertaSeguridad(id: data['id'], eventoId: data['evento'],
        mensaje: data['mensaje'], creada: data['creada'], leida: data['leida_en'] != null);
  }
}

class DetalleEventoSeguridad {
  final String categoria;
  final String descripcion;
  final String estado;
  final String fecha;

  const DetalleEventoSeguridad({required this.categoria, required this.descripcion,
    required this.estado, required this.fecha});

  factory DetalleEventoSeguridad.fromJson(dynamic data, String esperado) {
    if (data is! Map<String, dynamic> || data['id'] != esperado ||
        data['categoria'] is! String || data['descripcion'] is! String ||
        data['estado'] is! String || data['fecha_evento'] is! String) {
      throw const FormatException('Evento inválido');
    }
    return DetalleEventoSeguridad(categoria: data['categoria'],
        descripcion: data['descripcion'], estado: data['estado'], fecha: data['fecha_evento']);
  }
}

bool _validId(dynamic value) => value is String && RegExp(
    r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$').hasMatch(value);

class AlertasException implements Exception {
  final String mensaje;
  const AlertasException(this.mensaje);
}

class AlertasSeguridadService {
  final http.Client? client;
  final Future<String?> Function() readToken;

  AlertasSeguridadService({this.client, Future<String?> Function()? readToken})
      : readToken = readToken ?? AuthService.getAccessToken;

  Future<http.Response> _request(String path, {bool post = false}) async {
    try {
      final token = await readToken();
      if (token == null || token.isEmpty) {
        throw const AlertasException('Inicia sesión para consultar las alertas.');
      }
      final uri = Uri.parse('${ApiConfig.baseUrl}$path');
      final headers = ApiConfig.getAuthHeaders(token);
      final response = await (post
          ? (client == null ? http.post(uri, headers: headers) : client!.post(uri, headers: headers))
          : (client == null ? http.get(uri, headers: headers) : client!.get(uri, headers: headers)))
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 401) throw const AlertasException('La sesión venció. Inicia sesión nuevamente.');
      if (response.statusCode == 403 || response.statusCode == 404) {
        throw const AlertasException('No tienes acceso a esta información.');
      }
      if (response.statusCode == 503) throw const AlertasException('Las alertas de seguridad no están habilitadas.');
      if (response.statusCode != 200) throw const AlertasException('No se pudo consultar la información.');
      return response;
    } on AlertasException {
      rethrow;
    } catch (_) {
      throw const AlertasException('No se pudo conectar al servidor. Intenta nuevamente.');
    }
  }

  Future<List<AlertaSeguridad>> listar() async {
    final response = await _request('/notificaciones-seguridad/');
    try {
      final decoded = jsonDecode(response.body);
      // La API actual devuelve una lista sin paginación. Rechazar respuestas
      // paginadas evita presentar una primera página como historial completo.
      if (decoded is! List) throw const FormatException('Lista inválida');
      return decoded.map(AlertaSeguridad.fromJson).toList();
    } catch (_) {
      throw const AlertasException('La respuesta de alertas no es válida.');
    }
  }

  Future<DetalleEventoSeguridad> abrir(AlertaSeguridad alerta) async {
    if (!_validId(alerta.id) || !_validId(alerta.eventoId)) {
      throw const AlertasException('La alerta no es válida.');
    }
    final response = await _request('/eventos-seguridad/${alerta.eventoId}/');
    late DetalleEventoSeguridad detail;
    try {
      detail = DetalleEventoSeguridad.fromJson(jsonDecode(response.body), alerta.eventoId);
    } catch (_) {
      throw const AlertasException('La respuesta del evento no es válida.');
    }
    await _request('/notificaciones-seguridad/${alerta.id}/leer/', post: true);
    return detail;
  }
}
