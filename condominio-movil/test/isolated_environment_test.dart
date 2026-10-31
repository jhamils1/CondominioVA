import 'package:flutter_test/flutter_test.dart';
import 'package:smart_condominium/config/api_config.dart';
import 'package:smart_condominium/config/app_environment.dart';
import 'package:smart_condominium/services/fcm_service.dart';

void main() {
  test('isolation accepts only the designated local test API', () {
    expect(AppEnvironment.validIsolatedApi('http://127.0.0.1:18080/api'), isTrue);
    for (final value in ['', 'http://127.0.0.1:8000/api', 'http://192.168.0.15:8000/api',
        'https://example.com/api', 'http://127.0.0.1:18080/api/']) {
      expect(AppEnvironment.validIsolatedApi(value), isFalse);
    }
  });

  test('build uses explicit local API and leaves Firebase operations disabled', () async {
    expect(AppEnvironment.isolated, isTrue, reason: 'Run with the isolated dart defines');
    expect(AppEnvironment.validate, returnsNormally);
    expect(ApiConfig.baseUrl, AppEnvironment.isolatedApi);
    expect(await FCMService.getToken(), isNull);
    expect(await FCMService.registerDevice('fake-token'), isFalse);
    expect(await FCMService.unregisterDevice(), isTrue);
  }, skip: !AppEnvironment.isolated || !AppEnvironment.validIsolatedApi(AppEnvironment.configuredApi));

  test('wrong isolated API prevents initialization', () {
    expect(AppEnvironment.validate, throwsStateError);
  }, skip: !AppEnvironment.isolated || AppEnvironment.validIsolatedApi(AppEnvironment.configuredApi));
}
