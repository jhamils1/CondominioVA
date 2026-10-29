import React, { useState, useEffect } from 'react';
import UserList from './UserList.jsx';
import UserForm from './UserForm.jsx';
import Button from '../../components/button.jsx';
import { fetchAllUsers, fetchAllRoles, createUser, updateUser, deleteUser } from '../../api/userApi.jsx';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const data = await fetchAllRoles();
      setRoles(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;
    try {
      await deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingUser) {
        // Si estamos editando y la contraseña está vacía, no la incluimos en los datos
        const updateData = { ...formData };
        if (!updateData.password || updateData.password.trim() === '') {
          delete updateData.password;
        }
        console.log('Actualizando usuario:', editingUser.id, updateData);
        await updateUser(editingUser.id, updateData);
        alert('Usuario actualizado correctamente');
      } else {
        await createUser(formData);
        alert('Usuario creado correctamente');
      }
      setShowForm(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative">
      {/* Tabla de usuarios */}
      <UserList
        users={users}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <UserForm
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingUser(null); }}
            initialData={editingUser}
            roles={roles}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default UserPage;