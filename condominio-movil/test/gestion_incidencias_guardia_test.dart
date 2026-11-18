import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:smart_condominium/pages/incidencias_seguridad_page.dart';
import 'package:smart_condominium/services/alertas_seguridad_service.dart';

const id = '12345678-1234-1234-1234-123456789abc';

void main() {
  test('no acepta respuesta no confirmada ni permiso denegado', () async {
    var llamadas = 0;
    final client = MockClient((request) async {
      llamadas++;
      return llamadas == 1 ? http.Response('{}', 403) : http.Response('{}', 200);
    });
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await expectLater(service.gestionarEvento(id, 'resolver', observacion: 'Revisado'),
      throwsA(isA<AlertasException>().having((e) => e.mensaje, 'mensaje', 'No tienes acceso a esta información.')));
    await expectLater(service.gestionarEvento(id, 'resolver', observacion: 'Revisado'),
      throwsA(isA<AlertasException>().having((e) => e.mensaje, 'mensaje', contains('No se pudo comprobar'))));
    client.close();
  });

  testWidgets('guardia atiende, registra actuación y resuelve con observación', (tester) async {
    var estado = 'CONFIRMADA';
    final acciones = <String>[];
    Map<String, dynamic> evento() => {'id': id, 'categoria': 'Caso ficticio', 'descripcion': 'Revision', 'estado': estado, 'fecha_evento': '2020-01-01'};
    final client = MockClient((request) async {
      if (request.method == 'POST') {
        final accion = request.url.pathSegments[request.url.pathSegments.length - 2];
        final datos = jsonDecode(request.body) as Map<String, dynamic>;
        if (accion != 'atender') expect(datos['observacion'], isNotEmpty);
        acciones.add(accion);
        estado = accion == 'resolver' ? 'RESUELTA' : 'EN_ATENCION';
        return http.Response(jsonEncode(evento()), 200);
      }
      return http.Response(jsonEncode(request.url.path.endsWith('/$id/') ? evento() : [evento()]), 200);
    });
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: IncidenciasSeguridadPage(historial: true, puedeAtender: true, service: service))));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Caso ficticio')); await tester.pumpAndSettle();
    await tester.tap(find.text('Iniciar atención')); await tester.pumpAndSettle();
    await tester.tap(find.widgetWithText(FilledButton, 'Iniciar atención').last); await tester.pumpAndSettle();
    expect(acciones, ['atender']);
    expect(find.text('Estado: En atención'), findsOneWidget);
    await tester.tap(find.text('Registrar actuación')); await tester.pumpAndSettle();
    expect(tester.widget<FilledButton>(find.widgetWithText(FilledButton, 'Registrar actuación').last).onPressed, isNull);
    await tester.enterText(find.byType(TextField), 'Revisión realizada'); await tester.pump();
    await tester.tap(find.widgetWithText(FilledButton, 'Registrar actuación').last); await tester.pumpAndSettle();
    await tester.tap(find.text('Resolver incidencia')); await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'Atención finalizada'); await tester.pump();
    await tester.tap(find.widgetWithText(FilledButton, 'Resolver incidencia')); await tester.pumpAndSettle();
    expect(find.text('Estado: Resuelta'), findsOneWidget);
    expect(acciones, ['atender', 'actuaciones', 'resolver']);
    await tester.pumpWidget(const SizedBox.shrink()); client.close();
  });

  testWidgets('descarte requiere motivo y se envía al servidor', (tester) async {
    var estado = 'PENDIENTE_REVISION';
    String? motivo;
    Map<String, dynamic> evento() => {'id': id, 'categoria': 'Caso ficticio', 'descripcion': 'Revision', 'estado': estado, 'fecha_evento': '2020-01-01'};
    final client = MockClient((request) async {
      if (request.url.path.endsWith('/descartar/')) {
        motivo = (jsonDecode(request.body) as Map<String, dynamic>)['motivo'] as String;
        estado = 'FALSO_POSITIVO';
        return http.Response(jsonEncode(evento()), 200);
      }
      return http.Response(jsonEncode(request.url.path.endsWith('/$id/') ? evento() : [evento()]), 200);
    });
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: IncidenciasSeguridadPage(puedeConfirmar: true, puedeAtender: true, service: service))));
    await tester.pumpAndSettle(); await tester.tap(find.text('Caso ficticio')); await tester.pumpAndSettle();
    await tester.tap(find.text('Descartar incidencia')); await tester.pumpAndSettle();
    expect(tester.widget<FilledButton>(find.widgetWithText(FilledButton, 'Descartar incidencia')).onPressed, isNull);
    await tester.enterText(find.byType(TextField), 'No corresponde'); await tester.pump();
    await tester.tap(find.widgetWithText(FilledButton, 'Descartar incidencia')); await tester.pumpAndSettle();
    expect(motivo, 'No corresponde');
    expect(find.text('No hay incidencias pendientes de revisión.'), findsOneWidget);
    await tester.pumpWidget(const SizedBox.shrink()); client.close();
  });

  testWidgets('administrador no ve acciones exclusivas del guardia', (tester) async {
    final evento = {'id': id, 'categoria': 'Caso ficticio', 'descripcion': 'Revisión', 'estado': 'CONFIRMADA', 'fecha_evento': '2020-01-01'};
    final client = MockClient((request) async => http.Response(jsonEncode(request.url.path.endsWith('/$id/') ? evento : [evento]), 200));
    final service = AlertasSeguridadService(client: client, readToken: () async => 'ficticio');
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: IncidenciasSeguridadPage(historial: true, service: service))));
    await tester.pumpAndSettle(); await tester.tap(find.text('Caso ficticio')); await tester.pumpAndSettle();
    expect(find.text('Iniciar atención'), findsNothing);
    await tester.pumpWidget(const SizedBox.shrink()); client.close();
  });
}
