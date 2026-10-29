import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/fcm_service.dart';

class PerfilPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDark;

  const PerfilPage({
    super.key,
    required this.onToggleTheme,
    required this.isDark,
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
    });

    final result = await AuthService.getUserProfile();
    
    setState(() {
      _isLoading = false;
      if (result['success']) {
        userData = result['data'];
      } else {
        _errorMessage = result['message'];
      }
    });
  }

  Future<void> _logout(BuildContext context) async {
    // Desregistrar el dispositivo para notificaciones push
    await FCMService.unregisterDevice();
    
    final result = await AuthService.logout();
    
    if (result['success']) {
      Navigator.pushNamedAndRemoveUntil(context, "/", (route) => false);
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
    final username = userData?["username"] ?? "Cargando...";
    final email = userData?["email"] ?? "";
    final firstName = userData?["first_name"] ?? "";
    final lastName = userData?["last_name"] ?? "";

    return Scaffold(
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
              accountName: Text("$firstName $lastName"),
              accountEmail: Text(email),
              currentAccountPicture: const CircleAvatar(
                backgroundColor: Colors.white,
                child: Icon(Icons.person, size: 40, color: Colors.deepPurple),
              ),
              decoration: const BoxDecoration(color: Colors.deepPurple),
            ),
            ListTile(
              leading: const Icon(Icons.edit),
              title: const Text("Editar Perfil"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/editar-perfil");
              },
            ),
            ListTile(
              leading: const Icon(Icons.lock),
              title: const Text("Cambiar Contraseña"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/cambiar-password");
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.receipt_long),
              title: const Text("Mis Expensas"),
              subtitle: const Text("Ver y pagar expensas"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/expensas");
              },
            ),
            ListTile(
              leading: const Icon(Icons.inventory_2),
              title: const Text("Objetos Perdidos"),
              subtitle: const Text("Ver objetos encontrados"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/objetos-perdidos");
              },
            ),
            ListTile(
              leading: const Icon(Icons.location_city),
              title: const Text("Áreas Comunes"),
              subtitle: const Text("Reservar espacios comunes"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/areas-comunes");
              },
            ),
            ListTile(
              leading: const Icon(Icons.event_available),
              title: const Text("Mis Reservas"),
              subtitle: const Text("Ver y gestionar reservas"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/mis-reservas");
              },
            ),
            ListTile(
              leading: const Icon(Icons.dashboard),
              title: const Text("Dashboard Financiero"),
              subtitle: const Text("Estadísticas y gráficos"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/dashboard");
              },
            ),
            ListTile(
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
                      Text("Nombre: $firstName $lastName"),
                      Text("Correo: $email"),
                    ],
                  ),
                ),
    );
  }
}
