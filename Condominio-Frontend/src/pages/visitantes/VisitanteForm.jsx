// src/pages/visitantes/VisitanteForm.jsx
import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const VisitanteForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    // Atributos heredados de Persona
    nombre: "",
    apellido: "",
    telefono: "",
    imagen: null,
    estado: "A",
    sexo: "M",
    CI: "",
    fecha_nacimiento: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        // Atributos heredados de Persona
        nombre: initialData.nombre || "",
        apellido: initialData.apellido || "",
        telefono: initialData.telefono || "",
        imagen: initialData.imagen || null,
        estado: initialData.estado || "A",
        sexo: initialData.sexo || "M",
        CI: initialData.CI || "",
        fecha_nacimiento: initialData.fecha_nacimiento ? 
          initialData.fecha_nacimiento.split('T')[0] : "",
      });
    } else {
      // Resetear formulario cuando no hay datos iniciales
      setFormData({
        nombre: "",
        apellido: "",
        telefono: "",
        imagen: null,
        estado: "A",
        sexo: "M",
        CI: "",
        fecha_nacimiento: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };


  return (
    <StyledForm onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Editar Visitante' : 'Agregar Visitante'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Información Personal */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información Personal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="nombre">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingrese el nombre"
              />
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="apellido">
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingrese el apellido"
              />
            </div>

            {/* CI */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="CI">
                Cédula de Identidad *
              </label>
              <input
                type="text"
                id="CI"
                name="CI"
                value={formData.CI}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingrese la cédula"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="telefono">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingrese el teléfono"
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_nacimiento">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Sexo */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="sexo">
                Sexo *
              </label>
              <select
                id="sexo"
                name="sexo"
                value={formData.sexo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
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
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="imagen">
                Imagen
              </label>
              <input
                type="file"
                id="imagen"
                name="imagen"
                onChange={handleChange}
                accept="image/*"
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formData.imagen && typeof formData.imagen === 'string' && (
                <div className="mt-2">
                  <img
                    src={formData.imagen}
                    alt="Imagen actual"
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </div>
    </StyledForm>
  );
};

export default VisitanteForm;
