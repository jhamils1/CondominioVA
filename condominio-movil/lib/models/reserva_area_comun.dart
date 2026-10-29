class ReservaAreaComun {
  final int id;
  final int areaComun;
  final String? nombreArea;
  final int? persona;
  final String? nombrePersona;
  final String fechaReserva;
  final String horaInicio;
  final String horaFin;
  final String estadoReserva;
  final String fechaRegistro;

  ReservaAreaComun({
    required this.id,
    required this.areaComun,
    this.nombreArea,
    this.persona,
    this.nombrePersona,
    required this.fechaReserva,
    required this.horaInicio,
    required this.horaFin,
    required this.estadoReserva,
    required this.fechaRegistro,
  });

  factory ReservaAreaComun.fromJson(Map<String, dynamic> json) {
    return ReservaAreaComun(
      id: json['id'],
      areaComun: json['area_comun'],
      nombreArea: json['nombre_area'],
      persona: json['persona'],
      nombrePersona: json['nombre_persona'],
      fechaReserva: json['fecha_reserva'],
      horaInicio: json['hora_inicio'],
      horaFin: json['hora_fin'],
      estadoReserva: json['estado_reserva'],
      fechaRegistro: json['fecha_registro'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'area_comun': areaComun,
      if (persona != null) 'persona': persona,
      'fecha_reserva': fechaReserva,
      'hora_inicio': horaInicio,
      'hora_fin': horaFin,
      'estado_reserva': estadoReserva,
    };
  }

  String get estadoDisplay {
    switch (estadoReserva) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'CANCELADA':
        return 'Cancelada';
      case 'COMPLETADA':
        return 'Completada';
      default:
        return estadoReserva;
    }
  }

  bool get puedeSerCancelada =>
      estadoReserva == 'PENDIENTE' || estadoReserva == 'CONFIRMADA';

  bool get estaActiva =>
      estadoReserva == 'PENDIENTE' || estadoReserva == 'CONFIRMADA';
}
