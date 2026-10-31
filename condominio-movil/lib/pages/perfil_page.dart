import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/fcm_service.dart';
import '../security/access_policy.dart';

class PerfilPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDark;
  final Future<Map<String, dynamic>> Function()? cargarPerfil;

  const PerfilPage({
    super.key,
    required this.onToggleTheme,
    required this.isDark,
    this.cargarPerfil,
  });

  @override
  State<PerfilPage> createState() => _PerfilPageState();
}

class _PerfilPageState extends State<PerfilPage> {
  Map<String, dynamic>? userData;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      userData = null;
    });

    final result = await (widget.cargarPerfil ?? AuthService.getUserProfile)();
    if (!mounted) return;
    setState(() {
      _isLoading = false;
      if (result['success']) {
        userData = result['data'];
      } else {
        userData = null;
        _errorMessage = result['message'];
      }
    });
  }

  Future<void> _logout(BuildContext context) async {
    // Desregistrar el dispositivo para notificaciones push
    final deviceUnregistered = await FCMService.unregisterDevice();
    
    final result = await AuthService.logout();
    if (!context.mounted) return;
    if (result['success']) {
      final notices = <String>[];
      if (result['serverConfirmed'] != true) {
        notices.add('La sesión local se cerró, pero no se pudo confirmar el cierre en el servidor.');
      }
      if (!deviceUnregistered) {
        notices.add('No se pudo desregistrar este dispositivo de las notificaciones.');
      }
      Navigator.pushNamedAndRemoveUntil(context, "/", (route) => false,
          arguments: notices.isEmpty ? null : notices.join(' '));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message']),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final username = userData?["username"] ?? "Sin sesión verificada";
    final role = userData?["role"] as String?;

    return Scaffold(
      onDrawerChanged: (open) {
        if (open && !_isLoading) _loadProfile();
      },
      appBar: AppBar(
        title: const Text("Mi Perfil"),
        actions: [
          IconButton(
            icon: Icon(widget.isDark ? Icons.wb_sunny : Icons.nightlight_round),
            onPressed: widget.onToggleTheme,
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadProfile,
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            UserAccountsDrawerHeader(
              accountName: Text(username),
              accountEmail: Text(nombreRol(role)),
              currentAccountPicture: const CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.person, size: 40, color: Colors.deepPurple),
              ),
              decoration: const BoxDecoration(color: Colors.deepPurple),
            ),
            if (puedeAcceder(role, '/editar-perfil')) ListTile(
              leading: const Icon(Icons.edit),
              title: const Text("Editar Perfil"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/editar-perfil");
              },
            ),
            if (puedeAcceder(role, '/cambiar-password')) ListTile(
              leading: const Icon(Icons.lock),
              title: const Text("Cambiar Contraseña"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/cambiar-password");
              },
            ),
            const Divider(),
            if (puedeAcceder(role, '/alertas-seguridad')) ListTile(
              leading: const Icon(Icons.notifications_active),
              title: const Text('Alertas de seguridad'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/alertas-seguridad');
              },
            ),
            if (puedeAcceder(role, '/expensas')) ListTile(
              leading: const Icon(Icons.receipt_long),
              title: const Text("Mis Expensas"),
              subtitle: const Text("Ver y pagar expensas"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/expensas");
              },
            ),
            if (puedeAcceder(role, '/objetos-perdidos')) ListTile(
              leading: const Icon(Icons.inventory_2),
              title: const Text("Objetos Perdidos"),
              subtitle: const Text("Ver objetos encontrados"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/objetos-perdidos");
              },
            ),
            if (puedeAcceder(role, '/areas-comunes')) ListTile(
              leading: const Icon(Icons.location_city),
              title: const Text("Áreas Comunes"),
              subtitle: const Text("Reservar espacios comunes"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/areas-comunes");
              },
            ),
            if (puedeAcceder(role, '/mis-reservas')) ListTile(
              leading: const Icon(Icons.event_available),
              title: const Text("Mis Reservas"),
              subtitle: const Text("Ver y gestionar reservas"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/mis-reservas");
              },
            ),
            if (puedeAcceder(role, '/dashboard')) ListTile(
              leading: const Icon(Icons.dashboard),
              title: const Text("Dashboard Financiero"),
              subtitle: const Text("Estadísticas y gráficos"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/dashboard");
              },
            ),
            if (puedeAcceder(role, '/reconocimiento-facial')) ListTile(
              leading: const Icon(Icons.face),
              title: const Text("Reconocimiento Facial"),
              subtitle: const Text("Verificar acceso"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/reconocimiento-facial");
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text("Cerrar sesión"),
              onTap: () => _logout(context),
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error, size: 64, color: Colors.red),
                      const SizedBox(height: 16),
                      Text(
                        "Error: $_errorMessage",
                        style: const TextStyle(color: Colors.red),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadProfile,
                        child: const Text("Reintentar"),
                      ),
                    ],
                  ),
                )
              : Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Bienvenido $username 🎉",
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),
                      Text("Rol: ${nombreRol(role)}"),
                    ],
                  ),
                ),
    );
  }
}
