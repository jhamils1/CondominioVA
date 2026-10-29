import '../config/stripe_config.dart';

/// Servicio para gestionar pagos con Stripe
/// 
/// Este servicio proporciona métodos para procesar pagos
/// en el proyecto universitario usando Stripe.
/// 
/// NOTA: Esta es una implementación simplificada para demostración.
/// En producción, se debería usar el paquete oficial flutter_stripe.
class StripePaymentService {
  /// Verifica si Stripe está configurado correctamente
  static bool isConfigured() {
    return StripeConfig.isConfigured;
  }

  /// Obtiene la clave pública de Stripe
  static String getPublishableKey() {
    return StripeConfig.publishableKey;
  }

  /// Verifica si estamos en modo de prueba
  static bool isTestMode() {
    return StripeConfig.isTestMode;
  }

  /// Valida un número de tarjeta usando el algoritmo de Luhn
  static bool validateCardNumber(String cardNumber) {
    final cleaned = cardNumber.replaceAll(' ', '');
    
    if (cleaned.isEmpty || cleaned.length < 13 || cleaned.length > 19) {
      return false;
    }

    // Algoritmo de Luhn
    int sum = 0;
    bool alternate = false;
    
    for (int i = cleaned.length - 1; i >= 0; i--) {
      int digit = int.tryParse(cleaned[i]) ?? 0;
      
      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      alternate = !alternate;
    }
    
    return sum % 10 == 0;
  }

  /// Valida una fecha de expiración (MM/YY)
  static bool validateExpiryDate(String expiry) {
    if (!expiry.contains('/')) return false;
    
    final parts = expiry.split('/');
    if (parts.length != 2) return false;
    
    final month = int.tryParse(parts[0]);
    final year = int.tryParse(parts[1]);
    
    if (month == null || year == null) return false;
    if (month < 1 || month > 12) return false;
    
    // Convertir YY a YYYY
    final currentYear = DateTime.now().year % 100;
    final fullYear = year + (year < currentYear ? 2100 : 2000);
    
    final expiryDate = DateTime(fullYear, month + 1, 0);
    return expiryDate.isAfter(DateTime.now());
  }

  /// Valida un CVC (3 o 4 dígitos)
  static bool validateCVC(String cvc) {
    if (cvc.isEmpty) return false;
    final length = cvc.length;
    return length == 3 || length == 4;
  }

  /// Obtiene el tipo de tarjeta basado en el número
  static String getCardType(String cardNumber) {
    final cleaned = cardNumber.replaceAll(' ', '');
    
    if (cleaned.isEmpty) return 'unknown';
    
    // Visa
    if (cleaned.startsWith('4')) return 'visa';
    
    // Mastercard
    if (RegExp(r'^5[1-5]').hasMatch(cleaned)) return 'mastercard';
    if (RegExp(r'^2[2-7]').hasMatch(cleaned)) return 'mastercard';
    
    // American Express
    if (cleaned.startsWith('34') || cleaned.startsWith('37')) return 'amex';
    
    // Discover
    if (cleaned.startsWith('6011') || cleaned.startsWith('65')) return 'discover';
    
    // Diners Club
    if (cleaned.startsWith('36') || cleaned.startsWith('38')) return 'diners';
    
    return 'unknown';
  }

  /// Formatea un número de tarjeta con espacios
  static String formatCardNumber(String cardNumber) {
    final cleaned = cardNumber.replaceAll(' ', '');
    final buffer = StringBuffer();
    
    for (int i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 == 0) {
        buffer.write(' ');
      }
      buffer.write(cleaned[i]);
    }
    
    return buffer.toString();
  }

  /// Enmascara un número de tarjeta (muestra solo los últimos 4 dígitos)
  static String maskCardNumber(String cardNumber) {
    final cleaned = cardNumber.replaceAll(' ', '');
    if (cleaned.length < 4) return cardNumber;
    
    final lastFour = cleaned.substring(cleaned.length - 4);
    return '**** **** **** $lastFour';
  }

  /// Obtiene el icono de la tarjeta según el tipo
  static String getCardIcon(String cardType) {
    switch (cardType.toLowerCase()) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'amex':
        return '💳 American Express';
      case 'discover':
        return '💳 Discover';
      case 'diners':
        return '💳 Diners Club';
      default:
        return '💳 Tarjeta';
    }
  }

  /// Valida todos los datos de la tarjeta
  static Map<String, dynamic> validateCardData({
    required String cardNumber,
    required String expiryDate,
    required String cvc,
  }) {
    final errors = <String>[];

    if (!validateCardNumber(cardNumber)) {
      errors.add('Número de tarjeta inválido');
    }

    if (!validateExpiryDate(expiryDate)) {
      errors.add('Fecha de expiración inválida');
    }

    if (!validateCVC(cvc)) {
      errors.add('CVC inválido');
    }

    return {
      'isValid': errors.isEmpty,
      'errors': errors,
      'cardType': getCardType(cardNumber),
    };
  }

  /// Información sobre las tarjetas de prueba de Stripe
  static Map<String, dynamic> getTestCardInfo() {
    return {
      'success': {
        'number': '4242 4242 4242 4242',
        'description': 'Pago exitoso',
      },
      'declined': {
        'number': '4000 0000 0000 0002',
        'description': 'Tarjeta rechazada',
      },
      'insufficient_funds': {
        'number': '4000 0000 0000 9995',
        'description': 'Fondos insuficientes',
      },
      'expired': {
        'number': '4000 0000 0000 0069',
        'description': 'Tarjeta expirada',
      },
      'processing_error': {
        'number': '4000 0000 0000 0119',
        'description': 'Error de procesamiento',
      },
      'note': 'Usa fecha futura (ej: 12/34) y CVC cualquiera (ej: 123)',
    };
  }
}
