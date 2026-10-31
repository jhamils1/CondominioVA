// Simulated coordination only. Production adapters and UI are deliberately absent.
enum HandoverPhase {
  retiring,
  awaitingDeletion,
  deletionUncertain,
  ready,
  registering,
  completed,
}

class HandoverSession {
  const HandoverSession(this.userId, this.sessionId);
  final int userId;
  final String sessionId;
  bool matches(HandoverSession? other) =>
      other != null && userId == other.userId && sessionId == other.sessionId;
}

class HandoverState {
  HandoverState({
    required this.ownerId,
    required List<String> oldTokens,
    required this.currentToken,
    required this.phase,
    Set<String> retired = const {},
    this.newOwnerId,
    this.newToken,
  }) : oldTokens = List.unmodifiable(oldTokens),
       retired = Set.unmodifiable(retired);
  final int ownerId;
  final List<String> oldTokens;
  final String currentToken;
  final HandoverPhase phase;
  final Set<String> retired;
  final int? newOwnerId;
  final String? newToken;

  HandoverState copy({
    HandoverPhase? phase,
    Set<String>? retired,
    int? newOwnerId,
    String? newToken,
  }) => HandoverState(
    ownerId: ownerId,
    oldTokens: oldTokens,
    currentToken: currentToken,
    phase: phase ?? this.phase,
    retired: retired ?? this.retired,
    newOwnerId: newOwnerId ?? this.newOwnerId,
    newToken: newToken ?? this.newToken,
  );
}

// Production implementations must protect tokens at rest and serialize access
// across all instances. No production implementation is supplied in this stage.
abstract class HandoverStore {
  Future<HandoverState?> read();
  Future<void> write(HandoverState state);
}

abstract class HandoverPorts {
  Future<HandoverSession?> session();
  // The backend must authenticate the owner and make this operation idempotent.
  Future<bool> retire(String token);
  // Must pause refresh and invalidate only if the current token still matches.
  // False or an exception means the outcome is unknown, not necessarily failure.
  Future<bool> invalidateIfCurrent(String expectedToken);
  // The server must reject tokens belonging to a different user.
  Future<bool> register(String token);
}

enum HandoverResult { success, blocked, busy }

class DeviceAccountHandover {
  DeviceAccountHandover(this.store, this.ports);
  final HandoverStore store;
  final HandoverPorts ports;
  // Shared by all coordinators in this Dart isolate, not across isolates.
  static bool _busy = false;

  Future<HandoverResult> _exclusive(Future<bool> Function() action) async {
    if (_busy) return HandoverResult.busy;
    _busy = true;
    try {
      return await action() ? HandoverResult.success : HandoverResult.blocked;
    } catch (_) {
      return HandoverResult.blocked;
    } finally {
      _busy = false;
    }
  }

  Future<HandoverResult> start({
    required bool consent,
    required int ownerId,
    required List<String> oldTokens,
    required String currentToken,
  }) => _exclusive(() async {
    final session = await ports.session();
    final unique = oldTokens.toSet();
    if (!consent ||
        session?.userId != ownerId ||
        session!.sessionId.isEmpty ||
        unique.isEmpty ||
        unique.any((t) => t.trim().isEmpty) ||
        !unique.contains(currentToken) ||
        await store.read() != null ||
        !session.matches(await ports.session())) {
      return false;
    }
    await store.write(
      HandoverState(
        ownerId: ownerId,
        oldTokens: unique.toList(),
        currentToken: currentToken,
        phase: HandoverPhase.retiring,
      ),
    );
    return true;
  });

  Future<HandoverResult> retireOldTokens() => _exclusive(() async {
    final initial = await store.read();
    final session = await ports.session();
    if (initial == null ||
        initial.phase != HandoverPhase.retiring ||
        session == null ||
        session.userId != initial.ownerId ||
        session.sessionId.isEmpty) {
      return false;
    }
    var state = initial;
    for (final token in state.oldTokens) {
      if (state.retired.contains(token)) continue;
      if (!session.matches(await ports.session()) || !await ports.retire(token)) {
        return false;
      }
      // Record confirmed, idempotent server work even if the session changed meanwhile.
      state = state.copy(retired: {...state.retired, token});
      await store.write(state);
      if (!session.matches(await ports.session())) return false;
    }
    await store.write(state.copy(phase: HandoverPhase.awaitingDeletion));
    return true;
  });

  Future<HandoverResult> invalidateOldToken() => _exclusive(() async {
    final state = await store.read();
    final session = await ports.session();
    if (state == null ||
        state.phase != HandoverPhase.awaitingDeletion ||
        session == null ||
        session.userId != state.ownerId ||
        session.sessionId.isEmpty ||
        !session.matches(await ports.session())) {
      return false;
    }
    // Persist before the external operation; do not retry an uncertain deletion.
    await store.write(state.copy(phase: HandoverPhase.deletionUncertain));
    if (!session.matches(await ports.session()) ||
        !await ports.invalidateIfCurrent(state.currentToken) ||
        !session.matches(await ports.session())) {
      return false;
    }
    await store.write(state.copy(phase: HandoverPhase.ready));
    return true;
  });

  Future<HandoverResult> registerNewToken(String token) => _exclusive(() async {
    var state = await store.read();
    final session = await ports.session();
    if (state == null ||
        session == null ||
        session.sessionId.isEmpty ||
        session.userId == state.ownerId ||
        token.trim().isEmpty ||
        state.oldTokens.contains(token) ||
        (state.phase != HandoverPhase.ready &&
            state.phase != HandoverPhase.registering) ||
        (state.phase == HandoverPhase.registering &&
            (state.newOwnerId != session.userId || state.newToken != token)) ||
        !session.matches(await ports.session())) {
      return false;
    }
    if (state.phase == HandoverPhase.ready) {
      state = state.copy(
        phase: HandoverPhase.registering,
        newOwnerId: session.userId,
        newToken: token,
      );
      await store.write(state);
    }
    if (!session.matches(await ports.session()) ||
        !await ports.register(token) ||
        !session.matches(await ports.session())) {
      return false;
    }
    await store.write(state.copy(phase: HandoverPhase.completed));
    return true;
  });
}
