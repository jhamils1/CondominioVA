import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:smart_condominium/security/device_account_handover.dart';

class MemoryStore implements HandoverStore {
  HandoverState? state;
  bool failWrites = false;
  @override
  Future<HandoverState?> read() async => state;
  @override
  Future<void> write(HandoverState value) async {
    if (failWrites) throw Exception('simulated storage error');
    state = value;
  }
}

class FakePorts implements HandoverPorts {
  HandoverSession? current = const HandoverSession(1, 'a');
  final retired = <String>[];
  final registered = <String>[];
  String? failRetire;
  bool deletionResult = true;
  bool registrationResult = true;
  int deletionCalls = 0;
  void Function()? onRetire;
  void Function()? onDelete;
  void Function()? onRegister;
  Completer<void>? retireWait;
  @override
  Future<HandoverSession?> session() async => current;
  @override
  Future<bool> retire(String token) async {
    retired.add(token);
    if (retireWait != null) await retireWait!.future;
    onRetire?.call();
    return token != failRetire;
  }

  @override
  Future<bool> invalidateIfCurrent(String token) async {
    deletionCalls++;
    onDelete?.call();
    return deletionResult;
  }

  @override
  Future<bool> register(String token) async {
    registered.add(token);
    onRegister?.call();
    return registrationResult;
  }
}

