import React, { useState, useEffect } from 'react';
import MultaList from './MultaList.jsx';
import MultaForm from './MultaForm.jsx';
import Button from '../../components/button.jsx';
import { fetchAllMultas, createMulta, updateMulta, deleteMulta } from '../../api/multaApi.jsx';

const MultaPage = () => {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMulta, setEditingMulta] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadMultas = async () => {
    setLoading(true);
    try {
      const data = await fetchAllMultas();
      setMultas(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
      alert('Error al cargar las multas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMultas();
  }, []);

  const handleEdit = (multa) => {
    console.log('Multa seleccionada para editar:', multa);
    setEditingMulta(multa);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta multa?")) return;
    try {
      await deleteMulta(id);
      alert('Multa eliminada correctamente');
      loadMultas();
    } catch (error) {
      console.error(error.message);
      alert('Error al eliminar la multa: ' + error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Preparar los datos para el backend
      const cleanedData = {
        ...formData
      };

      if (editingMulta) {
        console.log('Actualizando multa:', editingMulta.id, cleanedData);
        await updateMulta(editingMulta.id, cleanedData);
        alert('Multa actualizada correctamente');
      } else {
        await createMulta(cleanedData);
        alert('Multa creada correctamente');
      }
      setShowForm(false);
      setEditingMulta(null);
      loadMultas();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Tabla de multas */}
      <MultaList
        multas={multas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <MultaForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingMulta(null); }}
              initialData={editingMulta}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MultaPage;
