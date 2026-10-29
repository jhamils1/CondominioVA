import React, { useState, useRef, useEffect } from 'react';
import { enrollPerson } from '../../api/recognitionApi.jsx';
import { fetchAllPropietarios } from '../../api/propietariosApi.jsx';
import { fetchAllInquilinos } from '../../api/inquilinosApi.jsx';
import { fetchAllEmpleados } from '../../api/empleadosApi.jsx';
import { fetchAllFamiliares } from '../../api/familiaresApi.jsx';
import { fetchAllVisitantes } from '../../api/visitantesApi.jsx';
import Button from '../../components/button.jsx';

const EnrolarPersonaPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [personType, setPersonType] = useState('propietario');
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Asegurar que el stream se conecte al elemento <video> cuando esté montado
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      try {
        videoRef.current.srcObject = stream;
        const playPromise = videoRef.current.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => {
            // Ignorar errores de autoplay; el botón Capturar implica interacción del usuario
          });
        }
      } catch (_) {
        // noop
      }
    }
  }, [cameraActive, stream]);

  // Cargar personas según el tipo seleccionado
  const loadPersons = async (type) => {
    setLoading(true);
    try {
      let data = [];
      switch (type) {
        case 'propietario':
          data = await fetchAllPropietarios();
          break;
        case 'inquilino':
          data = await fetchAllInquilinos();
          break;
        case 'empleado':
          data = await fetchAllEmpleados();
          break;
        case 'familiar':
          data = await fetchAllFamiliares();
          break;
        case 'visitante':
          data = await fetchAllVisitantes();
          break;
        default:
          data = [];
      }
      setPersons(data);
    } catch (err) {
      setError('Error al cargar ' + type + 's: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersons(personType);
  }, [personType]);

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
          facingMode: 'user'
        } 
      });
      setStream(mediaStream);
      setCameraActive(true);
      // En algunos navegadores, conectar el stream tras un pequeño retraso mejora la fiabilidad
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play?.();
        }
      }, 100);
    } catch (err) {
      setError('Error al acceder a la cámara: ' + err.message);
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

  // Capturar foto desde cámara
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          setSelectedImage(file);
          setImagePreview(URL.createObjectURL(file));
          setResult(null);
          setError(null);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  // Manejar envío
  const handleSubmit = async () => {
    if (!selectedImage) {
      setError('Por favor selecciona una imagen.');
      return;
    }

    if (!selectedPerson) {
      setError('Por favor selecciona una persona.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let response;
      
      // Enrolar persona
      if (personType === 'empleado') {
        response = await enrollPerson(null, selectedPerson.id, selectedImage);
      } else {
        response = await enrollPerson(selectedPerson.id, null, selectedImage);
      }
      
      setResult(response);
      
      // Limpiar formulario después del éxito
      if (response.ok) {
        setSelectedPerson(null);
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      setError('Error: ' + err.message);
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
    setSelectedPerson(null);
    if (cameraActive) {
      stopCamera();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Enrolar Persona - Sistema de Reconocimiento Facial
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel izquierdo - Selección de persona */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Seleccionar Persona a Enrolar
            </h3>
            
            {/* Selector de tipo */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Tipo de Persona
              </label>
              <select
                value={personType}
                onChange={(e) => setPersonType(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="propietario">Propietarios</option>
                <option value="inquilino">Inquilinos</option>
                <option value="empleado">Empleados</option>
                <option value="familiar">Familiares</option>
                <option value="visitante">Visitantes</option>
              </select>
            </div>

            {/* Lista de personas */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Cargando...</div>
              ) : persons.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No hay {personType}s disponibles</div>
              ) : (
                persons.map((person) => {
                  // Construir nombre completo si no existe
                  const nombreCompleto = person.nombre_completo || `${person.nombre || ''} ${person.apellido || ''}`.trim();
                  
                  // Información adicional básica
                  const infoAdicional = person.CI || 'Sin CI';
                  
                  return (
                    <div
                      key={person.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedPerson?.id === person.id ? 'bg-indigo-50 border-indigo-200' : ''
                      }`}
                      onClick={() => setSelectedPerson(person)}
                    >
                      <div className="flex items-center space-x-3">
                        {person.imagen && (
                          <img
                            src={person.imagen}
                            alt={nombreCompleto}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{nombreCompleto}</p>
                          <p className="text-sm text-gray-500">{infoAdicional}</p>
                          {person.luxand_uuid && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Ya Enrolado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho - Captura de imagen */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700">Capturar Imagen</h3>
          
          {/* Vista previa de imagen */}
          <div className="relative">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : cameraActive ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  onLoadedMetadata={handleVideoReady}
                  className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <Button
                    variant="guardar"
                    onClick={capturePhoto}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Capturar
                  </Button>
                  <Button
                    variant="cancelar"
                    onClick={stopCamera}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">No hay imagen seleccionada</p>
                  <div className="space-x-2">
                    <Button
                      variant="guardar"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Seleccionar Archivo
                    </Button>
                    <Button
                      variant="guardar"
                      onClick={startCamera}
                    >
                      Usar Cámara
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input de archivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Botones de acción */}
          <div className="flex space-x-2">
            <Button
              variant="guardar"
              onClick={handleSubmit}
              disabled={isProcessing || !selectedImage || !selectedPerson}
            >
              {isProcessing ? 'Enrolando...' : 'Enrolar Persona'}
            </Button>
            <Button variant="cancelar" onClick={clearAll}>
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-green-800 font-semibold mb-2">Resultado:</h4>
          <p className="text-green-700 text-sm">{JSON.stringify(result, null, 2)}</p>
        </div>
      )}

      {/* Errores */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-red-800 font-semibold mb-2">Error:</h4>
          <p className="text-red-700 text-sm">{error}</p>
          {error.includes("No se detectó una cara") && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h5 className="text-yellow-800 font-semibold text-sm mb-2">💡 Consejos para una mejor imagen:</h5>
              <ul className="text-yellow-700 text-xs space-y-1">
                <li>• Asegúrate de que el rostro esté bien iluminado</li>
                <li>• La persona debe mirar directamente a la cámara</li>
                <li>• Evita sombras en el rostro</li>
                <li>• La imagen debe ser clara y nítida</li>
                <li>• El rostro debe ocupar una buena parte de la imagen</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrolarPersonaPage;