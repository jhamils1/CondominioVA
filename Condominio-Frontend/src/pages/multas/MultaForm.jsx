import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { fetchAllExpensas } from "../../api/expensaApi.jsx";

const MultaForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    expensa: "",
    monto: "",
    tipo: "I",
  });

  const [expensas, setExpensas] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingData(true);
      try {
        const expensasData = await fetchAllExpensas();
        setExpensas(expensasData.results || expensasData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar las expensas disponibles');
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log('Datos iniciales recibidos en MultaForm:', initialData);
      setFormData({
        expensa: initialData.expensa || "",
        monto: initialData.monto || "",
        tipo: initialData.tipo || "I",
      });
    } else {
      // Resetear formulario cuando no hay datos iniciales
      setFormData({
        expensa: "",
        monto: "",
        tipo: "I",
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
    
    // Validar campos requeridos
    if (!formData.expensa) {
      alert('Por favor selecciona una expensa');
      return;
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      alert('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    // Preparar datos para envío
    const dataToSubmit = {
      ...formData,
      monto: parseFloat(formData.monto),
    };

    onSubmit(dataToSubmit);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Multa" : "Registrar Multa"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información de la Multa */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información de la Multa</h3>
        
          {/* Expensa */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="expensa">
              Expensa *
            </label>
            <select
              id="expensa"
              name="expensa"
              value={formData.expensa}
              onChange={handleChange}
              required
              disabled={loadingData}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona una expensa</option>
              {expensas.map((expensa) => (
                <option key={expensa.id} value={expensa.id}>
                  Expensa {expensa.id} - ${expensa.monto || 'N/A'}
                </option>
              ))}
            </select>
            {loadingData && <p className="text-xs text-gray-500 mt-1">Cargando expensas...</p>}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="monto">
              Monto de la Multa ($) *
            </label>
            <input
              type="number"
              id="monto"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Ingresa el monto de la multa en dólares</p>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="tipo">
              Tipo de Multa *
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="I">Incidente</option>
              <option value="F">Falta de Pago</option>
              <option value="O">Otros</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Selecciona el tipo de multa</p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información Adicional</h3>

          {/* Descripción de tipos */}
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Incidente</h4>
              <p className="text-xs text-blue-700">Multa aplicada por algún incidente reportado</p>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-1">Falta de Pago</h4>
              <p className="text-xs text-red-700">Multa por retraso en el pago de expensas</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-1">Otros</h4>
              <p className="text-xs text-gray-700">Multa por otras razones no especificadas</p>
            </div>
          </div>

          {/* Información importante */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Información Importante</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• La fecha de la multa se asigna automáticamente</li>
              <li>• El monto debe ser mayor a $0.00</li>
              <li>• Una vez creada, la multa se asocia a la expensa seleccionada</li>
              <li>• Las multas pueden ser utilizadas en incidentes</li>
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

export default MultaForm;
