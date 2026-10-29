import React, { useEffect, useState } from 'react';
import AreaComunList from './AreaComunList.jsx';
import AreaComunForm from './AreaComunForm.jsx';
import { fetchAllAreasComunes, createAreaComun, updateAreaComun, deleteAreaComun, fetchAreaComunById } from '../../api/areasComunesApi.jsx';

const AreaComunPage = () => {
  const [areasComunes, setAreasComunes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadAreasComunes = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAreasComunes();
      setAreasComunes(data.results || data);
    } catch (error) {
      console.error(error.message);
      alert('Error al cargar las áreas comunes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreasComunes();
  }, []);

  const handleEdit = async (area) => {
    try {
      const fullData = await fetchAreaComunById(area.id);
      setEditingArea(fullData);
      setShowForm(true);
    } catch (e) {
      console.error(e.message);
      alert('Error al cargar datos del área común');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta área común?')) return;
    try {
      await deleteAreaComun(id);
      alert('Área común eliminada correctamente');
      loadAreasComunes();
    } catch (error) {
      console.error(error.message);
      alert('Error al eliminar el área común');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingArea) {
        await updateAreaComun(editingArea.id, formData);
        alert('Área común actualizada correctamente');
      } else {
        await createAreaComun(formData);
        alert('Área común creada correctamente');
      }
      setShowForm(false);
      setEditingArea(null);
      loadAreasComunes();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative">
      <AreaComunList
        areasComunes={areasComunes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => { setEditingArea(null); setShowForm(true); }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <AreaComunForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingArea(null); }}
              initialData={editingArea}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaComunPage;
