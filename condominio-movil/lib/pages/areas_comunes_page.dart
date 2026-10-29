import 'package:flutter/material.dart';
import '../models/area_comun.dart';
import '../services/area_comun_service.dart';
import 'area_comun_detalle_page.dart';

class AreasComunesPage extends StatefulWidget {
  const AreasComunesPage({super.key});

  @override
  State<AreasComunesPage> createState() => _AreasComunesPageState();
}

class _AreasComunesPageState extends State<AreasComunesPage> {
  List<AreaComun> _areas = [];
  List<AreaComun> _areasFiltradas = [];
  bool _isLoading = true;
  String? _errorMessage;
  bool _soloActivas = true;

  @override
  void initState() {
    super.initState();
    _cargarAreas();
  }

  Future<void> _cargarAreas() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await AreaComunService.getAreas();

    if (!mounted) return;
    
    setState(() {
      _isLoading = false;
      if (result['success']) {
        _areas = result['data'] as List<AreaComun>;
        _aplicarFiltro();
      } else {
        _errorMessage = result['message'];
      }
    });
  }

  void _aplicarFiltro() {
    if (!mounted) return;
    
    setState(() {
      if (_soloActivas) {
        _areasFiltradas = AreaComunService.filterAreasByEstado(
          _areas,
          activas: true,
        );
      } else {
        _areasFiltradas = List.from(_areas);
      }

      _areasFiltradas = AreaComunService.sortAreasByNombre(_areasFiltradas);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Áreas Comunes'),
        actions: [
          IconButton(
            icon: Icon(_soloActivas ? Icons.visibility : Icons.visibility_off),
            tooltip: _soloActivas ? 'Mostrar todas' : 'Solo activas',
            onPressed: () {
              setState(() {
                _soloActivas = !_soloActivas;
                _aplicarFiltro();
              });
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _cargarAreas,
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
                        onPressed: _cargarAreas,
                      ),
                    ],
                  ),
                )
              : _areasFiltradas.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.location_city,
                            size: 64,
                            color: Theme.of(context).colorScheme.secondary,
                          ),
                          const SizedBox(height: 16),
                          Text(
                            _soloActivas
                                ? 'No hay áreas activas disponibles'
                                : 'No hay áreas comunes registradas',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _cargarAreas,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _areasFiltradas.length,
                        itemBuilder: (context, index) {
                          final area = _areasFiltradas[index];
                          return _buildAreaCard(area);
                        },
                      ),
                    ),
    );
  }

  Widget _buildAreaCard(AreaComun area) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => AreaComunDetallePage(area: area),
            ),
          ).then((_) => _cargarAreas());
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    _getIconForArea(area.nombre),
                    size: 32,
                    color: area.estaActivo
                        ? Theme.of(context).colorScheme.primary
                        : Colors.grey,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          area.nombre,
                          style: Theme.of(context)
                              .textTheme
                              .titleLarge
                              ?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              area.estaActivo
                                  ? Icons.check_circle
                                  : Icons.cancel,
                              size: 16,
                              color: area.estaActivo
                                  ? Colors.green
                                  : Colors.red,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              area.estadoDisplay,
                              style: TextStyle(
                                color: area.estaActivo
                                    ? Colors.green
                                    : Colors.red,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              if (area.descripcion != null && area.descripcion!.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    area.descripcion!,
                    style: Theme.of(context).textTheme.bodyMedium,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              const Divider(),
              Row(
                children: [
                  Expanded(
                    child: _buildInfoChip(
                      Icons.location_on,
                      area.ubicacion,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildInfoChip(
                      Icons.people,
                      'Cap: ${area.capacidadMaxima}',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              _buildInfoChip(
                Icons.access_time,
                '${area.horarioApertura} - ${area.horarioCierre}',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: Theme.of(context).colorScheme.secondary),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodySmall,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
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
