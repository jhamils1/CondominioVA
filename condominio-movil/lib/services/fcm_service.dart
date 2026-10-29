import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import 'auth_service.dart';

class FCMService {
  static final FirebaseMessaging _firebaseMessaging =
      FirebaseMessaging.instance;
  
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  // Inicializar el servicio de FCM
  static Future<void> initialize() async {
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

      print('Permisos de notificación: ${settings.authorizationStatus}');

      // Obtener el token FCM con manejo de errores
      try {
        String? token = await _firebaseMessaging.getToken();
        if (token != null) {
          print('Token FCM: $token');
          // Guardar el token localmente para enviarlo después del login
          await AuthService.saveFCMToken(token);
        }
      } catch (e) {
        print('Error al obtener token FCM: $e');
        print('La app continuará sin notificaciones push');
      }

      // Escuchar cambios en el token
      _firebaseMessaging.onTokenRefresh.listen((newToken) async {
        print('Token FCM actualizado: $newToken');
        await AuthService.saveFCMToken(newToken);
        // Intentar registrar el nuevo token si el usuario está autenticado
        final token = await AuthService.getToken();
        if (token != null) {
          await registerDevice(newToken);
        }
      }).onError((error) {
        print('Error en onTokenRefresh: $error');
      });

      // Configurar handlers de mensajes
      _configureMessageHandlers();
    } catch (e) {
      print('Error al inicializar FCM: $e');
      print('La aplicación continuará sin notificaciones push');
    }
  }

  // Configurar los handlers de mensajes
  static void _configureMessageHandlers() {
    // Handler para mensajes cuando la app está en primer plano
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Mensaje recibido en primer plano: ${message.messageId}');
      
      if (message.notification != null) {
        print('Título: ${message.notification!.title}');
        print('Cuerpo: ${message.notification!.body}');
        
        // Aquí puedes mostrar una notificación local o un diálogo
        _showNotificationDialog(message);
      }
    });

    // Handler para cuando el usuario toca una notificación y abre la app
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print('Notificación tocada: ${message.messageId}');
      
      // Aquí puedes navegar a una pantalla específica
      _handleNotificationNavigation(message);
    });

    // Verificar si la app se abrió desde una notificación
    _firebaseMessaging.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        print('App abierta desde notificación: ${message.messageId}');
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
        print('Notificación tocada: ${response.payload}');
      },
    );

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
    print('Mostrar notificación: ${message.notification?.title}');
    
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
      message.hashCode,
      message.notification?.title ?? 'Nueva notificación',
      message.notification?.body ?? '',
      notificationDetails,
    );
  }

  // Manejar la navegación según los datos de la notificación
  static void _handleNotificationNavigation(RemoteMessage message) {
    final data = message.data;
    print('Datos de notificación: $data');
    
    // Aquí puedes implementar lógica de navegación según el tipo de notificación
    if (data.containsKey('screen')) {
      // Navegar a la pantalla especificada
      print('Navegar a: ${data['screen']}');
    }
  }

  // Registrar el dispositivo en el backend
  static Future<bool> registerDevice(String fcmToken) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        print('No hay token de autenticación');
        return false;
      }

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.devicesEndpoint}'),
        headers: ApiConfig.getAuthHeaders(token),
        body: jsonEncode({
          'registration_id': fcmToken,
          'type': 'android', // o 'ios' según la plataforma
          'active': true,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('Dispositivo registrado exitosamente');
        return true;
      } else {
        print('Error al registrar dispositivo: ${response.statusCode}');
        print('Respuesta: ${response.body}');
        return false;
      }
    } catch (e) {
      print('Error al registrar dispositivo: $e');
      return false;
    }
  }

  // Actualizar el dispositivo en el backend
  static Future<bool> updateDevice(String fcmToken, {bool active = true}) async {
    try {
      final token = await AuthService.getToken();
      if (token == null) {
        print('No hay token de autenticación');
        return false;
      }

      final response = await http.put(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.devicesEndpoint}'),
        headers: ApiConfig.getAuthHeaders(token),
        body: jsonEncode({
          'registration_id': fcmToken,
          'active': active,
        }),
      );

      if (response.statusCode == 200) {
        print('Dispositivo actualizado exitosamente');
        return true;
      } else {
        print('Error al actualizar dispositivo: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('Error al actualizar dispositivo: $e');
      return false;
    }
  }

  // Desregistrar el dispositivo (cuando el usuario cierra sesión)
  static Future<bool> unregisterDevice() async {
    try {
      final fcmToken = await AuthService.getFCMToken();
      if (fcmToken == null) {
        print('No hay token FCM guardado');
        return false;
      }

      final token = await AuthService.getToken();
      if (token == null) {
        print('No hay token de autenticación');
        return false;
      }

      final response = await http.delete(
        Uri.parse('${ApiConfig.baseUrl}${ApiConfig.devicesEndpoint}$fcmToken/'),
        headers: ApiConfig.getAuthHeaders(token),
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        print('Dispositivo desregistrado exitosamente');
        await AuthService.deleteFCMToken();
        return true;
      } else {
        print('Error al desregistrar dispositivo: ${response.statusCode}');
        return false;
      }
    } catch (e) {
      print('Error al desregistrar dispositivo: $e');
      return false;
    }
  }

  // Obtener el token FCM actual
  static Future<String?> getToken() async {
    try {
      return await _firebaseMessaging.getToken();
    } catch (e) {
      print('Error al obtener token FCM: $e');
      return null;
    }
  }
}
