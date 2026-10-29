// src/pages/cargos/CargoForm.jsx
import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const CargoForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    salario_base: "",
    estado: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        salario_base: initialData.salario_base || "",
        estado: initialData.estado !== undefined ? initialData.estado : true,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Cargo" : "Registrar Cargo"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información del Cargo */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información del Cargo</h3>
        
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="nombre">
              Nombre del Cargo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Administrador, Conserje, etc."
            />
          </div>

          {/* Salario Base */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="salario_base">
              Salario Base *
            </label>
            <input
              type="number"
              id="salario_base"
              name="salario_base"
              value={formData.salario_base}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="estado">
              Estado del Cargo
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="estado"
                name="estado"
                checked={formData.estado}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="estado" className="text-sm text-gray-700">
                Cargo activo
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Los cargos inactivos no aparecerán en las opciones de empleados
            </p>
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
        <Button variant="guardar" type="submit" disabled={loading}>
          {isEditing ? "Guardar Cambios" : "Guardar"}
        </Button>
      </div>
    </StyledForm>
  );
};

export default CargoForm;
