import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/pages/perfil_page.dart';
import 'package:smart_condominium/services/alertas_seguridad_service.dart';
import 'package:smart_condominium/services/avisos_residente_service.dart';

const _nuevo = '11111111-1111-4111-8111-111111111111';
const _leido = '22222222-2222-4222-8222-222222222222';
const _evento = '33333333-3333-4333-8333-333333333333';

Future<Map<String, dynamic>> _perfil(String role) async => {
  'success': true,
  'data': {'id': 1, 'username': 'prueba', 'role': role},
};

void main() {
  testWidgets('residente ve avisos propios, historial leído y ajustes', (
    tester,
  ) async {
    final client = MockClient(
      (request) async => http.Response(
        jsonEncode([
          {
            'id': _nuevo,
            'categoria': 'Aviso nuevo',
            'fecha_evento': '2026-01-01',
            'evidencia_disponible': false,
            'leida_en': null,
          },
          {
            'id': _leido,
            'categoria': 'Aviso anterior',
            'fecha_evento': '2026-01-01',
            'evidencia_disponible': false,
            'leida_en': '2026-01-02',
          },
        ]),
        200,
      ),
    );
    final service = AvisosResidenteService(
      client: client,
      readToken: () async => 'ficticio',
    );
    await tester.pumpWidget(
      MaterialApp(
        home: PerfilPage(
          isDark: true,
          onToggleTheme: () {},
          cargarPerfil: () => _perfil('propietario'),
          avisosService: service,
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Incidencias'), findsNothing);
    await tester.tap(find.text('Avisos'));
    await tester.pumpAndSettle();
    expect(find.text('Aviso nuevo'), findsOneWidget);
    expect(find.text('Aviso anterior'), findsNothing);
    await tester.tap(find.text('Historial'));
    await tester.pumpAndSettle();
    expect(find.text('Aviso anterior'), findsOneWidget);
    expect(find.text('Aviso nuevo'), findsNothing);
    await tester.tap(find.text('Ajustes'));
    await tester.pumpAndSettle();
    final scaffold = tester.widget<Scaffold>(find.descendant(of: find.byType(PerfilPage), matching: find.byType(Scaffold)).first);
    expect(scaffold.drawer, isNull);
    expect(scaffold.endDrawer, isNotNull);
    expect(tester.getTopRight(find.byType(Drawer)).dx, tester.view.physicalSize.width / tester.view.devicePixelRatio);
    expect(find.text('Cambiar contraseña'), findsOneWidget);
    expect(find.text('Cerrar sesión'), findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink());
    client.close();
  });

  testWidgets('guardia separa incidencias por estado y conserva el detalle', (tester) async {
    var posts = 0;
    Map<String, dynamic> evento(String id, String categoria, String estado) => {
      'id': id, 'categoria': categoria, 'descripcion': 'Descripción de prueba',
      'estado': estado, 'fecha_evento': '2026-01-01', 'ubicacion': 'Entrada',
      'camara': 'Cámara 1', 'prioridad': 'alta',
    };
    final client = MockClient((request) async {
      if (request.method == 'POST') posts++;
      if (request.url.path.endsWith('/eventos-seguridad/$_evento/')) {
        return http.Response(jsonEncode(evento(_evento, 'Evento activo', 'EN_ATENCION')), 200);
      }
      return http.Response(jsonEncode([
        evento(_evento, 'Evento activo', 'EN_ATENCION'),
        evento(_leido, 'Evento resuelto', 'RESUELTA'),
        evento(_nuevo, 'Evento descartado', 'FALSO_POSITIVO'),
      ]), 200);
    });
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: PerfilPage(isDark: true, onToggleTheme: () {},
      cargarPerfil: () => _perfil('guardia'), alertasService: service)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Incidencias'));
    await tester.pumpAndSettle();
    expect(find.text('Evento activo'), findsOneWidget);
    expect(find.text('Evento resuelto'), findsNothing);
    await tester.tap(find.text('Evento activo'));
    await tester.pumpAndSettle();
    expect(find.text('Ubicación: Entrada'), findsOneWidget);
    expect(find.text('Cámara: Cámara 1'), findsOneWidget);
    expect(find.text('Prioridad: alta'), findsOneWidget);
    expect(posts, 0);
    await tester.tap(find.text('Historial'));
    await tester.pumpAndSettle();
    expect(find.text('Evento activo'), findsNothing);
    expect(find.text('Evento resuelto'), findsOneWidget);
    expect(find.text('Evento descartado'), findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink());
    client.close();
  });

  testWidgets(
    'actualiza avisos cada 30 segundos mientras se muestra la lista',
    (tester) async {
      var calls = 0;
      final client = MockClient((request) async {
        calls++;
        return http.Response(
          jsonEncode(
            calls == 1
                ? []
                : [
                    {
                      'id': _nuevo,
                      'categoria': 'Aviso recibido',
                      'fecha_evento': '2026-01-01',
                      'evidencia_disponible': false,
                      'leida_en': null,
                    },
                  ],
          ),
          200,
        );
      });
      final service = AvisosResidenteService(
        client: client,
        readToken: () async => 'ficticio',
      );
      await tester.pumpWidget(
        MaterialApp(
          home: PerfilPage(
            isDark: true,
            onToggleTheme: () {},
            cargarPerfil: () => _perfil('inquilino'),
            avisosService: service,
          ),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Avisos'));
      await tester.pumpAndSettle();
      expect(find.text('No tienes avisos nuevos.'), findsOneWidget);
      await tester.pump(const Duration(seconds: 30));
      await tester.pump();
      expect(find.text('Aviso recibido'), findsOneWidget);
      expect(calls, 2);
      await tester.tap(find.text('Inicio'));
      await tester.pumpAndSettle();
      await tester.pump(const Duration(seconds: 30));
      expect(calls, 2);
      await tester.pumpWidget(const SizedBox.shrink());
      client.close();
    },
  );

  testWidgets('oculta alertas previas si el servidor revoca el acceso', (
    tester,
  ) async {
    var calls = 0;
    final client = MockClient((request) async {
      calls++;
      if (calls > 1) return http.Response('', 403);
      return http.Response(
        jsonEncode([
          {
            'id': _nuevo,
            'categoria': 'Alerta privada',
            'descripcion': 'Prueba',
            'estado': 'PENDIENTE_REVISION',
            'fecha_evento': '2026-01-01',
          },
        ]),
        200,
      );
    });
    final service = AlertasSeguridadService(
      client: client,
      readToken: () async => 'ficticio',
    );
    await tester.pumpWidget(
      MaterialApp(
        home: PerfilPage(
          isDark: true,
          onToggleTheme: () {},
          cargarPerfil: () => _perfil('guardia'),
          alertasService: service,
        ),
      ),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.text('Incidencias'));
    await tester.pumpAndSettle();
    expect(find.text('Alerta privada'), findsOneWidget);
    await tester.pump(const Duration(seconds: 30));
    await tester.pump();
    expect(find.text('Alerta privada'), findsNothing);
    expect(find.text('No tienes acceso a esta información.'), findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink());
    client.close();
  });

  testWidgets('rol personalizado no recibe acceso a incidencias ni avisos', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: PerfilPage(
          isDark: true,
          onToggleTheme: () {},
          cargarPerfil: () async => {
            'success': true,
            'data': {
              'id': 1,
              'username': 'prueba',
              'role': 'personalizado',
              'rol_nombre': 'Recepción',
              'capacidades': ['visitas.consultar_operativas'],
            },
          },
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Visitas'), findsOneWidget);
    expect(find.text('Incidencias'), findsNothing);
    expect(find.text('Avisos'), findsNothing);
    expect(find.text('Historial'), findsNothing);
    await tester.tap(find.text('Ajustes'));
    await tester.pumpAndSettle();
    expect(find.text('Cerrar sesión'), findsOneWidget);
    expect(find.text('Cambiar contraseña'), findsNothing);
  });
}
