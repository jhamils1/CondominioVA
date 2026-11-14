import 'package:flutter_test/flutter_test.dart';
import 'package:smart_condominium/security/resident_notification_navigation.dart';

const aviso = {'tipo': 'aviso_residente', 'notificacion_id': '11111111-1111-4111-8111-111111111111'};
Future<void> flush() => Future<void>.delayed(Duration.zero);

void main() {
  test('solo acepta aviso con identificador valido', () {
    expect(esAvisoResidente(aviso), isTrue);
    expect(esAvisoResidente({'tipo': 'aviso_residente', 'notificacion_id': '../otros'}), isFalse);
    expect(esAvisoResidente({'tipo': 'seguridad', 'notificacion_id': aviso['notificacion_id']}), isFalse);
  });
  for (final rol in ['propietario', 'inquilino', 'guardia', 'administrador']) {
    test('apertura por rol $rol', () async {
      var abiertos = 0;
      final nav = ResidentNotificationNavigation(verificar: () async => {'success': true, 'data': {'id': 1, 'username': 'ficticio', 'role': rol}});
      nav.attach(() { abiertos++; return true; });
      nav.recibir(aviso);
      await flush();
      expect(abiertos, rol == 'propietario' || rol == 'inquilino' ? 1 : 0);
    });
  }
}
