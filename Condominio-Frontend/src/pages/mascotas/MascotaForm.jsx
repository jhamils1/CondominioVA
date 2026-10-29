// src/pages/mascotas/MascotaForm.jsx
import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const MascotaForm = ({ onSubmit, onCancel, initialData, personas = [], loading }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    especie: "PERRO",
    tipo: "MACHO",
    foto: null,
    raza: "",
    fecha_nacimiento: "",
    observaciones: "",
    persona: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        especie: initialData.especie || "PERRO",
        tipo: initialData.tipo || "MACHO",
        foto: initialData.foto || null,
        raza: initialData.raza || "",
        fecha_nacimiento: initialData.fecha_nacimiento ? 
          initialData.fecha_nacimiento.split('T')[0] : "",
        observaciones: initialData.observaciones || "",
        persona: initialData.persona || "",
      });
    } else {
      // Resetear formulario cuando no hay datos iniciales
      setFormData({
        nombre: "",
        especie: "PERRO",
        tipo: "MACHO",
        foto: null,
        raza: "",
        fecha_nacimiento: "",
        observaciones: "",
        persona: "",
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

  const especieOptions = [
    { value: 'PERRO', label: 'Perro' },
    { value: 'GATO', label: 'Gato' },
    { value: 'AVE', label: 'Ave' },
    { value: 'ROEDOR', label: 'Roedor' },
    { value: 'REPTIL', label: 'Reptil' },
    { value: 'OTRO', label: 'Otro' }
  ];

  const tipoOptions = [
    { value: 'MACHO', label: 'Macho' },
    { value: 'HEMBRA', label: 'Hembra' }
  ];

  return (
    <StyledForm onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Editar Mascota' : 'Agregar Mascota'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Información de la Mascota */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información de la Mascota</h3>
          
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
                placeholder="Ingrese el nombre de la mascota"
              />
            </div>

            {/* Especie */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="especie">
                Especie *
              </label>
              <select
                id="especie"
                name="especie"
                value={formData.especie}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {especieOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="tipo">
                Tipo *
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {tipoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Raza */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="raza">
                Raza
              </label>
              <input
                type="text"
                id="raza"
                name="raza"
                value={formData.raza}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingrese la raza"
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

            {/* Foto */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="foto">
                Foto
              </label>
              <input
                type="file"
                id="foto"
                name="foto"
                onChange={handleChange}
                accept="image/*"
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formData.foto && typeof formData.foto === 'string' && (
                <div className="mt-2">
                  <img
                    src={formData.foto}
                    alt="Foto actual"
                    className="w-20 h-20 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="observaciones">
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ingrese observaciones adicionales..."
            />
          </div>
        </div>

        {/* Información del Propietario */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Propietario</h3>

          {/* Propietario */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="persona">
              Propietario *
            </label>
            <select
              id="persona"
              name="persona"
              value={formData.persona}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona un propietario</option>
              {personas.map(persona =>
                persona.id && persona.nombre_completo ? (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombre_completo} - {persona.CI}
                  </option>
                ) : null
              )}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecciona el propietario de la mascota
            </p>
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

export default MascotaForm;
