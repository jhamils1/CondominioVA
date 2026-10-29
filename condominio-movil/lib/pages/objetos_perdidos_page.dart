import 'package:flutter/material.dart';
import '../models/objeto_perdido_model.dart';
import '../services/objeto_perdido_service.dart';
import 'objeto_perdido_detalle_page.dart';

class ObjetosPerdidosPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDark;

  const ObjetosPerdidosPage({
    super.key,
    required this.onToggleTheme,
    required this.isDark,
  });

  @override
  State<ObjetosPerdidosPage> createState() => _ObjetosPerdidosPageState();
}

class _ObjetosPerdidosPageState extends State<ObjetosPerdidosPage> {
  List<ObjetoPerdido> _objetos = [];
  bool _isLoading = true;
  String _filtroEstado = 'todos'; // todos, P, E

  @override
  void initState() {
    super.initState();
    _cargarObjetos();
  }

  Future<void> _cargarObjetos() async {
    setState(() {
      _isLoading = true;
    });

    String? estado;
    if (_filtroEstado != 'todos') {
      estado = _filtroEstado;
    }

    final result = await ObjetoPerdidoService.getObjetosPerdidos(estado: estado);

    if (result['success']) {
      setState(() {
        _objetos = result['data'];
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
        title: const Text('Objetos Perdidos'),
        actions: [
          IconButton(
            icon: Icon(widget.isDark ? Icons.light_mode : Icons.dark_mode),
            onPressed: widget.onToggleTheme,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filtros
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: _buildFiltroChip('Todos', 'todos'),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildFiltroChip('Pendientes', 'P'),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildFiltroChip('Entregados', 'E'),
                ),
              ],
            ),
          ),

          // Lista de objetos
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _objetos.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.inbox_outlined,
                              size: 80,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No hay objetos perdidos',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _cargarObjetos,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _objetos.length,
                          itemBuilder: (context, index) {
                            return _buildObjetoCard(_objetos[index]);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFiltroChip(String label, String valor) {
    final isSelected = _filtroEstado == valor;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _filtroEstado = valor;
        });
        _cargarObjetos();
      },
      selectedColor: Theme.of(context).primaryColor.withOpacity(0.3),
    );
  }

  Widget _buildObjetoCard(ObjetoPerdido objeto) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ObjetoPerdidoDetallePage(
                objetoId: objeto.id,
                onToggleTheme: widget.onToggleTheme,
                isDark: widget.isDark,
              ),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Imagen
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  objeto.foto,
                  width: 80,
                  height: 80,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 80,
                      height: 80,
                      color: Colors.grey[300],
                      child: const Icon(Icons.image_not_supported),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),

              // Información
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      objeto.titulo,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Encontrado en: ${objeto.lugarEncontrado}',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatearFecha(objeto.fechaEncontrado),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[500],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: objeto.isPendiente
                            ? Colors.orange.withOpacity(0.2)
                            : Colors.green.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: objeto.isPendiente ? Colors.orange : Colors.green,
                        ),
                      ),
                      child: Text(
                        objeto.estadoDisplay,
                        style: TextStyle(
                          fontSize: 12,
                          color: objeto.isPendiente ? Colors.orange[800] : Colors.green[800],
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Icono
              Icon(
                Icons.chevron_right,
                color: Colors.grey[400],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _formatearFecha(String fecha) {
    try {
      final dt = DateTime.parse(fecha);
      final now = DateTime.now();
      final difference = now.difference(dt);

      if (difference.inDays == 0) {
        return 'Hoy';
      } else if (difference.inDays == 1) {
        return 'Ayer';
      } else if (difference.inDays < 7) {
        return 'Hace ${difference.inDays} días';
      } else {
        return '${dt.day}/${dt.month}/${dt.year}';
      }
    } catch (e) {
      return fecha;
    }
  }
}
