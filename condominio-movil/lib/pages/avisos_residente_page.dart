import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../services/avisos_residente_service.dart';

class AvisosResidentePage extends StatefulWidget {
  final AvisosResidenteService? service;
  const AvisosResidentePage({super.key, this.service});
  @override
  State<AvisosResidentePage> createState() => _AvisosResidentePageState();
}

class _AvisosResidentePageState extends State<AvisosResidentePage> {
  late final AvisosResidenteService service;
  List<Map<String, dynamic>>? avisos;
  String? error;
  Map<String, dynamic>? seleccionado;
  Uint8List? imagen;
  @override
  void initState() { super.initState(); service = widget.service ?? AvisosResidenteService(); cargar(); }
  Future<void> cargar() async {
    setState(() { avisos = null; error = null; seleccionado = null; imagen = null; });
    try { final data = await service.listar(); if (mounted) setState(() => avisos = data); }
    catch (_) { if (mounted) setState(() => error = 'No se pudieron cargar los avisos.'); }
  }
  Future<void> abrir(Map<String, dynamic> aviso) async {
    setState(() { seleccionado = aviso; imagen = null; error = null; });
    try {
      await service.leer(aviso['id'] as String);
      if (aviso['evidencia_disponible'] == true) {
        final data = await service.evidencia(aviso['id'] as String);
        if (mounted && seleccionado?['id'] == aviso['id']) setState(() => imagen = data);
      }
    } catch (_) { if (mounted && seleccionado?['id'] == aviso['id']) setState(() => error = 'No se pudo cargar la información del aviso.'); }
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Mis avisos'), actions: [IconButton(onPressed: cargar, icon: const Icon(Icons.refresh))]),
    body: error != null && seleccionado == null ? Center(child: Text(error!))
      : avisos == null ? const Center(child: CircularProgressIndicator())
      : seleccionado != null ? SingleChildScrollView(child: Padding(padding: const EdgeInsets.all(16), child: Column(
          crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(seleccionado!['categoria'] as String, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12), Text('Fecha: ${seleccionado!['fecha_evento']}'),
            if (error != null) Text(error!),
            if (imagen != null) Image.memory(imagen!),
            if (seleccionado!['evidencia_disponible'] == true && imagen == null && error == null) const CircularProgressIndicator(),
            TextButton(onPressed: cargar, child: const Text('Volver a mis avisos')),
          ])))
      : avisos!.isEmpty ? const Center(child: Text('No tienes avisos.'))
      : ListView(children: avisos!.map((a) => ListTile(title: Text(a['categoria'] as String),
          subtitle: Text(a['fecha_evento'] as String), onTap: () => abrir(a))).toList()),
  );
}
