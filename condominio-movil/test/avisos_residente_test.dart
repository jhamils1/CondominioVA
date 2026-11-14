import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/security/access_policy.dart';
import 'package:smart_condominium/services/avisos_residente_service.dart';
import 'package:smart_condominium/pages/avisos_residente_page.dart';

void main() {
  test('solo propietario e inquilino pueden abrir la bandeja', () {
    expect(puedeAcceder('propietario', '/avisos-residente'), isTrue);
    expect(puedeAcceder('inquilino', '/avisos-residente'), isTrue);
    expect(puedeAcceder('guardia', '/avisos-residente'), isFalse);
    expect(puedeAcceder('administrador', '/avisos-residente'), isFalse);
  });
  test('consulta solo la API de avisos y carga evidencia autenticada', () async {
    const id = '12345678-1234-1234-1234-123456789abc';
    final paths = <String>[];
    final client = MockClient((request) async {
      paths.add(request.url.path);
      expect(request.headers['Authorization'], 'Bearer ficticio');
      if (request.url.path.endsWith('/evidencia/')) {
        return http.Response.bytes(Uint8List.fromList([255, 216, 255, 1]), 200, headers: {'content-type': 'image/jpeg'});
      }
      if (request.method == 'POST') return http.Response('{}', 200);
      return http.Response(jsonEncode([{'id': id, 'categoria': 'Estacionamiento', 'fecha_evento': '2026-11-13', 'evidencia_disponible': true}]), 200);
    });
    final servicio = AvisosResidenteService(client: client, readToken: () async => 'ficticio');
    final avisos = await servicio.listar();
    expect(avisos.single['id'], id);
    await servicio.leer(id);
    expect((await servicio.evidencia(id)).length, 4);
    expect(paths.every((path) => path.contains('/avisos-residente/')), isTrue);
    client.close();
  });
  testWidgets('residente abre su aviso desde la bandeja', (tester) async {
    const id = '12345678-1234-1234-1234-123456789abc';
    final client = MockClient((request) async {
      if (request.method == 'POST') return http.Response('{}', 200);
      return http.Response(jsonEncode([{'id': id, 'categoria': 'Estacionamiento', 'fecha_evento': '2026-11-13', 'evidencia_disponible': false}]), 200);
    });
    final service = AvisosResidenteService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: AvisosResidentePage(service: service)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Estacionamiento'));
    await tester.pumpAndSettle();
    expect(find.text('Volver a mis avisos'), findsOneWidget);
    expect(find.textContaining('Fecha:'), findsOneWidget);
    client.close();
  });
}
