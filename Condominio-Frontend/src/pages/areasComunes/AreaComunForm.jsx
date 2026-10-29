// src/pages/areasComunes/AreaComunForm.jsx
import React, { useEffect, useState } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const AreaComunForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    ubicacion: "",
    capacidad_maxima: "",
    horario_apertura: "",
    horario_cierre: "",
    estado: "A",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        ubicacion: initialData.ubicacion || "",
        capacidad_maxima: initialData.capacidad_maxima || "",
        horario_apertura: initialData.horario_apertura || "",
        horario_cierre: initialData.horario_cierre || "",
        estado: initialData.estado || "A",
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
    
    // Validar que la capacidad máxima sea al menos 1
    if (formData.capacidad_maxima < 1) {
      alert("La capacidad máxima debe ser al menos 1");
      return;
    }
    
    onSubmit(formData);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Área Común" : "Registrar Área Común"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="nombre">
            Nombre del Área <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            maxLength={100}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="ubicacion">
            Ubicación <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="ubicacion"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Ej: Piso 1, Edificio Principal"
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="descripcion">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Descripción del área común"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="capacidad_maxima">
            Capacidad Máxima <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="capacidad_maxima"
            name="capacidad_maxima"
            value={formData.capacidad_maxima}
            onChange={handleChange}
            required
            min={1}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="estado">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="A">Activo</option>
            <option value="I">Inactivo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="horario_apertura">
            Horario de Apertura <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="horario_apertura"
            name="horario_apertura"
            value={formData.horario_apertura}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="horario_cierre">
            Horario de Cierre <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="horario_cierre"
            name="horario_cierre"
            value={formData.horario_cierre}
            onChange={handleChange}
            required
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

export default AreaComunForm;
