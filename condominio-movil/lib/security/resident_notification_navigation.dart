import 'dart:async';
import 'dart:convert';
import '../services/auth_service.dart';
import 'access_policy.dart';

bool esAvisoResidente(dynamic data) => data is Map && data['tipo'] == 'aviso_residente' &&
    data['notificacion_id'] is String && RegExp(r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$').hasMatch(data['notificacion_id']);
String? payloadAvisoResidente(dynamic data) => esAvisoResidente(data)
    ? jsonEncode({'tipo': 'aviso_residente', 'notificacion_id': data['notificacion_id']}) : null;

class ResidentNotificationNavigation {
  static final instance = ResidentNotificationNavigation();
  final Future<Map<String, dynamic>> Function() verificar;
  bool Function()? _abrir;
  bool _pendiente = false, _procesando = false, _reintentar = false;
  ResidentNotificationNavigation({Future<Map<String, dynamic>> Function()? verificar}) : verificar = verificar ?? AuthService.getUserProfile;
  void attach(bool Function() abrir) { _abrir = abrir; unawaited(procesar()); }
  void detach() { _abrir = null; }
  void recibir(dynamic data) { if (esAvisoResidente(data)) { _pendiente = true; unawaited(procesar()); } }
  void recibirPayload(String? payload) { if (payload != null) { try { recibir(jsonDecode(payload)); } catch (_) { /* Ignorar datos invalidos. */ } } }
  Future<void> procesar() async {
    if (!_pendiente || _abrir == null) return;
    if (_procesando) { _reintentar = true; return; }
    _procesando = true;
    try {
      final result = await verificar();
      if (result['success'] != true) return;
      final user = validarUsuarioActual(result['data']);
      if (user == null || !puedeAcceder(user['role'] as String?, '/avisos-residente')) { _pendiente = false; return; }
      if (_pendiente && (_abrir?.call() ?? false)) _pendiente = false;
    } catch (_) { /* Esperar nueva sesion o conexion. */ }
    finally {
      _procesando = false;
      if (_reintentar) { _reintentar = false; unawaited(procesar()); }
    }
  }
}
