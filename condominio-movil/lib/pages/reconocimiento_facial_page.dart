import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/recognition_service.dart';

class ReconocimientoFacialPage extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDark;

  const ReconocimientoFacialPage({
    super.key,
    required this.onToggleTheme,
    required this.isDark,
  });

  @override
  State<ReconocimientoFacialPage> createState() =>
      _ReconocimientoFacialPageState();
}

class _ReconocimientoFacialPageState extends State<ReconocimientoFacialPage> {
  final ImagePicker _picker = ImagePicker();
  File? _selectedImage;
  bool _isProcessing = false;
  double _threshold = 0.50;
  Map<String, dynamic>? _recognitionResult;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Reconocimiento Facial"),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(widget.isDark ? Icons.wb_sunny : Icons.nightlight_round),
            onPressed: widget.onToggleTheme,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Selector de imagen
            _buildImageSelector(),
            const SizedBox(height: 20),

            // Controles de umbral
            _buildThresholdControls(),
            const SizedBox(height: 20),

            // Botón de reconocimiento
            _buildRecognitionButton(),
            const SizedBox(height: 20),

            // Resultado del reconocimiento
            if (_recognitionResult != null) _buildRecognitionResult(),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSelector() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              "Seleccionar Imagen",
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),

            if (_selectedImage != null) ...[
              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.file(_selectedImage!, fit: BoxFit.cover),
                ),
              ),
              const SizedBox(height: 16),
            ],

            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isProcessing ? null : _pickImageFromCamera,
                    icon: const Icon(Icons.camera_alt),
                    label: const Text("Cámara"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.deepPurple,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isProcessing ? null : _pickImageFromGallery,
                    icon: const Icon(Icons.photo_library),
                    label: const Text("Galería"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.deepPurple,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThresholdControls() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              "Umbral de Confianza: ${(_threshold * 100).toInt()}%",
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 16),
            Slider(
              value: _threshold,
              min: 0.5,
              max: 1.0,
              divisions: 10,
              activeColor: Colors.deepPurple,
              onChanged: _isProcessing
                  ? null
                  : (value) {
                      setState(() {
                        _threshold = value;
                      });
                    },
            ),
            const SizedBox(height: 8),
            Text(
              "Valores recomendados:\n• 80% - Seguridad estándar\n• 90% - Alta seguridad\n• 70% - Acceso rápido",
              style: Theme.of(context).textTheme.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecognitionButton() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: _isProcessing || _selectedImage == null
                    ? null
                    : _performRecognition,
                icon: _isProcessing
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.face),
                label: Text(
                  _isProcessing ? "Procesando..." : "Reconocer Persona",
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.deepPurple,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
            if (_selectedImage == null) ...[
              const SizedBox(height: 8),
              Text(
                "Selecciona una imagen primero",
                style: TextStyle(color: Colors.red, fontSize: 12),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildRecognitionResult() {
    final isSuccess = _recognitionResult!['success'] == true;

    return Card(
      elevation: 4,
      child: Container(
        padding: const EdgeInsets.all(16.0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          color: isSuccess ? Colors.green.shade50 : Colors.red.shade50,
          border: Border.all(
            color: isSuccess ? Colors.green : Colors.red,
            width: 2,
          ),
        ),
        child: Column(
          children: [
            Icon(
              isSuccess ? Icons.check_circle : Icons.cancel,
              color: isSuccess ? Colors.green : Colors.red,
              size: 48,
            ),
            const SizedBox(height: 16),
            Text(
              isSuccess ? "✅ ACCESO AUTORIZADO" : "❌ ACCESO DENEGADO",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isSuccess ? Colors.green : Colors.red,
              ),
            ),
            const SizedBox(height: 16),
            if (isSuccess) ...[
              Text(
                "Persona identificada:",
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                _recognitionResult!['data']['nombre'] ?? 'Persona identificada',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "Similitud: ${(_recognitionResult!['data']['similaridad'] * 100).toStringAsFixed(1)}%",
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              ),
            ] else ...[
              Text(
                _recognitionResult!['message'] ?? 'Persona no reconocida',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  _recognitionResult = null;
                  _selectedImage = null;
                });
              },
              child: const Text("Nueva Verificación"),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickImageFromCamera() async {
    // Solicitar permisos de cámara
    final status = await Permission.camera.request();
    if (status != PermissionStatus.granted) {
      _showErrorDialog("Permisos de cámara denegados");
      return;
    }

    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
      );

      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
          _recognitionResult = null;
        });
      }
    } catch (e) {
      _showErrorDialog("Error al capturar imagen: $e");
    }
  }

  Future<void> _pickImageFromGallery() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );

      if (image != null) {
        setState(() {
          _selectedImage = File(image.path);
          _recognitionResult = null;
        });
      }
    } catch (e) {
      _showErrorDialog("Error al seleccionar imagen: $e");
    }
  }

  Future<void> _performRecognition() async {
    if (_selectedImage == null) return;

    setState(() {
      _isProcessing = true;
      _recognitionResult = null;
    });

    try {
      final result = await RecognitionService.recognizeFace(
        _selectedImage!,
        _threshold,
      );
      print('DEBUG - Resultado del reconocimiento: $result');

      setState(() {
        _recognitionResult = result;
        _isProcessing = false;
      });
    } catch (e) {
      setState(() {
        _isProcessing = false;
      });
      _showErrorDialog("Error durante el reconocimiento: $e");
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Error"),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("OK"),
          ),
        ],
      ),
    );
  }
}
