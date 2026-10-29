class ObjetoPerdido {
  final int id;
  final String titulo;
  final String? descripcion;
  final String foto;
  final String lugarEncontrado;
  final String fechaEncontrado;
  final String estado;
  final String estadoDisplay;
  final String? entregadoA;
  final String? fechaEntrega;

  ObjetoPerdido({
    required this.id,
    required this.titulo,
    this.descripcion,
    required this.foto,
    required this.lugarEncontrado,
    required this.fechaEncontrado,
    required this.estado,
    required this.estadoDisplay,
    this.entregadoA,
    this.fechaEntrega,
  });

  factory ObjetoPerdido.fromJson(Map<String, dynamic> json) {
    return ObjetoPerdido(
      id: json['id'],
      titulo: json['titulo'],
      descripcion: json['descripcion'],
      foto: json['foto'],
      lugarEncontrado: json['lugar_encontrado'] ?? 'Áreas Comunes',
      fechaEncontrado: json['fecha_encontrado'],
      estado: json['estado'],
      estadoDisplay: json['estado_display'] ?? _getEstadoDisplay(json['estado']),
      entregadoA: json['entregado_a']?.toString(),
      fechaEntrega: json['fecha_entrega'],
    );
  }

  static String _getEstadoDisplay(String estado) {
    switch (estado) {
      case 'P':
        return 'Pendiente de reclamo';
      case 'E':
        return 'Entregado/Devuelto';
      default:
        return estado;
    }
  }

  bool get isPendiente => estado == 'P';
  bool get isEntregado => estado == 'E';
}
