import 'package:flutter/material.dart';
import '../services/visitas_operativas_service.dart';

class VisitasOperativasPage extends StatefulWidget {
  final Future<List<VisitaOperativa>> Function()? cargar;
  const VisitasOperativasPage({super.key, this.cargar});

  @override
  State<VisitasOperativasPage> createState() => _VisitasOperativasPageState();
}

class _VisitasOperativasPageState extends State<VisitasOperativasPage> {
  late Future<List<VisitaOperativa>> visitas;

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  void _cargar() {
    visitas = (widget.cargar ?? VisitasOperativasService().listar)();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Visitas pendientes y activas'), actions: [
      IconButton(onPressed: () => setState(_cargar), icon: const Icon(Icons.refresh), tooltip: 'Actualizar'),
    ]),
    body: FutureBuilder<List<VisitaOperativa>>(
      future: visitas,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) return const Center(child: CircularProgressIndicator());
        if (snapshot.hasError) {
          final error = snapshot.error;
          return Center(child: Text(error is VisitasOperativasException ? error.message : 'No se pudieron consultar las visitas.'));
        }
        final items = snapshot.data ?? [];
        if (items.isEmpty) return const Center(child: Text('No hay visitas pendientes o activas.'));
        return ListView.builder(itemCount: items.length, itemBuilder: (context, index) {
          final item = items[index];
          return ListTile(title: Text(item.visitante), subtitle: Text('Recibe: ${item.recibe}\nEstado: ${item.estado}\nEntrada: ${item.entrada}'), isThreeLine: true);
        });
      },
    ),
  );
}
