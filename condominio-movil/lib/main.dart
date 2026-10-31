import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_stripe/flutter_stripe.dart';
import 'firebase_options.dart';
import 'pages/login_page.dart';
import 'pages/perfil_page.dart';
import 'pages/editar_perfil_page.dart';
import 'pages/cambiar_password_page.dart';
import 'pages/reconocimiento_facial_page.dart';
import 'pages/expensas_page.dart';
import 'pages/objetos_perdidos_page.dart';
import 'pages/areas_comunes_page.dart';
import 'pages/mis_reservas_page.dart';
import 'pages/dashboard_page.dart';
import 'pages/alertas_seguridad_page.dart';
import 'services/fcm_service.dart';
import 'config/stripe_config.dart';
import 'config/app_environment.dart';
import 'security/protected_route.dart';
import 'security/security_notification_navigation.dart';

// Handler para mensajes en segundo plano
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  debugPrint('Mensaje recibido en segundo plano.');
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  AppEnvironment.validate();
  
  if (!AppEnvironment.isolated) {
    try {
      // Inicializar Firebase
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );

      // Configurar handler de mensajes en segundo plano
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

      // Inicializar servicio FCM (no bloqueante)
      FCMService.initialize().catchError((_) {
        debugPrint('No se pudo iniciar FCM; la app continuará sin notificaciones push.');
      });
    } catch (_) {
      debugPrint('No se pudo iniciar Firebase.');
    }
  }
  
  if (!AppEnvironment.isolated) {
    try {
      // Inicializar Stripe
      Stripe.publishableKey = StripeConfig.publishableKey;
      Stripe.merchantIdentifier = 'merchant.com.smartcondominium';
      await Stripe.instance.applySettings();
    } catch (_) {
      debugPrint('No se pudo iniciar Stripe.');
    }
  }
  
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool _isDark = false;
  final _navigator = GlobalKey<NavigatorState>();
  bool _alertsOpen = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      SecurityNotificationNavigation.instance.attach(() {
        final navigator = _navigator.currentState;
        if (navigator == null) return false;
        if (_alertsOpen) return true;
        _alertsOpen = true;
        navigator.pushNamed('/alertas-seguridad').whenComplete(() { _alertsOpen = false; });
        return true;
      });
    });
  }

  @override
  void dispose() {
    SecurityNotificationNavigation.instance.detach();
    super.dispose();
  }

  void _toggleTheme() {
    setState(() {
      _isDark = !_isDark;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: _navigator,
      title: 'Login Demo',
      debugShowCheckedModeBanner: false,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('es', 'ES'),
        Locale('en', 'US'),
      ],
      locale: const Locale('es', 'ES'),
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        brightness: Brightness.light,
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      themeMode: _isDark ? ThemeMode.dark : ThemeMode.light,
      initialRoute: "/",
      routes: {
        "/": (context) =>
            LoginPage(onToggleTheme: _toggleTheme, isDark: _isDark),
        "/perfil": (context) =>
            ProtectedRoute(route: '/perfil', child: PerfilPage(onToggleTheme: _toggleTheme, isDark: _isDark)),
        "/editar-perfil": (context) => const ProtectedRoute(route: '/editar-perfil', child: EditarPerfilPage()),
        "/cambiar-password": (context) => const ProtectedRoute(route: '/cambiar-password', child: CambiarPasswordPage()),
        "/reconocimiento-facial": (context) =>
            ProtectedRoute(route: '/reconocimiento-facial', child: ReconocimientoFacialPage(onToggleTheme: _toggleTheme, isDark: _isDark)),
        "/expensas": (context) =>
            ProtectedRoute(route: '/expensas', child: ExpensasPage(onToggleTheme: _toggleTheme, isDark: _isDark)),
        "/objetos-perdidos": (context) =>
            ProtectedRoute(route: '/objetos-perdidos', child: ObjetosPerdidosPage(onToggleTheme: _toggleTheme, isDark: _isDark)),
        "/areas-comunes": (context) => const ProtectedRoute(route: '/areas-comunes', child: AreasComunesPage()),
        "/mis-reservas": (context) => const ProtectedRoute(route: '/mis-reservas', child: MisReservasPage()),
        "/dashboard": (context) => const ProtectedRoute(route: '/dashboard', child: DashboardPage()),
        "/alertas-seguridad": (context) => const ProtectedRoute(route: '/alertas-seguridad', child: AlertasSeguridadPage()),
      },
    );
  }
}
