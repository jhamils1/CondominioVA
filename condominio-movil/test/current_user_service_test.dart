import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/services/auth_service.dart';

void main() {
  test('consulta el usuario actual al backend y conserva el rol recibido', () async {
    final client = MockClient((request) async {
      expect(request.url.path, endsWith('/api/me/'));
      const configuredBase = String.fromEnvironment('API_BASE_URL');
      if (configuredBase.isNotEmpty) {
        expect(request.url.toString(), '$configuredBase/me/');
      }
      expect(request.headers['Authorization'], 'Bearer token-ficticio');
      return http.Response(jsonEncode({'id': 1, 'username': 'guardia_prueba', 'role': 'guardia'}), 200);
    });
    final result = await AuthService.getUserProfile(client: client, readToken: () async => 'token-ficticio');
    expect(result['success'], isTrue);
    expect(result['data']['role'], 'guardia');
    expect(result['data']['username'], 'guardia_prueba');
    client.close();
  });

  test('sin token no se ejecuta solicitud', () async {
    var called = false;
    final client = MockClient((_) async { called = true; return http.Response('', 200); });
    final result = await AuthService.getUserProfile(client: client, readToken: () async => null);
    expect(result['success'], isFalse);
    expect(called, isFalse);
    client.close();
  });

  test('rechaza sesión vencida y acceso denegado', () async {
    for (final status in [401, 403]) {
      final client = MockClient((_) async => http.Response('', status));
      final result = await AuthService.getUserProfile(client: client, readToken: () async => 'token-ficticio');
      expect(result['success'], isFalse);
      expect(result['message'], isNotEmpty);
      client.close();
    }
  });

  test('rechaza respuesta inválida y error de conexión', () async {
    for (final client in [
      MockClient((_) async => http.Response(jsonEncode({'id': 1, 'username': 'x', 'role': 'desconocido'}), 200)),
      MockClient((_) async => throw Exception('error ficticio')),
    ]) {
      final result = await AuthService.getUserProfile(client: client, readToken: () async => 'token-ficticio');
      expect(result['success'], isFalse);
      client.close();
    }
  });
}
