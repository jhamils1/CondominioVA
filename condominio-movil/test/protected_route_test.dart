import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smart_condominium/security/protected_route.dart';

Future<Map<String, dynamic>> user(String role) async => {
  'success': true,
  'data': {'id': 3, 'username': 'cuenta_prueba', 'role': role},
};

void main() {
  for (final role in ['guardia', 'administrador', 'propietario', 'inquilino']) {
    testWidgets('la ruta de alertas aplica el permiso de $role', (tester) async {
      await tester.pumpWidget(MaterialApp(home: ProtectedRoute(
        route: '/alertas-seguridad', verificar: () => user(role),
        child: const Text('Bandeja protegida'),
      )));
      await tester.pumpAndSettle();
      expect(find.text('Bandeja protegida'),
          role == 'guardia' || role == 'administrador' ? findsOneWidget : findsNothing);
    });
  }
  testWidgets('permite al guardia abrir reconocimiento', (tester) async {
    await tester.pumpWidget(MaterialApp(home: ProtectedRoute(
      route: '/reconocimiento-facial',
      verificar: () => user('guardia'),
      child: const Text('Pantalla autorizada'),
    )));
    await tester.pumpAndSettle();
    expect(find.text('Pantalla autorizada'), findsOneWidget);
  });

  testWidgets('deniega ruta de seguridad al propietario', (tester) async {
    await tester.pumpWidget(MaterialApp(home: ProtectedRoute(
      route: '/reconocimiento-facial',
      verificar: () => user('propietario'),
      child: const Text('Pantalla restringida'),
    )));
    await tester.pumpAndSettle();
    expect(find.text('Pantalla restringida'), findsNothing);
    expect(find.text('No tienes permiso para acceder a esta pantalla.'), findsOneWidget);
  });

  testWidgets('cierra la ruta si el perfil falla y permite reintentar', (tester) async {
    var calls = 0;
    Future<Map<String, dynamic>> verify() async {
      calls++;
      if (calls == 1) return {'success': false, 'message': 'Sin conexión'};
      return await user('guardia');
    }
    await tester.pumpWidget(MaterialApp(home: ProtectedRoute(
      route: '/reconocimiento-facial', verificar: verify,
      child: const Text('Pantalla autorizada'),
    )));
    await tester.pumpAndSettle();
    expect(find.text('Sin conexión'), findsOneWidget);
    expect(find.text('Pantalla autorizada'), findsNothing);
    await tester.tap(find.text('Reintentar'));
    await tester.pumpAndSettle();
    expect(find.text('Pantalla autorizada'), findsOneWidget);
  });

  testWidgets('cierra la ruta con una respuesta de rol desconocido', (tester) async {
    await tester.pumpWidget(MaterialApp(home: ProtectedRoute(
      route: '/perfil', verificar: () => user('otro'),
      child: const Text('Pantalla restringida'),
    )));
    await tester.pumpAndSettle();
    expect(find.text('Pantalla restringida'), findsNothing);
    expect(find.text('No tienes permiso para acceder a esta pantalla.'), findsOneWidget);
  });
}
