import 'package:flutter/material.dart';
import 'dart:async';
import '../services/alertas_seguridad_service.dart';
import '../security/filtro_bandeja.dart';
import '../widgets/evidencia_seguridad.dart';

class AlertasSeguridadPage extends StatefulWidget {
  final AlertasSeguridadService? service;
  final FiltroBandeja filtro;
  final bool actualizarPeriodicamente;
  const AlertasSeguridadPage({super.key, this.service, this.filtro = FiltroBandeja.todas,
    this.actualizarPeriodicamente = false});

  @override
  State<AlertasSeguridadPage> createState() => _AlertasSeguridadPageState();
}

class _AlertasSeguridadPageState extends State<AlertasSeguridadPage> {
  late final AlertasSeguridadService service;
  List<AlertaSeguridad> alertas = [];
  DetalleEventoSeguridad? detalle;
  String? error;
  bool loading = true;
  Timer? _timer;
  bool _actualizando = false;
  int _version = 0;

  @override
  void initState() {
    super.initState();
    service = widget.service ?? AlertasSeguridadService();
    cargar();
    if (widget.actualizarPeriodicamente) {
      _timer = Timer.periodic(const Duration(seconds: 30), (_) => _actualizarLista());
    }
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  Future<void> _actualizarLista() async {
    final lifecycle = WidgetsBinding.instance.lifecycleState;
    if (!mounted || _actualizando || loading || detalle != null ||
        (lifecycle != null && lifecycle != AppLifecycleState.resumed) ||
        ModalRoute.of(context)?.isCurrent == false) { return; }
    _actualizando = true;
    final version = _version;
    try {
      final result = await service.listar();
      if (mounted && version == _version && detalle == null) {
        setState(() { alertas = result; error = null; });
      }
    } on AlertasException catch (e) {
      if (mounted && version == _version && detalle == null) {
        setState(() { alertas = []; error = e.mensaje; });
      }
    } finally { _actualizando = false; }
  }

  Future<void> cargar() async {
    _version++;
    setState(() { loading = true; error = null; detalle = null; alertas = []; });
    try {
      final result = await service.listar();
      if (!mounted) return;
      setState(() { alertas = result; loading = false; });
    } on AlertasException catch (e) {
      if (!mounted) return;
      setState(() { error = e.mensaje; loading = false; });
    }
  }

  Future<void> abrir(AlertaSeguridad alerta) async {
    _version++;
    setState(() { loading = true; error = null; detalle = null; });
    try {
      final result = await service.abrir(alerta);
      if (!mounted) return;
      setState(() {
        detalle = result;
        alertas = alertas.map((item) => item.id == alerta.id
            ? AlertaSeguridad(id: item.id, eventoId: item.eventoId,
                mensaje: item.mensaje, creada: item.creada, leida: true)
            : item).toList();
        loading = false;
      });
    } on AlertasException catch (e) {
      if (!mounted) return;
      setState(() { error = e.mensaje; alertas = []; loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final visibles = alertas.where((a) => widget.filtro == FiltroBandeja.todas ||
        (widget.filtro == FiltroBandeja.leidas ? a.leida : !a.leida)).toList();
    return Scaffold(
    appBar: AppBar(title: Text(widget.filtro == FiltroBandeja.leidas ? 'Historial de alertas' : 'Alertas de seguridad'),
      bottom: widget.actualizarPeriodicamente ? const PreferredSize(preferredSize: Size.fromHeight(36),
        child: Padding(padding: EdgeInsets.only(bottom: 8), child: Text('Se actualiza cada 30 s',
          style: TextStyle(fontSize: 11)))) : null, actions: [
      IconButton(onPressed: loading ? null : cargar, icon: const Icon(Icons.refresh), tooltip: 'Actualizar'),
    ]),
    body: loading ? const Center(child: CircularProgressIndicator())
      : error != null ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          Padding(padding: const EdgeInsets.all(16), child: Text(error!, textAlign: TextAlign.center)),
          ElevatedButton(onPressed: cargar, child: const Text('Reintentar')),
        ]))
      : detalle != null ? SingleChildScrollView(child: Padding(
          padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('DETALLE DEL EVENTO', style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: Theme.of(context).colorScheme.primary, letterSpacing: 1.2)),
            const SizedBox(height: 10),
            Text(detalle!.categoria, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12), Text(detalle!.descripcion),
            const SizedBox(height: 12), Text('Estado: ${detalle!.estado}'),
            Text('Fecha: ${detalle!.fecha}'),
            if (detalle!.ubicacion.isNotEmpty) Text('Ubicación: ${detalle!.ubicacion}'),
            if (detalle!.camara.isNotEmpty) Text('Cámara: ${detalle!.camara}'),
            if (detalle!.prioridad.isNotEmpty) Text('Prioridad: ${detalle!.prioridad}'),
            if (detalle!.evidenciaDisponible) ...[
              const SizedBox(height: 16),
              Text('Evidencia del evento', style: Theme.of(context).textTheme.titleMedium),
              EvidenciaSeguridad(key: ValueKey(detalle!.id), eventoId: detalle!.id, service: service),
            ],
            ]))),
            const SizedBox(height: 12),
            TextButton(onPressed: () => setState(() { detalle = null; }), child: const Text('Volver a las alertas')),
          ])))
      : visibles.isEmpty ? Center(child: Text(widget.filtro == FiltroBandeja.leidas
          ? 'No hay alertas leídas.' : widget.filtro == FiltroBandeja.nuevas
          ? 'No hay alertas nuevas.' : 'No hay alertas de seguridad.'))
      : ListView.separated(padding: const EdgeInsets.all(20), itemCount: visibles.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10), itemBuilder: (context, index) {
          final alerta = visibles[index];
          return Card(child: ListTile(
            leading: Icon(Icons.notifications_active_outlined, color: Theme.of(context).colorScheme.primary),
            title: Text(alerta.mensaje),
            subtitle: Text('${alerta.leida ? 'Leída' : 'Sin leer'} · ${alerta.creada}'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => abrir(alerta),
          ));
        }),
  );
  }
}

