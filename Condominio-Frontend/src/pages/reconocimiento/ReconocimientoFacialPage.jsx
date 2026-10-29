import React, { useState, useRef } from 'react';
import { recognizeFace } from '../../api/recognitionApi.jsx';
import Button from '../../components/button.jsx';

const ReconocimientoFacialPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [threshold, setThreshold] = useState(0.80);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Manejar cuando el video esté listo
  const handleVideoReady = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  // Activar cámara
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user' // Cámara frontal para reconocimiento facial
        } 
      });
      setStream(mediaStream);
      setCameraActive(true);
      
      // Esperar a que el video esté listo
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
      
      setResult(null);
      setError(null);
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      console.error('Error accessing camera:', err);
    }
  };

  // Detener cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  // Capturar foto de la cámara
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // Convertir canvas a blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
          setSelectedImage(file);
          setImagePreview(canvas.toDataURL('image/jpeg'));
        }
      }, 'image/jpeg', 0.8);
    }
  };

  // Procesar imagen para reconocimiento facial
  const processImage = async () => {
    if (!selectedImage) {
      setError('Por favor selecciona una imagen o captura una foto.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Enviar archivo directamente
      const response = await recognizeFace(selectedImage, threshold);
      
      setResult(response);
      
      // Mostrar resultado visual
      if (response.ok) {
        // Acceso permitido - verde
        document.body.style.backgroundColor = '#10B981'; // verde
        setTimeout(() => {
          document.body.style.backgroundColor = '';
        }, 3000);
      } else {
        // Acceso denegado - rojo
        document.body.style.backgroundColor = '#EF4444'; // rojo
        setTimeout(() => {
          document.body.style.backgroundColor = '';
        }, 3000);
      }
    } catch (err) {
      setError('Error al procesar la imagen: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Limpiar todo
  const clearAll = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (cameraActive) {
      stopCamera();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Reconocimiento Facial
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de control */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Opciones de Captura</h3>
          
          {/* Configuración de umbral */}
          <div className="border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Umbral de Confianza
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-600 w-16">
                {(threshold * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Umbral más alto = mayor precisión, menos coincidencias
            </p>
          </div>
          
          {/* Opción 1: Subir archivo */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subir imagen desde archivo
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Opción 2: Cámara */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capturar con cámara
            </label>
            {!cameraActive ? (
              <Button variant="guardar" onClick={startCamera} className="w-full">
                Activar Cámara
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="relative w-full h-48 bg-gray-100 rounded overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }} // Espejo para mejor UX
                    onLoadedMetadata={handleVideoReady}
                  />
                  {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <p className="text-gray-500">Iniciando cámara...</p>
                    </div>
                  )}
                </div>
                <Button variant="guardar" onClick={capturePhoto} className="w-full">
                  Capturar Foto
                </Button>
                <Button variant="cancelar" onClick={stopCamera} className="w-full">
                  Detener Cámara
                </Button>
              </div>
            )}
          </div>

          {/* Canvas oculto para captura */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Botones de acción */}
          <div className="flex space-x-2">
            <Button 
              variant="guardar" 
              onClick={processImage}
              disabled={!selectedImage || isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Procesando...' : 'Reconocer Persona'}
            </Button>
            <Button variant="cancelar" onClick={clearAll} className="flex-1">
              Limpiar
            </Button>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700">Vista Previa y Resultados</h3>
          
          {/* Vista previa de imagen */}
          {imagePreview && (
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen seleccionada:
              </label>
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-contain bg-gray-100 rounded"
              />
            </div>
          )}

          {/* Resultados */}
          {result && (
            <div className={`border rounded-lg p-4 ${
              result.ok 
                ? 'border-green-500 bg-green-50' 
                : 'border-red-500 bg-red-50'
            }`}>
              <h4 className={`text-lg font-semibold mb-2 ${
                result.ok ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.ok ? '✅ PERSONA RECONOCIDA' : '❌ PERSONA NO RECONOCIDA'}
              </h4>
              
              <div className="space-y-2 text-sm">
                {result.ok ? (
                  <>
                    <p><strong>Nombre:</strong> {result.nombre || 'No disponible'}</p>
                    <p><strong>Tipo:</strong> {result.tipo === 'persona' ? 'Residente' : 'Empleado'}</p>
                    <p><strong>ID:</strong> {result.id || 'No disponible'}</p>
                    <p><strong>Similitud:</strong> {(result.similaridad * 100).toFixed(1)}%</p>
                    <p><strong>UUID Luxand:</strong> {result.uuid || 'No disponible'}</p>
                    <p><strong>Umbral usado:</strong> {(result.umbral * 100).toFixed(0)}%</p>
                  </>
                ) : (
                  <>
                    <p><strong>Razón:</strong> {result.reason || 'Sin coincidencias'}</p>
                    <p><strong>Detalle:</strong> {result.detail || 'No se encontraron coincidencias'}</p>
                    <p><strong>Umbral usado:</strong> {(result.umbral * 100).toFixed(0)}%</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Errores */}
          {error && (
            <div className="border border-red-500 bg-red-50 rounded-lg p-4">
              <h4 className="text-red-800 font-semibold mb-2">Error:</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReconocimientoFacialPage;
