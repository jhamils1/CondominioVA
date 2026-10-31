// src/pages/empleados/EmpleadoForm.jsx
import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import CuentaPerfil from "../../components/CuentaPerfil.jsx";

const EmpleadoForm = ({ onSubmit, onCancel, initialData, cargos = [], loading }) => {
  const [formData, setFormData] = useState({
    // Campos directos del modelo Empleado (sin anidar en persona)
    nombre: "",
    apellido: "",
    telefono: "",
    direccion: "",
    sexo: "",
    CI: "",
    fecha_nacimiento: "",
    estado: "A",
    sueldo: "",
    imagen: null, // Archivo de imagen
    cargo: "",
    email: "", // Campo para crear usuario
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        apellido: initialData.apellido || "",
        telefono: initialData.telefono || "",
        direccion: initialData.direccion || "",
        sexo: initialData.sexo || "",
        CI: initialData.CI || "",
        fecha_nacimiento: initialData.fecha_nacimiento ? 
          initialData.fecha_nacimiento.split('T')[0] : "",
        estado: initialData.estado || "A",
        sueldo: initialData.sueldo || "",
        imagen: initialData.imagen || null, // URL de imagen existente o null
        cargo: initialData.cargo?.id || initialData.cargo || "",
        email: "", // Siempre vacío para no interferir con el formulario
      });
    } else {
      // Resetear formulario cuando no hay datos iniciales
      setFormData({
        nombre: "",
        apellido: "",
        telefono: "",
        direccion: "",
        sexo: "",
        CI: "",
        fecha_nacimiento: "",
        estado: "A",
        sueldo: "",
        imagen: null,
        cargo: "",
        email: "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Excluir el campo email del envío al backend
    const dataToSubmit = { ...formData };
    delete dataToSubmit.email;
    onSubmit(dataToSubmit);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Empleado" : "Registrar Empleado"} onSubmit={handleSubmit}>
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

          {/* Estado */}
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

          {/* Imagen */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="imagen">
              Imagen (Opcional)
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
              {isEditing ? 'Selecciona una nueva imagen para reemplazar la actual (opcional)' : 'Selecciona una imagen para el perfil del empleado (opcional)'}
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

        {/* Información Laboral */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información Laboral</h3>
          
          {/* Cargo */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="cargo">
              Cargo *
            </label>
            <select
              id="cargo"
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona un cargo</option>
              {cargos.map(cargo =>
                cargo.id && cargo.nombre ? (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.nombre}
                  </option>
                ) : null
              )}
            </select>
          </div>

          {/* Sueldo */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="sueldo">
              Sueldo *
            </label>
            <input
              type="number"
              id="sueldo"
              name="sueldo"
              value={formData.sueldo}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Dirección */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="direccion">
              Dirección *
            </label>
            <textarea
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <CuentaPerfil tipo="empleado" perfilId={initialData?.id} />

      {/* Botones */}
      <div className="flex justify-between items-center pt-2">
        {/* Botones de formulario */}
        <div className="flex space-x-2">
          {onCancel && (
            <Button variant="cancelar" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button variant="guardar" type="submit" disabled={loading}>
            {isEditing ? "Guardar Cambios" : "Guardar"}
          </Button>
        </div>
      </div>
    </StyledForm>
  );
};

export default EmpleadoForm;
