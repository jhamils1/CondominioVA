import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/fcm_service.dart';
import '../security/access_policy.dart';
import '../theme/app_theme.dart';
import '../security/filtro_bandeja.dart';
import '../services/alertas_seguridad_service.dart';
import '../services/avisos_residente_service.dart';
import 'alertas_seguridad_page.dart';
import 'incidencias_seguridad_page.dart';
import 'avisos_residente_page.dart';
import 'visitas_operativas_page.dart';

class PerfilPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDark;
  final Future<Map<String, dynamic>> Function()? cargarPerfil;
  final String initialTab;
  final AlertasSeguridadService? alertasService;
  final AvisosResidenteService? avisosService;

  const PerfilPage({
    super.key,
    required this.onToggleTheme,
    required this.isDark,
    this.cargarPerfil,
    this.initialTab = 'inicio',
    this.alertasService,
    this.avisosService,
  });

  @override
  State<PerfilPage> createState() => _PerfilPageState();
}

class _PerfilPageState extends State<PerfilPage> {
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  Map<String, dynamic>? userData;
  bool _isLoading = true;
  String? _errorMessage;
  late String _selectedTab;

  @override
  void initState() {
    super.initState();
    _selectedTab = widget.initialTab;
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
    final capabilities = userData?['capacidades'] is List ? userData!['capacidades'] as List<dynamic> : null;
    final roleName = role == 'personalizado' && userData?['rol_nombre'] is String
        ? userData!['rol_nombre'] as String : nombreRol(role);
    final staff = puedeAcceder(role, '/alertas-seguridad');
    final resident = puedeAcceder(role, '/avisos-residente');
    final visits = puedeAcceder(role, '/visitas-operativas', capabilities);
    final destinations = <_MobileDestination>[
      const _MobileDestination('inicio', 'Inicio', Icons.home_outlined, Icons.home),
      if (staff || resident) _MobileDestination('nuevos', staff ? 'Incidencias' : 'Avisos', Icons.notifications_outlined, Icons.notifications),
      if (staff || resident) const _MobileDestination('historial', 'Historial', Icons.history, Icons.history),
      if (!staff && !resident && visits) const _MobileDestination('visitas', 'Visitas', Icons.people_outline, Icons.people),
      const _MobileDestination('ajustes', 'Ajustes', Icons.settings_outlined, Icons.settings),
    ];
    final activeTab = _selectedTab == 'notificaciones' && staff ? 'nuevos' :
        destinations.any((item) => item.id == _selectedTab && item.id != 'ajustes') ? _selectedTab : 'inicio';

    return Scaffold(
      key: _scaffoldKey,
      onEndDrawerChanged: (open) {
        if (open && !_isLoading) _loadProfile();
      },
      appBar: activeTab != 'inicio' ? null : AppBar(
        automaticallyImplyLeading: false,
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
      endDrawer: Drawer(
        child: Column(children: [Expanded(child: ListView(
          padding: EdgeInsets.zero,
          children: [
            ListTile(
              title: Text('Ajustes', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              trailing: IconButton(icon: const Icon(Icons.close), tooltip: 'Cerrar ajustes',
                onPressed: () => Navigator.pop(context)),
            ),
            UserAccountsDrawerHeader(
              accountName: Text(username),
              accountEmail: Text(roleName),
              currentAccountPicture: const CircleAvatar(
                backgroundColor: Color(0xFF17466B),
                child: Icon(Icons.person, size: 40, color: Color(0xFFBEE7FF)),
              ),
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [AppTheme.navy, Color(0xFF164A70)]),
              ),
            ),
            if (role != 'guardia' && puedeAcceder(role, '/editar-perfil')) ListTile(
              leading: const Icon(Icons.edit),
              title: const Text("Editar Perfil"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/editar-perfil");
              },
            ),
            if (puedeAcceder(role, '/cambiar-password')) ListTile(
              leading: const Icon(Icons.lock),
              title: const Text("Cambiar contraseña"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/cambiar-password");
              },
            ),
            if (role != 'guardia') ListTile(
              leading: Icon(widget.isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined),
              title: Text(widget.isDark ? 'Usar tema claro' : 'Usar tema oscuro'),
              onTap: () { Navigator.pop(context); widget.onToggleTheme(); },
            ),
            const Divider(),
            if (role != 'guardia' && puedeAcceder(role, '/visitas-operativas', capabilities)) ListTile(
              leading: const Icon(Icons.people_outline),
              title: const Text('Visitas pendientes y activas'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/visitas-operativas');
              },
            ),
            if (role != 'guardia' && puedeAcceder(role, '/alertas-seguridad')) ListTile(
              leading: const Icon(Icons.notifications_active),
              title: const Text('Alertas de seguridad'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/alertas-seguridad');
              },
            ),
            if (puedeAcceder(role, '/avisos-residente')) ListTile(
              leading: const Icon(Icons.notifications_outlined),
              title: const Text('Mis avisos'),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/avisos-residente');
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
            if (role != 'guardia' && puedeAcceder(role, '/reconocimiento-facial')) ListTile(
              leading: const Icon(Icons.face),
              title: const Text("Reconocimiento Facial"),
              subtitle: const Text("Verificar acceso"),
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, "/reconocimiento-facial");
              },
            ),
          ],
        )),
          const Divider(height: 1),
          SafeArea(top: false, child: ListTile(
            leading: const Icon(Icons.logout),
            title: const Text("Cerrar sesión"),
            onTap: () => _logout(context),
          )),
        ]),
      ),
      bottomNavigationBar: _isLoading || _errorMessage != null || userData == null ? null : NavigationBar(
        selectedIndex: destinations.indexWhere((item) => item.id == activeTab),
        onDestinationSelected: (index) {
          final destination = destinations[index].id;
          if (destination == 'ajustes') { _scaffoldKey.currentState?.openEndDrawer(); return; }
          setState(() { _selectedTab = destination; });
        },
        destinations: destinations.map((item) => NavigationDestination(
          icon: Icon(item.icon), selectedIcon: Icon(item.selectedIcon), label: item.label,
        )).toList(),
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
              : _selectedTab == 'notificaciones' && staff
                  ? AlertasSeguridadPage(service: widget.alertasService)
              : activeTab == 'nuevos' && staff
                  ? IncidenciasSeguridadPage(key: const ValueKey('incidencias-activas'), service: widget.alertasService,
                      puedeConfirmar: role == 'guardia' || role == 'administrador', puedeAtender: role == 'guardia', onConfirmada: () => setState(() { _selectedTab = 'historial'; }))
              : activeTab == 'nuevos' && resident
                  ? AvisosResidentePage(key: const ValueKey('avisos-nuevos'), service: widget.avisosService, filtro: FiltroBandeja.nuevas, actualizarPeriodicamente: true)
              : activeTab == 'historial' && staff
                  ? IncidenciasSeguridadPage(key: const ValueKey('incidencias-historial'), service: widget.alertasService, historial: true, puedeAtender: role == 'guardia')
              : activeTab == 'historial' && resident
                  ? AvisosResidentePage(key: const ValueKey('avisos-historial'), service: widget.avisosService, filtro: FiltroBandeja.leidas)
              : activeTab == 'visitas' && visits
                  ? const VisitasOperativasPage()
              : SafeArea(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(20, 24, 20, 32),
                    children: [
                      Card(child: Padding(
                        padding: const EdgeInsets.all(22),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Icon(Icons.shield_outlined, size: 34, color: Theme.of(context).colorScheme.primary),
                          const SizedBox(height: 18),
                          Text('Bienvenido $username 🎉', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Text('Rol: $roleName', style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context).colorScheme.onSurfaceVariant)),
                        ]),
                      )),
                      const SizedBox(height: 26),
                      Text('Accesos rápidos', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 6),
                      Text('Selecciona una opción para continuar.', style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant)),
                      const SizedBox(height: 14),
                      if (puedeAcceder(role, '/avisos-residente')) _quickLink(context, Icons.notifications_outlined,
                        'Revisar avisos', 'Consulta tus notificaciones del condominio', '/avisos-residente'),
                      if (role != 'guardia' && puedeAcceder(role, '/alertas-seguridad')) _quickLink(context, Icons.notification_important_outlined,
                        'Revisar alertas', 'Consulta los eventos de seguridad', '/alertas-seguridad'),
                      if (role != 'guardia' && puedeAcceder(role, '/visitas-operativas', capabilities)) _quickLink(context, Icons.people_outline,
                        'Consultar visitas', 'Revisa las visitas pendientes y activas', '/visitas-operativas'),
                      if (puedeAcceder(role, '/expensas')) _quickLink(context, Icons.receipt_long_outlined,
                        'Ver expensas', 'Consulta tus expensas y pagos', '/expensas'),
                      if (puedeAcceder(role, '/areas-comunes')) _quickLink(context, Icons.apartment_outlined,
                        'Explorar áreas', 'Consulta los espacios del condominio', '/areas-comunes'),
                      if (puedeAcceder(role, '/dashboard')) _quickLink(context, Icons.insights_outlined,
                        'Ver resumen', 'Consulta el panel financiero', '/dashboard'),
                    ],
                  ),
                ),
    );
  }

  Widget _quickLink(BuildContext context, IconData icon, String title, String subtitle, String route) {
    final scheme = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Card(child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: scheme.primary.withValues(alpha: .13), borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: scheme.primary),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.pushNamed(context, route),
      )),
    );
  }


}

class _MobileDestination {
  final String id, label;
  final IconData icon, selectedIcon;
  const _MobileDestination(this.id, this.label, this.icon, this.selectedIcon);
}
