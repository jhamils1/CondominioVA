import React, { useState, useRef } from 'react';
import { addExtraPhotoToPerson, addExtraPhotoToEmployee } from '../api/recognitionApi.jsx';
import Button from './button.jsx';

const AddExtraPhotoModal = ({ 
  isOpen, 
  onClose, 
  personData, 
  personType = 'persona' // 'persona' o 'empleado'
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Limpiar estado cuando se abre/cierra el modal
  React.useEffect(() => {
    if (!isOpen) {
      clearAll();
    }
  }, [isOpen]);

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

  // Agregar foto extra
  const addExtraPhoto = async () => {
    if (!selectedImage) {
      setError('Por favor selecciona una imagen o captura una foto.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let response;
      if (personType === 'persona') {
        response = await addExtraPhotoToPerson(personData.id, selectedImage);
      } else {
        response = await addExtraPhotoToEmployee(personData.id, selectedImage);
      }
      
      setResult(response);
      
      // Limpiar formulario después del éxito
      if (response.ok) {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      setError('Error al agregar foto extra: ' + err.message);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Agregar Foto Extra - {personData?.nombre} {personData?.apellido}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel de control */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Captura de Imagen</h3>
              
              {/* Información de la persona */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-2">Información:</h4>
                <p><strong>Tipo:</strong> {personType === 'persona' ? 'Residente' : 'Empleado'}</p>
                <p><strong>Nombre:</strong> {personData?.nombre} {personData?.apellido}</p>
                <p><strong>ID:</strong> {personData?.id}</p>
                <p><strong>Estado Luxand:</strong> {personData?.luxand_uuid ? '✅ Enrolado' : '❌ No enrolado'}</p>
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
                  onClick={addExtraPhoto}
                  disabled={!selectedImage || isProcessing || !personData?.luxand_uuid}
                  className="flex-1"
                >
                  {isProcessing ? 'Procesando...' : 'Agregar Foto Extra'}
                </Button>
                <Button variant="cancelar" onClick={clearAll} className="flex-1">
                  Limpiar
                </Button>
              </div>

              {/* Advertencia si no está enrolado */}
              {!personData?.luxand_uuid && (
                <div className="border border-yellow-500 bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-yellow-800 font-semibold mb-2">⚠️ Advertencia:</h4>
                  <p className="text-yellow-700 text-sm">
                    Esta persona no está enrolada en el sistema de reconocimiento facial. 
                    Primero debe ser enrolada antes de agregar fotos extras.
                  </p>
                </div>
              )}
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
                    {result.ok ? '✅ FOTO AGREGADA EXITOSAMENTE' : '❌ ERROR AL AGREGAR FOTO'}
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    {result.ok ? (
                      <>
                        <p><strong>Estado:</strong> Foto extra agregada correctamente</p>
                        <p><strong>Mejora:</strong> La precisión del reconocimiento debería mejorar</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Error:</strong> {result.detail || 'Error desconocido'}</p>
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

              {/* Información adicional */}
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <h4 className="text-blue-800 font-semibold mb-2">ℹ️ Información:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Las fotos extras mejoran la precisión del reconocimiento</li>
                  <li>• Usa fotos con diferentes ángulos y expresiones</li>
                  <li>• La cara debe estar completamente visible</li>
                  <li>• Se recomienda agregar 2-3 fotos extras por persona</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botón de cerrar */}
          <div className="mt-6 flex justify-end">
            <Button variant="cancelar" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExtraPhotoModal;
