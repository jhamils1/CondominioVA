import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:smart_condominium/security/device_account_handover.dart';
import 'package:smart_condominium/security/handover_secure_store.dart';

class RecoveryPorts implements HandoverPorts {
  int invalidations = 0;
  int registrations = 0;
  HandoverSession current = const HandoverSession(1, 'a');
  @override
  Future<HandoverSession?> session() async => current;
  @override
  Future<bool> retire(String token) async => true;
  @override
  Future<bool> invalidateIfCurrent(String token) async {
    invalidations++;
    return false;
  }

  @override
  Future<bool> register(String token) async {
    registrations++;
    return true;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUp(() => FlutterSecureStorage.setMockInitialValues({}));

  test('a new store instance restores the pending state', () async {
    final first = HandoverSecureStore();
    await first.write(
      HandoverState(
        ownerId: 1,
        oldTokens: ['fake-old', 'fake-pending'],
        currentToken: 'fake-old',
        retired: {'fake-old'},
        phase: HandoverPhase.retiring,
      ),
    );
    final recovered = await HandoverSecureStore().read();
    expect(recovered!.retired, {'fake-old'});
    expect(recovered.phase, HandoverPhase.retiring);
    expect(recovered.oldTokens, ['fake-old', 'fake-pending']);
  });

  test('uncertain deletion survives re-instantiation', () async {
    await HandoverSecureStore().write(
      HandoverState(
        ownerId: 1,
        oldTokens: ['fake'],
        currentToken: 'fake',
        retired: {'fake'},
        phase: HandoverPhase.deletionUncertain,
      ),
    );
    expect(
      (await HandoverSecureStore().read())!.phase,
      HandoverPhase.deletionUncertain,
    );
  });

  test('corrupted state blocks instead of being treated as absent', () async {
    FlutterSecureStorage.setMockInitialValues({
      'device_handover_v1': '{broken',
    });
    expect(HandoverSecureStore().read(), throwsFormatException);
  });

  test(
    'invalid or premature state cannot overwrite confirmed progress',
    () async {
      final store = HandoverSecureStore();
      await store.write(
        HandoverState(
          ownerId: 1,
          oldTokens: ['fake'],
          currentToken: 'fake',
          phase: HandoverPhase.retiring,
        ),
      );
      await expectLater(
        store.write(
          HandoverState(
            ownerId: 1,
            oldTokens: ['fake'],
            currentToken: 'fake',
            phase: HandoverPhase.ready,
          ),
        ),
        throwsFormatException,
      );
      expect((await store.read())!.phase, HandoverPhase.retiring);
    },
  );

  test(
    'uncertain deletion stays blocked after simulated storage reload',
    () async {
      final ports = RecoveryPorts();
      final first = DeviceAccountHandover(HandoverSecureStore(), ports);
      expect(
        await first.start(
          consent: true,
          ownerId: 1,
          oldTokens: ['fake'],
          currentToken: 'fake',
        ),
        HandoverResult.success,
      );
      expect(await first.retireOldTokens(), HandoverResult.success);
      expect(await first.invalidateOldToken(), HandoverResult.blocked);
      final recovered = DeviceAccountHandover(HandoverSecureStore(), ports);
      expect(await recovered.invalidateOldToken(), HandoverResult.blocked);
      ports.current = const HandoverSession(2, 'b');
      expect(
        await recovered.registerNewToken('different'),
        HandoverResult.blocked,
      );
      expect(ports.invalidations, 1);
      expect(ports.registrations, 0);
      expect(
        (await HandoverSecureStore().read())!.phase,
        HandoverPhase.deletionUncertain,
      );
    },
  );
}
