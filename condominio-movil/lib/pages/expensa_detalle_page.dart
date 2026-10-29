import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_stripe/flutter_stripe.dart' hide Card;
import 'package:flutter_stripe/flutter_stripe.dart' as stripe;
import '../models/expensa_model.dart';
import '../services/expensa_service.dart';
import '../services/stripe_payment_service.dart';
import '../config/stripe_config.dart';

class ExpensaDetallePage extends StatefulWidget {
  final int expensaId;
  final VoidCallback onToggleTheme;
  final bool isDark;

  const ExpensaDetallePage({
    super.key,
    required this.expensaId,
    required this.onToggleTheme,
    required this.isDark,
  });

  @override
  State<ExpensaDetallePage> createState() => _ExpensaDetallePageState();
}

class _ExpensaDetallePageState extends State<ExpensaDetallePage> {
  Expensa? _expensa;
  bool _isLoading = true;
  bool _isPaying = false;
  String? _errorMessage;
  String? _clientSecret;
  final _cardNumberController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvcController = TextEditingController();
  String _cardType = 'unknown';

  @override
  void initState() {
    super.initState();
    _cargarExpensa();
    
    // Detectar tipo de tarjeta mientras el usuario escribe
    _cardNumberController.addListener(() {
      final newType = StripePaymentService.getCardType(_cardNumberController.text);
      if (newType != _cardType) {
        setState(() {
          _cardType = newType;
        });
      }
    });
  }

  @override
  void dispose() {
    _cardNumberController.dispose();
    _expiryController.dispose();
    _cvcController.dispose();
    super.dispose();
  }

  Future<void> _cargarExpensa() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await ExpensaService.getExpensa(widget.expensaId);

