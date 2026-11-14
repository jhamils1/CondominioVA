import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/fcm_service.dart';
import '../widgets/custom_text_field.dart';
import '../security/security_notification_navigation.dart';
import '../security/resident_notification_navigation.dart';

class LoginPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDark;

  const LoginPage({
    super.key,
    required this.onToggleTheme,
    required this.isDark,
  });

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _userController = TextEditingController();
  final _passController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _userController.dispose();
    _passController.dispose();
    super.dispose();
  }

  void _login() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      final user = _userController.text;
      final pass = _passController.text;

      final result = await AuthService.login(user, pass);
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });

      if (result['success']) {
        final profile = await AuthService.getUserProfile();
        final data = profile['data'];
        final role = profile['success'] == true && data is Map ? data['role'] : null;
        var fcmReady = role == 'personalizado';
        if (role != null && role != 'personalizado') {
          FCMService.allowRegistration();
          try {
            final fcmToken = await FCMService.getToken();
            if (fcmToken != null) {
              fcmReady = await FCMService.registerDevice(fcmToken);
            }
          } catch (_) { /* El acceso no depende de la disponibilidad de FCM. */ }
        }
        if (!mounted) return;
        if (!fcmReady) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('No se pudo confirmar el registro de notificaciones en este dispositivo.'),
          ));
        }
        
        // Navegar al perfil si el login es exitoso
        Navigator.pushReplacementNamed(context, "/perfil");
        SecurityNotificationNavigation.instance.procesar();
        ResidentNotificationNavigation.instance.procesar();
      } else {
        // Mostrar error si el login falla
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final notice = ModalRoute.of(context)?.settings.arguments;
    return Scaffold(
      appBar: AppBar(
        title: const Text("Iniciar Sesión"),
        actions: [
          IconButton(
            icon: Icon(widget.isDark ? Icons.wb_sunny : Icons.nightlight_round),
            onPressed: widget.onToggleTheme,
          ),
        ],
      ),
      body: SafeArea(
        child: LayoutBuilder(builder: (context, constraints) {
          final theme = Theme.of(context);
          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: (constraints.maxHeight - 48).clamp(0, double.infinity)),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 440),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Form(
                        key: _formKey,
                        child: Column(mainAxisSize: MainAxisSize.min, children: [
                          if (notice is String && notice.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: Text(notice, style: TextStyle(color: theme.colorScheme.error)),
                            ),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(24),
                            child: Image.asset('assets/images/logo_condominio.png', height: 92, width: 92),
                          ),
                          const SizedBox(height: 18),
                          Text('CONDOMINIO', style: theme.textTheme.labelLarge?.copyWith(
                            color: theme.colorScheme.primary, letterSpacing: 2, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 6),
                          Text('Seguridad y administración', textAlign: TextAlign.center,
                            style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant)),
                          const SizedBox(height: 26),
                          CustomTextField(
                            controller: _userController,
                            label: 'Usuario',
                            validator: (value) => value!.isEmpty ? 'Ingrese su usuario' : null,
                          ),
                          const SizedBox(height: 16),
                          CustomTextField(
                            controller: _passController,
                            label: 'Contraseña',
                            isPassword: true,
                            validator: (value) => value!.isEmpty ? 'Ingrese su contraseña' : null,
                          ),
                          const SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _login,
                              child: _isLoading
                                  ? const SizedBox(height: 20, width: 20,
                                      child: CircularProgressIndicator(strokeWidth: 2))
                                  : const Text('Ingresar'),
                            ),
                          ),
                        ]),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
