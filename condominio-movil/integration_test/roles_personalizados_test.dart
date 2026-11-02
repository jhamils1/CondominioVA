import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:smart_condominium/config/app_environment.dart';
import 'package:smart_condominium/main.dart' as app;
import 'package:smart_condominium/services/auth_service.dart';
import 'package:smart_condominium/services/fcm_service.dart';

// Only the disposable server created by run_roles_web_isolated --port 18080.
// Credentials belong exclusively to its fictional, temporary fixtures.
const api = 'http://127.0.0.1:18080/api';
const password = 'PruebaTemporal2026';

Future<dynamic> request(String method, String path, int expected,
    {Object? body, String? token}) async {
  final client = http.Client();
  try {
    final req = http.Request(method, Uri.parse('$api/$path'));
    req.headers['Content-Type'] = 'application/json';
    if (token != null) req.headers['Authorization'] = 'Bearer $token';
    if (body != null) req.body = jsonEncode(body);
    final response = await http.Response.fromStream(
        await client.send(req).timeout(const Duration(seconds: 10)));
    // Never include response bodies or credentials in failure output.
    expect(response.statusCode, expected, reason: '$method $path');
    return response.body.isEmpty ? null : jsonDecode(response.body);
  } finally {
    client.close();
  }
}

Future<void> waitFor(WidgetTester tester, Finder finder) async {
  final until = DateTime.now().add(const Duration(seconds: 30));
  while (finder.evaluate().isEmpty && DateTime.now().isBefore(until)) {
    await tester.pump(const Duration(milliseconds: 200));
  }
  expect(finder, findsOneWidget);
  await tester.pumpAndSettle();
}

Future<void> openMenu(WidgetTester tester) async {
  await tester.tap(find.byIcon(Icons.menu));
  await tester.pumpAndSettle();
  await waitFor(tester, find.text('Recepcion ficticia'));
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Android: login, capacidad, consulta, revocacion y cierre',
      (tester) async {
    // Fail before clearing storage, logging in, or creating any fixture.
    expect(AppEnvironment.isolated, isTrue);
    AppEnvironment.validate();
    final identity = await request('GET', 'prueba-aislada/', 200);
    expect(identity, {'entorno': 'roles-aislados', 'firebase': false});
    const storage = FlutterSecureStorage();
    await storage.deleteAll(); // Separate .prueba application storage only.

    final adminLogin = await request('POST', 'login/', 200,
        body: {'username': 'admin_ficticio', 'password': password});
    final admin = adminLogin['access'] as String;
    final role = await request('POST', 'roles-personalizados/', 201,
        body: {'nombre': 'Recepcion ficticia'}, token: admin);
    expect(role['activo'], false);
    expect(role['consultar_visitas'], false);
    final rolePath = 'roles-personalizados/${role['id']}/';
    final users = await request('GET', 'users/', 200, token: admin) as List;
    final employee = users.singleWhere((u) => u['username'] == 'empleado_ficticio');
    await request('PATCH', rolePath, 200, body: {'activo': true}, token: admin);
    await request('POST', '${rolePath}asignar/', 200,
        body: {'usuario_id': employee['id']}, token: admin);

    try {
      app.main();
      await waitFor(tester, find.text('Ingresar'));
      await tester.enterText(find.byType(TextFormField).at(0), 'empleado_ficticio');
      await tester.enterText(find.byType(TextFormField).at(1), password);
      FocusManager.instance.primaryFocus?.unfocus();
      await tester.pumpAndSettle();
      await tester.ensureVisible(find.text('Ingresar'));
      await tester.tap(find.text('Ingresar'));
      await waitFor(tester, find.text('Rol: Recepcion ficticia'));
      final access = await AuthService.getAccessToken();
      expect(access != null && access.isNotEmpty, true);
      final refresh = await storage.read(key: 'refresh_token');
      expect(refresh != null && refresh.isNotEmpty, true);
      await openMenu(tester);
      expect(find.text('Visitas pendientes y activas'), findsNothing);
      expect(find.text('Alertas de seguridad'), findsNothing);
      expect(find.text('Mis Expensas'), findsNothing);
      await request('GET', 'visitas/', 403, token: access);
      await request('GET', 'users/', 403, token: access);
      await request('POST', 'devices/sincronizar/', 403,
          body: {'registration_id': 'ficticio', 'type': 'android'}, token: access);
      expect(await FCMService.getToken(), isNull);
      expect(await FCMService.registerDevice('ficticio'), false);

      tester.state<ScaffoldState>(find.byType(Scaffold).last).closeDrawer();
      await tester.pumpAndSettle();
      await request('PATCH', rolePath, 200,
          body: {'consultar_visitas': true}, token: admin);
      await openMenu(tester);
      await waitFor(tester, find.text('Visitas pendientes y activas'));
      await tester.tap(find.text('Visitas pendientes y activas'));
      await waitFor(tester, find.text('Visita Ficticia'));
      expect(find.textContaining('Recibe: Residente Ficticio'), findsOneWidget);
      expect(find.text('Editar'), findsNothing);

      await request('PATCH', rolePath, 200,
          body: {'consultar_visitas': false}, token: admin);
      await tester.tap(find.byTooltip('Actualizar'));
      await waitFor(tester, find.text('No tienes permiso para consultar visitas.'));
      expect(find.text('Visita Ficticia'), findsNothing);
      await tester.tap(find.byType(BackButton));
      await tester.pumpAndSettle();
      await openMenu(tester);
      expect(find.text('Visitas pendientes y activas'), findsNothing);
      await tester.tap(find.text('Cerrar sesión'));
      await waitFor(tester, find.text('Ingresar'));
      expect(await AuthService.getAccessToken(), isNull);
      expect(await storage.read(key: 'refresh_token'), isNull);
      await request('GET', 'me/', 401, token: access);

      // Check role deactivation against a fresh, otherwise valid session.
      final next = await request('POST', 'login/', 200,
          body: {'username': 'empleado_ficticio', 'password': password});
      await request('PATCH', rolePath, 200, body: {'activo': false}, token: admin);
      await request('GET', 'me/', 401, token: next['access']);
      await request('POST', 'refresh/', 401, body: {'refresh': next['refresh']});
    } finally {
      await storage.deleteAll();
      await tester.pumpWidget(const SizedBox.shrink());
    }
  });
}
