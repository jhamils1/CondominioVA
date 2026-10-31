import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/services/fcm_device_registration.dart';

void main() {
  test('rotación conserva el anterior hasta confirmar y no envía tokens en la URL', () async {
    var registered = 'anterior-ficticio';
    final client = MockClient((request) async {
      expect(request.url.path, '/api/devices/sincronizar/');
      expect(request.url.toString(), isNot(contains('ficticio')));
      expect(registered, 'anterior-ficticio');
      expect(jsonDecode(request.body), {'registration_id': 'nuevo-ficticio',
        'previous_registration_id': 'anterior-ficticio', 'type': 'android'});
      return http.Response('', 204);
    });
    String? pending;
    final safeService = FcmDeviceRegistration(client: client, readAccess: () async => 'sesion',
      readRegistered: () async => registered, saveRegistered: (value) async { registered = value; },
      readPending: () async => pending, savePending: (value) async { pending = value; },
      clearPending: () async { pending = null; });
    expect(await safeService.synchronize('nuevo-ficticio', 'android'), true);
    expect(registered, 'nuevo-ficticio');
  });

  test('error o desconexión no sobrescribe el registro anterior', () async {
    for (final offline in [false, true]) {
      var registered = 'anterior-ficticio';
      final service = FcmDeviceRegistration(client: MockClient((_) async {
        if (offline) throw Exception('sin conexión');
        return http.Response('', 400);
      }), readAccess: () async => 'sesion', readRegistered: () async => registered,
          saveRegistered: (value) async { registered = value; }, readPending: () async => null,
          savePending: (_) async {}, clearPending: () async {});
      expect(await service.synchronize('nuevo-ficticio', 'android'), false);
      expect(registered, 'anterior-ficticio');
    }
  });

  test('la baja confirmada borra la referencia y la fallida la conserva', () async {
    var registered = 'prueba-ficticia';
    var status = 500;
    final service = FcmDeviceRegistration(client: MockClient((request) async {
      expect(request.url.path, '/api/devices/desregistrar/');
      expect(request.url.toString(), isNot(contains('prueba-ficticia')));
      expect(jsonDecode(request.body)['registration_id'], 'prueba-ficticia');
      return http.Response('', status);
    }), readAccess: () async => 'sesion', readRegistered: () async => registered,
        clearRegistered: () async { registered = ''; }, readPending: () async => null,
        clearPending: () async {});
    expect(await service.unregister(), false);
    expect(registered, 'prueba-ficticia');
    status = 204;
    expect(await service.unregister(), true);
    expect(registered, '');
  });

  test('no guarda resultado si la sesión cambió durante la solicitud', () async {
    var access = 'primera-sesion';
    var saved = false;
    final service = FcmDeviceRegistration(client: MockClient((_) async {
      access = 'segunda-sesion';
      return http.Response('', 204);
    }), readAccess: () async => access, readRegistered: () async => null,
        saveRegistered: (_) async { saved = true; }, readPending: () async => null,
        savePending: (_) async {}, clearPending: () async {});
    expect(await service.synchronize('nuevo-ficticio', 'android'), false);
    expect(saved, false);
  });

  test('sin sesión no se consulta el servidor', () async {
    var requests = 0;
    final service = FcmDeviceRegistration(client: MockClient((_) async {
      requests++;
      return http.Response('', 204);
    }), readAccess: () async => null, readRegistered: () async => 'anterior',
        readPending: () async => null);
    expect(await service.synchronize('nuevo', 'android'), false);
    expect(await service.unregister(), false);
    expect(requests, 0);
  });

  test('cerrar sin dispositivo registrado no intenta ninguna solicitud', () async {
    var requests = 0;
    final service = FcmDeviceRegistration(client: MockClient((_) async {
      requests++;
      return http.Response('', 204);
    }), readAccess: () async => null, readRegistered: () async => null,
        readPending: () async => null);
    expect(await service.unregister(), true);
    expect(requests, 0);
  });

  test('si se pierde la respuesta, la baja intenta el token anterior y el pendiente', () async {
    String? registered = 'anterior';
    String? pending;
    final removed = <String>[];
    final service = FcmDeviceRegistration(client: MockClient((request) async {
      if (request.url.path.endsWith('/sincronizar/')) throw Exception('respuesta perdida');
      removed.add(jsonDecode(request.body)['registration_id']);
      return http.Response('', 204);
    }), readAccess: () async => 'sesion', readRegistered: () async => registered,
      saveRegistered: (value) async { registered = value; },
      clearRegistered: () async { registered = null; }, readPending: () async => pending,
      savePending: (value) async { pending = value; }, clearPending: () async { pending = null; });
    expect(await service.synchronize('nuevo', 'android'), false);
    expect(registered, 'anterior');
    expect(pending, 'nuevo');
    expect(await service.unregister(), true);
    expect(removed, ['anterior', 'nuevo']);
    expect(registered, isNull);
    expect(pending, isNull);
  });
}
