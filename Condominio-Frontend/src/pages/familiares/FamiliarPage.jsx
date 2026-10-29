import React, { useState, useEffect } from 'react';
import FamiliarList from './FamiliarList.jsx';
import FamiliarForm from './FamiliarForm.jsx';
import Button from '../../components/button.jsx';
import { fetchAllFamiliares, createFamiliar, updateFamiliar, deleteFamiliar, fetchAllPersonas } from '../../api/familiaresApi.jsx';

const FamiliarPage = () => {
  const [familiares, setFamiliares] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingFamiliar, setEditingFamiliar] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadFamiliares = async () => {
    setLoading(true);
    try {
      const data = await fetchAllFamiliares();
      setFamiliares(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonas = async () => {
    try {
      const data = await fetchAllPersonas();
      setPersonas(data);
    } catch (error) {
      console.error('Error al cargar personas:', error.message);
    }
  };

  useEffect(() => {
    loadFamiliares();
    loadPersonas();
  }, []);

  const handleEdit = (familiar) => {
    console.log('Familiar seleccionado para editar:', familiar);
    setEditingFamiliar(familiar);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este familiar?")) return;
    try {
      await deleteFamiliar(id);
      loadFamiliares();
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

      if (editingFamiliar) {
        console.log('Actualizando familiar:', editingFamiliar.id, cleanedData);
        await updateFamiliar(editingFamiliar.id, cleanedData);
        alert('Familiar actualizado correctamente');
      } else {
        await createFamiliar(cleanedData);
        alert('Familiar creado correctamente');
      }
      setShowForm(false);
      setEditingFamiliar(null);
      loadFamiliares();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Tabla de familiares */}
      <FamiliarList
        familiares={familiares}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <FamiliarForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingFamiliar(null); }}
              initialData={editingFamiliar}
              personas={personas}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FamiliarPage;
