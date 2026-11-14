import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../services/alertas_seguridad_service.dart';

class EvidenciaSeguridad extends StatefulWidget {
  final String eventoId;
  final AlertasSeguridadService service;
  const EvidenciaSeguridad({super.key, required this.eventoId, required this.service});

  @override
  State<EvidenciaSeguridad> createState() => _EvidenciaSeguridadState();
}

class _EvidenciaSeguridadState extends State<EvidenciaSeguridad> {
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
