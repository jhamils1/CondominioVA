import React, { useEffect, useState } from 'react';
import UnidadList from './UnidadList.jsx';
import UnidadForm from './UnidadForm.jsx';
import { fetchAllUnidades, createUnidad, updateUnidad, deleteUnidad, fetchUnidadById } from '../../api/unidadApi.jsx';

const UnidadPage = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadUnidades = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUnidades();
      setUnidades(data.results || data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnidades();
  }, []);

  const handleEdit = async (unidad) => {
    try {
      const fullData = await fetchUnidadById(unidad.id);
      setEditingUnidad(fullData);
      setShowForm(true);
    } catch (e) {
      console.error(e.message);
      alert('Error al cargar datos de la unidad');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta unidad?')) return;
    try {
      await deleteUnidad(id);
      loadUnidades();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Si la imagen es string (URL), no la reenviamos en update salvo que haya File
      const dataToSend = { ...formData };
      if (typeof dataToSend.imagen === 'string') {
        // Mantener cadena para update sin cambio; backend puede ignorar si no es archivo
      }
      if (editingUnidad) {
        await updateUnidad(editingUnidad.id, dataToSend);
        alert('Unidad actualizada correctamente');
      } else {
        await createUnidad(dataToSend);
        alert('Unidad creada correctamente');
      }
      setShowForm(false);
      setEditingUnidad(null);
      loadUnidades();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative">
      <UnidadList
        unidades={unidades}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => { setEditingUnidad(null); setShowForm(true); }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <UnidadForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingUnidad(null); }}
              initialData={editingUnidad}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UnidadPage;




