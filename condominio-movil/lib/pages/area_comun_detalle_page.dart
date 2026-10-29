import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/area_comun.dart';
import '../services/reserva_service.dart';

class AreaComunDetallePage extends StatefulWidget {
  final AreaComun area;

  const AreaComunDetallePage({
    super.key,
    required this.area,
  });

  @override
  State<AreaComunDetallePage> createState() => _AreaComunDetallePageState();
}

class _AreaComunDetallePageState extends State<AreaComunDetallePage> {
  final _formKey = GlobalKey<FormState>();
  DateTime? _fechaSeleccionada;
  TimeOfDay? _horaInicio;
  TimeOfDay? _horaFin;
  bool _isCreatingReserva = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle del Área'),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            _buildDetalles(),
            if (widget.area.estaActivo) ...[
              const Divider(thickness: 8),
              _buildFormularioReserva(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: widget.area.estaActivo
              ? [
                  Theme.of(context).colorScheme.primary,
                  Theme.of(context).colorScheme.secondary,
                ]
              : [Colors.grey.shade600, Colors.grey.shade400],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            _getIconForArea(widget.area.nombre),
            size: 48,
            color: Colors.white,
          ),
          const SizedBox(height: 12),
          Text(
            widget.area.nombre,
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                widget.area.estaActivo ? Icons.check_circle : Icons.cancel,
                size: 20,
                color: Colors.white,
              ),
              const SizedBox(width: 8),
              Text(
                widget.area.estadoDisplay,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDetalles() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Información',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 16),
          if (widget.area.descripcion != null &&
              widget.area.descripcion!.isNotEmpty)
            _buildInfoRow(
              Icons.description,
              'Descripción',
              widget.area.descripcion!,
            ),
          _buildInfoRow(
            Icons.location_on,
            'Ubicación',
            widget.area.ubicacion,
          ),
          _buildInfoRow(
            Icons.people,
            'Capacidad Máxima',
            '${widget.area.capacidadMaxima} personas',
          ),
          _buildInfoRow(
            Icons.access_time,
            'Horario',
            '${widget.area.horarioApertura} - ${widget.area.horarioCierre}',
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            color: Theme.of(context).colorScheme.primary,
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey,
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFormularioReserva() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hacer una Reserva',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            // Mensaje informativo para usuarios
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                border: Border.all(color: Colors.blue.shade200),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.info_outline,
                    color: Colors.blue.shade700,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Esta reserva se registrará automáticamente a tu nombre.',
                      style: TextStyle(
                        color: Colors.blue.shade900,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildFechaSelector(),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildHoraInicioSelector()),
                const SizedBox(width: 16),
                Expanded(child: _buildHoraFinSelector()),
              ],
            ),
            const SizedBox(height: 8),
            // Ayuda sobre reservas que cruzan medianoche
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Text(
                'Las reservas que cruzan medianoche son válidas (ej: 22:00 a 02:00)',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey.shade600,
                      fontSize: 12,
                    ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                icon: _isCreatingReserva
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Icon(Icons.check),
                label: Text(_isCreatingReserva
                    ? 'Creando...'
                    : 'Confirmar Reserva'),
                onPressed: _isCreatingReserva ? null : _confirmarReserva,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFechaSelector() {
    return InkWell(
      onTap: _seleccionarFecha,
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: 'Fecha de la Reserva',
          border: const OutlineInputBorder(),
          prefixIcon: const Icon(Icons.calendar_today),
          suffixIcon: _fechaSeleccionada != null
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    setState(() {
                      _fechaSeleccionada = null;
                    });
                  },
                )
              : null,
        ),
        child: Text(
          _fechaSeleccionada != null
              ? DateFormat('dd/MM/yyyy').format(_fechaSeleccionada!)
              : 'Seleccionar fecha',
          style: TextStyle(
            color: _fechaSeleccionada != null ? null : Colors.grey,
          ),
        ),
      ),
    );
  }

  Widget _buildHoraInicioSelector() {
    return InkWell(
      onTap: () => _seleccionarHora(true),
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: 'Hora Inicio',
          border: const OutlineInputBorder(),
          prefixIcon: const Icon(Icons.access_time),
          suffixIcon: _horaInicio != null
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    setState(() {
                      _horaInicio = null;
                    });
                  },
                )
              : null,
        ),
        child: Text(
          _horaInicio != null
              ? _horaInicio!.format(context)
              : 'Seleccionar',
          style: TextStyle(
            color: _horaInicio != null ? null : Colors.grey,
          ),
        ),
      ),
    );
  }

  Widget _buildHoraFinSelector() {
    return InkWell(
      onTap: () => _seleccionarHora(false),
      child: InputDecorator(
        decoration: InputDecoration(
          labelText: 'Hora Fin',
          border: const OutlineInputBorder(),
          prefixIcon: const Icon(Icons.access_time),
          suffixIcon: _horaFin != null
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    setState(() {
                      _horaFin = null;
                    });
                  },
                )
              : null,
        ),
        child: Text(
          _horaFin != null ? _horaFin!.format(context) : 'Seleccionar',
          style: TextStyle(
            color: _horaFin != null ? null : Colors.grey,
          ),
        ),
      ),
    );
  }

  Future<void> _seleccionarFecha() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );

    if (picked != null) {
      setState(() {
        _fechaSeleccionada = picked;
      });
    }
  }

  Future<void> _seleccionarHora(bool esInicio) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
      builder: (BuildContext context, Widget? child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (esInicio) {
          _horaInicio = picked;
        } else {
          _horaFin = picked;
        }
      });
    }
  }

  Future<void> _confirmarReserva() async {
    if (_fechaSeleccionada == null) {
      _showError('Por favor selecciona una fecha');
      return;
    }

    if (_horaInicio == null) {
      _showError('Por favor selecciona la hora de inicio');
      return;
    }

    if (_horaFin == null) {
      _showError('Por favor selecciona la hora de fin');
      return;
    }

    setState(() {
      _isCreatingReserva = true;
    });

    // Formatear la fecha y horas
    final fechaStr = DateFormat('yyyy-MM-dd').format(_fechaSeleccionada!);
    final horaInicioStr =
        '${_horaInicio!.hour.toString().padLeft(2, '0')}:${_horaInicio!.minute.toString().padLeft(2, '0')}:00';
    final horaFinStr =
        '${_horaFin!.hour.toString().padLeft(2, '0')}:${_horaFin!.minute.toString().padLeft(2, '0')}:00';

    final result = await ReservaService.crearReserva(
      areaComun: widget.area.id,
      fechaReserva: fechaStr,
      horaInicio: horaInicioStr,
      horaFin: horaFinStr,
    );

    setState(() {
      _isCreatingReserva = false;
    });

    if (!mounted) return;

    if (result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Reserva creada exitosamente'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context, true);
    } else {
      _showError(result['message'] ?? 'Error al crear la reserva');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  IconData _getIconForArea(String nombre) {
    final nombreLower = nombre.toLowerCase();
    if (nombreLower.contains('piscina') || nombreLower.contains('alberca')) {
      return Icons.pool;
    } else if (nombreLower.contains('gym') ||
        nombreLower.contains('gimnasio')) {
      return Icons.fitness_center;
    } else if (nombreLower.contains('salon') ||
        nombreLower.contains('salón') ||
        nombreLower.contains('eventos')) {
      return Icons.event;
    } else if (nombreLower.contains('cancha') ||
        nombreLower.contains('deportiva')) {
      return Icons.sports_soccer;
    } else if (nombreLower.contains('bbq') ||
        nombreLower.contains('parrilla') ||
        nombreLower.contains('asador')) {
      return Icons.outdoor_grill;
    } else if (nombreLower.contains('juegos') ||
        nombreLower.contains('niños')) {
      return Icons.child_care;
    } else {
      return Icons.meeting_room;
    }
  }
}
