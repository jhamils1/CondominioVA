class Persona {
  final int id;
  final String nombre;
  final String apellido;
  final String? telefono;
  final String? imagen;
  final String estado;
  final String sexo;
  final String tipo;
  final DateTime fechaRegistro;
  final String ci;
  final DateTime fechaNacimiento;
  final String? luxandUuid;

  Persona({
    required this.id,
    required this.nombre,
    required this.apellido,
    this.telefono,
    this.imagen,
    required this.estado,
    required this.sexo,
    required this.tipo,
    required this.fechaRegistro,
    required this.ci,
    required this.fechaNacimiento,
    this.luxandUuid,
  });

  factory Persona.fromJson(Map<String, dynamic> json) {
    return Persona(
      id: json['id'],
      nombre: json['nombre'],
      apellido: json['apellido'],
      telefono: json['telefono'],
      imagen: json['imagen'],
      estado: json['estado'],
      sexo: json['sexo'],
      tipo: json['tipo'],
      fechaRegistro: DateTime.parse(json['fecha_registro']),
      ci: json['CI'],
      fechaNacimiento: DateTime.parse(json['fecha_nacimiento']),
      luxandUuid: json['luxand_uuid'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nombre': nombre,
      'apellido': apellido,
      'telefono': telefono,
      'imagen': imagen,
      'estado': estado,
      'sexo': sexo,
      'tipo': tipo,
      'fecha_registro': fechaRegistro.toIso8601String(),
      'CI': ci,
      'fecha_nacimiento': fechaNacimiento.toIso8601String().split('T')[0],
      'luxand_uuid': luxandUuid,
    };
  }

  String get nombreCompleto => '$nombre $apellido';

  String get estadoDisplay {
    switch (estado) {
      case 'A': return 'Activo';
      case 'I': return 'Inactivo';
      case 'S': return 'Suspendido';
      default: return estado;
    }
  }

  String get sexoDisplay {
    switch (sexo) {
      case 'M': return 'Masculino';
      case 'F': return 'Femenino';
      case 'O': return 'Otro';
      default: return sexo;
    }
  }

  String get tipoDisplay {
    switch (tipo) {
      case 'P': return 'Propietario';
      case 'I': return 'Inquilino';
      case 'F': return 'Familiar';
      case 'V': return 'Visitante';
      default: return tipo;
    }
  }
}
