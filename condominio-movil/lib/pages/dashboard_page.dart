import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../services/dashboard_service.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({Key? key}) : super(key: key);

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _resumen;
  Map<String, dynamic>? _graficoExpensas;
  Map<String, dynamic>? _graficoIngresos;
  Map<String, dynamic>? _graficoMorosos;
  Map<String, dynamic>? _graficoComparativo;
  int _anioSeleccionado = DateTime.now().year;

  @override
  void initState() {
    super.initState();
    _cargarDatosDashboard();
  }

  Future<void> _cargarDatosDashboard() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Cargar todos los datos en paralelo
      final results = await Future.wait([
        DashboardService.obtenerResumenFinanciero(),
        DashboardService.obtenerGraficoExpensasEstado(),
        DashboardService.obtenerGraficoIngresosMensuales(anio: _anioSeleccionado),
        DashboardService.obtenerGraficoMorososRanking(limite: 10),
        DashboardService.obtenerGraficoComparativoAnual(),
      ]);

      if (results.every((result) => result['success'] == true)) {
        setState(() {
          _resumen = results[0]['data']['resumen'];
          _graficoExpensas = results[1]['data'];
          _graficoIngresos = results[2]['data'];
          _graficoMorosos = results[3]['data'];
          _graficoComparativo = results[4]['data'];
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'No se pudieron cargar los datos del dashboard';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error al cargar dashboard: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _cargarGraficoIngresos() async {
    final result = await DashboardService.obtenerGraficoIngresosMensuales(
        anio: _anioSeleccionado);
    if (result['success']) {
      setState(() {
        _graficoIngresos = result['data'];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Dashboard Financiero'),
          backgroundColor: Colors.blue[700],
        ),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Cargando dashboard...'),
            ],
          ),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Dashboard Financiero'),
          backgroundColor: Colors.blue[700],
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
                const SizedBox(height: 16),
                Text(
                  _error!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.red),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _cargarDatosDashboard,
                  child: const Text('Reintentar'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Financiero'),
        backgroundColor: Colors.blue[700],
      ),
      body: RefreshIndicator(
        onRefresh: _cargarDatosDashboard,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Título y descripción
              const Text(
                'Resumen General',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Análisis de expensas del condominio',
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 20),

              // Tarjetas de resumen
              if (_resumen != null) ...[
                _buildResumenCards(),
                const SizedBox(height: 20),
                _buildMontoCards(),
                const SizedBox(height: 24),
              ],

              // Gráfico de Expensas (Dona)
              if (_graficoExpensas != null) ...[
                _buildDonutChart(),
                const SizedBox(height: 24),
              ],

              // Gráfico de Ingresos Mensuales (Barras)
              if (_graficoIngresos != null) ...[
                _buildBarChart(),
                const SizedBox(height: 24),
              ],

              // Gráfico de Morosos (Barras Horizontales)
              if (_graficoMorosos != null) ...[
                _buildHorizontalBarChart(),
                const SizedBox(height: 24),
              ],

              // Gráfico Comparativo Anual (Líneas)
              if (_graficoComparativo != null) ...[
                _buildLineChart(),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResumenCards() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                title: 'Total Expensas',
                value: '${_resumen!['total_expensas']}',
                subtitle: '${_resumen!['porcentaje_pagado']}% pagado',
                icon: Icons.receipt_long,
                color: Colors.blue,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                title: 'Pagadas',
                value: '${_resumen!['expensas_pagadas']}',
                subtitle: 'Bs. ${_formatNumber(_resumen!['monto_total_recaudado'])}',
                icon: Icons.check_circle,
                color: Colors.green,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                title: 'Pendientes',
                value: '${_resumen!['expensas_pendientes']}',
                subtitle: 'Bs. ${_formatNumber(_resumen!['monto_pendiente'])}',
                icon: Icons.error,
                color: Colors.red,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                title: 'Contratos',
                value: '${_resumen!['contratos_activos']}',
                subtitle: '${_resumen!['unidades_ocupadas']} unidades',
                icon: Icons.home,
                color: Colors.purple,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border(
          left: BorderSide(color: color, width: 4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              Icon(icon, color: color, size: 24),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 11,
              color: color,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMontoCards() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF22C55E), Color(0xFF16A34A)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.green.withOpacity(0.3),
                spreadRadius: 1,
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Monto Total Recaudado',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Bs. ${_formatNumber(_resumen!['monto_total_recaudado'])}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const Icon(
                Icons.attach_money,
                color: Colors.white54,
                size: 48,
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFEF4444), Color(0xFFDC2626)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.red.withOpacity(0.3),
                spreadRadius: 1,
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Monto Pendiente de Cobro',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Bs. ${_formatNumber(_resumen!['monto_pendiente'])}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const Icon(
                Icons.trending_up,
                color: Colors.white54,
                size: 48,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDonutChart() {
    final montos = _graficoExpensas!['montos'];
    final porcentajes = _graficoExpensas!['porcentajes'];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _graficoExpensas!['titulo'],
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 200,
            child: PieChart(
              PieChartData(
                sections: [
                  PieChartSectionData(
                    value: montos['pagado'].toDouble(),
                    title: '${porcentajes['pagado']}%',
                    color: Colors.green,
                    radius: 60,
                    titleStyle: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  PieChartSectionData(
                    value: montos['pendiente'].toDouble(),
                    title: '${porcentajes['pendiente']}%',
                    color: Colors.red,
                    radius: 60,
                    titleStyle: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
                sectionsSpace: 2,
                centerSpaceRadius: 40,
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildLegendItem('Pagado', Colors.green,
                  'Bs. ${_formatNumber(montos['pagado'])}'),
              _buildLegendItem('Pendiente', Colors.red,
                  'Bs. ${_formatNumber(montos['pendiente'])}'),
              _buildLegendItem('Total', Colors.blue,
                  'Bs. ${_formatNumber(montos['total'])}'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBarChart() {
    final estadisticas = _graficoIngresos!['estadisticas'];
    final labels = List<String>.from(_graficoIngresos!['labels']);
    final data = List<double>.from(
        _graficoIngresos!['datasets'][0]['data'].map((e) => e.toDouble()));

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _graficoIngresos!['titulo'],
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              DropdownButton<int>(
                value: _anioSeleccionado,
                items: [2022, 2023, 2024, 2025].map((anio) {
                  return DropdownMenuItem(
                    value: anio,
                    child: Text(anio.toString()),
                  );
                }).toList(),
                onChanged: (valor) {
                  if (valor != null) {
                    setState(() {
                      _anioSeleccionado = valor;
                    });
                    _cargarGraficoIngresos();
                  }
                },
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 250,
            child: BarChart(
              BarChartData(
                alignment: BarChartAlignment.spaceAround,
                maxY: data.isEmpty
                    ? 100
                    : (data.reduce((a, b) => a > b ? a : b) * 1.2),
                barTouchData: BarTouchData(
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      return BarTooltipItem(
                        '${labels[group.x.toInt()]}\nBs. ${_formatNumber(rod.toY)}',
                        const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      );
                    },
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        if (value.toInt() >= 0 && value.toInt() < labels.length) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(
                              labels[value.toInt()],
                              style: const TextStyle(fontSize: 10),
                            ),
                          );
                        }
                        return const Text('');
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) {
                        return Text(
                          _formatNumberShort(value),
                          style: const TextStyle(fontSize: 10),
                        );
                      },
                    ),
                  ),
                  topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                ),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                ),
                borderData: FlBorderData(show: false),
                barGroups: List.generate(
                  data.length,
                  (index) => BarChartGroupData(
                    x: index,
                    barRods: [
                      BarChartRodData(
                        toY: data[index],
                        color: Colors.blue,
                        width: 16,
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          _buildEstadisticasGrid(estadisticas),
        ],
      ),
    );
  }

  Widget _buildHorizontalBarChart() {
    final detalles = List<Map<String, dynamic>>.from(_graficoMorosos!['detalles']);
    final estadisticas = _graficoMorosos!['estadisticas'];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _graficoMorosos!['titulo'],
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 300,
            child: ListView.builder(
              itemCount: detalles.length,
              itemBuilder: (context, index) {
                final detalle = detalles[index];
                final maxMonto = detalles
                    .map((d) => d['monto_pendiente'] as num)
                    .reduce((a, b) => a > b ? a : b);
                final porcentaje =
                    (detalle['monto_pendiente'] / maxMonto * 100).toInt();

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '${detalle['nombre']} - ${detalle['unidad']}',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            'Bs. ${_formatNumber(detalle['monto_pendiente'])}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.red,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      LinearProgressIndicator(
                        value: porcentaje / 100,
                        backgroundColor: Colors.grey[200],
                        valueColor:
                            const AlwaysStoppedAnimation<Color>(Colors.orange),
                        minHeight: 8,
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: _buildInfoCard(
                  'Total Morosos',
                  '${estadisticas['total_morosos']}',
                  Colors.orange,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildInfoCard(
                  'Deuda Total',
                  'Bs. ${_formatNumber(estadisticas['deuda_total'])}',
                  Colors.red,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildInfoCard(
                  'Promedio',
                  'Bs. ${_formatNumber(estadisticas['promedio_deuda'])}',
                  Colors.yellow[700]!,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLineChart() {
    final labels = List<String>.from(_graficoComparativo!['labels']);
    final datasets = List<Map<String, dynamic>>.from(_graficoComparativo!['datasets']);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _graficoComparativo!['titulo'],
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 250,
            child: LineChart(
              LineChartData(
                lineBarsData: datasets.map((dataset) {
                  final data = List<double>.from(
                      dataset['data'].map((e) => e.toDouble()));
                  final color = _parseColor(dataset['borderColor']);

                  return LineChartBarData(
                    spots: List.generate(
                      data.length,
                      (index) => FlSpot(index.toDouble(), data[index]),
                    ),
                    isCurved: true,
                    color: color,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: true),
                    belowBarData: BarAreaData(
                      show: true,
                      color: color.withOpacity(0.1),
                    ),
                  );
                }).toList(),
                titlesData: FlTitlesData(
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, meta) {
                        if (value.toInt() >= 0 &&
                            value.toInt() < labels.length) {
                          return Padding(
                            padding: const EdgeInsets.only(top: 8.0),
                            child: Text(
                              labels[value.toInt()],
                              style: const TextStyle(fontSize: 10),
                            ),
                          );
                        }
                        return const Text('');
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) {
                        return Text(
                          _formatNumberShort(value),
                          style: const TextStyle(fontSize: 10),
                        );
                      },
                    ),
                  ),
                  topTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                  rightTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: false),
                  ),
                ),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                ),
                borderData: FlBorderData(show: false),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Wrap(
            spacing: 16,
            runSpacing: 8,
            children: datasets.map((dataset) {
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: _parseColor(dataset['borderColor']),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    dataset['label'],
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color, String value) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildEstadisticasGrid(Map<String, dynamic> estadisticas) {
    return Row(
      children: [
        if (estadisticas['total_año'] != null)
          Expanded(
            child: _buildInfoCard(
              'Total Año',
              'Bs. ${_formatNumber(estadisticas['total_año'])}',
              Colors.blue,
            ),
          ),
        if (estadisticas['promedio_mensual'] != null) ...[
          const SizedBox(width: 8),
          Expanded(
            child: _buildInfoCard(
              'Promedio Mensual',
              'Bs. ${_formatNumber(estadisticas['promedio_mensual'])}',
              Colors.purple,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildInfoCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 11,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  String _formatNumber(num number) {
    return number.toStringAsFixed(2).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]},',
        );
  }

  String _formatNumberShort(double number) {
    if (number >= 1000) {
      return '${(number / 1000).toStringAsFixed(0)}K';
    }
    return number.toStringAsFixed(0);
  }

  Color _parseColor(String colorString) {
    // Parsear colores tipo 'rgb(255, 99, 132)' o '#RGB'
    if (colorString.startsWith('rgb')) {
      final values = colorString
          .substring(4, colorString.length - 1)
          .split(',')
          .map((e) => int.parse(e.trim()))
          .toList();
      return Color.fromRGBO(values[0], values[1], values[2], 1);
    } else if (colorString.startsWith('#')) {
      return Color(int.parse(colorString.substring(1), radix: 16) + 0xFF000000);
    }
    // Colores por defecto para diferentes años
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.purple,
    ];
    return colors[0];
  }
}
