import React, { useState, useEffect } from 'react';
import PropietarioList from './PropietarioList.jsx';
import PropietarioForm from './PropietarioForm.jsx';
import Button from '../../components/button.jsx';
import { fetchAllPropietarios, createPropietario, updatePropietario, deletePropietario } from '../../api/propietariosApi.jsx';

const PropietarioPage = () => {
  const [propietarios, setPropietarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPropietario, setEditingPropietario] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadPropietarios = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPropietarios();
      setPropietarios(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropietarios();
  }, []);

  const handleEdit = (propietario) => {
    console.log('Propietario seleccionado para editar:', propietario);
    setEditingPropietario(propietario);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este propietario?")) return;
    try {
      await deletePropietario(id);
      loadPropietarios();
    } catch (error) {
      console.error(error.message);
    }
  };


  const handleFormSubmit = async (formData) => {
    try {
      // Preparar los datos para el backend (estructura simplificada)
      const cleanedData = {
        ...formData
      };

      // Solo remover la imagen si está vacía
      if (cleanedData.imagen === null || cleanedData.imagen === undefined || !cleanedData.imagen) {
        delete cleanedData.imagen;
      }

      // Si estamos editando y no hay nueva imagen, mantener la existente
      if (editingPropietario && !formData.imagen && editingPropietario.imagen) {
        cleanedData.imagen = editingPropietario.imagen;
      }

      if (editingPropietario) {
        console.log('Actualizando propietario:', editingPropietario.id, cleanedData);
        await updatePropietario(editingPropietario.id, cleanedData);
        alert('Propietario actualizado correctamente');
      } else {
        await createPropietario(cleanedData);
        alert('Propietario creado correctamente');
      }
      setShowForm(false);
      setEditingPropietario(null);
      loadPropietarios();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Tabla de propietarios */}
      <PropietarioList
        propietarios={propietarios}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <PropietarioForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingPropietario(null); }}
              initialData={editingPropietario}
              loading={loading}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default PropietarioPage;
