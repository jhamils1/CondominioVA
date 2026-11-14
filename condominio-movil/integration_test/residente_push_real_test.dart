// Exclusivo para el backend temporal de prueba; nunca usa cuentas reales.
import 'dart:async';
import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:smart_condominium/main.dart' as app;
import 'package:smart_condominium/config/app_environment.dart';
import 'package:smart_condominium/security/resident_notification_navigation.dart';
import 'package:smart_condominium/services/auth_service.dart';

Future<dynamic> request(String method, String path, {String? access}) async {
  final client = http.Client();
  try {
    final req = http.Request(method, Uri.parse('http://127.0.0.1:18082/api/$path'));
    if (access != null) req.headers['Authorization'] = 'Bearer $access';
    final response = await http.Response.fromStream(await client.send(req).timeout(const Duration(seconds: 15)));
    expect(response.statusCode, 200, reason: 'Petición de prueba: $method $path');
    return jsonDecode(response.body);
  } finally { client.close(); }
}

Future<void> waitFor(WidgetTester tester, Finder finder) async {
  final end = DateTime.now().add(const Duration(seconds: 45));
  while (finder.evaluate().isEmpty && DateTime.now().isBefore(end)) { await tester.pump(const Duration(milliseconds: 200)); }
  expect(finder, findsOneWidget);
  await tester.pumpAndSettle();
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('aviso FCM dirigido a residente y apertura de evidencia ficticia', (tester) async {
    expect(AppEnvironment.pushTest, isTrue);
    app.main();
    await waitFor(tester, find.text('Ingresar'));
    await tester.enterText(find.byType(TextFormField).at(0), 'residente_prueba');
    await tester.enterText(find.byType(TextFormField).at(1), 'PruebaTemporal2026');
    FocusManager.instance.primaryFocus?.unfocus();
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Ingresar'));
    await tester.tap(find.text('Ingresar'));
    await waitFor(tester, find.text('Rol: Propietario'));
    final access = await AuthService.getAccessToken();
    expect(access, isNotNull);
    final ready = await tester.runAsync(() async {
      for (var n = 0; n < 45; n++) {
        if ((await request('GET', 'prueba-residente/', access: access))['listo'] == true) return true;
        await Future<void>.delayed(const Duration(seconds: 1));
      }
      return false;
    });
    expect(ready, isTrue, reason: 'No se registró el dispositivo de prueba.');
    final recibido = Completer<RemoteMessage>();
    final sub = FirebaseMessaging.onMessage.listen((m) {
      if (m.data['tipo'] == 'aviso_residente' && !recibido.isCompleted) recibido.complete(m);
    });
    try {
      final mensaje = await tester.runAsync(() async {
        final res = await request('POST', 'prueba-residente/', access: access);
        expect(res['estado'], 'ENVIADA');
        return recibido.future.timeout(const Duration(seconds: 45));
      });
      expect(mensaje, isNotNull);
      expect(mensaje!.notification?.body, 'Tienes un aviso del condominio.');
      ResidentNotificationNavigation.instance.recibir(mensaje.data);
      await waitFor(tester, find.text('Mis avisos'));
      await waitFor(tester, find.text('Estacionamiento de prueba'));
      await tester.tap(find.text('Estacionamiento de prueba'));
      await waitFor(tester, find.text('Volver a mis avisos'));
      await waitFor(tester, find.byType(Image));
    } finally { await sub.cancel(); }
  }, timeout: const Timeout(Duration(minutes: 4)));
}
