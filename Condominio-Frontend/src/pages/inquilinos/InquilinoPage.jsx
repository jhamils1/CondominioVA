import React, { useState, useEffect } from 'react';
import InquilinoList from './InquilinoList.jsx';
import InquilinoForm from './InquilinoForm.jsx';
import Button from '../../components/button.jsx';
import { fetchAllInquilinos, fetchAllPropietarios, createInquilino, updateInquilino, deleteInquilino } from '../../api/inquilinosApi.jsx';

const InquilinoPage = () => {
  const [inquilinos, setInquilinos] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingInquilino, setEditingInquilino] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadInquilinos = async () => {
    setLoading(true);
    try {
      const data = await fetchAllInquilinos();
      setInquilinos(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPropietarios = async () => {
    try {
      const data = await fetchAllPropietarios();
      setPropietarios(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    loadInquilinos();
    loadPropietarios();
  }, []);

  const handleEdit = (inquilino) => {
    console.log('Inquilino seleccionado para editar:', inquilino);
    setEditingInquilino(inquilino);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este inquilino?")) return;
    try {
      await deleteInquilino(id);
      loadInquilinos();
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

      if (editingInquilino) {
        console.log('Actualizando inquilino:', editingInquilino.id, cleanedData);
        await updateInquilino(editingInquilino.id, cleanedData);
        alert('Inquilino actualizado correctamente');
      } else {
        await createInquilino(cleanedData);
        alert('Inquilino creado correctamente');
      }
      setShowForm(false);
      setEditingInquilino(null);
      loadInquilinos();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Tabla de inquilinos */}
      <InquilinoList
        inquilinos={inquilinos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <InquilinoForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingInquilino(null); }}
              initialData={editingInquilino}
              propietarios={propietarios}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InquilinoPage;
