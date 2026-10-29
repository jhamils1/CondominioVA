import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/fcm_service.dart';
import '../widgets/custom_text_field.dart';

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

  void _login() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      final user = _userController.text;
      final pass = _passController.text;

      final result = await AuthService.login(user, pass);

      setState(() {
        _isLoading = false;
      });

      if (result['success']) {
        // Registrar el dispositivo para notificaciones push (no bloqueante)
        try {
          final fcmToken = await FCMService.getToken();
          if (fcmToken != null) {
            await FCMService.registerDevice(fcmToken);
          }
        } catch (e) {
          print('Error al registrar dispositivo FCM: $e');
          // Continuar con el login aunque falle el registro FCM
        }
        
        // Navegar al perfil si el login es exitoso
        Navigator.pushReplacementNamed(context, "/perfil");
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
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // 👇 Logo en la parte superior
              SizedBox(
                height: 180,
                width: 180,
                child: Image.asset("assets/images/logo_condominio.png"),
              ),
              const SizedBox(height: 32),

              CustomTextField(
                controller: _userController,
                label: "Usuario",
                validator: (value) =>
                    value!.isEmpty ? "Ingrese su usuario" : null,
              ),
              const SizedBox(height: 16),
              CustomTextField(
                controller: _passController,
                label: "Contraseña",
                isPassword: true,
                validator: (value) =>
                    value!.isEmpty ? "Ingrese su contraseña" : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isLoading ? null : _login,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 50),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text("Ingresar"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
