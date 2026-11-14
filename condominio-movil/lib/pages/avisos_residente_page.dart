import 'dart:typed_data';
import 'dart:async';
import 'package:flutter/material.dart';
import '../services/avisos_residente_service.dart';
import '../security/filtro_bandeja.dart';

class AvisosResidentePage extends StatefulWidget {
  final AvisosResidenteService? service;
  final FiltroBandeja filtro;
  final bool actualizarPeriodicamente;
  const AvisosResidentePage({super.key, this.service, this.filtro = FiltroBandeja.todas,
    this.actualizarPeriodicamente = false});
  @override
  State<AvisosResidentePage> createState() => _AvisosResidentePageState();
}

class _AvisosResidentePageState extends State<AvisosResidentePage> {
  late final AvisosResidenteService service;
  List<Map<String, dynamic>>? avisos;
  String? error;
  Map<String, dynamic>? seleccionado;
  Uint8List? imagen;
  Timer? _timer;
  bool _actualizando = false;
  int _version = 0;
  @override
  void initState() {
    super.initState(); service = widget.service ?? AvisosResidenteService(); cargar();
    if (widget.actualizarPeriodicamente) {
      _timer = Timer.periodic(const Duration(seconds: 30), (_) => _actualizarLista());
    }
  }
  @override
  void dispose() { _timer?.cancel(); super.dispose(); }
  Future<void> _actualizarLista() async {
    final lifecycle = WidgetsBinding.instance.lifecycleState;
    if (!mounted || _actualizando || avisos == null || seleccionado != null ||
        (lifecycle != null && lifecycle != AppLifecycleState.resumed) ||
        ModalRoute.of(context)?.isCurrent == false) { return; }
    _actualizando = true;
    final version = _version;
    try {
      final data = await service.listar();
      if (mounted && version == _version && seleccionado == null) setState(() { avisos = data; error = null; });
    } catch (_) {
      if (mounted && version == _version && seleccionado == null) setState(() { avisos = []; error = 'No se pudieron cargar los avisos.'; });
    } finally { _actualizando = false; }
  }
  Future<void> cargar() async {
    _version++;
    setState(() { avisos = null; error = null; seleccionado = null; imagen = null; });
    try { final data = await service.listar(); if (mounted) setState(() => avisos = data); }
    catch (_) { if (mounted) setState(() => error = 'No se pudieron cargar los avisos.'); }
  }
  Future<void> abrir(Map<String, dynamic> aviso) async {
    _version++;
    setState(() { seleccionado = aviso; imagen = null; error = null; });
    try {
      await service.leer(aviso['id'] as String);
      if (mounted && seleccionado?['id'] == aviso['id']) {
        setState(() { avisos = avisos?.map((item) => item['id'] == aviso['id']
          ? {...item, 'leida_en': DateTime.now().toIso8601String()} : item).toList(); });
      }
      if (aviso['evidencia_disponible'] == true) {
        final data = await service.evidencia(aviso['id'] as String);
        if (mounted && seleccionado?['id'] == aviso['id']) setState(() => imagen = data);
      }
    } catch (_) { if (mounted && seleccionado?['id'] == aviso['id']) setState(() => error = 'No se pudo cargar la información del aviso.'); }
  }
  @override
  Widget build(BuildContext context) {
    final visibles = (avisos ?? []).where((a) => widget.filtro == FiltroBandeja.todas ||
      (widget.filtro == FiltroBandeja.leidas ? a['leida_en'] != null : a['leida_en'] == null)).toList();
    return Scaffold(
    appBar: AppBar(title: Text(widget.filtro == FiltroBandeja.leidas ? 'Historial de avisos' : 'Mis avisos'),
      bottom: widget.actualizarPeriodicamente ? const PreferredSize(preferredSize: Size.fromHeight(36),
        child: Padding(padding: EdgeInsets.only(bottom: 8), child: Text('Se actualiza cada 30 s',
          style: TextStyle(fontSize: 11)))) : null,
      actions: [IconButton(onPressed: cargar, icon: const Icon(Icons.refresh), tooltip: 'Actualizar')]),
    body: error != null && seleccionado == null ? Center(child: Text(error!))
      : avisos == null ? const Center(child: CircularProgressIndicator())
      : seleccionado != null ? SingleChildScrollView(child: Padding(padding: const EdgeInsets.all(20), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
            Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(
              crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('DETALLE DEL AVISO', style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: Theme.of(context).colorScheme.primary, letterSpacing: 1.2)),
                const SizedBox(height: 10),
                Text(seleccionado!['categoria'] as String, style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 12), Text('Fecha: ${seleccionado!['fecha_evento']}'),
                if (error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(error!)),
                if (imagen != null) Padding(padding: const EdgeInsets.only(top: 16),
                  child: ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.memory(imagen!))),
                if (seleccionado!['evidencia_disponible'] == true && imagen == null && error == null)
                  const Padding(padding: EdgeInsets.only(top: 16), child: CircularProgressIndicator()),
              ],
            ))),
            const SizedBox(height: 12),
            TextButton(onPressed: cargar, child: const Text('Volver a mis avisos')),
          ])))
      : visibles.isEmpty ? Center(child: Text(widget.filtro == FiltroBandeja.leidas
          ? 'No hay avisos leídos.' : widget.filtro == FiltroBandeja.nuevas
          ? 'No tienes avisos nuevos.' : 'No tienes avisos.'))
      : ListView.separated(padding: const EdgeInsets.all(20), itemCount: visibles.length,
          separatorBuilder: (_, _) => const SizedBox(height: 10),
          itemBuilder: (context, index) {
            final a = visibles[index];
            return Card(child: ListTile(
              leading: Icon(Icons.notifications_outlined, color: Theme.of(context).colorScheme.primary),
              title: Text(a['categoria'] as String), subtitle: Text(a['fecha_evento'] as String),
              trailing: const Icon(Icons.chevron_right), onTap: () => abrir(a),
            ));
          }),
  );
  }
}
