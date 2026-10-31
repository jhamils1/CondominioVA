import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

/// Synchronizes only the device for the authenticated account. Tokens stay in
/// request bodies and the last confirmed token is kept if a request fails.
class FcmDeviceRegistration {
  final http.Client? client;
  final Future<String?> Function() readAccess;
  final Future<String?> Function() readRegistered;
  final Future<void> Function(String) saveRegistered;
  final Future<void> Function() clearRegistered;
  final Future<String?> Function() readPending;
  final Future<void> Function(String) savePending;
  final Future<void> Function() clearPending;

  FcmDeviceRegistration({this.client, Future<String?> Function()? readAccess,
      Future<String?> Function()? readRegistered,
      Future<void> Function(String)? saveRegistered,
      Future<void> Function()? clearRegistered,
      Future<String?> Function()? readPending,
      Future<void> Function(String)? savePending,
      Future<void> Function()? clearPending})
      : readAccess = readAccess ?? AuthService.getAccessToken,
        readRegistered = readRegistered ?? AuthService.getFCMToken,
        saveRegistered = saveRegistered ?? AuthService.saveFCMToken,
        clearRegistered = clearRegistered ?? AuthService.deleteFCMToken,
        readPending = readPending ?? AuthService.getPendingFCMToken,
        savePending = savePending ?? AuthService.savePendingFCMToken,
        clearPending = clearPending ?? AuthService.deletePendingFCMToken;

  Future<http.Response> _post(String endpoint, String access, Map<String, dynamic> data) {
    final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.devicesEndpoint}$endpoint/');
    final headers = ApiConfig.getAuthHeaders(access);
    final body = jsonEncode(data);
    return (client == null ? http.post(uri, headers: headers, body: body)
        : client!.post(uri, headers: headers, body: body)).timeout(const Duration(seconds: 5));
  }

  Future<bool> synchronize(String current, String platform) async {
    if (current.isEmpty || !['android', 'ios'].contains(platform)) return false;
    try {
      final access = await readAccess();
      if (access == null || access.isEmpty) return false;
      final previous = await readRegistered();
      final pending = await readPending();
      if (pending != null && pending != current && pending != previous) {
        final cleanup = await _post('desregistrar', access, {'registration_id': pending});
        if (cleanup.statusCode != 204 || await readAccess() != access) return false;
        await clearPending();
      }
      // Record the candidate before the request: the response may be lost
      // after the server commits, or the app may terminate during the request.
      await savePending(current);
      final response = await _post('sincronizar', access, {'registration_id': current,
        'previous_registration_id': previous, 'type': platform});
      if (response.statusCode != 204 || await readAccess() != access) return false;
      await saveRegistered(current);
      await clearPending();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> unregister({String? token}) async {
    try {
      final access = await readAccess();
      final registered = await readRegistered();
      final pending = await readPending();
      final targets = token != null ? {token} : <String>{if (registered != null) registered, if (pending != null) pending};
      targets.remove('');
      if (targets.isEmpty) return true;
      if (access == null || access.isEmpty) return false;
      for (final target in targets) {
        final response = await _post('desregistrar', access, {'registration_id': target});
        if (response.statusCode != 204 || await readAccess() != access) return false;
      }
      if (registered != null && targets.contains(registered)) await clearRegistered();
      if (pending != null && targets.contains(pending)) await clearPending();
      return true;
    } catch (_) {
      return false;
    }
  }
}
