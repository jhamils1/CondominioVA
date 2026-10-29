import 'persona_model.dart';

class Mascota {
  final int id;
  final String especie;
  final String tipo;
  final String? foto;
  final String nombre;
  final String? raza;
  final DateTime? fechaNacimiento;
  final String? observaciones;
  final DateTime fechaRegistro;
  final Persona persona;

  Mascota({
    required this.id,
    required this.especie,
    required this.tipo,
    this.foto,
    required this.nombre,
    this.raza,
    this.fechaNacimiento,
    this.observaciones,
    required this.fechaRegistro,
    required this.persona,
  });

  factory Mascota.fromJson(Map<String, dynamic> json) {
    return Mascota(
      id: json['id'],
      especie: json['especie'],
      tipo: json['tipo'],
      foto: json['foto'],
      nombre: json['nombre'],
      raza: json['raza'],
      fechaNacimiento: json['fecha_nacimiento'] != null 
          ? DateTime.parse(json['fecha_nacimiento']) 
          : null,
      observaciones: json['observaciones'],
      fechaRegistro: DateTime.parse(json['fecha_registro']),
      persona: Persona.fromJson(json['persona']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'especie': especie,
      'tipo': tipo,
      'foto': foto,
      'nombre': nombre,
      'raza': raza,
      'fecha_nacimiento': fechaNacimiento?.toIso8601String().split('T')[0],
      'observaciones': observaciones,
      'fecha_registro': fechaRegistro.toIso8601String(),
      'persona': persona.toJson(),
    };
  }

  String get especieDisplay {
    switch (especie) {
      case 'PERRO': return 'Perro';
      case 'GATO': return 'Gato';
      case 'AVE': return 'Ave';
      case 'ROEDOR': return 'Roedor';
      case 'REPTIL': return 'Reptil';
      case 'OTRO': return 'Otro';
      default: return especie;
    }
  }

  String get tipoDisplay {
    switch (tipo) {
      case 'MACHO': return 'Macho';
      case 'HEMBRA': return 'Hembra';
      default: return tipo;
    }
  }
}
