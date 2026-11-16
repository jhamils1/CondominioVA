import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/pages/perfil_page.dart';
import 'package:smart_condominium/pages/incidencias_seguridad_page.dart';
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
  testWidgets('deslizar actualiza incidencias incluso con lista vacía', (tester) async {
    var consultas = 0;
    final client = MockClient((request) async {
      consultas++;
      return http.Response(jsonEncode(consultas == 1 ? [] : [{
        'id': _evento, 'categoria': 'Nueva incidencia', 'descripcion': 'Prueba',
        'estado': 'PENDIENTE_REVISION', 'fecha_evento': '2026-01-01',
      }]), 200);
    });
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: IncidenciasSeguridadPage(service: service))));
    await tester.pumpAndSettle();
    expect(find.text('No hay incidencias pendientes de revisión.'), findsOneWidget);
    await tester.drag(find.byType(ListView), const Offset(0, 350));
    await tester.pumpAndSettle();
    expect(consultas, 2);
    expect(find.text('Nueva incidencia'), findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink());
    client.close();
  });

  testWidgets('guardia confirma una incidencia y la ve en historial', (tester) async {
    var estado = 'PENDIENTE_REVISION';
    var confirmaciones = 0;
    Map<String, dynamic> evento() => {'id': _evento, 'categoria': 'Evento ficticio',
      'descripcion': 'Revisar imagen', 'estado': estado, 'fecha_evento': '2026-01-01'};
    final client = MockClient((request) async {
      if (request.url.path.endsWith('/confirmar/')) { confirmaciones++; estado = 'CONFIRMADA'; return http.Response(jsonEncode(evento()), 200); }
      if (request.url.path.endsWith('/$_evento/')) return http.Response(jsonEncode(evento()), 200);
      return http.Response(jsonEncode([evento()]), 200);
    });
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: PerfilPage(isDark: true, onToggleTheme: () {},
      cargarPerfil: () => _perfil('guardia'), alertasService: service)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Incidencias')); await tester.pumpAndSettle();
    await tester.tap(find.text('Evento ficticio')); await tester.pumpAndSettle();
    await tester.tap(find.text('Confirmar incidencia')); await tester.pumpAndSettle();
    await tester.tap(find.text('Cancelar')); await tester.pumpAndSettle();
    expect(confirmaciones, 0);
    await tester.tap(find.text('Confirmar incidencia')); await tester.pumpAndSettle();
    await tester.tap(find.text('Confirmar')); await tester.pumpAndSettle();
    expect(confirmaciones, 1);
    expect(find.text('Historial de incidencias'), findsOneWidget);
    expect(find.text('Evento ficticio'), findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink()); client.close();
  });

  testWidgets('administrador puede confirmar desde el móvil', (tester) async {
    final client = MockClient((request) async => http.Response(jsonEncode(request.url.path.endsWith('/$_evento/')
      ? {'id': _evento, 'categoria': 'Evento ficticio', 'descripcion': 'Prueba', 'estado': 'PENDIENTE_REVISION', 'fecha_evento': '2026-01-01'}
      : [{'id': _evento, 'categoria': 'Evento ficticio', 'descripcion': 'Prueba', 'estado': 'PENDIENTE_REVISION', 'fecha_evento': '2026-01-01'}]), 200));
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: PerfilPage(isDark: true, onToggleTheme: () {}, cargarPerfil: () => _perfil('administrador'), alertasService: service)));
    await tester.pumpAndSettle(); await tester.tap(find.text('Incidencias')); await tester.pumpAndSettle();
    await tester.tap(find.text('Evento ficticio')); await tester.pumpAndSettle();
    expect(find.text('Confirmar incidencia'), findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink()); client.close();
  });

  testWidgets('historial conserva orden de llegada al confirmar un evento anterior', (tester) async {
    var estadoAnterior = 'PENDIENTE_REVISION';
    Map<String, dynamic> evento(String id, String categoria, String estado) => {
      'id': id, 'categoria': categoria, 'descripcion': 'Prueba',
      'estado': estado, 'fecha_evento': '2026-01-01',
    };
    final client = MockClient((request) async {
      if (request.url.path.endsWith('/confirmar/')) {
        estadoAnterior = 'CONFIRMADA';
        return http.Response(jsonEncode(evento(_evento, 'Evento anterior', estadoAnterior)), 200);
      }
      if (request.url.path.endsWith('/$_evento/')) {
        return http.Response(jsonEncode(evento(_evento, 'Evento anterior', estadoAnterior)), 200);
      }
      // La API entrega los eventos por fecha de recepción descendente.
      return http.Response(jsonEncode([
        evento(_leido, 'Evento posterior', 'CONFIRMADA'),
        evento(_evento, 'Evento anterior', estadoAnterior),
      ]), 200);
    });
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: PerfilPage(isDark: true, onToggleTheme: () {},
      cargarPerfil: () => _perfil('guardia'), alertasService: service)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Incidencias')); await tester.pumpAndSettle();
    await tester.longPress(find.text('Evento anterior')); await tester.pumpAndSettle();
    expect(find.text('Eliminar del historial'), findsNothing);
    await tester.tap(find.text('Evento anterior')); await tester.pumpAndSettle();
    await tester.tap(find.text('Confirmar incidencia')); await tester.pumpAndSettle();
    await tester.tap(find.text('Confirmar')); await tester.pumpAndSettle();
    expect(tester.getTopLeft(find.text('Evento posterior')).dy, lessThan(tester.getTopLeft(find.text('Evento anterior')).dy));
    expect(find.text('Descartadas'), findsNothing);
    await tester.pumpWidget(const SizedBox.shrink()); client.close();
  });

  testWidgets('si la confirmación falla no se afirma que pasó al historial', (tester) async {
    final evento = {'id': _evento, 'categoria': 'Evento ficticio', 'descripcion': 'Prueba',
      'estado': 'PENDIENTE_REVISION', 'fecha_evento': '2026-01-01'};
    final client = MockClient((request) async {
      if (request.url.path.endsWith('/confirmar/')) return http.Response('{}', 400);
      return http.Response(jsonEncode(request.url.path.endsWith('/$_evento/') ? evento : [evento]), 200);
    });
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: PerfilPage(isDark: true, onToggleTheme: () {}, cargarPerfil: () => _perfil('guardia'), alertasService: service)));
    await tester.pumpAndSettle(); await tester.tap(find.text('Incidencias')); await tester.pumpAndSettle();
    await tester.tap(find.text('Evento ficticio')); await tester.pumpAndSettle();
    await tester.tap(find.text('Confirmar incidencia')); await tester.pumpAndSettle();
    await tester.tap(find.text('Confirmar')); await tester.pumpAndSettle();
    expect(find.text('Historial de incidencias'), findsNothing);
    expect(find.text('Actualizar detalle'), findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink()); client.close();
  });
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
        return http.Response(jsonEncode(evento(_evento, 'Evento activo', 'PENDIENTE_REVISION')), 200);
      }
      return http.Response(jsonEncode([
        evento(_evento, 'Evento activo', 'PENDIENTE_REVISION'),
        evento(_leido, 'Evento resuelto', 'RESUELTA'),
        evento(_nuevo, 'Evento descartado', 'FALSO_POSITIVO'),
        evento('44444444-4444-4444-8444-444444444444', 'Evento confirmado', 'CONFIRMADA'),
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
    expect(find.text('Evento confirmado'), findsOneWidget);
    expect(find.text('Evento descartado'), findsNothing);
    expect(find.text('Descartadas'), findsNothing);
    await tester.pumpWidget(const SizedBox.shrink());
    client.close();
  });

  testWidgets('mantener pulsado permite retirar una incidencia confirmada', (tester) async {
    var retirada = false;
    var peticiones = 0;
    final evento = {'id': _evento, 'categoria': 'Incidencia revisada', 'descripcion': 'Prueba',
      'estado': 'CONFIRMADA', 'fecha_evento': '2026-01-01'};
    final client = MockClient((request) async {
      if (request.url.path.endsWith('/retirar-historial/')) {
        peticiones++;
        retirada = true;
        return http.Response('{}', 200);
      }
      return http.Response(jsonEncode(retirada ? [] : [evento]), 200);
    });
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: PerfilPage(isDark: true, onToggleTheme: () {},
      cargarPerfil: () => _perfil('guardia'), alertasService: service)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Historial')); await tester.pumpAndSettle();
    await tester.longPress(find.text('Incidencia revisada')); await tester.pumpAndSettle();
    await tester.tap(find.text('Eliminar del historial')); await tester.pumpAndSettle();
    await tester.tap(find.text('Cancelar')); await tester.pumpAndSettle();
    expect(peticiones, 0);
    await tester.longPress(find.text('Incidencia revisada')); await tester.pumpAndSettle();
    await tester.tap(find.text('Eliminar del historial')); await tester.pumpAndSettle();
    await tester.tap(find.text('Retirar')); await tester.pumpAndSettle();
    expect(peticiones, 1);
    expect(find.text('Incidencia revisada'), findsNothing);
    await tester.pumpWidget(const SizedBox.shrink()); client.close();
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
