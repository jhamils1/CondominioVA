import 'dart:async';

import 'package:flutter/material.dart';
import '../services/alertas_seguridad_service.dart';
import '../widgets/evidencia_seguridad.dart';

class IncidenciasSeguridadPage extends StatefulWidget {
  final bool historial;
  final AlertasSeguridadService? service;
  const IncidenciasSeguridadPage({super.key, this.historial = false, this.service});

  @override
  State<IncidenciasSeguridadPage> createState() => _IncidenciasSeguridadPageState();
}

class _IncidenciasSeguridadPageState extends State<IncidenciasSeguridadPage> with WidgetsBindingObserver {
  late final AlertasSeguridadService service = widget.service ?? AlertasSeguridadService();
  List<DetalleEventoSeguridad>? eventos;
  DetalleEventoSeguridad? detalle;
  String? error;
  bool cargando = true;
  bool consultando = false;
  int version = 0;
  Timer? timer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    cargar();
    if (!widget.historial) {
      timer = Timer.periodic(const Duration(seconds: 30), (_) {
        if (detalle == null && !consultando && ModalRoute.of(context)?.isCurrent == true &&
            WidgetsBinding.instance.lifecycleState != AppLifecycleState.paused &&
            WidgetsBinding.instance.lifecycleState != AppLifecycleState.inactive &&
            WidgetsBinding.instance.lifecycleState != AppLifecycleState.hidden) {
          cargar(silencioso: true);
        }
      });
    }
  }

  @override
  void dispose() {
    version++;
    timer?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  Future<void> cargar({bool silencioso = false}) async {
    final actual = ++version;
    consultando = true;
    if (!silencioso) setState(() { cargando = true; error = null; detalle = null; });
    try {
      final lista = await service.listarEventos();
      if (!mounted || actual != version) return;
      const finalizados = {'RESUELTA', 'FALSO_POSITIVO'};
      setState(() {
        eventos = lista.where((e) => finalizados.contains(e.estado) == widget.historial).toList();
        error = null;
        cargando = false;
      });
    } on AlertasException catch (e) {
      if (!mounted || actual != version) return;
      setState(() { eventos = null; detalle = null; error = e.mensaje; cargando = false; });
    } finally {
      if (actual == version) consultando = false;
    }
  }

  Future<void> abrir(DetalleEventoSeguridad evento) async {
    final actual = ++version;
    setState(() { cargando = true; error = null; });
    try {
      final resultado = await service.obtenerEvento(evento.id);
      if (!mounted || actual != version) return;
      setState(() { detalle = resultado; cargando = false; });
    } on AlertasException catch (e) {
      if (!mounted || actual != version) return;
      setState(() { eventos = null; detalle = null; error = e.mensaje; cargando = false; });
    } finally {
      if (actual == version) consultando = false;
    }
  }

  String estado(String valor) => switch (valor) {
    'PENDIENTE_REVISION' => 'Pendiente de revisión',
    'CONFIRMADA' => 'Confirmada',
    'EN_ATENCION' => 'En atención',
    'RESUELTA' => 'Resuelta',
    'FALSO_POSITIVO' => 'Descartada',
    _ => 'Estado no disponible',
  };

  @override
  Widget build(BuildContext context) {
    final titulo = widget.historial ? 'Historial de incidencias' : 'Incidencias activas';
    return SafeArea(child: Column(children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 12, 8, 8), child: Row(children: [
        if (detalle != null) IconButton(onPressed: cargar, icon: const Icon(Icons.arrow_back), tooltip: 'Volver a la lista'),
        Expanded(child: Text(detalle == null ? titulo : 'Detalle de incidencia', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold))),
        IconButton(onPressed: cargar, icon: const Icon(Icons.refresh), tooltip: 'Actualizar'),
      ])),
      if (cargando) const Expanded(child: Center(child: CircularProgressIndicator()))
      else if (error != null) Expanded(child: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
        Padding(padding: const EdgeInsets.all(16), child: Text(error!, textAlign: TextAlign.center)),
        TextButton(onPressed: cargar, child: const Text('Reintentar')),
      ])))
      else if (detalle != null) Expanded(child: ListView(padding: const EdgeInsets.all(16), children: [
        Text(detalle!.categoria, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        Text('Estado: ${estado(detalle!.estado)}'),
        const SizedBox(height: 8),
        Text('Fecha: ${detalle!.fecha}'),
        if (detalle!.ubicacion.isNotEmpty) Text('Ubicación: ${detalle!.ubicacion}'),
        if (detalle!.camara.isNotEmpty) Text('Cámara: ${detalle!.camara}'),
        if (detalle!.prioridad.isNotEmpty) Text('Prioridad: ${detalle!.prioridad}'),
        const SizedBox(height: 16),
        Text(detalle!.descripcion),
        if (detalle!.evidenciaDisponible) ...[const SizedBox(height: 16), const Text('Evidencia'),
          EvidenciaSeguridad(key: ValueKey(detalle!.id), eventoId: detalle!.id, service: service)],
      ]))
      else if (eventos == null || eventos!.isEmpty) Expanded(child: Center(child: Padding(
        padding: const EdgeInsets.all(24), child: Text(widget.historial ? 'Todavía no hay incidencias resueltas o descartadas.' : 'No hay incidencias pendientes o en atención.', textAlign: TextAlign.center))))
      else Expanded(child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24), itemCount: eventos!.length,
        separatorBuilder: (_, _) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final evento = eventos![index];
          return Card(child: ListTile(
            leading: Icon(widget.historial ? Icons.task_alt : Icons.warning_amber_rounded),
            title: Text(evento.categoria, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${estado(evento.estado)} · ${evento.fecha}${evento.ubicacion.isEmpty ? '' : '\n${evento.ubicacion}'}'),
            isThreeLine: evento.ubicacion.isNotEmpty,
            trailing: const Icon(Icons.chevron_right), onTap: () => abrir(evento),
          ));
        },
      )),
      if (!widget.historial && detalle == null && error == null) const Padding(
        padding: EdgeInsets.fromLTRB(12, 4, 12, 8),
        child: Text('Se actualiza cada 30 segundos mientras esta pantalla está abierta.', textAlign: TextAlign.center),
      ),
    ]));
  }
}
