import 'dart:convert';
import 'dart:typed_data';

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
  final String id;
  final String categoria;
  final String descripcion;
  final String estado;
  final String fecha;
  final bool evidenciaDisponible;
  final bool clipDisponible;
  final String camara;
  final String ubicacion;
  final String prioridad;

  const DetalleEventoSeguridad({required this.id, required this.categoria, required this.descripcion,
    required this.estado, required this.fecha, this.evidenciaDisponible = false, this.clipDisponible = false,
    this.camara = '', this.ubicacion = '', this.prioridad = ''});

  factory DetalleEventoSeguridad.fromJson(dynamic data, String esperado) {
    if (data is! Map<String, dynamic> || data['id'] != esperado ||
        data['categoria'] is! String || data['descripcion'] is! String ||
        data['estado'] is! String || data['fecha_evento'] is! String ||
        (data['evidencia_disponible'] != null && data['evidencia_disponible'] is! bool) ||
        (data['clip_disponible'] != null && data['clip_disponible'] is! bool) ||
        (data['camara'] != null && data['camara'] is! String) ||
        (data['ubicacion'] != null && data['ubicacion'] is! String) ||
        (data['prioridad'] != null && data['prioridad'] is! String)) {
      throw const FormatException('Evento inválido');
    }
    return DetalleEventoSeguridad(id: esperado, categoria: data['categoria'],
        descripcion: data['descripcion'], estado: data['estado'], fecha: data['fecha_evento'],
        evidenciaDisponible: data['evidencia_disponible'] == true,
        clipDisponible: data['clip_disponible'] == true,
        camara: data['camara'] as String? ?? '', ubicacion: data['ubicacion'] as String? ?? '',
        prioridad: data['prioridad'] as String? ?? '');
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

  Future<http.Response> _request(String path, {bool post = false, bool confirmacion = false, Map<String, String>? datos}) async {
    try {
      final token = await readToken();
      if (token == null || token.isEmpty) {
        throw const AlertasException('Inicia sesión para consultar las alertas.');
      }
      final uri = Uri.parse('${ApiConfig.baseUrl}$path');
      final headers = ApiConfig.getAuthHeaders(token);
      final response = await (post
          ? (client == null ? http.post(uri, headers: headers, body: datos == null ? null : jsonEncode(datos)) : client!.post(uri, headers: headers, body: datos == null ? null : jsonEncode(datos)))
          : (client == null ? http.get(uri, headers: headers) : client!.get(uri, headers: headers)))
          .timeout(const Duration(seconds: 10));
      if (response.statusCode == 401) throw const AlertasException('La sesión venció. Inicia sesión nuevamente.');
      if (response.statusCode == 403 || response.statusCode == 404) {
        throw const AlertasException('No tienes acceso a esta información.');
      }
      if (response.statusCode == 503) throw const AlertasException('Las alertas de seguridad no están habilitadas.');
      if (confirmacion && response.statusCode == 400) {
        throw const AlertasException('La incidencia pudo ser revisada por otra persona. Actualiza para comprobar su estado.');
      }
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

  /// Lista eventos autorizados al operador; no trata notificaciones leídas como incidencias resueltas.
  Future<List<DetalleEventoSeguridad>> listarEventos() async {
    final response = await _request('/eventos-seguridad/');
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is! List) throw const FormatException('Lista inválida');
      return decoded.map((item) {
        if (item is! Map<String, dynamic> || !_validId(item['id'])) {
          throw const FormatException('Evento inválido');
        }
        final evento = DetalleEventoSeguridad.fromJson(item, item['id'] as String);
        if (!{'PENDIENTE_REVISION', 'CONFIRMADA', 'EN_ATENCION', 'RESUELTA', 'FALSO_POSITIVO'}.contains(evento.estado)) {
          throw const FormatException('Estado de evento desconocido');
        }
        return evento;
      }).toList();
    } catch (_) {
      throw const AlertasException('La respuesta de incidencias no es válida.');
    }
  }

  Future<DetalleEventoSeguridad> obtenerEvento(String id) async {
    if (!_validId(id)) throw const AlertasException('La incidencia no es válida.');
    final response = await _request('/eventos-seguridad/$id/');
    try {
      return DetalleEventoSeguridad.fromJson(jsonDecode(response.body), id);
    } catch (_) {
      throw const AlertasException('La respuesta del evento no es válida.');
    }
  }

  Future<void> confirmarEvento(String id) async {
    if (!_validId(id)) throw const AlertasException('La incidencia no es válida.');
    final response = await _request('/eventos-seguridad/$id/confirmar/', post: true, confirmacion: true);
    try {
      final evento = DetalleEventoSeguridad.fromJson(jsonDecode(utf8.decode(response.bodyBytes)), id);
      if (evento.estado != 'CONFIRMADA') throw const FormatException('Estado inesperado');
    } catch (_) {
      throw const AlertasException('No se pudo comprobar la confirmación. Actualiza para revisar el estado.');
    }
  }

  Future<DetalleEventoSeguridad> gestionarEvento(String id, String accion, {String observacion = ''}) async {
    if (!_validId(id)) throw const AlertasException('La incidencia no es válida.');
    const estados = {'descartar': 'FALSO_POSITIVO', 'atender': 'EN_ATENCION',
      'actuaciones': 'EN_ATENCION', 'resolver': 'RESUELTA'};
    final esperado = estados[accion];
    if (esperado == null) throw const AlertasException('La acción no es válida.');
    final texto = observacion.trim();
    if (accion != 'atender' && texto.isEmpty) throw const AlertasException('Escribe un motivo u observación.');
    final response = await _request('/eventos-seguridad/$id/$accion/', post: true, confirmacion: true,
      datos: {accion == 'descartar' ? 'motivo' : 'observacion': texto});
    try {
      final evento = DetalleEventoSeguridad.fromJson(jsonDecode(utf8.decode(response.bodyBytes)), id);
      if (evento.estado != esperado) throw const FormatException('Estado inesperado');
      return evento;
    } catch (_) {
      throw const AlertasException('No se pudo comprobar el resultado. Actualiza para revisar el estado.');
    }
  }

  Future<void> retirarHistorial(String id) async {
    if (!_validId(id)) throw const AlertasException('La incidencia no es válida.');
    await _request('/eventos-seguridad/$id/retirar-historial/', post: true);
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

  Future<Uint8List> obtenerEvidencia(String eventoId) async {
    if (!_validId(eventoId)) throw const AlertasException('El evento no es válido.');
    final response = await _request('/eventos-seguridad/$eventoId/evidencia/');
    final bytes = response.bodyBytes;
    final tipo = response.headers['content-type']?.toLowerCase() ?? '';
    if (!tipo.startsWith('image/jpeg') || bytes.length < 3 || bytes.length > 1024 * 1024 ||
        bytes[0] != 0xff || bytes[1] != 0xd8 || bytes[2] != 0xff) {
      throw const AlertasException('La evidencia recibida no es válida.');
    }
    return bytes;
  }
}
