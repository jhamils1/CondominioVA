import 'persona_model.dart';

class Visita {
  final int id;
  final String estado;
  final DateTime fechaHoraEntrada;
  final DateTime? fechaHoraSalida;
  final Persona visitante;
  final Persona recibePersona;
  final DateTime fechaRegistro;

  Visita({
    required this.id,
    required this.estado,
    required this.fechaHoraEntrada,
    this.fechaHoraSalida,
    required this.visitante,
    required this.recibePersona,
    required this.fechaRegistro,
  });

  factory Visita.fromJson(Map<String, dynamic> json) {
    return Visita(
      id: json['id'],
      estado: json['estado'],
      fechaHoraEntrada: DateTime.parse(json['fecha_hora_entrada']),
      fechaHoraSalida: json['fecha_hora_salida'] != null 
          ? DateTime.parse(json['fecha_hora_salida']) 
          : null,
      visitante: Persona.fromJson(json['visitante']),
      recibePersona: Persona.fromJson(json['recibe_persona']),
      fechaRegistro: DateTime.parse(json['fecha_registro']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'estado': estado,
      'fecha_hora_entrada': fechaHoraEntrada.toIso8601String(),
      'fecha_hora_salida': fechaHoraSalida?.toIso8601String(),
      'visitante': visitante.toJson(),
      'recibe_persona': recibePersona.toJson(),
      'fecha_registro': fechaRegistro.toIso8601String(),
    };
  }

  String get estadoDisplay {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'ACTIVA': return 'Activa';
      case 'FINALIZADA': return 'Finalizada';
      case 'CANCELADA': return 'Cancelada';
      default: return estado;
    }
  }

  bool get isActiva => estado == 'ACTIVA';
  bool get isPendiente => estado == 'PENDIENTE';
  bool get isFinalizada => estado == 'FINALIZADA';
  bool get isCancelada => estado == 'CANCELADA';
}
