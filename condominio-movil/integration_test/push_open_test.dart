import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:smart_condominium/config/app_environment.dart';
import 'package:smart_condominium/main.dart' as app;
import 'package:smart_condominium/services/auth_service.dart';

const api = 'http://127.0.0.1:18082/api';

Future<dynamic> get(String path, {String? access}) async {
  final headers = <String, String>{};
  if (access != null) headers['Authorization'] = 'Bearer $access';
  final response = await http.get(Uri.parse('$api/$path'), headers: headers)
      .timeout(const Duration(seconds: 10));
  expect(response.statusCode, 200, reason: 'GET $path');
  return jsonDecode(response.body);
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
  testWidgets('Abrir alerta push en segundo plano con guardia ficticio',
      (tester) async {
    expect(AppEnvironment.pushTest, isTrue);
    expect(AppEnvironment.isolated, isFalse);
    AppEnvironment.validate();
    final identity = await tester.runAsync(() => get('prueba-aislada/'));
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
    final registered = await tester.runAsync(() async {
      for (var n = 0; n < 45; n++) {
        if ((await get('prueba-enviar/', access: access))['dispositivo_listo'] == true) return true;
        await Future<void>.delayed(const Duration(seconds: 1));
      }
      return false;
    });
    expect(registered, isTrue, reason: 'No se registró el dispositivo aislado.');
    debugPrint('PUSH_APERTURA_LISTO');
    var finished = false;
    for (var n = 0; n < 150; n++) {
      final state = await tester.runAsync(() => get('prueba-finalizar/', access: access));
      if (state?['finalizar'] == true) {
        finished = true;
        break;
      }
      // Mantener la interfaz actualizada cuando el usuario abre el aviso.
      await tester.pump(const Duration(milliseconds: 100));
      await tester.runAsync(() => Future<void>.delayed(const Duration(seconds: 1)));
    }
    expect(finished, isTrue, reason: 'La prueba externa no confirmó la entrega.');
    // El aviso abre la bandeja autorizada; el detalle se abre desde ella.
    await waitFor(tester, find.text('Alertas de seguridad'));
    await waitFor(tester, find.text('Evento enviado a revisión'));
    debugPrint('PUSH_APERTURA_VERIFICADA');
    await tester.runAsync(() => Future<void>.delayed(const Duration(seconds: 20)));
  }, timeout: const Timeout(Duration(minutes: 4)));
}
