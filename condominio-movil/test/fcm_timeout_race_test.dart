import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/services/fcm_device_registration.dart';

void main() {
  testWidgets('timeout conserva estado local aunque servidor complete luego', (tester) async {
    final server = Completer<http.Response>();
    String? registered = 'anterior-ficticio';
    String? pending;
    var requests = 0;
    final service = FcmDeviceRegistration(
      client: MockClient((_) { requests++; return server.future; }),
      readAccess: () async => 'sesion-ficticia',
      readRegistered: () async => registered,
      saveRegistered: (value) async { registered = value; },
      readPending: () async => pending,
      savePending: (value) async { pending = value; },
      clearPending: () async { pending = null; },
    );
    final operation = service.synchronize('nuevo-ficticio', 'android');
    await tester.pump();
    expect(requests, 1);
    await tester.pump(const Duration(seconds: 6));
    expect(await operation, false);
    expect(registered, 'anterior-ficticio');
    expect(pending, 'nuevo-ficticio');
    server.complete(http.Response('', 204));
    await tester.pump();
    expect(registered, 'anterior-ficticio');
    expect(pending, 'nuevo-ficticio');
  });
}
