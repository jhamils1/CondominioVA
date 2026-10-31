// src/pages/rol/RolPage.jsx
import React, { useState, useEffect } from 'react';
import RolList from './RolList.jsx';
import RolForm from './RolForm.jsx';
import { fetchAllRoles, createRol, updateRol, fetchRolById } from '../../api/rolApi.jsx';
import { useSession } from '../../auth/sessionContext.js';

const RolPage = () => {
  const { user } = useSession();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await fetchAllRoles();
      setRoles(data.results || data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleEdit = async (rol) => {
    try {
        const fullRol = await fetchRolById(rol.id);
        setEditingRol(fullRol);
        setShowForm(true);
    } catch (error) {
        console.error(error.message);
        alert('Error al cargar los datos del rol para edición.');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingRol) {
        await updateRol(editingRol.id, formData);
        alert('Rol actualizado correctamente');
      } else {
        await createRol(formData);
        alert('Rol creado correctamente');
      }
      setShowForm(false);
      setEditingRol(null);
      loadRoles();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative">
      <RolList
        roles={roles}
        onEdit={handleEdit}
        currentRole={user.role}
        onAddNew={() => { setEditingRol(null); setShowForm(true); }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <RolForm
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingRol(null); }}
            initialData={editingRol}
            loading={loading}
            existingRoles={roles}
          />
        </div>
      )}
    </div>
  );
};

export default RolPage;
