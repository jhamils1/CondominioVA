import 'persona_model.dart';

class Vehiculo {
  final int id;
  final String placa;
  final String marca;
  final String modelo;
  final String color;
  final String? foto;
  final String? observaciones;
  final DateTime fechaRegistro;
  final Persona persona;

  Vehiculo({
    required this.id,
    required this.placa,
    required this.marca,
    required this.modelo,
    required this.color,
    this.foto,
    this.observaciones,
    required this.fechaRegistro,
    required this.persona,
  });

  factory Vehiculo.fromJson(Map<String, dynamic> json) {
    return Vehiculo(
      id: json['id'],
      placa: json['placa'],
      marca: json['marca'],
      modelo: json['modelo'],
      color: json['color'],
      foto: json['foto'],
      observaciones: json['observaciones'],
      fechaRegistro: DateTime.parse(json['fecha_registro']),
      persona: Persona.fromJson(json['persona']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'placa': placa,
      'marca': marca,
      'modelo': modelo,
      'color': color,
      'foto': foto,
      'observaciones': observaciones,
      'fecha_registro': fechaRegistro.toIso8601String(),
      'persona': persona.toJson(),
    };
  }

  String get descripcionCompleta => '$marca $modelo - $color';
}
