import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { fetchAllPropietarios } from "../../api/propietariosApi.jsx";
import { fetchAllUnidades } from "../../api/unidadApi.jsx";

const ContratoForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    propietario: "",
    unidad: "",
    fecha_contrato: "",
    cuota_mensual: "",
    estado: "P",
    costo_compra: "",
  });

  const [propietarios, setPropietarios] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingData(true);
      try {
        const [propietariosData, unidadesData] = await Promise.all([
          fetchAllPropietarios(),
          fetchAllUnidades()
        ]);
        
        setPropietarios(propietariosData.results || propietariosData);
        setUnidades(unidadesData.results || unidadesData);
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
    if (initialData) {
      console.log('Datos iniciales recibidos en ContratoForm:', initialData);
      setFormData({
        propietario: initialData.propietario || "",
        unidad: initialData.unidad || "",
        fecha_contrato: initialData.fecha_contrato ? 
          initialData.fecha_contrato.split('T')[0] : "",
        cuota_mensual: initialData.cuota_mensual || "",
        estado: initialData.estado || "P",
        costo_compra: initialData.costo_compra || "",
      });
    } else {
      // Resetear formulario cuando no hay datos iniciales
      setFormData({
        propietario: "",
        unidad: "",
        fecha_contrato: "",
        cuota_mensual: "",
        estado: "P",
        costo_compra: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que se hayan seleccionado propietario y unidad
    if (!formData.propietario || !formData.unidad) {
      alert('Por favor selecciona un propietario y una unidad');
      return;
    }

    // Convertir valores numéricos
    const dataToSubmit = {
      ...formData,
      cuota_mensual: formData.cuota_mensual ? parseFloat(formData.cuota_mensual) : null,
      costo_compra: formData.costo_compra ? parseFloat(formData.costo_compra) : null,
    };

    onSubmit(dataToSubmit);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Contrato" : "Registrar Contrato"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información del Contrato */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información del Contrato</h3>
        
          {/* Propietario */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="propietario">
              Propietario *
            </label>
            <select
              id="propietario"
              name="propietario"
              value={formData.propietario}
              onChange={handleChange}
              required
              disabled={loadingData}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona un propietario</option>
              {propietarios.map((propietario) => (
                <option key={propietario.id} value={propietario.id}>
                  {propietario.nombre_completo || `${propietario.nombre} ${propietario.apellido}`} - CI: {propietario.CI}
                </option>
              ))}
            </select>
            {loadingData && <p className="text-xs text-gray-500 mt-1">Cargando propietarios...</p>}
          </div>

          {/* Unidad */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="unidad">
              Unidad *
            </label>
            <select
              id="unidad"
              name="unidad"
              value={formData.unidad}
              onChange={handleChange}
              required
              disabled={loadingData}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona una unidad</option>
              {unidades.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.codigo} - Bloque: {unidad.bloque?.nombre || 'N/A'}
                </option>
              ))}
            </select>
            {loadingData && <p className="text-xs text-gray-500 mt-1">Cargando unidades...</p>}
          </div>

          {/* Fecha del Contrato */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_contrato">
              Fecha del Contrato *
            </label>
            <input
              type="date"
              id="fecha_contrato"
              name="fecha_contrato"
              value={formData.fecha_contrato}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="estado">
              Estado *
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="P">Pendiente</option>
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
              <option value="F">Finalizado</option>
            </select>
          </div>
        </div>

        {/* Información Financiera */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información Financiera</h3>

          {/* Cuota Mensual */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="cuota_mensual">
              Cuota Mensual ($)
            </label>
            <input
              type="number"
              id="cuota_mensual"
              name="cuota_mensual"
              value={formData.cuota_mensual}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Monto mensual a pagar por el contrato</p>
          </div>

          {/* Costo de Compra */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="costo_compra">
              Costo de Compra ($)
            </label>
            <input
              type="number"
              id="costo_compra"
              name="costo_compra"
              value={formData.costo_compra}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Costo total de compra de la unidad</p>
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Información Importante</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Una vez creado el contrato, podrás generar el PDF desde la lista</li>
              <li>• El PDF se guardará automáticamente en Cloudinary</li>
              <li>• Puedes descargar el PDF cuando esté disponible</li>
              <li>• Los campos financieros son opcionales pero recomendados</li>
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

export default ContratoForm;


