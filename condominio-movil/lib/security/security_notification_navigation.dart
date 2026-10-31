import 'dart:async';
import 'dart:convert';

import '../services/auth_service.dart';
import 'access_policy.dart';

bool _uuid(dynamic value) => value is String && RegExp(
    r'^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$').hasMatch(value);

/// Accept only the existing security message contract; never trust a route in a push.
bool esAvisoSeguridad(dynamic data) => data is Map && data['tipo'] == 'seguridad' &&
    _uuid(data['notificacion_id']) && _uuid(data['evento_id']);

String? payloadAvisoSeguridad(dynamic data) => esAvisoSeguridad(data)
    ? jsonEncode({'tipo': 'seguridad', 'notificacion_id': data['notificacion_id'],
        'evento_id': data['evento_id']}) : null;

class SecurityNotificationNavigation {
  static final instance = SecurityNotificationNavigation();
  final Future<Map<String, dynamic>> Function() verificar;
  bool Function()? _abrir;
  bool _pending = false;
  bool _processing = false;
  bool _retryRequested = false;

  SecurityNotificationNavigation({Future<Map<String, dynamic>> Function()? verificar})
      : verificar = verificar ?? AuthService.getUserProfile;

  void attach(bool Function() abrir) {
    _abrir = abrir;
    unawaited(procesar());
  }

  void detach() { _abrir = null; }

  void recibir(dynamic data) {
    if (!esAvisoSeguridad(data)) return;
    _pending = true;
    unawaited(procesar());
  }

  void recibirPayload(String? payload) {
    if (payload == null) return;
    try { recibir(jsonDecode(payload)); } catch (_) { /* Payload inválido. */ }
  }

  Future<void> procesar() async {
    if (!_pending || _abrir == null) return;
    if (_processing) { _retryRequested = true; return; }
    _processing = true;
    try {
      final result = await verificar();
      // Preserve the pending tap if there is no session or connectivity; a
      // successful login will retry. Never show payload data to another user.
      if (result['success'] != true) return;
      final user = validarUsuarioActual(result['data']);
      if (user == null || !puedeAcceder(user['role'] as String?, '/alertas-seguridad')) {
        _pending = false;
        return;
      }
      if (_pending && (_abrir?.call() ?? false)) _pending = false;
    } catch (_) {
      // A future login or retry may restore connectivity.
    } finally {
      _processing = false;
      if (_retryRequested) {
        _retryRequested = false;
        unawaited(procesar());
      }
    }
  }
}
