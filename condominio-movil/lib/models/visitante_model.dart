import 'persona_model.dart';

class Visitante extends Persona {
  final String motivoVisita;
  final String? observaciones;

  Visitante({
    required super.id,
    required super.nombre,
    required super.apellido,
    super.telefono,
    super.imagen,
    required super.estado,
    required super.sexo,
    required super.tipo,
    required super.fechaRegistro,
    required super.ci,
    required super.fechaNacimiento,
    super.luxandUuid,
    required this.motivoVisita,
    this.observaciones,
  });

  factory Visitante.fromJson(Map<String, dynamic> json) {
    return Visitante(
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
      motivoVisita: json['motivo_visita'],
      observaciones: json['observaciones'],
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final json = super.toJson();
    json['motivo_visita'] = motivoVisita;
    json['observaciones'] = observaciones;
    return json;
  }

  String get motivoVisitaDisplay {
    switch (motivoVisita) {
      case 'FAMILIA': return 'Visita Familiar';
      case 'TRABAJO': return 'Trabajo';
      case 'SERVICIO': return 'Servicio';
      case 'SOCIAL': return 'Social';
      case 'OTRO': return 'Otro';
      default: return motivoVisita;
    }
  }
}
