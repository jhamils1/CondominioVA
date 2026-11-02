import 'dart:async';
import 'dart:convert';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:smart_condominium/config/app_environment.dart';
import 'package:smart_condominium/main.dart' as app;
import 'package:smart_condominium/services/auth_service.dart';

const api = 'http://127.0.0.1:18082/api';

Future<dynamic> request(String method, String path, {String? access}) async {
  final client = http.Client();
  try {
    final req = http.Request(method, Uri.parse('$api/$path'));
    if (access != null) req.headers['Authorization'] = 'Bearer $access';
    final response = await http.Response.fromStream(
        await client.send(req).timeout(const Duration(seconds: 15)));
    expect(response.statusCode, 200, reason: '$method $path');
    return jsonDecode(response.body);
  } finally {
    client.close();
  }
}

Future<void> waitFor(WidgetTester tester, Finder finder) async {
  final until = DateTime.now().add(const Duration(seconds: 45));
  while (finder.evaluate().isEmpty && DateTime.now().isBefore(until)) {
    await tester.pump(const Duration(milliseconds: 200));
  }
  expect(finder, findsOneWidget);
  await tester.pumpAndSettle();
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('Firebase: alerta dirigida al guardia ficticio en primer plano',
      (tester) async {
    expect(AppEnvironment.pushTest, isTrue);
    expect(AppEnvironment.isolated, isFalse);
    AppEnvironment.validate();
    final identity = await tester.runAsync(() => request('GET', 'prueba-aislada/'));
    expect(identity, {'entorno': 'push-aislado', 'proyecto': 'condominio-seguridad'});
    app.main();
    await waitFor(tester, find.text('Ingresar'));
    await tester.enterText(find.byType(TextFormField).at(0), 'guardia_ficticio');
    await tester.enterText(find.byType(TextFormField).at(1), 'PruebaTemporal2026');
    FocusManager.instance.primaryFocus?.unfocus();
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Ingresar'));
    await tester.tap(find.text('Ingresar'));
    await waitFor(tester, find.text('Rol: Guardia de seguridad'));
    final access = await AuthService.getAccessToken();
    expect(access != null && access.isNotEmpty, isTrue);
    try {
      final fcm = await tester.runAsync(() => FirebaseMessaging.instance.getToken());
      expect(fcm != null && fcm.isNotEmpty, isTrue,
          reason: 'Firebase no entregó un identificador para la app de prueba.');
    } catch (error) {
      final code = error is FirebaseException ? error.code :
          error is PlatformException ? error.code : 'no_catalogado';
      final safeCode = RegExp(r'^[a-zA-Z0-9_./-]{1,60}$').hasMatch(code)
          ? code : 'no_catalogado';
      final message = error is FirebaseException ? (error.message ?? '') :
          error is PlatformException ? (error.message ?? '') : '';
      const known = ['SERVICE_NOT_AVAILABLE', 'FIS_AUTH_ERROR',
        'AUTHENTICATION_FAILED', 'MISSING_INSTANCEID_SERVICE', 'API_KEY_INVALID',
        'TOO_MANY_REGISTRATIONS', 'INVALID_ARGUMENT'];
      final reason = known.where(message.contains).firstOrNull ?? 'no_catalogado';
      debugPrint('Diagnóstico Firebase de prueba: $safeCode / $reason');
      rethrow;
    }
    final ready = await tester.runAsync(() async {
      for (var n = 0; n < 30; n++) {
        final state = await request('GET', 'prueba-enviar/', access: access);
        if (state['dispositivo_listo'] == true) return true;
        await Future<void>.delayed(const Duration(seconds: 1));
      }
      return false;
    });
    expect(ready, isTrue, reason: 'No se registró el dispositivo aislado.');
    final delivered = Completer<RemoteMessage>();
    final subscription = FirebaseMessaging.onMessage.listen((message) {
      if (message.data['tipo'] == 'seguridad' && !delivered.isCompleted) {
        delivered.complete(message);
      }
    });
    try {
      final result = await tester.runAsync(() async {
        final sent = await request('POST', 'prueba-enviar/', access: access);
        expect(sent['estado'], 'ENVIADA');
        return delivered.future.timeout(const Duration(seconds: 45));
      });
      expect(result?.notification?.title, 'Seguridad del condominio');
      expect(result?.notification?.body, 'Hay una alerta para revisar.');
      expect(result?.data['evento_id'], isNotEmpty);
      await tester.pump(const Duration(seconds: 2));
    } finally {
      await subscription.cancel();
    }
  }, timeout: const Timeout(Duration(minutes: 3)));
}
