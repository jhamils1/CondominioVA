import React, { useState, useEffect } from 'react';
import VisitanteList from './VisitanteList.jsx';
import VisitanteForm from './VisitanteForm.jsx';
import Button from '../../components/button.jsx';
import { fetchAllVisitantes, createVisitante, updateVisitante, deleteVisitante } from '../../api/visitantesApi.jsx';

const VisitantePage = () => {
  const [visitantes, setVisitantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingVisitante, setEditingVisitante] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadVisitantes = async () => {
    setLoading(true);
    try {
      const data = await fetchAllVisitantes();
      setVisitantes(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisitantes();
  }, []);

  const handleEdit = (visitante) => {
    console.log('Visitante seleccionado para editar:', visitante);
    setEditingVisitante(visitante);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este visitante?")) return;
    try {
      await deleteVisitante(id);
      loadVisitantes();
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

      if (editingVisitante) {
        console.log('Actualizando visitante:', editingVisitante.id, cleanedData);
        await updateVisitante(editingVisitante.id, cleanedData);
        alert('Visitante actualizado correctamente');
      } else {
        await createVisitante(cleanedData);
        alert('Visitante creado correctamente');
      }
      setShowForm(false);
      setEditingVisitante(null);
      loadVisitantes();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Tabla de visitantes */}
      <VisitanteList
        visitantes={visitantes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <VisitanteForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingVisitante(null); }}
              initialData={editingVisitante}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitantePage;
