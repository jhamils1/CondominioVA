import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { fetchAllPropietarios } from "../../api/propietariosApi.jsx";
import { fetchAllMultas } from "../../api/multaApi.jsx";

const IncidenteForm = ({ onSubmit, onCancel, initialData, loading }) => {
  console.log('IncidenteForm renderizado con:', { initialData, loading });
  
  // Error boundary local
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Resetear error cuando cambian los props
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');
  }, [initialData]);
  const [formData, setFormData] = useState({
    propietario: "",
    multa: "",
    descripcion: "",
    fecha_incidente: "",
  });

  const [propietarios, setPropietarios] = useState([]);
  const [multas, setMultas] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingData(true);
      try {
        const [propietariosData, multasData] = await Promise.all([
          fetchAllPropietarios(),
          fetchAllMultas()
        ]);
        
        setPropietarios(propietariosData.results || propietariosData);
        setMultas(multasData.results || multasData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar los datos necesarios');
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    try {
      if (initialData) {
        console.log('Datos iniciales recibidos en IncidenteForm:', initialData);
        setFormData({
          propietario: initialData.propietario || "",
          multa: initialData.multa || "",
          descripcion: initialData.descripcion || "",
          fecha_incidente: initialData.fecha_incidente ? 
            (() => {
              try {
                const date = new Date(initialData.fecha_incidente);
                return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
              } catch (error) {
                console.error('Error al procesar fecha:', error);
                return "";
              }
            })() : "",
        });
      } else {
        // Resetear formulario cuando no hay datos iniciales
        setFormData({
          propietario: "",
          multa: "",
          descripcion: "",
          fecha_incidente: "",
        });
      }
    } catch (error) {
      console.error('Error en useEffect de IncidenteForm:', error);
      setHasError(true);
      setErrorMessage('Error al cargar los datos del incidente: ' + error.message);
      // Resetear formulario en caso de error
      setFormData({
        propietario: "",
        multa: "",
        descripcion: "",
        fecha_incidente: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    try {
      const { name, value } = e.target;
      
      setFormData({
        ...formData,
        [name]: value
      });
    } catch (error) {
      console.error('Error en handleChange:', error);
      setHasError(true);
      setErrorMessage('Error al procesar el cambio: ' + error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.descripcion.trim()) {
      alert('Por favor ingresa una descripción del incidente');
      return;
    }

    if (!formData.fecha_incidente) {
      alert('Por favor selecciona la fecha del incidente');
      return;
    }

    // Preparar datos para envío
    const dataToSubmit = {
      ...formData,
      propietario: formData.propietario || null,
      multa: formData.multa || null,
    };

    onSubmit(dataToSubmit);
  };

  const isEditing = !!initialData;

  // Mostrar error si existe
  if (hasError) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-red-600">
          Error al cargar el formulario
        </h2>
        <p className="text-red-600 mb-4">{errorMessage}</p>
        <div className="flex space-x-2">
          <Button variant="cancelar" onClick={onCancel}>
            Cerrar
          </Button>
          <Button variant="guardar" onClick={() => {
            setHasError(false);
            setErrorMessage('');
          }}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <StyledForm title={isEditing ? "Editar Incidente" : "Registrar Incidente"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información del Incidente */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información del Incidente</h3>
        
          {/* Propietario */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="propietario">
              Propietario (Opcional)
            </label>
            <select
              id="propietario"
              name="propietario"
              value={formData.propietario}
              onChange={handleChange}
              disabled={loadingData}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sin propietario específico</option>
              {propietarios.map((propietario) => (
                <option key={propietario.id} value={propietario.id}>
                  {propietario.nombre_completo || `${propietario.nombre} ${propietario.apellido}`} - CI: {propietario.CI}
                </option>
              ))}
            </select>
            {loadingData && <p className="text-xs text-gray-500 mt-1">Cargando propietarios...</p>}
          </div>

          {/* Fecha del Incidente */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_incidente">
              Fecha y Hora del Incidente *
            </label>
            <input
              type="datetime-local"
              id="fecha_incidente"
              name="fecha_incidente"
              value={formData.fecha_incidente}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="descripcion">
              Descripción del Incidente *
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe detalladamente lo que ocurrió en el incidente..."
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Proporciona todos los detalles relevantes del incidente
            </p>
          </div>
        </div>

        {/* Información de Multa */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información de Multa</h3>

          {/* Multa */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="multa">
              Multa Asociada (Opcional)
            </label>
            <select
              id="multa"
              name="multa"
              value={formData.multa}
              onChange={handleChange}
              disabled={loadingData}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sin multa</option>
              {multas.map((multa) => (
                <option key={multa.id} value={multa.id}>
                  {multa.descripcion || `Multa ${multa.id}`} - ${multa.monto || 'N/A'}
                </option>
              ))}
            </select>
            {loadingData && <p className="text-xs text-gray-500 mt-1">Cargando multas...</p>}
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Información Importante</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• La descripción es obligatoria y debe ser detallada</li>
              <li>• La fecha y hora del incidente son obligatorias</li>
              <li>• El propietario y la multa son opcionales</li>
              <li>• Una vez registrado, el incidente no se puede modificar fácilmente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-4 mt-6 border-t">
        {onCancel && (
          <Button variant="cancelar" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button variant="guardar" type="submit" disabled={loading || loadingData}>
          {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Guardar"}
        </Button>
      </div>
    </StyledForm>
  );
};

export default IncidenteForm;
