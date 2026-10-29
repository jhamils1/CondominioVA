import 'package:flutter/material.dart';
import '../config/stripe_config.dart';

/// Widget que muestra información sobre la configuración de Stripe
class StripeInfoBanner extends StatelessWidget {
  const StripeInfoBanner({super.key});

  @override
  Widget build(BuildContext context) {
    if (!StripeConfig.isConfigured) {
      return Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.red.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.red),
        ),
        child: const Row(
          children: [
            Icon(Icons.warning, color: Colors.red, size: 20),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                'Stripe no está configurado correctamente',
                style: TextStyle(color: Colors.red, fontSize: 12),
              ),
            ),
          ],
        ),
      );
    }

    if (StripeConfig.isTestMode) {
      return Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.amber.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.amber),
        ),
        child: Row(
          children: [
            const Icon(Icons.science, color: Colors.amber, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Modo de prueba activo (${StripeConfig.environment})',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Use tarjeta de prueba: 4242 4242 4242 4242',
                    style: TextStyle(fontSize: 11),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.green.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.green),
      ),
      child: const Row(
        children: [
          Icon(Icons.verified_user, color: Colors.green, size: 20),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'Pagos seguros procesados por Stripe',
              style: TextStyle(
                color: Colors.green,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
