// src/pages/unidades/UnidadForm.jsx
import React, { useEffect, useState } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { fetchAllBloquesAux } from "../../api/unidadApi.jsx";

const UnidadForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    numero: "",
    codigo: "",
    descripcion: "",
    imagen: null, // File | string
    dimensiones: "",
    tipo_unidad: "A",
    estado: "D",
    bloque: "", // bloque id
    numero_piso: 1,
    area_m2: "",
  });

  const [bloques, setBloques] = useState([]);

  useEffect(() => {
    const loadBloques = async () => {
      try {
        const data = await fetchAllBloquesAux();
        setBloques(data.results || data);
      } catch (e) {
        console.error(e.message);
        setBloques([]);
      }
    };
    loadBloques();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        numero: initialData.numero || "",
        codigo: initialData.codigo || "",
        descripcion: initialData.descripcion || "",
        imagen: initialData.imagen || null,
        dimensiones: initialData.dimensiones || "",
        tipo_unidad: initialData.tipo_unidad || "A",
        estado: initialData.estado || "D",
        bloque: initialData.bloque?.id || initialData.bloque || "",
        numero_piso: initialData.numero_piso || 1,
        area_m2: initialData.area_m2 || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? (files && files.length ? files[0] : null) : 
              type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
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
    <StyledForm title={isEditing ? "Editar Unidad" : "Registrar Unidad"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="codigo">
            Código de Unidad
          </label>
          <input
            type="text"
            id="codigo"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            required
            maxLength={20}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="numero">
            Número de Unidad
          </label>
          <input
            type="text"
            id="numero"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            required
            maxLength={10}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="bloque">
            Bloque
          </label>
          <select
            id="bloque"
            name="bloque"
            value={formData.bloque}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Selecciona un bloque</option>
            {Array.isArray(bloques) && bloques.length > 0 ? (
              bloques.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))
            ) : (
              <option value="" disabled>No hay bloques disponibles</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="tipo_unidad">
            Tipo de Unidad
          </label>
          <select
            id="tipo_unidad"
            name="tipo_unidad"
            value={formData.tipo_unidad}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="A">Apartamento</option>
            <option value="C">Casa</option>
            <option value="L">Local Comercial</option>
            <option value="E">Estacionamiento</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="estado">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="D">Disponible</option>
            <option value="O">Ocupada</option>
            <option value="M">En Mantenimiento</option>
            <option value="R">Reservada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="numero_piso">
            Número de Piso
          </label>
          <input
            type="number"
            id="numero_piso"
            name="numero_piso"
            value={formData.numero_piso}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="area_m2">
            Área en m²
          </label>
          <input
            type="number"
            id="area_m2"
            name="area_m2"
            value={formData.area_m2}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="dimensiones">
            Dimensiones
          </label>
          <input
            type="text"
            id="dimensiones"
            name="dimensiones"
            value={formData.dimensiones}
            onChange={handleChange}
            maxLength={100}
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
            rows="3"
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
                  alt="Imagen actual de la unidad"
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

export default UnidadForm;
