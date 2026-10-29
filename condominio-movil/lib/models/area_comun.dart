class AreaComun {
  final int id;
  final String nombre;
  final String? descripcion;
  final String ubicacion;
  final int capacidadMaxima;
  final String horarioApertura;
  final String horarioCierre;
  final String estado;

  AreaComun({
    required this.id,
    required this.nombre,
    this.descripcion,
    required this.ubicacion,
    required this.capacidadMaxima,
    required this.horarioApertura,
    required this.horarioCierre,
    required this.estado,
  });

  factory AreaComun.fromJson(Map<String, dynamic> json) {
    return AreaComun(
      id: json['id'],
      nombre: json['nombre'],
      descripcion: json['descripcion'],
      ubicacion: json['ubicacion'],
      capacidadMaxima: json['capacidad_maxima'],
      horarioApertura: json['horario_apertura'],
      horarioCierre: json['horario_cierre'],
      estado: json['estado'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'descripcion': descripcion,
      'ubicacion': ubicacion,
      'capacidad_maxima': capacidadMaxima,
      'horario_apertura': horarioApertura,
      'horario_cierre': horarioCierre,
      'estado': estado,
    };
  }

  bool get estaActivo => estado == 'A';

  String get estadoDisplay => estado == 'A' ? 'Activo' : 'Inactivo';
}
