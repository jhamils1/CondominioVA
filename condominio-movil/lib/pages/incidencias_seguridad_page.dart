import 'dart:async';

import 'package:flutter/material.dart';
import '../services/alertas_seguridad_service.dart';
import '../widgets/evidencia_seguridad.dart';

class IncidenciasSeguridadPage extends StatefulWidget {
  final bool historial;
  final AlertasSeguridadService? service;
  final bool puedeConfirmar;
  final VoidCallback? onConfirmada;
  const IncidenciasSeguridadPage({super.key, this.historial = false, this.service, this.puedeConfirmar = false, this.onConfirmada});

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
  bool confirmando = false;
  String? errorConfirmacion;
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
    if (!silencioso) setState(() { cargando = true; error = null; detalle = null; errorConfirmacion = null; });
    try {
      final lista = await service.listarEventos();
      if (!mounted || actual != version) return;
      setState(() {
        eventos = lista;
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
    setState(() { cargando = true; error = null; errorConfirmacion = null; });
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

  Future<void> confirmar() async {
    if (confirmando || detalle == null || !widget.puedeConfirmar || detalle!.estado != 'PENDIENTE_REVISION') return;
    setState(() { confirmando = true; errorConfirmacion = null; });
    final aprobada = await showDialog<bool>(context: context, builder: (context) => AlertDialog(
      title: const Text('Confirmar incidencia'),
      content: const Text('Confirma solo si ya revisaste la imagen y los datos de la incidencia. Se notificará al administrador.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Confirmar')),
      ],
    ));
    if (!mounted) return;
    if (aprobada != true || detalle == null) { setState(() { confirmando = false; }); return; }
    final id = detalle!.id;
    try {
      await service.confirmarEvento(id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Incidencia confirmada. Ahora está en Historial.')));
      widget.onConfirmada?.call();
      if (widget.onConfirmada == null) await cargar();
    } on AlertasException catch (e) {
      if (!mounted) return;
      if (e.mensaje == 'La sesión venció. Inicia sesión nuevamente.' || e.mensaje == 'No tienes acceso a esta información.') {
        setState(() { eventos = null; detalle = null; error = e.mensaje; });
      } else {
        setState(() { errorConfirmacion = '${e.mensaje} Actualiza el detalle antes de volver a intentar.'; });
      }
    } finally {
      if (mounted) setState(() { confirmando = false; });
    }
  }

  Future<void> retirarHistorial(DetalleEventoSeguridad evento) async {
    if (confirmando) return;
    final aceptado = await showDialog<bool>(context: context, builder: (context) => AlertDialog(
      title: const Text('Retirar del historial'),
      content: const Text('Se retirará para todos y se conservará el registro de auditoría.'),
      actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Retirar'))],
    ));
    if (!mounted || aceptado != true) return;
    final id = evento.id;
    setState(() { confirmando = true; });
    try {
      await service.retirarHistorial(id);
      if (!mounted) return;
      setState(() { detalle = null; });
      await cargar();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Incidencia retirada del historial.')));
    } on AlertasException catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.mensaje)));
    } finally { if (mounted) setState(() { confirmando = false; }); }
  }

  Future<void> opcionesHistorial(DetalleEventoSeguridad evento) async {
    if (confirmando) return;
    final retirar = await showModalBottomSheet<bool>(context: context, builder: (context) => SafeArea(
      child: ListTile(leading: const Icon(Icons.delete_outline), title: const Text('Eliminar del historial'),
        onTap: () => Navigator.pop(context, true)),
    ));
    if (retirar == true && mounted) await retirarHistorial(evento);
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
    final visibles = eventos?.where((evento) => widget.historial
        ? {'CONFIRMADA', 'EN_ATENCION', 'RESUELTA'}.contains(evento.estado)
        : evento.estado == 'PENDIENTE_REVISION').toList();
    return SafeArea(child: Column(children: [
      Padding(padding: const EdgeInsets.fromLTRB(16, 12, 8, 8), child: Row(children: [
        if (detalle != null) IconButton(onPressed: confirmando ? null : cargar, icon: const Icon(Icons.arrow_back), tooltip: 'Volver a la lista'),
        Expanded(child: Text(detalle == null ? titulo : 'Detalle de incidencia', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold))),
        IconButton(onPressed: confirmando ? null : cargar, icon: const Icon(Icons.refresh), tooltip: 'Actualizar'),
      ])),
      if (widget.historial && detalle == null && error == null && !cargando && visibles != null && visibles.isNotEmpty)
        const Padding(padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Text('Mantén pulsada una incidencia para retirarla del historial.')),
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
        if (widget.puedeConfirmar && detalle!.estado == 'PENDIENTE_REVISION') ...[
          const SizedBox(height: 20),
          if (errorConfirmacion != null) Text(errorConfirmacion!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          FilledButton(onPressed: confirmando || errorConfirmacion != null ? null : confirmar,
            child: Text(confirmando ? 'Confirmando…' : 'Confirmar incidencia')),
          if (errorConfirmacion != null) TextButton(onPressed: () { errorConfirmacion = null; abrir(detalle!); }, child: const Text('Actualizar detalle')),
        ],
      ]))
      else Expanded(child: RefreshIndicator(
        onRefresh: () => cargar(silencioso: true),
        child: visibles == null || visibles.isEmpty
          ? ListView(physics: const AlwaysScrollableScrollPhysics(), children: [
              SizedBox(height: 240, child: Center(child: Padding(padding: const EdgeInsets.all(24),
                child: Text(widget.historial ? 'No hay incidencias confirmadas.' : 'No hay incidencias pendientes de revisión.', textAlign: TextAlign.center)))),
            ])
          : ListView.separated(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24), itemCount: visibles.length,
        separatorBuilder: (_, _) => const SizedBox(height: 8),
        itemBuilder: (context, index) {
          final evento = visibles[index];
          return Card(child: ListTile(
            leading: Icon(widget.historial ? Icons.task_alt : Icons.warning_amber_rounded),
            title: Text(evento.categoria, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${estado(evento.estado)} · ${evento.fecha}${evento.ubicacion.isEmpty ? '' : '\n${evento.ubicacion}'}'),
            isThreeLine: evento.ubicacion.isNotEmpty,
            trailing: const Icon(Icons.chevron_right), onTap: () => abrir(evento),
            onLongPress: widget.historial && !confirmando ? () => opcionesHistorial(evento) : null,
          ));
        },
      ))),
      if (!widget.historial && detalle == null && error == null) const Padding(
        padding: EdgeInsets.fromLTRB(12, 4, 12, 8),
        child: Text('Se actualiza cada 30 segundos mientras esta pantalla está abierta.', textAlign: TextAlign.center),
      ),
    ]));
  }
}
