import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:smart_condominium/services/fcm_startup.dart';

void main() {
  test('aviso se procesa mientras permiso y red siguen pendientes', () async {
    final startup = FcmStartup();
    final permission = Completer<void>();
    final network = Completer<void>();
    final messages = StreamController<int>.broadcast(sync: true);
    final received = <int>[];
    var refreshInstalled = false;
    final future = startup.start(
      initializeLocal: () async {},
      installMessageHandlers: () => messages.stream.listen(received.add),
      installTokenRefresh: () { refreshInstalled = true; },
      requestPermission: () => permission.future,
      obtainAndRegister: () => network.future,
      onError: (error) => fail('Error inesperado'),
    );
    await Future<void>.delayed(Duration.zero);
    expect(refreshInstalled, true);
    messages.add(1);
    expect(received, [1]);
    permission.complete();
    await Future<void>.delayed(Duration.zero);
    messages.add(2);
    expect(received, [1, 2]);
    network.complete();
    await future;
    await messages.close();
  });

  test('error del permiso conserva manejadores y no registra', () async {
    final startup = FcmStartup();
    var handlers = 0;
    var registered = 0;
    var errors = 0;
    await startup.start(
      initializeLocal: () async {},
      installMessageHandlers: () { handlers++; },
      installTokenRefresh: () {},
      requestPermission: () async { throw StateError('ficticio'); },
      obtainAndRegister: () async { registered++; },
      onError: (_) { errors++; },
    );
    expect(handlers, 1);
    expect(registered, 0);
    expect(errors, 1);
  });

  test('llamadas repetidas no instalan escuchas duplicadas', () async {
    final startup = FcmStartup();
    final pending = Completer<void>();
    var handlers = 0;
    Future<void> start() => startup.start(
      initializeLocal: () async {},
      installMessageHandlers: () { handlers++; },
      installTokenRefresh: () {},
      requestPermission: () => pending.future,
      obtainAndRegister: () async {},
      onError: (_) => fail('Error inesperado'),
    );
    final first = start();
    final second = start();
    await Future<void>.delayed(Duration.zero);
    expect(handlers, 1);
    pending.complete();
    await Future.wait([first, second]);
    await start();
    expect(handlers, 1);
  });

  test('la inicialización local termina antes de instalar manejadores', () async {
    final startup = FcmStartup();
    final local = Completer<void>();
    var handlers = 0;
    final operation = startup.start(
      initializeLocal: () => local.future,
      installMessageHandlers: () { handlers++; },
      installTokenRefresh: () {},
      requestPermission: () async {},
      obtainAndRegister: () async {},
      onError: (_) => fail('Error inesperado'),
    );
    expect(handlers, 0);
    local.complete();
    await operation;
    expect(handlers, 1);
  });

  test('reintento tras fallo no duplica manejadores', () async {
    final startup = FcmStartup();
    var handlers = 0;
    var refresh = 0;
    var attempts = 0;
    var registered = 0;
    var errors = 0;
    Future<void> start() => startup.start(
      initializeLocal: () async {},
      installMessageHandlers: () { handlers++; },
      installTokenRefresh: () { refresh++; },
      requestPermission: () async {
        attempts++;
        if (attempts == 1) throw StateError('permiso ficticio');
      },
      obtainAndRegister: () async { registered++; },
      onError: (_) { errors++; },
    );
    await start();
    await start();
    expect(errors, 1);
    expect(attempts, 2);
    expect(handlers, 1);
    expect(refresh, 1);
    expect(registered, 1);
  });
}
