import 'dart:async';
import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:smart_condominium/security/security_notification_navigation.dart';

const valid = {'tipo': 'seguridad',
  'notificacion_id': '11111111-1111-4111-8111-111111111111',
  'evento_id': '22222222-2222-4222-8222-222222222222'};

Future<Map<String, dynamic>> profile(String role) async => {
  'success': true, 'data': {'id': 1, 'username': 'prueba', 'role': role},
};

Future<void> flush() => Future<void>.delayed(Duration.zero);

void main() {
  test('valida únicamente mensajes de seguridad y descarta rutas arbitrarias', () {
    expect(esAvisoSeguridad(valid), true);
    expect(esAvisoSeguridad({...valid, 'tipo': 'otra'}), false);
    expect(esAvisoSeguridad({...valid, 'evento_id': '../usuarios'}), false);
    expect(esAvisoSeguridad({'screen': '/usuarios'}), false);
    expect(jsonDecode(payloadAvisoSeguridad({...valid, 'screen': '/usuarios'})!), valid);
    expect(payloadAvisoSeguridad({'screen': '/usuarios'}), isNull);
  });

  test('un toque recibido antes de iniciar la interfaz abre la bandeja del guardia', () async {
    var opened = 0;
    final navigation = SecurityNotificationNavigation(verificar: () => profile('guardia'));
    navigation.recibir(valid);
    await flush();
    navigation.attach(() { opened++; return true; });
    await flush();
    expect(opened, 1);
  });

  test('el payload de notificación local abre la bandeja del administrador', () async {
    var opened = 0;
    final navigation = SecurityNotificationNavigation(verificar: () => profile('administrador'));
    navigation.attach(() { opened++; return true; });
    navigation.recibirPayload(payloadAvisoSeguridad(valid));
    await flush();
    expect(opened, 1);
    navigation.recibirPayload('{invalido');
    await flush();
    expect(opened, 1);
  });

  for (final role in ['propietario', 'inquilino', 'desconocido']) {
    test('no abre alertas para $role', () async {
      var opened = 0;
      final navigation = SecurityNotificationNavigation(verificar: () => profile(role));
      navigation.attach(() { opened++; return true; });
      navigation.recibir(valid);
      await flush();
      expect(opened, 0);
    });
  }

  test('sin sesión espera y vuelve a verificar después del inicio de sesión', () async {
    var authorized = false;
    var opened = 0;
    final navigation = SecurityNotificationNavigation(verificar: () async => authorized
        ? await profile('guardia') : {'success': false, 'message': 'Sin sesión'});
    navigation.attach(() { opened++; return true; });
    navigation.recibir(valid);
    await flush();
    expect(opened, 0);
    authorized = true;
    await navigation.procesar();
    expect(opened, 1);
    await navigation.procesar();
    expect(opened, 1);
  });

  test('reintenta si el inicio de sesión ocurre durante una verificación pendiente', () async {
    final first = Completer<Map<String, dynamic>>();
    var checks = 0;
    var opened = 0;
    final navigation = SecurityNotificationNavigation(verificar: () {
      checks++;
      return checks == 1 ? first.future : profile('guardia');
    });
    navigation.attach(() { opened++; return true; });
    navigation.recibir(valid);
    await navigation.procesar();
    first.complete({'success': false});
    await flush();
    await flush();
    expect(opened, 1);
    expect(checks, 2);
  });
}