void main() {
  late MemoryStore store;
  late FakePorts ports;
  late DeviceAccountHandover handover;
  setUp(() {
    store = MemoryStore();
    ports = FakePorts();
    handover = DeviceAccountHandover(store, ports);
  });
  Future<HandoverResult> start({bool consent = true}) => handover.start(
    consent: consent,
    ownerId: 1,
    oldTokens: ['old', 'pending'],
    currentToken: 'old',
  );
  Future<void> prepare() async {
    expect(await start(), HandoverResult.success);
    expect(await handover.retireOldTokens(), HandoverResult.success);
    expect(await handover.invalidateOldToken(), HandoverResult.success);
    ports.current = const HandoverSession(2, 'b');
  }

  test('requires explicit consent and the old account', () async {
    expect(await start(consent: false), HandoverResult.blocked);
    ports.current = const HandoverSession(2, 'b');
    expect(await start(), HandoverResult.blocked);
    expect(store.state, isNull);
    expect(ports.retired, isEmpty);
  });
  test('completes only with a different token and account', () async {
    await prepare();
    expect(await handover.registerNewToken('old'), HandoverResult.blocked);
    expect(await handover.registerNewToken('new'), HandoverResult.success);
    expect(store.state!.phase, HandoverPhase.completed);
    expect(ports.registered, ['new']);
  });
  test('partial retirement resumes without repeating confirmed work', () async {
    await start();
    ports.failRetire = 'pending';
    expect(await handover.retireOldTokens(), HandoverResult.blocked);
    expect(store.state!.retired, {'old'});
    expect(await handover.invalidateOldToken(), HandoverResult.blocked);
    ports.failRetire = null;
    handover = DeviceAccountHandover(store, ports);
    expect(await handover.retireOldTokens(), HandoverResult.success);
    expect(ports.retired, ['old', 'pending', 'pending']);
  });
  test(
    'uncertain deletion is never retried or followed by registration',
    () async {
      await start();
      await handover.retireOldTokens();
      ports.deletionResult = false;
      expect(await handover.invalidateOldToken(), HandoverResult.blocked);
      expect(store.state!.phase, HandoverPhase.deletionUncertain);
      expect(await handover.invalidateOldToken(), HandoverResult.blocked);
      ports.current = const HandoverSession(2, 'b');
      expect(await handover.registerNewToken('new'), HandoverResult.blocked);
      expect(ports.deletionCalls, 1);
      expect(ports.registered, isEmpty);
    },
  );
  test(
    'session change during retirement stops subsequent operations',
    () async {
      await start();
      ports.onRetire = () => ports.current = const HandoverSession(2, 'b');
      expect(await handover.retireOldTokens(), HandoverResult.blocked);
      expect(ports.retired, ['old']);
      expect(store.state!.retired, {'old'});
    },
  );
  test('session change during invalidation leaves uncertain state', () async {
    await start();
    await handover.retireOldTokens();
    ports.onDelete = () => ports.current = const HandoverSession(2, 'b');
    expect(await handover.invalidateOldToken(), HandoverResult.blocked);
    expect(store.state!.phase, HandoverPhase.deletionUncertain);
  });
  test(
    'lost deletion response remains blocked across coordinator restart',
    () async {
      await start();
      await handover.retireOldTokens();
      ports.onDelete = () => throw Exception('lost simulated response');
      expect(await handover.invalidateOldToken(), HandoverResult.blocked);
      handover = DeviceAccountHandover(store, ports);
      ports.onDelete = null;
      expect(await handover.invalidateOldToken(), HandoverResult.blocked);
      ports.current = const HandoverSession(2, 'b');
      expect(await handover.registerNewToken('new'), HandoverResult.blocked);
      expect(ports.deletionCalls, 1);
      expect(ports.registered, isEmpty);
      expect(store.state!.phase, HandoverPhase.deletionUncertain);
    },
  );

  test(
    'a different observed token cannot clear an uncertain deletion',
    () async {
      await start();
      await handover.retireOldTokens();
      ports.deletionResult = false;
      await handover.invalidateOldToken();
      // A new candidate on its own is not proof of what Firebase invalidated.
      ports.current = const HandoverSession(2, 'b');
      expect(
        await handover.registerNewToken('observed-new'),
        HandoverResult.blocked,
      );
      expect(store.state!.phase, HandoverPhase.deletionUncertain);
      expect(ports.registered, isEmpty);
    },
  );

  test(
    'returning to the original account does not clear uncertainty',
    () async {
      await start();
      await handover.retireOldTokens();
      ports.deletionResult = false;
      await handover.invalidateOldToken();
      ports.current = const HandoverSession(2, 'b');
      expect(await handover.registerNewToken('new'), HandoverResult.blocked);
      ports.current = const HandoverSession(1, 'new-session-a');
      expect(await handover.invalidateOldToken(), HandoverResult.blocked);
      expect(await start(), HandoverResult.blocked);
      expect(ports.deletionCalls, 1);
      expect(store.state!.phase, HandoverPhase.deletionUncertain);
    },
  );
  test('failed registration can retry only the same user and token', () async {
    await prepare();
    ports.registrationResult = false;
    expect(await handover.registerNewToken('new'), HandoverResult.blocked);
    expect(await handover.registerNewToken('another'), HandoverResult.blocked);
    ports.current = const HandoverSession(3, 'c');
    expect(await handover.registerNewToken('new'), HandoverResult.blocked);
    ports.current = const HandoverSession(2, 'b2');
    ports.registrationResult = true;
    expect(await handover.registerNewToken('new'), HandoverResult.success);
    expect(ports.registered, ['new', 'new']);
  });
  test(
    'session change during registration does not report completion',
    () async {
      await prepare();
      ports.onRegister = () => ports.current = const HandoverSession(3, 'c');
      expect(await handover.registerNewToken('new'), HandoverResult.blocked);
      expect(store.state!.phase, HandoverPhase.registering);
    },
  );
  test('storage failure prevents external deletion', () async {
    await start();
    await handover.retireOldTokens();
    store.failWrites = true;
    expect(await handover.invalidateOldToken(), HandoverResult.blocked);
    expect(ports.deletionCalls, 0);
  });
  test('serializes operations on the coordinator', () async {
    await start();
    ports.retireWait = Completer<void>();
    final first = handover.retireOldTokens();
    await Future<void>.delayed(Duration.zero);
    expect(await handover.retireOldTokens(), HandoverResult.busy);
    ports.retireWait!.complete();
    expect(await first, HandoverResult.success);
  });

  test('serializes multiple coordinators in the same isolate', () async {
    await start();
    ports.retireWait = Completer<void>();
    final first = handover.retireOldTokens();
    await Future<void>.delayed(Duration.zero);
    final second = DeviceAccountHandover(store, ports);
    expect(await second.retireOldTokens(), HandoverResult.busy);
    ports.retireWait!.complete();
    expect(await first, HandoverResult.success);
  });
}
