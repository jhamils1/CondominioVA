import React, { useState, useEffect } from 'react';
import IncidenteList from './IncidenteList.jsx';
import IncidenteForm from './IncidenteForm.jsx';
import Button from '../../components/button.jsx';
import { fetchAllIncidentes, createIncidente, updateIncidente, deleteIncidente } from '../../api/incidenteApi.jsx';

const IncidentePage = () => {
  const [incidentes, setIncidentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingIncidente, setEditingIncidente] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadIncidentes = async () => {
    setLoading(true);
    try {
      const data = await fetchAllIncidentes();
      setIncidentes(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
      alert('Error al cargar los incidentes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidentes();
  }, []);

  const handleEdit = (incidente) => {
    console.log('=== DEBUG HANDLE EDIT ===');
    console.log('Incidente seleccionado para editar:', incidente);
    console.log('Tipo de incidente:', typeof incidente);
    console.log('Propiedades del incidente:', incidente ? Object.keys(incidente) : 'null');
    
    try {
      setEditingIncidente(incidente);
      setShowForm(true);
      console.log('✅ Estado actualizado correctamente');
    } catch (error) {
      console.error('❌ Error en handleEdit:', error);
      alert('Error al abrir el formulario de edición: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este incidente?")) return;
    try {
      await deleteIncidente(id);
      alert('Incidente eliminado correctamente');
      loadIncidentes();
    } catch (error) {
      console.error(error.message);
      alert('Error al eliminar el incidente: ' + error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Preparar los datos para el backend
      const cleanedData = {
        ...formData
      };

      if (editingIncidente) {
        console.log('Actualizando incidente:', editingIncidente.id, cleanedData);
        await updateIncidente(editingIncidente.id, cleanedData);
        alert('Incidente actualizado correctamente');
      } else {
        await createIncidente(cleanedData);
        alert('Incidente creado correctamente');
      }
      setShowForm(false);
      setEditingIncidente(null);
      loadIncidentes();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Tabla de incidentes */}
      <IncidenteList
        incidentes={incidentes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <IncidenteForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingIncidente(null); }}
              initialData={editingIncidente}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentePage;
