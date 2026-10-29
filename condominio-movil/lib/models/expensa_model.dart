class Expensa {
  final int id;
  final int unidad;
  final String monto;
  final String fechaEmision;
  final String? fechaVencimiento;
  final bool pagada;
  final String? stripeSessionId;
  final String? stripePaymentIntentId;
  final String currency;
  final String descripcion;
  final Destinatario? destinatario;
  final UnidadDetalle? unidadDetalle;
  final int? diasRestantes;
  final bool? vencida;

  Expensa({
    required this.id,
    required this.unidad,
    required this.monto,
    required this.fechaEmision,
    this.fechaVencimiento,
    required this.pagada,
    this.stripeSessionId,
    this.stripePaymentIntentId,
    required this.currency,
    required this.descripcion,
    this.destinatario,
    this.unidadDetalle,
    this.diasRestantes,
    this.vencida,
  });

  factory Expensa.fromJson(Map<String, dynamic> json) {
    return Expensa(
      id: json['id'],
      unidad: json['unidad'],
      monto: json['monto'].toString(),
      fechaEmision: json['fecha_emision'],
      fechaVencimiento: json['fecha_vencimiento'],
      pagada: json['pagada'] ?? false,
      stripeSessionId: json['stripe_session_id'],
      stripePaymentIntentId: json['stripe_payment_intent_id'],
      currency: json['currency'] ?? 'usd',
      descripcion: json['descripcion'] ?? 'Expensa de condominio',
      destinatario: json['destinatario'] != null
          ? Destinatario.fromJson(json['destinatario'])
          : null,
      unidadDetalle: json['unidad_detalle'] != null
          ? UnidadDetalle.fromJson(json['unidad_detalle'])
          : null,
      diasRestantes: json['dias_restantes'],
      vencida: json['vencida'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'unidad': unidad,
      'monto': monto,
      'fecha_emision': fechaEmision,
      'fecha_vencimiento': fechaVencimiento,
      'pagada': pagada,
      'stripe_session_id': stripeSessionId,
      'stripe_payment_intent_id': stripePaymentIntentId,
      'currency': currency,
      'descripcion': descripcion,
    };
  }

  // Helper para obtener monto como double
  double get montoDouble => double.tryParse(monto) ?? 0.0;

  // Helper para obtener el monto en centavos para Stripe
  int get amountCents => (montoDouble * 100).round();
}

class Destinatario {
  final int? id;
  final String? nombre;
  final String? apellido;
  final String? nombreCompleto;

  Destinatario({
    this.id,
    this.nombre,
    this.apellido,
    this.nombreCompleto,
  });

  factory Destinatario.fromJson(Map<String, dynamic> json) {
    return Destinatario(
      id: json['id'],
      nombre: json['nombre'],
      apellido: json['apellido'],
      nombreCompleto: json['nombre_completo'],
    );
  }
}

class UnidadDetalle {
  final int? id;
  final String? numero;
  final Bloque? bloque;

  UnidadDetalle({
    this.id,
    this.numero,
    this.bloque,
  });

  factory UnidadDetalle.fromJson(Map<String, dynamic> json) {
    return UnidadDetalle(
      id: json['id'],
      numero: json['numero'],
      bloque: json['bloque'] != null ? Bloque.fromJson(json['bloque']) : null,
    );
  }
}

class Bloque {
  final int? id;
  final String? nombre;

  Bloque({
    this.id,
    this.nombre,
  });

  factory Bloque.fromJson(Map<String, dynamic> json) {
    return Bloque(
      id: json['id'],
      nombre: json['nombre'],
    );
  }
}