    setState(() {
      _isLoading = false;
      if (result['success']) {
        _expensa = result['data'];
      } else {
        _errorMessage = result['message'];
      }
    });
  }

  Future<void> _iniciarPago() async {
    if (_expensa == null || _expensa!.pagada) return;

    setState(() {
      _isPaying = true;
      _errorMessage = null;
    });

    // Crear PaymentIntent
    final result = await ExpensaService.createPaymentIntent(widget.expensaId);

    if (result['success']) {
      setState(() {
        _clientSecret = result['data']['client_secret'];
        _isPaying = false;
      });

      // Mostrar formulario de pago
      _mostrarFormularioPago();
    } else {
      setState(() {
        _isPaying = false;
        _errorMessage = result['message'];
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message']),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _mostrarFormularioPago() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          top: 20,
          left: 20,
          right: 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Información de Pago',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 20),
            
            // Monto a pagar
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total a pagar:', style: TextStyle(fontSize: 16)),
                  Text(
                    '\$${_expensa!.montoDouble.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Información de Stripe
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.payment, color: Colors.blue, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        'Procesado por Stripe (${StripeConfig.environment})',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Pago seguro encriptado',
                    style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Tarjeta de prueba Stripe (solo en test mode)
            if (StripeConfig.isTestMode)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.amber),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.info, color: Colors.amber, size: 16),
                        const SizedBox(width: 8),
                        const Text(
                          'Tarjeta de prueba Stripe',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text('Número: 4242 4242 4242 4242', style: TextStyle(fontSize: 12)),
                    const Text('Vencimiento: 12/34', style: TextStyle(fontSize: 12)),
                    const Text('CVC: 123', style: TextStyle(fontSize: 12)),
                  ],
                ),
              ),
            if (StripeConfig.isTestMode) const SizedBox(height: 20),

            // Widget de tarjeta de Stripe (todo en uno)
            stripe.CardField(
              onCardChanged: (card) {
                setState(() {
                  // Stripe valida automáticamente
                });
              },
              enablePostalCode: false,
            ),
            const SizedBox(height: 16),

            // Ya no necesitamos estos TextFields porque CardField lo maneja todo
            /*
            TextField(
              controller: _cardNumberController,
              decoration: InputDecoration(
                labelText: 'Número de tarjeta',
                hintText: '4242 4242 4242 4242',
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.credit_card),
                suffixIcon: _cardType != 'unknown'
                    ? Padding(
                        padding: const EdgeInsets.all(12),
                        child: Text(
                          StripePaymentService.getCardIcon(_cardType),
                          style: const TextStyle(fontSize: 20),
                        ),
                      )
                    : null,
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(16),
                _CardNumberInputFormatter(),
              ],
            ),
            */
            const SizedBox(height: 24),

            // Botón de pago
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isPaying ? null : _procesarPago,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                child: _isPaying
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Pagar Ahora', style: TextStyle(fontSize: 18)),
              ),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Future<void> _procesarPago() async {
    // Ya no necesitamos validación manual, CardField lo hace automáticamente
    print('Procesando pago con Stripe...');

    setState(() {
      _isPaying = true;
    });

    try {
      // Validar que tengamos el client_secret
      if (_clientSecret == null || _clientSecret!.isEmpty) {
        setState(() {
          _isPaying = false;
        });
        _mostrarError('Error: No se pudo obtener el secreto del pago');
        return;
      }

      // Confirmar el pago con Stripe
      // CardField automáticamente pasa los datos de la tarjeta
      await stripe.Stripe.instance.confirmPayment(
        paymentIntentClientSecret: _clientSecret!,
        data: const stripe.PaymentMethodParams.card(
          paymentMethodData: stripe.PaymentMethodData(),
        ),
      );

      // Si llegamos aquí, el pago fue exitoso
      print('Pago confirmado exitosamente con Stripe');

      // Extraer payment_intent_id del client_secret
      // Formato: pi_xxxxx_secret_yyyyy
      final secretIndex = _clientSecret!.indexOf('_secret_');
      final String paymentIntentId;
      if (secretIndex > 0) {
        paymentIntentId = _clientSecret!.substring(0, secretIndex);
      } else {
        // Si no tiene el formato esperado, usar todo el string
        paymentIntentId = _clientSecret!;
      }

      print('Verificando pago en backend con payment_intent_id: $paymentIntentId');

      // Verificar el pago en el backend
      final result = await ExpensaService.verifyPaymentIntent(paymentIntentId);

      if (result['success']) {
        final data = result['data'];
        final status = data['status'];
        final expensaId = data['expensa_id'];

        print('Estado del pago: $status, Expensa ID: $expensaId');

        if (status == 'succeeded') {
          // Verificar si el backend actualizó la expensa
          // Si no lo hizo, intentar actualizar manualmente
          print('Pago exitoso. Verificando actualización de expensa...');
          
          // Intentar marcar como pagada usando el método alternativo
          final updateResult = await ExpensaService.marcarComoPagada(
            widget.expensaId,
            paymentIntentId,
          );
          
          setState(() {
            _isPaying = false;
          });

          if (updateResult['success'] || updateResult['message']?.contains('404') == true) {
            // Éxito o la expensa ya está actualizada
            Navigator.pop(context); // Cerrar modal
            _mostrarExito();
            
            // Esperar un momento para que el usuario vea el mensaje
            await Future.delayed(const Duration(milliseconds: 500));
            
            // Recargar expensa para obtener el estado actualizado
            await _cargarExpensa();
            
            // Volver a la lista con resultado true para que recargue
            Navigator.pop(context, true);
          } else {
            print('Advertencia: No se pudo actualizar la expensa: ${updateResult['message']}');
            // Aun así, considerarlo exitoso y recargar
            Navigator.pop(context);
            _mostrarExito();
            await Future.delayed(const Duration(milliseconds: 500));
            await _cargarExpensa();
            Navigator.pop(context, true);
          }
        } else {
          setState(() {
            _isPaying = false;
          });
          _mostrarError('El pago no se completó. Estado: $status');
        }
      } else {
        setState(() {
          _isPaying = false;
        });
        _mostrarError(result['message'] ?? 'Error al verificar el pago');
        print('Error en verificación: ${result['details']}');
      }
    } on stripe.StripeException catch (e) {
      // Error específico de Stripe
      setState(() {
        _isPaying = false;
      });
      final errorMessage = e.error.localizedMessage ?? 'Error al procesar el pago';
      _mostrarError(errorMessage);
      print('Error de Stripe: $errorMessage');
      print('Detalles: ${e.error.code} - ${e.error.message}');
    } catch (e) {
      setState(() {
        _isPaying = false;
      });
      _mostrarError('Error al procesar el pago: $e');
      print('Error en _procesarPago: $e');
    }
  }

  void _mostrarError(String mensaje) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensaje),
        backgroundColor: Colors.red,
      ),
    );
  }

  void _mostrarExito() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 32),
            SizedBox(width: 8),
            Text('Pago Exitoso'),
          ],
        ),
        content: const Text('Su expensa ha sido pagada correctamente.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Aceptar'),
          ),
        ],
      ),
    );
  }

  Color _getEstadoColor() {
    if (_expensa!.pagada) {
      return Colors.green;
    } else if (_expensa!.vencida ?? false) {
      return Colors.red;
    } else if ((_expensa!.diasRestantes ?? 0) <= 5) {
      return Colors.orange;
    }
    return Colors.blue;
  }

  String _getEstadoTexto() {
    if (_expensa!.pagada) {
      return 'Pagada';
    } else if (_expensa!.vencida ?? false) {
      return 'Vencida';
    } else if ((_expensa!.diasRestantes ?? 0) <= 5) {
      return 'Por vencer';
    }
    return 'Pendiente';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle de Expensa'),
        actions: [
          IconButton(
            icon: Icon(widget.isDark ? Icons.wb_sunny : Icons.nightlight_round),
            onPressed: widget.onToggleTheme,
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: _expensa != null && !_expensa!.pagada
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: ElevatedButton(
                  onPressed: _isPaying ? null : _iniciarPago,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 50),
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                  child: _isPaying
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          'Pagar \$${_expensa!.montoDouble.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 18),
                        ),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 64, color: Colors.red[300]),
            const SizedBox(height: 16),
            Text(_errorMessage!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _cargarExpensa,
              child: const Text('Reintentar'),
            ),
          ],
        ),
      );
    }

    if (_expensa == null) {
      return const Center(child: Text('Expensa no encontrada'));
    }

    final estadoColor = _getEstadoColor();
    final estadoTexto = _getEstadoTexto();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Estado y monto
          Card(
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: estadoColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: estadoColor, width: 2),
                    ),
                    child: Text(
                      estadoTexto,
                      style: TextStyle(
                        color: estadoColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Monto Total',
                    style: TextStyle(fontSize: 16, color: Colors.grey),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '\$${_expensa!.montoDouble.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Información general
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Información General',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const Divider(),
                  _buildInfoRow('Descripción', _expensa!.descripcion),
                  _buildInfoRow('ID Expensa', '#${_expensa!.id}'),
                  _buildInfoRow('Moneda', _expensa!.currency.toUpperCase()),
                  if (_expensa!.destinatario?.nombreCompleto != null)
                    _buildInfoRow('Destinatario', _expensa!.destinatario!.nombreCompleto!),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Información de la unidad
          if (_expensa!.unidadDetalle != null)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Unidad',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const Divider(),
                    _buildInfoRow(
                      'Número',
                      _expensa!.unidadDetalle!.numero ?? _expensa!.unidad.toString(),
                    ),
                    if (_expensa!.unidadDetalle!.bloque?.nombre != null)
                      _buildInfoRow('Bloque', _expensa!.unidadDetalle!.bloque!.nombre!),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 16),

          // Fechas
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Fechas',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const Divider(),
                  _buildInfoRow('Fecha de Emisión', _expensa!.fechaEmision),
                  if (_expensa!.fechaVencimiento != null)
                    _buildInfoRow('Fecha de Vencimiento', _expensa!.fechaVencimiento!),
                  if (!_expensa!.pagada && _expensa!.diasRestantes != null)
                    _buildInfoRow(
                      'Días Restantes',
                      _expensa!.diasRestantes! < 0
                          ? 'Vencida hace ${-_expensa!.diasRestantes!} días'
                          : _expensa!.diasRestantes! == 0
                              ? 'Vence hoy'
                              : '${_expensa!.diasRestantes} días',
                      color: _expensa!.diasRestantes! < 0
                          ? Colors.red
                          : _expensa!.diasRestantes! <= 5
                              ? Colors.orange
                              : Colors.green,
                    ),
                ],
              ),
            ),
          ),

          // Información de pago (si está pagada)
          if (_expensa!.pagada) ...[
            const SizedBox(height: 16),
            Card(
              color: Colors.green.withOpacity(0.1),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.check_circle, color: Colors.green),
                        const SizedBox(width: 8),
                        const Text(
                          'Pago Realizado',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const Divider(),
                    if (_expensa!.stripePaymentIntentId != null)
                      _buildInfoRow('ID de Transacción', _expensa!.stripePaymentIntentId!),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.grey, fontSize: 14),
          ),
          const SizedBox(width: 16),
          Flexible(
            child: Text(
              value,
              style: TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
                color: color,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}

// Formatter para número de tarjeta
class _CardNumberInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final text = newValue.text.replaceAll(' ', '');
    final buffer = StringBuffer();

    for (int i = 0; i < text.length; i++) {
      buffer.write(text[i]);
      if ((i + 1) % 4 == 0 && i + 1 != text.length) {
        buffer.write(' ');
      }
    }

    return TextEditingValue(
      text: buffer.toString(),
      selection: TextSelection.collapsed(offset: buffer.length),
    );
  }
}

// Formatter para fecha de expiración
class _ExpiryDateFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final text = newValue.text;

    if (text.length >= 2 && !text.contains('/')) {
      return TextEditingValue(
        text: '${text.substring(0, 2)}/${text.substring(2)}',
        selection: TextSelection.collapsed(offset: text.length + 1),
      );
    }

    return newValue;
  }
}
