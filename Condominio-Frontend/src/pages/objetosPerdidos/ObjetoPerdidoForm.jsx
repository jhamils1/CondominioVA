// src/pages/objetosPerdidos/ObjetoPerdidoForm.jsx
import React, { useEffect, useState } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { fetchAllPersonas } from "../../api/objetoPerdidoApi.jsx";

const ObjetoPerdidoForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    foto: null, // File | string URL
    lugar_encontrado: "Áreas Comunes",
    fecha_encontrado: "",
    estado: "P",
    entregado_a: "",
    fecha_entrega: "",
  });

  const [personas, setPersonas] = useState([]);

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const data = await fetchAllPersonas();
        setPersonas(data.results || data);
      } catch (e) {
        console.error(e.message);
        setPersonas([]);
      }
    };
    loadPersonas();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        titulo: initialData.titulo || "",
        descripcion: initialData.descripcion || "",
        foto: initialData.foto || null,
        lugar_encontrado: initialData.lugar_encontrado || "Áreas Comunes",
        fecha_encontrado: initialData.fecha_encontrado 
          ? new Date(initialData.fecha_encontrado).toISOString().slice(0, 16) 
          : "",
        estado: initialData.estado || "P",
        entregado_a: initialData.entregado_a?.id || initialData.entregado_a || "",
        fecha_entrega: initialData.fecha_entrega 
          ? new Date(initialData.fecha_entrega).toISOString().slice(0, 16) 
          : "",
      });
    } else {
      // Para nuevo objeto, fecha actual
      const now = new Date().toISOString().slice(0, 16);
      setFormData(prev => ({
        ...prev,
        fecha_encontrado: now,
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    const newValue = type === "file" ? (files && files.length ? files[0] : null) : value;
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };
      
      // Si cambiamos el estado a Pendiente, limpiar campos de entrega
      if (name === "estado" && value === "P") {
        updated.entregado_a = "";
        updated.fecha_entrega = "";
      }
      
      // Si cambiamos a Entregado, establecer fecha de entrega actual si está vacía
      if (name === "estado" && value === "E" && !prev.fecha_entrega) {
        updated.fecha_entrega = new Date().toISOString().slice(0, 16);
      }
      
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    
    // Si el estado no es "E" (Entregado), limpiar campos de entrega
    if (payload.estado !== "E") {
      payload.entregado_a = "";
      payload.fecha_entrega = "";
    }
    
    // Si no hay fecha de entrega, enviar null
    if (!payload.fecha_entrega) {
      payload.fecha_entrega = null;
    }
    
    if (!payload.entregado_a) {
      payload.entregado_a = null;
    }
    
    onSubmit(payload);
  };

  const isEditing = !!initialData;
  const isEntregado = formData.estado === "E";

  return (
    <StyledForm title={isEditing ? "Editar Objeto Perdido" : "Registrar Objeto Perdido"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Título */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="titulo">
            ¿Qué es? *
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Ej: Llave, Celular, Cartera..."
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Lugar Encontrado */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="lugar_encontrado">
            Lugar Encontrado *
          </label>
          <input
            type="text"
            id="lugar_encontrado"
            name="lugar_encontrado"
            value={formData.lugar_encontrado}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Ej: Piscina, Gimnasio, Lobby..."
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="descripcion">
            Descripción / Detalles
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            placeholder="Detalles adicionales del objeto..."
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Fecha Encontrado */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_encontrado">
            Fecha y Hora Encontrado *
          </label>
          <input
            type="datetime-local"
            id="fecha_encontrado"
            name="fecha_encontrado"
            value={formData.fecha_encontrado}
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
            <option value="P">Pendiente de reclamo</option>
            <option value="E">Entregado/Devuelto</option>
          </select>
        </div>

        {/* Entregado A - Solo si estado es Entregado */}
        {isEntregado && (
          <>
            <div className="md:col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  📦 Información de Entrega
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="entregado_a">
                Entregado a (Persona) *
              </label>
              <select
                id="entregado_a"
                name="entregado_a"
                value={formData.entregado_a}
                onChange={handleChange}
                required={isEntregado}
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Seleccione una persona --</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.nombre} {persona.apellido} - CI: {persona.CI}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecciona a quién se le entregó el objeto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_entrega">
                Fecha y Hora de Entrega *
              </label>
              <input
                type="datetime-local"
                id="fecha_entrega"
                name="fecha_entrega"
                value={formData.fecha_entrega}
                onChange={handleChange}
                required={isEntregado}
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fecha en que se entregó el objeto
              </p>
            </div>
          </>
        )}

        {/* Foto */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="foto">
            Foto del Objeto *
          </label>
          <input
            type="file"
            id="foto"
            name="foto"
            accept="image/*"
            onChange={handleChange}
            required={!isEditing}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {isEditing 
              ? 'Selecciona una nueva imagen para reemplazar la actual (opcional)' 
              : 'Selecciona una imagen del objeto'}
          </p>
          {formData.foto && typeof formData.foto === 'string' && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Imagen actual:</p>
              <img 
                src={formData.foto} 
                alt="Objeto perdido" 
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
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

export default ObjetoPerdidoForm;
