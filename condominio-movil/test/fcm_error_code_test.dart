import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:smart_condominium/services/fcm_error_code.dart';

void main() {
  test('reconoce un código conocido sin divulgar detalles', () {
    final error = PlatformException(code: 'unknown', message: 'SERVICE_NOT_AVAILABLE valor-privado');
    expect(fcmErrorCode(error), 'SERVICE_NOT_AVAILABLE');
  });

  test('no divulga mensajes ni códigos arbitrarios', () {
    final error = PlatformException(code: 'privado', message: 'identificador-privado');
    expect(fcmErrorCode(error), 'NO_CATALOGADO');
  });
}
