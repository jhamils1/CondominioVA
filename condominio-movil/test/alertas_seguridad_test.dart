import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/pages/alertas_seguridad_page.dart';
import 'package:smart_condominium/security/access_policy.dart';
import 'package:smart_condominium/services/alertas_seguridad_service.dart';

const notificationId = '11111111-1111-4111-8111-111111111111';
const eventId = '22222222-2222-4222-8222-222222222222';
const notification = {'id': notificationId, 'evento': eventId,
  'mensaje': 'Evento enviado a revisión', 'creada': '2026-01-01T12:00:00Z', 'leida_en': null};
const detail = {'id': eventId, 'categoria': 'Prueba', 'descripcion': 'Detalle ficticio',
  'estado': 'RESUELTA', 'fecha_evento': '2026-01-01T12:00:00Z'};

void main() {
  test('solo administrador y guardia pueden navegar a alertas', () {
    expect(puedeAcceder('administrador', '/alertas-seguridad'), true);
    expect(puedeAcceder('guardia', '/alertas-seguridad'), true);
    expect(puedeAcceder('propietario', '/alertas-seguridad'), false);
    expect(puedeAcceder('inquilino', '/alertas-seguridad'), false);
    expect(puedeAcceder(null, '/alertas-seguridad'), false);
  });

  test('lista, consulta el evento y marca únicamente la notificación propia', () async {
    final requests = <String>[];
    final client = MockClient((request) async {
      requests.add('${request.method} ${request.url.path}');
      expect(request.headers['authorization'], 'Bearer prueba');
      if (request.url.path.endsWith('/notificaciones-seguridad/')) return http.Response(jsonEncode([notification]), 200);
      if (request.url.path.endsWith('/eventos-seguridad/$eventId/')) return http.Response(jsonEncode(detail), 200);
      return http.Response('{}', 200);
    });
    final service = AlertasSeguridadService(client: client, readToken: () async => 'prueba');
    final list = await service.listar();
    final event = await service.abrir(list.single);
    expect(event.estado, 'RESUELTA');
    expect(requests, [
      'GET /api/notificaciones-seguridad/',
      'GET /api/eventos-seguridad/$eventId/',
      'POST /api/notificaciones-seguridad/$notificationId/leer/',
    ]);
  });

  test('maneja sesión vencida, permiso denegado, servicio desactivado y desconexión', () async {
    for (final status in [401, 403, 503]) {
      final service = AlertasSeguridadService(client: MockClient((_) async => http.Response('', status)),
          readToken: () async => 'prueba');
      await expectLater(service.listar(), throwsA(isA<AlertasException>()));
    }
    final offline = AlertasSeguridadService(client: MockClient((_) async => throw Exception('sin conexión')),
        readToken: () async => 'prueba');
    await expectLater(offline.listar(), throwsA(isA<AlertasException>()));
  });

  test('rechaza datos inválidos y no consulta URL creada con identificadores falsos', () async {
    var requests = 0;
    final service = AlertasSeguridadService(client: MockClient((_) async {
      requests++;
      return http.Response(jsonEncode([{'id': '../usuarios', 'evento': eventId}]), 200);
    }), readToken: () async => 'prueba');
    await expectLater(service.listar(), throwsA(isA<AlertasException>()));
    await expectLater(service.abrir(const AlertaSeguridad(id: '../usuarios', eventoId: eventId,
        mensaje: '', creada: '', leida: false)), throwsA(isA<AlertasException>()));
    expect(requests, 1);
  });

  testWidgets('abre alerta y muestra su estado actual', (tester) async {
    final service = AlertasSeguridadService(client: MockClient((request) async {
      if (request.url.path.endsWith('/notificaciones-seguridad/')) return http.Response(jsonEncode([notification]), 200);
      if (request.method == 'GET') return http.Response(jsonEncode(detail), 200);
      return http.Response('{}', 200);
    }), readToken: () async => 'prueba');
    await tester.pumpWidget(MaterialApp(home: AlertasSeguridadPage(service: service)));
    await tester.pumpAndSettle();
    expect(find.text('Evento enviado a revisión'), findsOneWidget);
    await tester.tap(find.text('Evento enviado a revisión'));
    await tester.pumpAndSettle();
    expect(find.text('Detalle ficticio'), findsOneWidget);
    expect(find.text('Estado: RESUELTA'), findsOneWidget);
    await tester.tap(find.text('Volver a las alertas'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Leída'), findsOneWidget);
  });

  testWidgets('muestra error cuando cambia el acceso al abrir detalle', (tester) async {
    final service = AlertasSeguridadService(client: MockClient((request) async {
      if (request.url.path.endsWith('/notificaciones-seguridad/')) return http.Response(jsonEncode([notification]), 200);
      return http.Response('', 403);
    }), readToken: () async => 'prueba');
    await tester.pumpWidget(MaterialApp(home: AlertasSeguridadPage(service: service)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Evento enviado a revisión'));
    await tester.pumpAndSettle();
    expect(find.text('No tienes acceso a esta información.'), findsOneWidget);
    expect(find.text('Detalle ficticio'), findsNothing);
  });
}
