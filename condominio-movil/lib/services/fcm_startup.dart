import 'dart:async';

/// Orders notification setup independently of slow permission or network work.
class FcmStartup {
  Future<void>? _started;
  bool _localReady = false;
  bool _messagesInstalled = false;
  bool _refreshInstalled = false;
  bool _complete = false;

  Future<void> start({
    required Future<void> Function() initializeLocal,
    required void Function() installMessageHandlers,
    required void Function() installTokenRefresh,
    required Future<void> Function() requestPermission,
    required Future<void> Function() obtainAndRegister,
    required void Function(Object) onError,
  }) {
    if (_complete) return Future<void>.value();
    return _started ??= _run(
      initializeLocal, installMessageHandlers, installTokenRefresh,
      requestPermission, obtainAndRegister, onError,
    );
  }

  Future<void> _run(
    Future<void> Function() initializeLocal,
    void Function() installMessageHandlers,
    void Function() installTokenRefresh,
    Future<void> Function() requestPermission,
    Future<void> Function() obtainAndRegister,
    void Function(Object) onError,
  ) async {
    // Ensure the in-flight future is stored before a synchronous callback fails.
    await Future<void>.value();
    try {
      // Local display and launch payload must be ready before events arrive.
      if (!_localReady) {
        await initializeLocal();
        _localReady = true;
      }
      if (!_messagesInstalled) {
        installMessageHandlers();
        _messagesInstalled = true;
      }
      if (!_refreshInstalled) {
        installTokenRefresh();
        _refreshInstalled = true;
      }
      await requestPermission();
      await obtainAndRegister();
      _complete = true;
    } catch (error) {
      onError(error);
    } finally {
      _started = null;
    }
  }
}
