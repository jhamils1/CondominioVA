import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { fetchAllUnidades } from "../../api/unidadApi.jsx";

const ExpensaForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    unidad: "",
    monto: "",
    fecha_vencimiento: "",
    pagada: false,
    descripcion: "Expensa de condominio",
    currency: "usd",
  });

  const [unidades, setUnidades] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingData(true);
      try {
        const unidadesData = await fetchAllUnidades();
        setUnidades(unidadesData.results || unidadesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar las unidades disponibles');
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (initialData) {
      console.log('Datos iniciales recibidos en ExpensaForm:', initialData);
      setFormData({
        unidad: initialData.unidad || "",
        monto: initialData.monto || "",
        fecha_vencimiento: initialData.fecha_vencimiento ? 
          initialData.fecha_vencimiento.split('T')[0] : "",
        pagada: initialData.pagada || false,
        descripcion: initialData.descripcion || "Expensa de condominio",
        currency: initialData.currency || "usd",
      });
    } else {
      // Resetear formulario cuando no hay datos iniciales
      setFormData({
        unidad: "",
        monto: "",
        fecha_vencimiento: "",
        pagada: false,
        descripcion: "Expensa de condominio",
        currency: "usd",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.unidad) {
      alert('Por favor selecciona una unidad');
      return;
    }

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      alert('Por favor ingresa un monto válido mayor a 0');
      return;
    }

    if (!formData.fecha_vencimiento) {
      alert('Por favor selecciona la fecha de vencimiento');
      return;
    }

    // Validar que la fecha de vencimiento no sea en el pasado
    const hoy = new Date();
    const fechaVencimiento = new Date(formData.fecha_vencimiento);
    if (fechaVencimiento < hoy) {
      alert('La fecha de vencimiento no puede ser en el pasado');
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
    <StyledForm title={isEditing ? "Editar Expensa" : "Registrar Expensa"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información de la Expensa */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información de la Expensa</h3>
        
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

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="monto">
              Monto de la Expensa ($) *
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
            <p className="text-xs text-gray-500 mt-1">Ingresa el monto de la expensa en dólares</p>
          </div>

          {/* Fecha de Vencimiento */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_vencimiento">
              Fecha de Vencimiento *
            </label>
            <input
              type="date"
              id="fecha_vencimiento"
              name="fecha_vencimiento"
              value={formData.fecha_vencimiento}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">La fecha de emisión se asigna automáticamente</p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="descripcion">
              Descripción
            </label>
            <input
              type="text"
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Expensa de condominio"
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Descripción de la expensa</p>
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="currency">
              Moneda
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="usd">USD - Dólar Americano</option>
              <option value="eur">EUR - Euro</option>
              <option value="cop">COP - Peso Colombiano</option>
              <option value="mxn">MXN - Peso Mexicano</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Moneda para el pago</p>
          </div>

          {/* Estado de Pago */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="pagada"
                checked={formData.pagada}
                onChange={handleChange}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Marcar como pagada</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">Marca esta casilla si la expensa ya ha sido pagada</p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información Adicional</h3>

          {/* Estados de expensa */}
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-1">Pagada</h4>
              <p className="text-xs text-green-700">Expensa que ha sido cancelada completamente</p>
            </div>
            
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Pendiente</h4>
              <p className="text-xs text-yellow-700">Expensa que aún no ha sido pagada</p>
            </div>
            
            <div className="p-3 bg-red-50 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 mb-1">Vencida</h4>
              <p className="text-xs text-red-700">Expensa que ha pasado su fecha de vencimiento sin pagar</p>
            </div>
          </div>

          {/* Información importante */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Información Importante</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• La fecha de emisión se asigna automáticamente</li>
              <li>• El monto debe ser mayor a $0.00</li>
              <li>• La fecha de vencimiento no puede ser en el pasado</li>
              <li>• Las expensas vencidas pueden generar multas</li>
              <li>• Una vez creada, la expensa se asocia a la unidad seleccionada</li>
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

export default ExpensaForm;
