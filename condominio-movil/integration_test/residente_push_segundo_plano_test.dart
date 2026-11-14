import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:smart_condominium/main.dart' as app;
import 'package:smart_condominium/config/app_environment.dart';
import 'package:smart_condominium/services/auth_service.dart';
import 'residente_push_real_test.dart' as soporte;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('aviso FCM en segundo plano y apertura desde Android', (tester) async {
    expect(AppEnvironment.pushTest, isTrue);
    app.main();
    await soporte.waitFor(tester, find.text('Ingresar'));
    await tester.enterText(find.byType(TextFormField).at(0), 'residente_prueba');
    await tester.enterText(find.byType(TextFormField).at(1), 'PruebaTemporal2026');
    FocusManager.instance.primaryFocus?.unfocus();
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Ingresar'));
    await tester.tap(find.text('Ingresar'));
    await soporte.waitFor(tester, find.text('Rol: Propietario'));
    final access = await AuthService.getAccessToken();
    expect(access, isNotNull);
    final ready = await tester.runAsync(() async {
      for (var n = 0; n < 45; n++) {
        if ((await soporte.request('GET', 'prueba-residente/', access: access))['listo'] == true) return true;
        await Future<void>.delayed(const Duration(seconds: 1));
      }
      return false;
    });
    expect(ready, isTrue, reason: 'No se registro el dispositivo de prueba.');
    debugPrint('PRUEBA_SEGUNDO_PLANO_LISTA');
    final sent = await tester.runAsync(() async {
      await Future<void>.delayed(const Duration(seconds: 25));
      return soporte.request('POST', 'prueba-residente/', access: access);
    });
    expect(sent['estado'], 'ENVIADA');
    debugPrint('PRUEBA_SEGUNDO_PLANO_ENVIADA');
    await soporte.waitFor(tester, find.text('Mis avisos'));
    await soporte.waitFor(tester, find.text('Estacionamiento de prueba'));
    await tester.tap(find.text('Estacionamiento de prueba'));
    await soporte.waitFor(tester, find.text('Volver a mis avisos'));
    await soporte.waitFor(tester, find.byType(Image));
  }, timeout: const Timeout(Duration(minutes: 4)));
}
