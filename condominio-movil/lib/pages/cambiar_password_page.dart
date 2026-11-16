import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class CambiarPasswordPage extends StatefulWidget {
  const CambiarPasswordPage({super.key});
  @override
  State<CambiarPasswordPage> createState() => _CambiarPasswordPageState();
}

class _CambiarPasswordPageState extends State<CambiarPasswordPage> {
  final actual = TextEditingController();
  final nueva = TextEditingController();
  final confirmacion = TextEditingController();
  bool ocupado = false;
  bool mostrarActual = false;
  bool mostrarNueva = false;
  bool mostrarConfirmacion = false;
  String? error;

  @override
  void dispose() { actual.dispose(); nueva.dispose(); confirmacion.dispose(); super.dispose(); }

  Future<void> cambiar() async {
    if (ocupado) return;
    if (actual.text.isEmpty || nueva.text.isEmpty || confirmacion.text.isEmpty) {
      setState(() { error = 'Completa todos los campos.'; }); return;
    }
    if (nueva.text != confirmacion.text) {
      setState(() { error = 'Las contraseñas nuevas no coinciden.'; }); return;
    }
    setState(() { ocupado = true; error = null; });
    final fallo = await AuthService.cambiarContrasena(actual.text, nueva.text);
    if (!mounted) return;
    if (fallo != null) { setState(() { ocupado = false; error = fallo; }); return; }
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Contraseña actualizada. Las otras sesiones se cerraron.')));
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Cambiar contraseña')),
    body: ListView(padding: const EdgeInsets.all(20), children: [
      TextField(controller: actual, obscureText: !mostrarActual, enabled: !ocupado, maxLength: 256,
        decoration: InputDecoration(labelText: 'Contraseña actual', suffixIcon: IconButton(
          tooltip: mostrarActual ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual',
          onPressed: ocupado ? null : () => setState(() { mostrarActual = !mostrarActual; }),
          icon: Icon(mostrarActual ? Icons.visibility_off : Icons.visibility)))),
      TextField(controller: nueva, obscureText: !mostrarNueva, enabled: !ocupado, maxLength: 256,
        decoration: InputDecoration(labelText: 'Nueva contraseña', suffixIcon: IconButton(
          tooltip: mostrarNueva ? 'Ocultar nueva contraseña' : 'Mostrar nueva contraseña',
          onPressed: ocupado ? null : () => setState(() { mostrarNueva = !mostrarNueva; }),
          icon: Icon(mostrarNueva ? Icons.visibility_off : Icons.visibility)))),
      TextField(controller: confirmacion, obscureText: !mostrarConfirmacion, enabled: !ocupado, maxLength: 256,
        decoration: InputDecoration(labelText: 'Repetir nueva contraseña', suffixIcon: IconButton(
          tooltip: mostrarConfirmacion ? 'Ocultar repetición de contraseña' : 'Mostrar repetición de contraseña',
          onPressed: ocupado ? null : () => setState(() { mostrarConfirmacion = !mostrarConfirmacion; }),
          icon: Icon(mostrarConfirmacion ? Icons.visibility_off : Icons.visibility)))),
      if (error != null) Padding(padding: const EdgeInsets.symmetric(vertical: 12), child: Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
      const SizedBox(height: 16),
      ElevatedButton(onPressed: ocupado ? null : cambiar, child: const Text('Cambiar contraseña')),
    ]),
  );
}
