import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

class AvisosResidenteService {
  final http.Client? client;
  final Future<String?> Function() readToken;
  AvisosResidenteService({this.client, Future<String?> Function()? readToken})
      : readToken = readToken ?? AuthService.getAccessToken;

  Future<http.Response> _request(String path, {bool post = false}) async {
    final token = await readToken();
    if (token == null || token.isEmpty) throw Exception('Inicia sesión nuevamente.');
    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    final headers = ApiConfig.getAuthHeaders(token);
    final response = await (post
        ? (client == null ? http.post(uri, headers: headers) : client!.post(uri, headers: headers))
        : (client == null ? http.get(uri, headers: headers) : client!.get(uri, headers: headers)))
        .timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) throw Exception('No se pudo consultar el aviso.');
    return response;
  }

  Future<List<Map<String, dynamic>>> listar() async {
    final data = jsonDecode((await _request('/avisos-residente/')).body);
    if (data is! List) throw const FormatException('Lista inválida');
    return data.map((e) {
      if (e is! Map<String, dynamic> || e['id'] is! String ||
          !RegExp(r'^[0-9a-fA-F-]{36}$').hasMatch(e['id']) || e['categoria'] is! String ||
          e['fecha_evento'] is! String || e['evidencia_disponible'] is! bool ||
          (e['leida_en'] != null && e['leida_en'] is! String)) {
        throw const FormatException('Aviso inválido');
      }
      return e;
    }).toList();
  }

  Future<void> leer(String id) async { await _request('/avisos-residente/$id/leer/', post: true); }

  Future<Uint8List> evidencia(String id) async {
    final response = await _request('/avisos-residente/$id/evidencia/');
    final bytes = response.bodyBytes;
    if (!(response.headers['content-type'] ?? '').toLowerCase().startsWith('image/jpeg') ||
        bytes.length < 3 || bytes.length > 1024 * 1024 || bytes[0] != 255 || bytes[1] != 216 || bytes[2] != 255) {
      throw const FormatException('Imagen inválida');
    }
    return bytes;
  }
}
