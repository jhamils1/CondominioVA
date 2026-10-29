import React, { useState, useEffect } from 'react';
import ExpensaList from './ExpensaList.jsx';
import ExpensaForm from './ExpensaForm.jsx';
import Button from '../../components/button.jsx';
import { fetchAllExpensas, createExpensa, updateExpensa, deleteExpensa } from '../../api/expensaApi.jsx';

const ExpensaPage = () => {
  const [expensas, setExpensas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingExpensa, setEditingExpensa] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadExpensas = async () => {
    setLoading(true);
    try {
      const data = await fetchAllExpensas();
      setExpensas(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
      alert('Error al cargar las expensas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpensas();
  }, []);

  const handleEdit = (expensa) => {
    console.log('Expensa seleccionada para editar:', expensa);
    setEditingExpensa(expensa);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta expensa?")) return;
    try {
      await deleteExpensa(id);
      alert('Expensa eliminada correctamente');
      loadExpensas();
    } catch (error) {
      console.error(error.message);
      alert('Error al eliminar la expensa: ' + error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Preparar los datos para el backend
      const cleanedData = {
        ...formData
      };

      if (editingExpensa) {
        console.log('Actualizando expensa:', editingExpensa.id, cleanedData);
        await updateExpensa(editingExpensa.id, cleanedData);
        alert('Expensa actualizada correctamente');
      } else {
        await createExpensa(cleanedData);
        alert('Expensa creada correctamente');
      }
      setShowForm(false);
      setEditingExpensa(null);
      loadExpensas();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Tabla de expensas */}
      <ExpensaList
        expensas={expensas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ExpensaForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingExpensa(null); }}
              initialData={editingExpensa}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensaPage;
