import 'package:flutter/material.dart';
import '../models/objeto_perdido_model.dart';
import '../services/objeto_perdido_service.dart';

class ObjetoPerdidoDetallePage extends StatefulWidget {
  final int objetoId;
  final VoidCallback onToggleTheme;
  final bool isDark;

  const ObjetoPerdidoDetallePage({
    super.key,
    required this.objetoId,
    required this.onToggleTheme,
    required this.isDark,
  });

  @override
  State<ObjetoPerdidoDetallePage> createState() => _ObjetoPerdidoDetallePageState();
}

class _ObjetoPerdidoDetallePageState extends State<ObjetoPerdidoDetallePage> {
  ObjetoPerdido? _objeto;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _cargarObjeto();
  }

  Future<void> _cargarObjeto() async {
    setState(() {
      _isLoading = true;
    });

    final result = await ObjetoPerdidoService.getObjetoPerdido(widget.objetoId);

    if (result['success']) {
      setState(() {
        _objeto = result['data'];
        _isLoading = false;
      });
    } else {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'])),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle del Objeto'),
        actions: [
          IconButton(
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: widget.onToggleTheme,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _objeto == null
              ? const Center(child: Text('No se pudo cargar el objeto'))
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Imagen principal
                      Image.network(
                        _objeto!.foto,
                        width: double.infinity,
                        height: 300,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: double.infinity,
                            height: 300,
                            color: Colors.grey[300],
                            child: const Icon(Icons.image_not_supported, size: 80),
                          );
                        },
                      ),

                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Título y estado
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    _objeto!.titulo,
                                    style: const TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: _objeto!.isPendiente
                                        ? Colors.orange.withOpacity(0.2)
                                        : Colors.green.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: _objeto!.isPendiente ? Colors.orange : Colors.green,
                                    ),
                                  ),
                                  child: Text(
                                    _objeto!.estadoDisplay,
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: _objeto!.isPendiente ? Colors.orange[800] : Colors.green[800],
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),

                            // Descripción
                            const Text(
                              'Descripción',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _objeto!.descripcion ?? 'Sin descripción',
                              style: const TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 24),

                            // Lugar encontrado
                            _buildInfoRow(
                              Icons.location_on,
                              'Lugar encontrado',
                              _objeto!.lugarEncontrado,
                            ),
                            const SizedBox(height: 16),

                            // Fecha encontrado
                            _buildInfoRow(
                              Icons.calendar_today,
                              'Fecha encontrado',
                              _formatearFecha(_objeto!.fechaEncontrado),
                            ),

                            // Si está entregado, mostrar información de entrega
                            if (_objeto!.isEntregado) ...[
                              const SizedBox(height: 24),
                              const Divider(),
                              const SizedBox(height: 16),
                              const Text(
                                'Información de entrega',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 16),
                              _buildInfoRow(
                                Icons.person,
                                'Entregado a',
                                _objeto!.entregadoA ?? 'No especificado',
                              ),
                              const SizedBox(height: 16),
                              _buildInfoRow(
                                Icons.event,
                                'Fecha de entrega',
                                _objeto!.fechaEntrega != null
                                    ? _formatearFecha(_objeto!.fechaEntrega!)
                                    : 'No especificada',
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: Colors.grey[600]),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _formatearFecha(String fecha) {
    try {
      final dt = DateTime.parse(fecha);
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return fecha;
    }
  }
}
