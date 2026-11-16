import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import '../config/api_config.dart';
import '../services/auth_service.dart';

class ClipSeguridad extends StatefulWidget {
  final String eventoId;
  const ClipSeguridad({super.key, required this.eventoId});

  @override
  State<ClipSeguridad> createState() => _ClipSeguridadState();
}

class _ClipSeguridadState extends State<ClipSeguridad> {
  VideoPlayerController? controlador;
  bool cargando = true;
  bool error = false;

  @override
  void initState() { super.initState(); cargar(); }

  Future<void> cargar() async {
    final token = await AuthService.getAccessToken();
    if (!mounted) return;
    if (token == null || token.isEmpty) { setState(() { cargando = false; error = true; }); return; }
    final video = VideoPlayerController.networkUrl(
      Uri.parse('${ApiConfig.baseUrl}/eventos-seguridad/${widget.eventoId}/clip/'),
      httpHeaders: {'Authorization': 'Bearer $token'},
    );
    controlador = video;
    try {
      await video.initialize();
      if (mounted) setState(() { cargando = false; error = false; });
    } catch (_) {
      if (mounted) setState(() { cargando = false; error = true; });
    }
  }

  @override
  void dispose() { controlador?.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    if (cargando) return const Center(child: CircularProgressIndicator());
    if (error || controlador == null) return const Text('No se pudo abrir el clip. Actualiza el detalle e intenta nuevamente.');
    final video = controlador!;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      AspectRatio(aspectRatio: video.value.aspectRatio, child: VideoPlayer(video)),
      ValueListenableBuilder<VideoPlayerValue>(valueListenable: video, builder: (context, value, _) =>
        IconButton(tooltip: value.isPlaying ? 'Pausar clip' : 'Reproducir clip',
          icon: Icon(value.isPlaying ? Icons.pause_circle : Icons.play_circle),
          onPressed: () => value.isPlaying ? video.pause() : video.play())),
    ]);
  }
}
