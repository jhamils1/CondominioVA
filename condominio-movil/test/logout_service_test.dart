import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/services/auth_service.dart';

void main() {
  for (final status in [205, 400]) {
    test('logout con respuesta $status limpia tokens y verifica confirmación', () async {
      final tokens = {'access_token': 'access-test', 'refresh_token': 'refresh-test'};
      final client = MockClient((request) async {
        expect(request.headers['authorization'], 'Bearer access-test');
        expect(jsonDecode(request.body)['refresh'], 'refresh-test');
        return http.Response('', status);
      });
      final result = await AuthService.logout(
        client: client,
        readToken: (key) async => tokens[key],
        deleteToken: (key) async { tokens.remove(key); },
      );
      expect(result['success'], true);
      expect(result['serverConfirmed'], status == 205);
      expect(tokens, isEmpty);
    });
  }

  test('logout sin conexión elimina credenciales y no confirma servidor', () async {
    final tokens = {'access_token': 'a', 'refresh_token': 'r'};
    final result = await AuthService.logout(
      client: MockClient((_) async => throw Exception('sin conexión')),
      readToken: (key) async => tokens[key],
      deleteToken: (key) async { tokens.remove(key); },
    );
    expect(result['success'], true);
    expect(result['serverConfirmed'], false);
    expect(tokens, isEmpty);
  });

  test('logout informa fallo local e intenta borrar ambos tokens', () async {
    final attempts = <String>[];
    final result = await AuthService.logout(
      readToken: (_) async => null,
      deleteToken: (key) async {
        attempts.add(key);
        if (key == 'access_token') throw Exception('almacenamiento');
      },
    );
    expect(result['success'], false);
    expect(attempts, ['access_token', 'refresh_token']);
  });
}
