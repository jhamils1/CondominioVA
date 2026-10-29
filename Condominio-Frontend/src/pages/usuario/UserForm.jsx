// src/pages/usuario/UserForm.jsx
import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button"; // Nuevo componente reutilizable

const UserForm = ({ onSubmit, onCancel, initialData, roles = [], loading }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role_id: "",
  });

  useEffect(() => {
    if (initialData && roles.length > 0) {
      const selectedRole = roles.find(r => r.name === initialData.role);
      setFormData({
        username: initialData.username || "",
        email: initialData.email || "",
        password: "",
        role_id: selectedRole ? selectedRole.id : "",
      });
    }
  }, [initialData, roles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Usuario" : "Registrar Usuario"} onSubmit={handleSubmit}>
      {/* Username */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="username">
          Nombre de Usuario
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="password">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required={!isEditing}
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {isEditing && (
          <p className="text-xs text-gray-500 mt-1">
            Deja en blanco para mantener la contraseña actual.
          </p>
        )}
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="role_id">
          Rol
        </label>
        <select
          id="role_id"
          name="role_id"
          value={formData.role_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecciona un rol</option>
          {roles.map(role =>
            role.id && role.name ? (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ) : null
          )}
        </select>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-2">
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

export default UserForm;