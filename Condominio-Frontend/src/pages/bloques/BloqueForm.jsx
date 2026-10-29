// src/pages/bloques/BloqueForm.jsx
import React, { useEffect, useState } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const BloqueForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        direccion: initialData.direccion || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Bloque" : "Registrar Bloque"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="nombre">
            Nombre del Bloque
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            maxLength={20}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="direccion">
            Dirección
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
            maxLength={100}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

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

export default BloqueForm;
