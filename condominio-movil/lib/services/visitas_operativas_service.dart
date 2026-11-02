import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

class VisitasOperativasException implements Exception {
  final String message;
  const VisitasOperativasException(this.message);
}

class VisitaOperativa {
  final int id;
  final String estado;
  final String visitante;
  final String recibe;
  final String entrada;
  final String? salida;

  VisitaOperativa({required this.id, required this.estado, required this.visitante,
      required this.recibe, required this.entrada, required this.salida});

  factory VisitaOperativa.fromJson(dynamic data) {
    if (data is! Map<String, dynamic> || data['id'] is! int ||
        !['PENDIENTE', 'ACTIVA'].contains(data['estado']) ||
        data['visitante_nombre'] is! String || data['recibe_persona_nombre'] is! String ||
        data['fecha_hora_entrada'] is! String ||
        (data['fecha_hora_salida'] != null && data['fecha_hora_salida'] is! String)) {
      throw const FormatException('Visita inválida');
    }
    return VisitaOperativa(id: data['id'], estado: data['estado'],
        visitante: data['visitante_nombre'], recibe: data['recibe_persona_nombre'],
        entrada: data['fecha_hora_entrada'], salida: data['fecha_hora_salida']);
  }
}

class VisitasOperativasService {
  final http.Client? client;
  final Future<String?> Function() readToken;
  VisitasOperativasService({this.client, Future<String?> Function()? readToken})
      : readToken = readToken ?? AuthService.getAccessToken;

  Future<List<VisitaOperativa>> listar() async {
    try {
      final token = await readToken();
      if (token == null || token.isEmpty) throw const VisitasOperativasException('Inicia sesión nuevamente.');
      final uri = Uri.parse('${ApiConfig.baseUrl}/visitas/');
      final headers = ApiConfig.getAuthHeaders(token);
      final response = await (client == null ? http.get(uri, headers: headers) : client!.get(uri, headers: headers))
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 401) throw const VisitasOperativasException('La sesión venció. Inicia sesión nuevamente.');
      if (response.statusCode == 403) throw const VisitasOperativasException('No tienes permiso para consultar visitas.');
      if (response.statusCode != 200) throw const VisitasOperativasException('No se pudieron consultar las visitas.');
      final data = jsonDecode(response.body);
      if (data is! List) throw const FormatException('Lista inválida');
      return data.map(VisitaOperativa.fromJson).toList();
    } on VisitasOperativasException {
      rethrow;
    } on FormatException {
      throw const VisitasOperativasException('La respuesta de visitas no es válida.');
    } catch (_) {
      throw const VisitasOperativasException('No se pudo conectar al servidor.');
    }
  }
}
