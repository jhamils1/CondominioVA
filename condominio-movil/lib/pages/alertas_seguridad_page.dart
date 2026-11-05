import 'package:flutter/material.dart';
import 'dart:typed_data';
import '../services/alertas_seguridad_service.dart';

class AlertasSeguridadPage extends StatefulWidget {
  final AlertasSeguridadService? service;
  const AlertasSeguridadPage({super.key, this.service});

  @override
  State<AlertasSeguridadPage> createState() => _AlertasSeguridadPageState();
}

class _AlertasSeguridadPageState extends State<AlertasSeguridadPage> {
  late final AlertasSeguridadService service;
  List<AlertaSeguridad> alertas = [];
  DetalleEventoSeguridad? detalle;
  String? error;
  bool loading = true;

  @override
  void initState() {
    super.initState();
    service = widget.service ?? AlertasSeguridadService();
    cargar();
  }

  Future<void> cargar() async {
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
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Alertas de seguridad'), actions: [
      IconButton(onPressed: loading ? null : cargar, icon: const Icon(Icons.refresh), tooltip: 'Actualizar'),
    ]),
    body: loading ? const Center(child: CircularProgressIndicator())
      : error != null ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
          Padding(padding: const EdgeInsets.all(16), child: Text(error!, textAlign: TextAlign.center)),
          ElevatedButton(onPressed: cargar, child: const Text('Reintentar')),
        ]))
      : detalle != null ? SingleChildScrollView(child: Padding(
          padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(detalle!.categoria, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12), Text(detalle!.descripcion),
            const SizedBox(height: 12), Text('Estado: ${detalle!.estado}'),
            Text('Fecha: ${detalle!.fecha}'),
            if (detalle!.evidenciaDisponible) ...[
              const SizedBox(height: 16),
              Text('Evidencia del evento', style: Theme.of(context).textTheme.titleMedium),
              _EvidenciaEvento(key: ValueKey(detalle!.id), eventoId: detalle!.id, service: service),
            ],
            TextButton(onPressed: () => setState(() { detalle = null; }), child: const Text('Volver a las alertas')),
          ])))
      : alertas.isEmpty ? const Center(child: Text('No hay alertas de seguridad.'))
      : ListView.builder(itemCount: alertas.length, itemBuilder: (context, index) {
          final alerta = alertas[index];
          return ListTile(
            title: Text(alerta.mensaje),
            subtitle: Text('${alerta.leida ? 'Leída' : 'Sin leer'} · ${alerta.creada}'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => abrir(alerta),
          );
        }),
  );
}

class _EvidenciaEvento extends StatefulWidget {
  final String eventoId;
  final AlertasSeguridadService service;
  const _EvidenciaEvento({super.key, required this.eventoId, required this.service});

  @override
  State<_EvidenciaEvento> createState() => _EvidenciaEventoState();
}

class _EvidenciaEventoState extends State<_EvidenciaEvento> {
  late Future<Uint8List?> imagen;
  Uint8List? ultimaImagen;

  Future<Uint8List?> cargarImagen() async {
    try {
      final bytes = await widget.service.obtenerEvidencia(widget.eventoId);
      if (mounted) ultimaImagen = bytes;
      return bytes;
    } catch (_) {
      return null;
    }
  }

  @override
  void initState() {
    super.initState();
    imagen = cargarImagen();
  }

  @override
  void dispose() {
    if (ultimaImagen != null) PaintingBinding.instance.imageCache.evict(MemoryImage(ultimaImagen!));
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<Uint8List?>(
    future: imagen,
    builder: (context, resultado) {
      if (resultado.connectionState != ConnectionState.done) {
        return const Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator());
      }
      if (resultado.hasError || resultado.data == null) {
        return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('No se pudo cargar la evidencia.'),
          TextButton(onPressed: () => setState(() { imagen = cargarImagen(); }),
              child: const Text('Reintentar evidencia')),
        ]);
      }
      return Image.memory(resultado.data!, semanticLabel: 'Fotograma de evidencia del evento',
          errorBuilder: (context, error, stack) => const Text('No se pudo mostrar la evidencia.'));
    },
  );
}
