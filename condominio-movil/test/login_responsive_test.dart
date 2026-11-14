import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smart_condominium/pages/login_page.dart';
import 'package:smart_condominium/theme/app_theme.dart';

void main() {
  for (final brightness in [Brightness.dark, Brightness.light]) {
    testWidgets('acceso usable en pantalla pequeña: $brightness', (
      tester,
    ) async {
      await tester.binding.setSurfaceSize(const Size(320, 550));
      addTearDown(() => tester.binding.setSurfaceSize(null));
      await tester.pumpWidget(
        MaterialApp(
          theme: AppTheme.build(brightness),
          home: MediaQuery(
            data: const MediaQueryData(
              size: Size(320, 550),
              textScaler: TextScaler.linear(1.25),
            ),
            child: LoginPage(
              onToggleTheme: () {},
              isDark: brightness == Brightness.dark,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Usuario'), findsOneWidget);
      await tester.ensureVisible(find.text('Ingresar'));
      await tester.pumpAndSettle();
      expect(find.text('Ingresar'), findsOneWidget);
      await tester.tap(find.text('Ingresar'));
      await tester.pumpAndSettle();
      expect(find.text('Ingrese su usuario'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  }
}
