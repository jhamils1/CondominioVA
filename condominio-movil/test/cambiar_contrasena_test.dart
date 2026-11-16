import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/services/auth_service.dart';
import 'package:smart_condominium/pages/cambiar_password_page.dart';

void main() {
  testWidgets('cada ojo muestra y oculta solo el texto escrito', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: CambiarPasswordPage()));
    final campos = find.byType(TextField);
    expect(tester.widget<TextField>(campos.at(0)).obscureText, isTrue);
    await tester.enterText(campos.at(0), 'clave-ficticia');
    await tester.tap(find.byTooltip('Mostrar contraseña actual'));
    await tester.pump();
    expect(tester.widget<TextField>(campos.at(0)).obscureText, isFalse);
    expect(tester.widget<TextField>(campos.at(1)).obscureText, isTrue);
    await tester.tap(find.byTooltip('Ocultar contraseña actual'));
    await tester.pump();
    expect(tester.widget<TextField>(campos.at(0)).obscureText, isTrue);
  });
  test('cambio de contraseña usa la sesión y muestra rechazo sin filtrar datos', () async {
    final client = MockClient((request) async {
      expect(request.url.path, endsWith('/api/change-password/'));
      expect(request.headers.entries.firstWhere((entry) => entry.key.toLowerCase() == 'authorization').value, 'Bearer ficticio');
      expect(jsonDecode(request.body), {'old_password': 'anterior', 'new_password': 'nueva'});
      return http.Response.bytes(utf8.encode(jsonEncode({'detail': 'Contraseña actual incorrecta.'})), 400);
    });
    final error = await AuthService.cambiarContrasena('anterior', 'nueva', client: client, readToken: () async => 'ficticio');
    expect(error, 'Contraseña actual incorrecta.');
    client.close();
  });

  test('cambio correcto y falta de sesión', () async {
    var llamadas = 0;
    final client = MockClient((request) async { llamadas++; return http.Response('{}', 200); });
    expect(await AuthService.cambiarContrasena('a', 'b', client: client, readToken: () async => 'ficticio'), isNull);
    expect(await AuthService.cambiarContrasena('a', 'b', client: client, readToken: () async => null), 'Inicia sesión nuevamente.');
    expect(llamadas, 1);
    client.close();
  });
}
