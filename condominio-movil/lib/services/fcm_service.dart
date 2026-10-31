import 'dart:async';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'auth_service.dart';
import 'fcm_device_registration.dart';
import '../security/security_notification_navigation.dart';
import '../config/app_environment.dart';

class FCMService {
  static Future<void> _pendingRegistration = Future.value();
  static bool _registrationsPaused = false;

  static void allowRegistration() { _registrationsPaused = false; }

  static Future<T> _serialize<T>(Future<T> Function() action) {
    final result = Completer<T>();
    _pendingRegistration = _pendingRegistration.then((_) async {
      try {
        result.complete(await action());
      } catch (error, stack) {
        result.completeError(error, stack);
      }
    });
    return result.future;
  }
  static final FirebaseMessaging _firebaseMessaging =
      FirebaseMessaging.instance;
  
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  // Inicializar el servicio de FCM
  static Future<void> initialize() async {
    if (AppEnvironment.isolated) return;
    try {
      // Inicializar notificaciones locales
      await _initializeLocalNotifications();
      
      // Solicitar permisos
      NotificationSettings settings = await _firebaseMessaging.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      debugPrint('Permisos de notificación: ${settings.authorizationStatus}');

      // Obtener el token FCM con manejo de errores
      try {
        String? token = await _firebaseMessaging.getToken();
        if (token != null) {
          // Conservar el registro anterior hasta que el servidor confirme.
          if (await AuthService.getToken() != null) await registerDevice(token);
        }
      } catch (_) {
        debugPrint('No se pudo obtener el token de notificaciones.');
        debugPrint('La app continuará sin notificaciones push');
      }

      // Escuchar cambios en el token
      _firebaseMessaging.onTokenRefresh.listen((newToken) async {
        // Intentar registrar el nuevo token si el usuario está autenticado
        final token = await AuthService.getToken();
        if (token != null) {
          await registerDevice(newToken);
        }
      }).onError((_) {
        debugPrint('No se pudo actualizar el registro de notificaciones.');
      });

      // Configurar handlers de mensajes
      _configureMessageHandlers();
    } catch (_) {
      debugPrint('No se pudo inicializar el servicio de notificaciones.');
      debugPrint('La aplicación continuará sin notificaciones push');
    }
  }

  // Configurar los handlers de mensajes
  static void _configureMessageHandlers() {
    // Handler para mensajes cuando la app está en primer plano
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('Mensaje recibido en primer plano.');
      
      if (message.notification != null) {
        debugPrint('Notificación recibida.');
        
        // Aquí puedes mostrar una notificación local o un diálogo
        _showNotificationDialog(message);
      }
    });

    // Handler para cuando el usuario toca una notificación y abre la app
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Notificación tocada.');
      
      // Aquí puedes navegar a una pantalla específica
      _handleNotificationNavigation(message);
    });

    // Verificar si la app se abrió desde una notificación
    _firebaseMessaging.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        debugPrint('App abierta desde notificación.');
        _handleNotificationNavigation(message);
      }
    });
  }

  // Inicializar notificaciones locales
  static Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
    );

    await _localNotifications.initialize(
      settings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        debugPrint('Notificación tocada.');
        SecurityNotificationNavigation.instance.recibirPayload(response.payload);
      },
    );

    try {
      final launch = await _localNotifications.getNotificationAppLaunchDetails();
      if (launch?.didNotificationLaunchApp == true) {
        SecurityNotificationNavigation.instance.recibirPayload(launch?.notificationResponse?.payload);
      }
    } catch (_) {
      debugPrint('No se pudo comprobar el inicio desde una notificación local.');
    }

    // Crear canal de notificación para Android
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'high_importance_channel', // id
      'Notificaciones Importantes', // nombre
      description: 'Canal para notificaciones importantes',
      importance: Importance.high,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);
  }

  // Mostrar notificación local cuando la app está en primer plano
  static Future<void> _showNotificationDialog(RemoteMessage message) async {
    debugPrint('Mostrar notificación local.');
    
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'high_importance_channel',
      'Notificaciones Importantes',
      channelDescription: 'Canal para notificaciones importantes',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
    );

    const NotificationDetails notificationDetails = NotificationDetails(
      android: androidDetails,
    );

    await _localNotifications.show(
      message.data['notificacion_id']?.hashCode ?? message.hashCode,
      message.notification?.title ?? 'Nueva notificación',
      message.notification?.body ?? '',
      notificationDetails,
      payload: payloadAvisoSeguridad(message.data),
    );
  }

  // Manejar la navegación según los datos de la notificación
  static void _handleNotificationNavigation(RemoteMessage message) {
    SecurityNotificationNavigation.instance.recibir(message.data);
  }

  // Registrar el dispositivo en el backend
  static Future<bool> registerDevice(String fcmToken) => _serialize(() async {
    if (AppEnvironment.isolated) return false;
    if (_registrationsPaused) return false;
    final platform = defaultTargetPlatform == TargetPlatform.iOS ? 'ios' : 'android';
    return FcmDeviceRegistration().synchronize(fcmToken, platform);
  });

  // Actualizar el dispositivo en el backend
  static Future<bool> updateDevice(String fcmToken, {bool active = true}) => active
      ? registerDevice(fcmToken)
      : _serialize(() => AppEnvironment.isolated ? Future.value(true) : FcmDeviceRegistration().unregister(token: fcmToken));

  // Desregistrar el dispositivo (cuando el usuario cierra sesión)
  static Future<bool> unregisterDevice() {
    if (AppEnvironment.isolated) return Future.value(true);
    _registrationsPaused = true;
    return _serialize(() => FcmDeviceRegistration().unregister());
  }

  // Obtener el token FCM actual
  static Future<String?> getToken() async {
    if (AppEnvironment.isolated) return null;
    try {
      return await _firebaseMessaging.getToken();
    } catch (_) {
      debugPrint('No se pudo obtener el token de notificaciones.');
      return null;
    }
  }
}
