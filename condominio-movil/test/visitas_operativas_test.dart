import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/pages/visitas_operativas_page.dart';
import 'package:smart_condominium/security/access_policy.dart';
import 'package:smart_condominium/security/protected_route.dart';
import 'package:smart_condominium/services/visitas_operativas_service.dart';

Map<String, dynamic> customUser(List<dynamic> capabilities) => {
  'id': 4, 'username': 'empleado_ficticio', 'role': 'personalizado',
  'rol_nombre': 'Recepción', 'capacidades': capabilities,
};

void main() {
  test('solo la capacidad validada habilita la ruta; no habilita FCM ni seguridad', () {
    final without = customUser([]);
    final withVisits = customUser(['visitas.consultar_operativas']);
    expect(validarUsuarioActual(without), isNotNull);
    expect(validarUsuarioActual(customUser([1])), isNull);
    expect(validarUsuarioActual({...without, 'capacidades': null}), isNull);
    expect(puedeAcceder('personalizado', '/visitas-operativas', []), false);
    expect(puedeAcceder('personalizado', '/visitas-operativas', withVisits['capacidades']), true);
    expect(puedeAcceder('personalizado', '/alertas-seguridad', withVisits['capacidades']), false);
    expect(puedeAcceder('personalizado', '/editar-perfil', withVisits['capacidades']), false);
    expect(puedeRegistrarNotificaciones(withVisits), false);
    expect(puedeRegistrarNotificaciones({'role': 'guardia'}), true);
  });

  testWidgets('ruta consulta el perfil y niega acceso sin capacidad', (tester) async {
    await tester.pumpWidget(MaterialApp(home: ProtectedRoute(
      route: '/visitas-operativas', verificar: () async => {'success': true, 'data': customUser([])},
      child: const Text('Pantalla de visitas'),
    )));
    await tester.pumpAndSettle();
    expect(find.text('Pantalla de visitas'), findsNothing);
    expect(find.text('No tienes permiso para acceder a esta pantalla.'), findsOneWidget);
  });

  testWidgets('con capacidad muestra únicamente la pantalla autorizada', (tester) async {
    await tester.pumpWidget(MaterialApp(home: ProtectedRoute(
      route: '/visitas-operativas',
      verificar: () async => {'success': true, 'data': customUser(['visitas.consultar_operativas'])},
      child: const Text('Pantalla de visitas'),
    )));
    await tester.pumpAndSettle();
    expect(find.text('Pantalla de visitas'), findsOneWidget);
  });

  test('servicio usa token y procesa solo visitas vigentes', () async {
    final service = VisitasOperativasService(readToken: () async => 'token-ficticio',
      client: MockClient((request) async {
        expect(request.url.path, endsWith('/visitas/'));
        expect(request.headers['Authorization'], 'Bearer token-ficticio');
        return http.Response(jsonEncode([{'id': 1, 'estado': 'ACTIVA',
          'visitante_nombre': 'Visita ficticia', 'recibe_persona_nombre': 'Residente ficticio',
          'fecha_hora_entrada': '2026-01-01T12:00:00Z', 'fecha_hora_salida': null}]), 200);
      }));
    final visits = await service.listar();
    expect(visits.single.visitante, 'Visita ficticia');
  });

  test('servicio rechaza respuesta inválida y acceso denegado', () async {
    final denied = VisitasOperativasService(readToken: () async => 'ficticio', client: MockClient((_) async => http.Response('', 403)));
    await expectLater(denied.listar(), throwsA(isA<VisitasOperativasException>()));
    final invalid = VisitasOperativasService(readToken: () async => 'ficticio', client: MockClient((_) async => http.Response(jsonEncode([{'id': 1, 'estado': 'FINALIZADA'}]), 200)));
    await expectLater(invalid.listar(), throwsA(isA<VisitasOperativasException>()));
  });

  testWidgets('pantalla presenta datos de lectura y estado vacío', (tester) async {
    await tester.pumpWidget(MaterialApp(home: VisitasOperativasPage(cargar: () async => [
      VisitaOperativa(id: 1, estado: 'ACTIVA', visitante: 'Visita ficticia', recibe: 'Residente ficticio', entrada: '2026-01-01', salida: null),
    ])));
    await tester.pumpAndSettle();
    expect(find.text('Visita ficticia'), findsOneWidget);
    expect(find.textContaining('Recibe: Residente ficticio'), findsOneWidget);
    expect(find.text('Editar'), findsNothing);
  });
}
