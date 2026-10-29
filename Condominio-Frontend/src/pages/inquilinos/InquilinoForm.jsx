// src/pages/inquilinos/InquilinoForm.jsx
import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { createUser } from "../../api/userApi";

const InquilinoForm = ({ onSubmit, onCancel, initialData, propietarios = [], loading }) => {
  const [formData, setFormData] = useState({
    // Atributos heredados de Persona
    nombre: "",
    apellido: "",
    telefono: "",
    CI: "",
    fecha_nacimiento: "",
    sexo: "M",
    imagen: null,
    estado: "A",
    email: "", // Campo para crear usuario
    // Atributos específicos de Inquilino
    propietario: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado_inquilino: "A",
  });

  useEffect(() => {
    if (initialData) {
      console.log('Datos iniciales recibidos en InquilinoForm:', initialData);
      setFormData({
        // Atributos heredados de Persona
        nombre: initialData.nombre || "",
        apellido: initialData.apellido || "",
        telefono: initialData.telefono || "",
        CI: initialData.CI || "",
        fecha_nacimiento: initialData.fecha_nacimiento ? 
          initialData.fecha_nacimiento.split('T')[0] : "",
        sexo: initialData.sexo || "M",
        imagen: initialData.imagen || null,
        estado: initialData.estado || "A",
        email: "", // Siempre vacío para no interferir con el formulario
        // Atributos específicos de Inquilino
        propietario: initialData.propietario || "",
        fecha_inicio: initialData.fecha_inicio ? 
          initialData.fecha_inicio.split('T')[0] : "",
        fecha_fin: initialData.fecha_fin ? 
          initialData.fecha_fin.split('T')[0] : "",
        estado_inquilino: initialData.estado_inquilino || "A",
      });
    } else {
      // Resetear formulario cuando no hay datos iniciales
      setFormData({
        nombre: "",
        apellido: "",
        telefono: "",
        CI: "",
        fecha_nacimiento: "",
        sexo: "M",
        imagen: null,
        estado: "A",
        email: "",
        propietario: "",
        fecha_inicio: "",
        fecha_fin: "",
        estado_inquilino: "A",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0] || null
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Excluir el campo email del envío al backend
    const { email, ...dataToSubmit } = formData;
    onSubmit(dataToSubmit);
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.nombre || !formData.apellido || !formData.CI || !formData.telefono) {
      alert('Por favor completa todos los campos requeridos (nombre, apellido, CI, teléfono y email)');
      return;
    }

    try {
      // Generar username: nombre + CI
      const username = `${formData.nombre}${formData.CI}`;
      
      // Generar password: teléfono + primera letra del nombre + primera letra del apellido
      const password = `${formData.telefono}${formData.nombre.charAt(0).toLowerCase()}${formData.apellido.charAt(0).toLowerCase()}`;
      
      // Role ID para Inquilino
      const role_id = 4;

      const userData = {
        username,
        email: formData.email,
        password,
        role_id
      };

      console.log('Creando usuario con datos:', userData);
      
      const result = await createUser(userData);
      console.log('Usuario creado exitosamente:', result);
      
      alert('Usuario creado exitosamente');
      
      // Limpiar el campo email después de crear el usuario
      setFormData(prev => ({ ...prev, email: "" }));
      
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert('Error al crear usuario: ' + error.message);
    }
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Inquilino" : "Registrar Inquilino"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Email - Solo para crear usuario */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="email">
              Email (Para crear usuario)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ejemplo@correo.com"
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este campo solo se usa para crear un usuario del sistema
            </p>
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
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
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
              accept="image/*"
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {formData.imagen && typeof formData.imagen === 'string' && (
              <div className="mt-2">
                <img src={formData.imagen} alt="Imagen actual" className="w-20 h-20 object-cover rounded" />
              </div>
            )}
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
        </div>

        {/* Información de Alquiler */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Información de Alquiler</h3>

          {/* Propietario */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="propietario">
              Propietario *
            </label>
            <select
              id="propietario"
              name="propietario"
              value={formData.propietario}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Selecciona un propietario</option>
              {propietarios.map(propietario =>
                propietario.id && propietario.nombre_completo ? (
                  <option key={propietario.id} value={propietario.id}>
                    {propietario.nombre_completo}
                  </option>
                ) : null
              )}
            </select>
          </div>

          {/* Fecha de Inicio */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_inicio">
              Fecha de Inicio
            </label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Fecha de Fin */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_fin">
              Fecha de Fin (Opcional)
            </label>
            <input
              type="date"
              id="fecha_fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deja en blanco si el alquiler está activo
            </p>
          </div>

          {/* Estado del Inquilino */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="estado_inquilino">
              Estado del Inquilino
            </label>
            <select
              id="estado_inquilino"
              name="estado_inquilino"
              value={formData.estado_inquilino}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="A">Activo</option>
              <option value="I">Inactivo</option>
              <option value="F">Finalizado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between items-center pt-4 mt-6 border-t">
        {/* Botón para crear usuario */}
        <Button 
          variant="guardar" 
          type="button"
          onClick={handleCreateUser}
          disabled={loading || !formData.email}
          className="bg-blue-600 hover:bg-blue-700"
        >
          CREAR USUARIO
        </Button>
        
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

export default InquilinoForm;
