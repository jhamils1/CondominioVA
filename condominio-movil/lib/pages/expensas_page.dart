import 'package:flutter/material.dart';
import '../models/expensa_model.dart';
import '../services/expensa_service.dart';
import '../widgets/stripe_info_banner.dart';
import 'expensa_detalle_page.dart';

class ExpensasPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDark;

  const ExpensasPage({
    super.key,
    required this.onToggleTheme,
    required this.isDark,
  });

  @override
  State<ExpensasPage> createState() => _ExpensasPageState();
}

class _ExpensasPageState extends State<ExpensasPage> {
  List<Expensa> _expensas = [];
  List<Expensa> _expensasFiltradas = [];
  bool _isLoading = true;
  String? _errorMessage;
  String _filtroSeleccionado = 'Todas'; // 'Todas', 'Pendientes', 'Pagadas', 'Vencidas'

  @override
  void initState() {
    super.initState();
    _cargarExpensas();
  }

  Future<void> _cargarExpensas() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await ExpensaService.getExpensas();

    if (!mounted) return;
    
    setState(() {
      _isLoading = false;
      if (result['success']) {
        _expensas = result['data'] as List<Expensa>;
        _aplicarFiltro();
      } else {
        _errorMessage = result['message'];
      }
    });
  }

  void _aplicarFiltro() {
    setState(() {
      switch (_filtroSeleccionado) {
        case 'Pendientes':
          _expensasFiltradas = ExpensaService.filterExpensasByEstado(
            _expensas,
            pagada: false,
          );
          break;
        case 'Pagadas':
          _expensasFiltradas = ExpensaService.filterExpensasByEstado(
            _expensas,
            pagada: true,
          );
          break;
        case 'Vencidas':
          _expensasFiltradas = _expensas
              .where((e) => !e.pagada && (e.vencida ?? false))
              .toList();
          break;
        default:
          _expensasFiltradas = List.from(_expensas);
      }
      
      // Ordenar por fecha de vencimiento (más próximas primero)
      _expensasFiltradas = ExpensaService.sortExpensasByVencimiento(
        _expensasFiltradas,
        ascending: true,
      );
    });
  }

  Color _getEstadoColor(Expensa expensa) {
    if (expensa.pagada) {
      return Colors.green;
    } else if (expensa.vencida ?? false) {
      return Colors.red;
    } else if ((expensa.diasRestantes ?? 0) <= 5) {
      return Colors.orange;
    }
    return Colors.blue;
  }

  String _getEstadoTexto(Expensa expensa) {
    if (expensa.pagada) {
      return 'Pagada';
    } else if (expensa.vencida ?? false) {
      return 'Vencida';
    } else if ((expensa.diasRestantes ?? 0) <= 5) {
      return 'Por vencer';
    }
    return 'Pendiente';
  }

  @override
  Widget build(BuildContext context) {
    final totalPendiente = ExpensaService.calcularTotalPendiente(_expensas);
    final cantidadPendientes = _expensas.where((e) => !e.pagada).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Expensas'),
        actions: [
          IconButton(
            icon: Icon(widget.isDark ? Icons.wb_sunny : Icons.nightlight_round),
            onPressed: widget.onToggleTheme,
          ),
        ],
      ),
      body: Column(
        children: [
          // Banner de información de Stripe
          const StripeInfoBanner(),

          // Resumen de expensas
          if (!_isLoading && _expensas.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildResumenCard(
                        'Total Pendiente',
                        '\$${totalPendiente.toStringAsFixed(2)}',
                        Icons.attach_money,
                        Colors.orange,
                      ),
                      _buildResumenCard(
                        'Pendientes',
                        cantidadPendientes.toString(),
                        Icons.pending_actions,
                        Colors.red,
                      ),
                    ],
                  ),
                ],
              ),
            ),

          // Filtros
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFiltroChip('Todas'),
                  const SizedBox(width: 8),
                  _buildFiltroChip('Pendientes'),
                  const SizedBox(width: 8),
                  _buildFiltroChip('Pagadas'),
                  const SizedBox(width: 8),
                  _buildFiltroChip('Vencidas'),
                ],
              ),
            ),
          ),

          // Lista de expensas
          Expanded(
            child: _buildBody(),
          ),
        ],
      ),
    );
  }

  Widget _buildResumenCard(String titulo, String valor, IconData icono, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Icon(icono, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              titulo,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 4),
            Text(
              valor,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFiltroChip(String filtro) {
    final isSelected = _filtroSeleccionado == filtro;
    return FilterChip(
      label: Text(filtro),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _filtroSeleccionado = filtro;
          _aplicarFiltro();
        });
      },
      selectedColor: Theme.of(context).primaryColor.withOpacity(0.3),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(_errorMessage!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _cargarExpensas,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    if (_expensasFiltradas.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'No hay expensas $_filtroSeleccionado'.toLowerCase(),
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _cargarExpensas,
      child: ListView.builder(
        padding: const EdgeInsets.all(8),
        itemCount: _expensasFiltradas.length,
        itemBuilder: (context, index) {
          final expensa = _expensasFiltradas[index];
          return _buildExpensaCard(expensa);
        },
      ),
    );
  }

  Widget _buildExpensaCard(Expensa expensa) {
    final estadoColor = _getEstadoColor(expensa);
    final estadoTexto = _getEstadoTexto(expensa);

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      elevation: 2,
      child: InkWell(
        onTap: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ExpensaDetallePage(
                expensaId: expensa.id,
                onToggleTheme: widget.onToggleTheme,
                isDark: widget.isDark,
              ),
            ),
          );
          
          // Si se realizó un pago, recargar la lista
          if (result == true) {
            _cargarExpensas();
          }
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Estado
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: estadoColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: estadoColor),
                    ),
                    child: Text(
                      estadoTexto,
                      style: TextStyle(
                        color: estadoColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  // Monto
                  Text(
                    '\$${expensa.montoDouble.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              
              // Descripción
              Text(
                expensa.descripcion,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              
              // Unidad
              if (expensa.unidadDetalle != null)
                Row(
                  children: [
                    const Icon(Icons.home, size: 16, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      'Unidad ${expensa.unidadDetalle!.numero ?? expensa.unidad}',
                      style: const TextStyle(color: Colors.grey),
                    ),
                    if (expensa.unidadDetalle!.bloque?.nombre != null) ...[
                      const Text(' - ', style: TextStyle(color: Colors.grey)),
                      Text(
                        'Bloque ${expensa.unidadDetalle!.bloque!.nombre}',
                        style: const TextStyle(color: Colors.grey),
                      ),
                    ],
                  ],
                ),
              const SizedBox(height: 4),
              
              // Fechas
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(
                        'Emisión: ${expensa.fechaEmision}',
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                  if (expensa.fechaVencimiento != null)
                    Row(
                      children: [
                        const Icon(Icons.event, size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          'Vence: ${expensa.fechaVencimiento}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                ],
              ),
              
              // Días restantes
              if (!expensa.pagada && expensa.diasRestantes != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 16,
                        color: expensa.diasRestantes! < 0
                            ? Colors.red
                            : expensa.diasRestantes! <= 5
                                ? Colors.orange
                                : Colors.green,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        expensa.diasRestantes! < 0
                            ? 'Vencida hace ${-expensa.diasRestantes!} días'
                            : expensa.diasRestantes! == 0
                                ? 'Vence hoy'
                                : 'Vence en ${expensa.diasRestantes} días',
                        style: TextStyle(
                          fontSize: 12,
                          color: expensa.diasRestantes! < 0
                              ? Colors.red
                              : expensa.diasRestantes! <= 5
                                  ? Colors.orange
                                  : Colors.green,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
