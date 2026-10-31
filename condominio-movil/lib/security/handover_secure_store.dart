import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'device_account_handover.dart';

/// Persists a single handover document. Not connected to the application yet.
/// A single coordinator must own this store; this class is not a process lock.
class HandoverSecureStore implements HandoverStore {
  HandoverSecureStore({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  static const _key = 'device_handover_v1';
  final FlutterSecureStorage _storage;

  @override
  Future<void> write(HandoverState state) async {
    final data = {
      'version': 1,
      'owner': state.ownerId,
      'old': state.oldTokens,
      'current': state.currentToken,
      'phase': state.phase.name,
      'retired': state.retired.toList(),
      'newOwner': state.newOwnerId,
      'newToken': state.newToken,
    };
    // Validate before replacing the previous document, and never log it.
    _decode(data);
    await _storage.write(key: _key, value: jsonEncode(data));
  }

  @override
  Future<HandoverState?> read() async {
    final value = await _storage.read(key: _key);
    if (value == null) return null;
    final dynamic data = jsonDecode(value);
    return _decode(data);
  }

  HandoverState _decode(dynamic value) {
    Never invalid() => throw const FormatException('Invalid handover state');
    if (value is! Map || value['version'] != 1) invalid();
    final owner = value['owner'];
    final old = value['old'];
    final current = value['current'];
    final phaseName = value['phase'];
    final retired = value['retired'];
    final newOwner = value['newOwner'];
    final newToken = value['newToken'];
    if (owner is! int ||
        owner <= 0 ||
        old is! List ||
        old.isEmpty ||
        old.any((t) => t is! String || t.trim().isEmpty) ||
        current is! String ||
        !old.contains(current) ||
        retired is! List ||
        retired.any((t) => t is! String || !old.contains(t)) ||
        old.toSet().length != old.length ||
        retired.toSet().length != retired.length ||
        phaseName is! String) {
      invalid();
    }
    final phases = HandoverPhase.values.where((p) => p.name == phaseName);
    if (phases.isEmpty) invalid();
    final phase = phases.single;
    if (phase != HandoverPhase.retiring && retired.length != old.length) {
      invalid();
    }
    final hasNew =
        phase == HandoverPhase.registering || phase == HandoverPhase.completed;
    if (hasNew) {
      if (newOwner is! int ||
          newOwner <= 0 ||
          newOwner == owner ||
          newToken is! String ||
          newToken.trim().isEmpty ||
          old.contains(newToken)) {
        invalid();
      }
    } else if (newOwner != null || newToken != null) {
      invalid();
    }
    return HandoverState(
      ownerId: owner,
      oldTokens: old.cast<String>(),
      currentToken: current,
      phase: phase,
      retired: retired.cast<String>().toSet(),
      newOwnerId: newOwner as int?,
      newToken: newToken as String?,
    );
  }
}
