// src/pages/vehiculos/VehiculoForm.jsx
import React, { useEffect, useState } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { fetchAllPropietarios } from "../../api/propietariosApi.jsx";

const VehiculoForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    color: "",
    marca: "",
    modelo: "",
    placa: "",
    tipo: "",
    imagen: null, // File | string
    persona: "", // persona id
  });

  const [propietarios, setPropietarios] = useState([]);

  useEffect(() => {
    const loadPropietarios = async () => {
      try {
        const data = await fetchAllPropietarios();
        setPropietarios(data.results || data);
      } catch (e) {
        console.error(e.message);
        setPropietarios([]);
      }
    };
    loadPropietarios();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        color: initialData.color || "",
        marca: initialData.marca || "",
        modelo: initialData.modelo || "",
        placa: initialData.placa || "",
        tipo: initialData.tipo || "",
        imagen: initialData.imagen || null,
        persona: initialData.persona?.id || initialData.persona || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? (files && files.length ? files[0] : null) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    // Si estamos editando y la imagen es string (url), no reenviar a menos que se cambie
    if (typeof payload.imagen === "string") {
      // Mantener cadena para permitir backend no cambiar si no se envía archivo
    }
    onSubmit(payload);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Vehículo" : "Registrar Vehículo"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="marca">
            Marca
          </label>
          <input
            type="text"
            id="marca"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="modelo">
            Modelo
          </label>
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="placa">
            Placa
          </label>
          <input
            type="text"
            id="placa"
            name="placa"
            value={formData.placa}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="color">
            Color
          </label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="tipo">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Selecciona un tipo</option>
            <option value="Automóvil">Automóvil</option>
            <option value="Camioneta">Camioneta</option>
            <option value="SUV">SUV</option>
            <option value="Motocicleta">Motocicleta</option>
            <option value="Furgoneta">Furgoneta</option>
            <option value="Crossover">Crossover</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="persona">
            Propietario
          </label>
          <select
            id="persona"
            name="persona"
            value={formData.persona}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Selecciona propietario</option>
            {Array.isArray(propietarios) && propietarios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre_completo || `${p.persona?.nombre || ""} ${p.persona?.apellido || ""}`}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="imagen">
            Imagen (opcional)
          </label>
          <input
            type="file"
            id="imagen"
            name="imagen"
            accept="image/*"
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {isEditing && typeof formData.imagen === "string" && formData.imagen && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">
                Selecciona una nueva imagen para reemplazar la actual (opcional)
              </p>
              <p className="text-sm font-medium text-gray-700 mb-2">Imagen actual:</p>
              <div className="border rounded-lg p-2 bg-gray-50">
                <img
                  src={formData.imagen}
                  alt="Imagen actual del vehículo"
                  className="w-32 h-24 object-cover rounded border"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-xs text-gray-500 mt-1">
                  Error al cargar la imagen
                </div>
              </div>
            </div>
          )}
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

export default VehiculoForm;


