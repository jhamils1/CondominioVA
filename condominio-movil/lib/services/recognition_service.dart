import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class RecognitionService {
  static const _storage = FlutterSecureStorage();

  // Reconocimiento facial usando imagen
  static Future<Map<String, dynamic>> recognizeFace(
    File imageFile,
    double threshold,
  ) async {
    try {
      final token = await _storage.read(key: 'access_token');

      if (token == null) {
        return {'success': false, 'message': 'No hay token de acceso'};
      }

      // Crear request multipart
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConfig.baseUrl}/personas/reconocimiento_facial/'),
      );

      // Agregar headers de autenticación
      request.headers.addAll(ApiConfig.getAuthHeaders(token));

      // Agregar archivo de imagen
      request.files.add(
        await http.MultipartFile.fromPath(
          'image',
          imageFile.path,
          filename: 'face_recognition.jpg',
        ),
      );

      // Agregar parámetros
      request.fields['umbral'] = threshold.toString();

      // Enviar request
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('DEBUG - Respuesta del servidor (archivo): $data');

        // Manejar respuesta en formato lista (nuevo formato del backend)
        if (data is List && data.isNotEmpty) {
          final person = data[0];
          print('DEBUG - Procesando persona: $person');
          final result = {
            'success': true,
            'message': 'Reconocimiento exitoso',
            'data': {
              'persona_id': null, // No disponible en este formato
              'similaridad': person['probability'] ?? 0.0,
              'uuid': person['uuid'],
              'nombre': person['name'] ?? 'Persona identificada',
              'tipo': 'persona',
            },
          };
          print('DEBUG - Resultado final: $result');
          return result;
        }
        // Manejar respuesta en formato diccionario (formato anterior)
        else if (data is Map && data['ok'] == true) {
          return {
            'success': true,
            'message': 'Reconocimiento exitoso',
            'data': {
              'persona_id': data['persona_id'],
              'similaridad': data['similaridad'],
              'uuid': data['uuid'],
              'nombre': data['nombre'] ?? 'Persona identificada',
              'tipo': data['tipo'] ?? 'persona',
            },
          };
        } else {
          return {
            'success': false,
            'message': data['reason'] ?? 'Persona no reconocida',
            'data': data,
          };
        }
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['detail'] ?? 'Error en el reconocimiento',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Error de conexión: $e'};
    }
  }

  // Reconocimiento facial usando URL de imagen
  static Future<Map<String, dynamic>> recognizeFaceFromUrl(
    String imageUrl,
    double threshold,
  ) async {
    try {
      final token = await _storage.read(key: 'access_token');

      if (token == null) {
        return {'success': false, 'message': 'No hay token de acceso'};
      }

      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/personas/reconocimiento_facial/'),
        headers: ApiConfig.getAuthHeaders(token),
        body: jsonEncode({'image_url': imageUrl, 'umbral': threshold}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('DEBUG - Respuesta del servidor (URL): $data');

        // Manejar respuesta en formato lista (nuevo formato del backend)
        if (data is List && data.isNotEmpty) {
          final person = data[0];
          return {
            'success': true,
            'message': 'Reconocimiento exitoso',
            'data': {
              'persona_id': null, // No disponible en este formato
              'similaridad': person['probability'] ?? 0.0,
              'uuid': person['uuid'],
              'nombre': person['name'] ?? 'Persona identificada',
              'tipo': 'persona',
            },
          };
        }
        // Manejar respuesta en formato diccionario (formato anterior)
        else if (data is Map && data['ok'] == true) {
          return {
            'success': true,
            'message': 'Reconocimiento exitoso',
            'data': {
              'persona_id': data['persona_id'],
              'similaridad': data['similaridad'],
              'uuid': data['uuid'],
              'nombre': data['nombre'] ?? 'Persona identificada',
              'tipo': data['tipo'] ?? 'persona',
            },
          };
        } else {
          return {
            'success': false,
            'message': data['reason'] ?? 'Persona no reconocida',
            'data': data,
          };
        }
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['detail'] ?? 'Error en el reconocimiento',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Error de conexión: $e'};
    }
  }

  // Enrolar persona en el sistema de reconocimiento
  static Future<Map<String, dynamic>> enrollPerson(
    int personId,
    File imageFile,
  ) async {
    try {
      final token = await _storage.read(key: 'access_token');

      if (token == null) {
        return {'success': false, 'message': 'No hay token de acceso'};
      }

      // Crear request multipart
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConfig.baseUrl}/personas/$personId/agregar_foto/'),
      );

      // Agregar headers de autenticación
      request.headers.addAll(ApiConfig.getAuthHeaders(token));

      // Agregar archivo de imagen
      request.files.add(
        await http.MultipartFile.fromPath(
          'image',
          imageFile.path,
          filename: 'enroll_face.jpg',
        ),
      );

      // Enviar request
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'message': 'Persona enrolada exitosamente',
          'data': data,
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['detail'] ?? 'Error al enrolar persona',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Error de conexión: $e'};
    }
  }
}
