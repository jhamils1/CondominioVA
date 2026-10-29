// src/pages/visitas/VisitaForm.jsx
import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const VisitaForm = ({ onSubmit, onCancel, initialData, visitantes = [], personas = [], loading }) => {
  const [formData, setFormData] = useState({
    estado: "PENDIENTE",
    fecha_hora_entrada: "",
    fecha_hora_salida: "",
    visitante: "",
    recibe_persona: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        estado: initialData.estado || "PENDIENTE",
        fecha_hora_entrada: initialData.fecha_hora_entrada ? 
          new Date(initialData.fecha_hora_entrada).toISOString().slice(0, 16) : "",
        fecha_hora_salida: initialData.fecha_hora_salida ? 
          new Date(initialData.fecha_hora_salida).toISOString().slice(0, 16) : "",
        visitante: initialData.visitante || "",
        recibe_persona: initialData.recibe_persona || "",
      });
    } else {
      // Resetear formulario cuando no hay datos iniciales
      setFormData({
        estado: "PENDIENTE",
        fecha_hora_entrada: "",
        fecha_hora_salida: "",
        visitante: "",
        recibe_persona: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const estadoOptions = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'ACTIVA', label: 'Activa' },
    { value: 'FINALIZADA', label: 'Finalizada' },
    { value: 'CANCELADA', label: 'Cancelada' }
  ];

  return (
    <StyledForm onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {initialData ? 'Editar Visita' : 'Registrar Visita'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Información de la Visita */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información de la Visita</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {estadoOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y Hora de Entrada */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_hora_entrada">
                Fecha y Hora de Entrada *
              </label>
              <input
                type="datetime-local"
                id="fecha_hora_entrada"
                name="fecha_hora_entrada"
                value={formData.fecha_hora_entrada}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Fecha y Hora de Salida */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_hora_salida">
                Fecha y Hora de Salida
              </label>
              <input
                type="datetime-local"
                id="fecha_hora_salida"
                name="fecha_hora_salida"
                value={formData.fecha_hora_salida}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dejar vacío si la visita aún no ha terminado
              </p>
            </div>
          </div>
        </div>

        {/* Información de las Personas */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Personas Involucradas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Visitante */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="visitante">
                Visitante *
              </label>
              <select
                id="visitante"
                name="visitante"
                value={formData.visitante}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecciona un visitante</option>
                {visitantes.map(visitante =>
                  visitante.id && visitante.nombre && visitante.apellido ? (
                    <option key={visitante.id} value={visitante.id}>
                      {visitante.nombre} {visitante.apellido} - {visitante.CI}
                    </option>
                  ) : null
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona el visitante que realiza la visita
              </p>
            </div>

            {/* Persona que Recibe */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="recibe_persona">
                Persona que Recibe *
              </label>
              <select
                id="recibe_persona"
                name="recibe_persona"
                value={formData.recibe_persona}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Selecciona quien recibe la visita</option>
                {personas.map(persona =>
                  persona.id && persona.nombre && persona.apellido ? (
                    <option key={persona.id} value={persona.id}>
                      {persona.nombre} {persona.apellido} - {persona.CI} ({persona.tipo === 'P' ? 'Propietario' : 'Inquilino'})
                    </option>
                  ) : null
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona el propietario o inquilino que recibe la visita
              </p>
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
            {loading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Registrar')}
          </Button>
        </div>
      </div>
    </StyledForm>
  );
};

export default VisitaForm;
