import React, { useEffect, useState } from 'react';
import BloqueList from './BloqueList.jsx';
import BloqueForm from './BloqueForm.jsx';
import { fetchAllBloques, createBloque, updateBloque, deleteBloque, fetchBloqueById } from '../../api/bloqueApi.jsx';

const BloquePage = () => {
  const [bloques, setBloques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBloque, setEditingBloque] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadBloques = async () => {
    setLoading(true);
    try {
      const data = await fetchAllBloques();
      setBloques(data.results || data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBloques();
  }, []);

  const handleEdit = async (bloque) => {
    try {
      const fullData = await fetchBloqueById(bloque.id);
      setEditingBloque(fullData);
      setShowForm(true);
    } catch (e) {
      console.error(e.message);
      alert('Error al cargar datos del bloque');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este bloque?')) return;
    try {
      await deleteBloque(id);
      loadBloques();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingBloque) {
        await updateBloque(editingBloque.id, formData);
        alert('Bloque actualizado correctamente');
      } else {
        await createBloque(formData);
        alert('Bloque creado correctamente');
      }
      setShowForm(false);
      setEditingBloque(null);
      loadBloques();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative">
      <BloqueList
        bloques={bloques}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => { setEditingBloque(null); setShowForm(true); }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <BloqueForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingBloque(null); }}
              initialData={editingBloque}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BloquePage;
