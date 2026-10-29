// src/pages/familiares/FamiliarForm.jsx
import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const FamiliarForm = ({ onSubmit, onCancel, initialData, personas = [], loading }) => {
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
    // Atributos específicos de Familiares
    persona_relacionada: "",
    parentesco: "",
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
        // Atributos específicos de Familiares
        persona_relacionada: initialData.persona_relacionada || "",
        parentesco: initialData.parentesco || "",
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
        persona_relacionada: "",
        parentesco: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Familiar" : "Registrar Familiar"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Información Personal */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información Personal</h3>
        
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
            />
          </div>

          {/* Cédula de Identidad */}
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
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_nacimiento">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              required
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
              <option value="">Selecciona el sexo</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>

          {/* Estado de Persona */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="estado">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
              <option value="S">Suspendido</option>
            </select>
          </div>

          {/* Foto */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="imagen">
              Foto (Opcional)
            </label>
            <input
              type="file"
              id="imagen"
              name="imagen"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {isEditing ? 'Selecciona una nueva imagen para reemplazar la actual (opcional)' : 'Selecciona una imagen para el perfil del familiar (opcional)'}
            </p>
            {formData.imagen && typeof formData.imagen === 'string' && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Imagen actual:</p>
                <img 
                  src={formData.imagen} 
                  alt="Imagen actual" 
                  className="w-20 h-20 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Información de Parentesco */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información de Parentesco</h3>

          {/* Persona Relacionada */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="persona_relacionada">
              Persona Relacionada *
            </label>
            <select
              id="persona_relacionada"
              name="persona_relacionada"
              value={formData.persona_relacionada}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona una persona</option>
              {personas.map(persona =>
                persona.id && persona.nombre_completo ? (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombre_completo} - {persona.tipo === 'P' ? 'Propietario' : persona.tipo === 'I' ? 'Inquilino' : persona.tipo}
                  </option>
                ) : null
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecciona el propietario o inquilino con quien tiene parentesco
            </p>
          </div>

          {/* Parentesco */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="parentesco">
              Parentesco *
            </label>
            <select
              id="parentesco"
              name="parentesco"
              value={formData.parentesco}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona el parentesco</option>
              <option value="PADRE">Padre</option>
              <option value="MADRE">Madre</option>
              <option value="HIJO">Hijo</option>
              <option value="HIJA">Hija</option>
              <option value="HERMANO">Hermano</option>
              <option value="HERMANA">Hermana</option>
              <option value="ESPOSO">Esposo</option>
              <option value="ESPOSA">Esposa</option>
            </select>
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

export default FamiliarForm;
