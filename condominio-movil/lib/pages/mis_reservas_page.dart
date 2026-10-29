import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/reserva_area_comun.dart';
import '../services/reserva_service.dart';

class MisReservasPage extends StatefulWidget {
  const MisReservasPage({super.key});

  @override
  State<MisReservasPage> createState() => _MisReservasPageState();
}

class _MisReservasPageState extends State<MisReservasPage> {
  List<ReservaAreaComun> _reservas = [];
  List<ReservaAreaComun> _reservasFiltradas = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _filtroSeleccionado = 'Todas';

  @override
  void initState() {
    super.initState();
    _cargarReservas();
  }

  Future<void> _cargarReservas() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await ReservaService.getReservas();

    if (!mounted) return;
    
    setState(() {
      _isLoading = false;
      if (result['success']) {
        _reservas = result['data'] as List<ReservaAreaComun>;
        _aplicarFiltro();
      } else {
        _errorMessage = result['message'];
      }
    });
  }

  void _aplicarFiltro() {
    if (!mounted) return;
    
    setState(() {
      switch (_filtroSeleccionado) {
        case 'Activas':
          _reservasFiltradas = ReservaService.getReservasActivas(_reservas);
          break;
        case 'Pendientes':
          _reservasFiltradas = ReservaService.filterReservasByEstado(
            _reservas,
            'PENDIENTE',
          );
          break;
        case 'Confirmadas':
          _reservasFiltradas = ReservaService.filterReservasByEstado(
            _reservas,
            'CONFIRMADA',
          );
          break;
        case 'Canceladas':
          _reservasFiltradas = ReservaService.filterReservasByEstado(
            _reservas,
            'CANCELADA',
          );
          break;
        case 'Completadas':
          _reservasFiltradas = ReservaService.filterReservasByEstado(
            _reservas,
            'COMPLETADA',
          );
          break;
        default:
          _reservasFiltradas = List.from(_reservas);
      }

      _reservasFiltradas = ReservaService.sortReservasByFecha(
        _reservasFiltradas,
        ascending: false,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Reservas'),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.filter_list),
            onSelected: (value) {
              setState(() {
                _filtroSeleccionado = value;
                _aplicarFiltro();
              });
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'Todas', child: Text('Todas')),
              const PopupMenuItem(value: 'Activas', child: Text('Activas')),
              const PopupMenuItem(
                  value: 'Pendientes', child: Text('Pendientes')),
              const PopupMenuItem(
                  value: 'Confirmadas', child: Text('Confirmadas')),
              const PopupMenuItem(
                  value: 'Canceladas', child: Text('Canceladas')),
              const PopupMenuItem(
                  value: 'Completadas', child: Text('Completadas')),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _cargarReservas,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.error_outline,
                        size: 64,
                        color: Theme.of(context).colorScheme.error,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _errorMessage!,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.error,
                        ),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.refresh),
                        label: const Text('Reintentar'),
                        onPressed: _cargarReservas,
                      ),
                    ],
                  ),
                )
              : _reservasFiltradas.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.event_busy,
                            size: 64,
                            color: Theme.of(context).colorScheme.secondary,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _filtroSeleccionado == 'Todas'
                                ? 'No tienes reservas'
                                : 'No hay reservas $_filtroSeleccionado',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    )
                  : Column(
                      children: [
                        if (_filtroSeleccionado != 'Todas')
                          Container(
                            padding: const EdgeInsets.all(8),
                            color:
                                Theme.of(context).colorScheme.primaryContainer,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.filter_list, size: 16),
                                const SizedBox(width: 8),
                                Text(
                                  'Mostrando: $_filtroSeleccionado',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Theme.of(context)
                                        .colorScheme
                                        .onPrimaryContainer,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        Expanded(
                          child: RefreshIndicator(
                            onRefresh: _cargarReservas,
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _reservasFiltradas.length,
                              itemBuilder: (context, index) {
                                final reserva = _reservasFiltradas[index];
                                return _buildReservaCard(reserva);
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
    );
  }

  Widget _buildReservaCard(ReservaAreaComun reserva) {
    final fecha = DateTime.parse(reserva.fechaReserva);
    final esProxima = fecha.isAfter(DateTime.now());

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: reserva.estaActiva ? 4 : 1,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        reserva.nombreArea ?? 'Área Común',
                        style:
                            Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Reserva #${reserva.id}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey,
                            ),
                      ),
                    ],
                  ),
                ),
                _buildEstadoChip(reserva.estadoReserva),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 12),
            _buildInfoRow(
              Icons.calendar_today,
              'Fecha',
              DateFormat('dd/MM/yyyy').format(fecha),
            ),
            const SizedBox(height: 8),
            _buildInfoRow(
              Icons.access_time,
              'Horario',
              '${reserva.horaInicio.substring(0, 5)} - ${reserva.horaFin.substring(0, 5)}',
            ),
            const SizedBox(height: 8),
            _buildInfoRow(
              Icons.info_outline,
              'Registrada',
              DateFormat('dd/MM/yyyy HH:mm')
                  .format(DateTime.parse(reserva.fechaRegistro)),
            ),
            if (reserva.puedeSerCancelada && esProxima) ...[
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  icon: const Icon(Icons.cancel),
                  label: const Text('Cancelar Reserva'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                  ),
                  onPressed: () => _confirmarCancelacion(reserva),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Theme.of(context).colorScheme.secondary),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: const TextStyle(
            fontWeight: FontWeight.w600,
          ),
        ),
        Expanded(
          child: Text(value),
        ),
      ],
    );
  }

  Widget _buildEstadoChip(String estado) {
    Color color;
    IconData icon;

    switch (estado) {
      case 'PENDIENTE':
        color = Colors.orange;
        icon = Icons.pending;
        break;
      case 'CONFIRMADA':
        color = Colors.green;
        icon = Icons.check_circle;
        break;
      case 'CANCELADA':
        color = Colors.red;
        icon = Icons.cancel;
        break;
      case 'COMPLETADA':
        color = Colors.blue;
        icon = Icons.done_all;
        break;
      default:
        color = Colors.grey;
        icon = Icons.help;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 4),
          Text(
            estado,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmarCancelacion(ReservaAreaComun reserva) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancelar Reserva'),
        content: Text(
          '¿Estás seguro de que deseas cancelar la reserva de ${reserva.nombreArea} para el ${DateFormat('dd/MM/yyyy').format(DateTime.parse(reserva.fechaReserva))}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('No'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('Sí, Cancelar'),
          ),
        ],
      ),
    );

    if (confirmar == true) {
      _cancelarReserva(reserva.id);
    }
  }

  Future<void> _cancelarReserva(int reservaId) async {
    // Mostrar indicador de carga
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    final result = await ReservaService.cancelarReserva(reservaId);

    if (!mounted) return;
    Navigator.pop(context); // Cerrar diálogo de carga

    if (result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Reserva cancelada exitosamente'),
          backgroundColor: Colors.green,
        ),
      );
      _cargarReservas(); // Recargar lista
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Error al cancelar la reserva'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
