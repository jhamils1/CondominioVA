import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'access_policy.dart';

/// Control de navegación; las solicitudes deben seguir autorizándose en Django.
class ProtectedRoute extends StatefulWidget {
  final String route;
  final Widget child;
  final Future<Map<String, dynamic>> Function()? verificar;

  const ProtectedRoute({super.key, required this.route, required this.child, this.verificar});

  @override
  State<ProtectedRoute> createState() => _ProtectedRouteState();
}

class _ProtectedRouteState extends State<ProtectedRoute> {
  late Future<Map<String, dynamic>> verification;

  @override
  void initState() {
    super.initState();
    verification = (widget.verificar ?? AuthService.getUserProfile)();
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<Map<String, dynamic>>(
    future: verification,
    builder: (context, snapshot) {
      if (snapshot.connectionState != ConnectionState.done) {
        return const Scaffold(body: Center(child: CircularProgressIndicator()));
      }
      final result = snapshot.data;
      if (result == null || result['success'] != true) {
        return Scaffold(
          appBar: AppBar(title: const Text('Verificar acceso')),
          body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
            Padding(padding: const EdgeInsets.all(16), child: Text(
              result?['message']?.toString() ?? 'No se pudo verificar la sesión.',
              textAlign: TextAlign.center,
            )),
            ElevatedButton(onPressed: () => setState(() {
              verification = (widget.verificar ?? AuthService.getUserProfile)();
            }), child: const Text('Reintentar')),
            TextButton(onPressed: () => Navigator.pushNamedAndRemoveUntil(
              context, '/', (route) => false,
            ), child: const Text('Volver al inicio de sesión')),
          ])),
        );
      }
      final user = validarUsuarioActual(result['data']);
      if (user == null || !puedeAcceder(user['role'] as String?, widget.route)) {
        return Scaffold(
          appBar: AppBar(title: const Text('Acceso denegado')),
          body: const Center(child: Text('No tienes permiso para acceder a esta pantalla.')),
        );
      }
      return widget.child;
    },
  );
}
