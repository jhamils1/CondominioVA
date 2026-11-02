import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/services.dart';

/// Only return a known, non-sensitive provider error label.
String fcmErrorCode(Object error) {
  const known = [
    'SERVICE_NOT_AVAILABLE', 'FIS_AUTH_ERROR', 'AUTHENTICATION_FAILED',
    'MISSING_INSTANCEID_SERVICE', 'API_KEY_INVALID', 'TOO_MANY_REGISTRATIONS',
    'INVALID_ARGUMENT', 'PERMISSION_DENIED',
  ];
  final message = error is FirebaseException ? error.message :
      error is PlatformException ? error.message : null;
  final code = error is FirebaseException ? error.code :
      error is PlatformException ? error.code : null;
  final combined = '${code ?? ''} ${message ?? ''}'.toUpperCase();
  for (final value in known) {
    if (combined.contains(value)) return value;
  }
  return 'NO_CATALOGADO';
}
