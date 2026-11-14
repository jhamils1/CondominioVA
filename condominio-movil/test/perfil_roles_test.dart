import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smart_condominium/pages/perfil_page.dart';

Future<Map<String, dynamic>> profile(String role) async => {
  'success': true,
  'data': {'id': 12, 'username': 'usuario_prueba', 'role': role},
};

void main() {
  Future<void> showMenu(WidgetTester tester, String role) async {
    await tester.pumpWidget(MaterialApp(home: PerfilPage(
      isDark: false, onToggleTheme: () {}, cargarPerfil: () => profile(role),
    )));
    await tester.pumpAndSettle();
    expect(find.text('Bienvenido usuario_prueba 🎉'), findsOneWidget);
    await tester.tap(find.text('Ajustes'));
    await tester.pumpAndSettle();
  }

  testWidgets('propietario ve expensas y no ve reconocimiento ni dashboard', (tester) async {
    await showMenu(tester, 'propietario');
    expect(find.text('Mis Expensas'), findsOneWidget);
    expect(find.text('Reconocimiento Facial'), findsNothing);
    expect(find.text('Dashboard Financiero'), findsNothing);
    expect(find.text('Alertas de seguridad'), findsNothing);
  });

  testWidgets('guardia no ve expensas ni dashboard y sí reconocimiento', (tester) async {
    await showMenu(tester, 'guardia');
    expect(find.text('Mis Expensas'), findsNothing);
    expect(find.text('Dashboard Financiero'), findsNothing);
    expect(find.text('Reconocimiento Facial'), findsOneWidget);
    expect(find.text('Alertas de seguridad'), findsOneWidget);
  });

  testWidgets('inquilino no ve expensas ni funciones de seguridad', (tester) async {
    await showMenu(tester, 'inquilino');
    expect(find.text('Mis Expensas'), findsNothing);
    expect(find.text('Reconocimiento Facial'), findsNothing);
    expect(find.text('Alertas de seguridad'), findsNothing);
    await tester.drag(find.descendant(of: find.byType(Drawer), matching: find.byType(ListView)), const Offset(0, -250));
    await tester.pumpAndSettle();
    expect(find.text('Áreas Comunes'), findsOneWidget);
  });

  testWidgets('rol personalizado ve visitas solo cuando tiene capacidad', (tester) async {
    Future<Map<String, dynamic>> custom() async => {'success': true, 'data': {
      'id': 12, 'username': 'usuario_prueba', 'role': 'personalizado',
      'rol_nombre': 'Recepción', 'capacidades': ['visitas.consultar_operativas'],
    }};
    await tester.pumpWidget(MaterialApp(home: PerfilPage(
      isDark: false, onToggleTheme: () {}, cargarPerfil: custom,
    )));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Ajustes'));
    await tester.pumpAndSettle();
    expect(find.text('Visitas pendientes y activas'), findsOneWidget);
    expect(find.text('Alertas de seguridad'), findsNothing);
    expect(find.text('Mis Expensas'), findsNothing);
    expect(find.text('Editar Perfil'), findsNothing);
  });

  testWidgets('administrador ve el dashboard financiero', (tester) async {
    await showMenu(tester, 'administrador');
    await tester.drag(find.descendant(of: find.byType(Drawer), matching: find.byType(ListView)), const Offset(0, -500));
    await tester.pumpAndSettle();
    expect(find.text('Dashboard Financiero'), findsOneWidget);
  });

  testWidgets('los accesos rápidos respetan el rol y abren la ruta autorizada', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: PerfilPage(isDark: true, onToggleTheme: () {}, cargarPerfil: () => profile('propietario')),
      routes: {'/avisos-residente': (_) => const Scaffold(body: Text('Bandeja de prueba'))},
    ));
    await tester.pumpAndSettle();
    expect(find.text('Revisar avisos'), findsOneWidget);
    expect(find.text('Revisar alertas'), findsNothing);
    await tester.tap(find.text('Revisar avisos'));
    await tester.pumpAndSettle();
    expect(find.text('Bandeja de prueba'), findsOneWidget);
  });

  testWidgets('un error del perfil oculta las opciones restringidas', (tester) async {
    await tester.pumpWidget(MaterialApp(home: PerfilPage(
      isDark: false, onToggleTheme: () {},
      cargarPerfil: () async => {'success': false, 'message': 'Sin conexión'},
    )));
    await tester.pumpAndSettle();
    expect(find.text('Error: Sin conexión'), findsOneWidget);
    expect(find.text('Ajustes'), findsNothing);
    expect(find.text('Mis Expensas'), findsNothing);
    expect(find.text('Dashboard Financiero'), findsNothing);
    expect(find.text('Reconocimiento Facial'), findsNothing);
  });

  testWidgets('al abrir el menú actualiza el rol desde el servidor', (tester) async {
    var calls = 0;
    Future<Map<String, dynamic>> load() async {
      calls++;
      return await profile(calls == 1 ? 'propietario' : 'guardia');
    }
    await tester.pumpWidget(MaterialApp(home: PerfilPage(
      isDark: false, onToggleTheme: () {}, cargarPerfil: load,
    )));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Ajustes'));
    await tester.pumpAndSettle();
    expect(find.text('Mis Expensas'), findsNothing);
    expect(find.text('Reconocimiento Facial'), findsOneWidget);
    expect(calls, greaterThanOrEqualTo(2));
  });
}
