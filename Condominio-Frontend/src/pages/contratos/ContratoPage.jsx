import React, { useState, useEffect } from 'react';
import ContratoList from './ContratoList.jsx';
import ContratoForm from './ContratoForm.jsx';
import Button from '../../components/button.jsx';
import { fetchAllContratos, createContrato, updateContrato, deleteContrato } from '../../api/contratoApi.jsx';

const ContratoPage = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadContratos = async () => {
    setLoading(true);
    try {
      const data = await fetchAllContratos();
      setContratos(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
      alert('Error al cargar los contratos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContratos();
  }, []);

  const handleEdit = (contrato) => {
    console.log('Contrato seleccionado para editar:', contrato);
    setEditingContrato(contrato);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este contrato?")) return;
    try {
      await deleteContrato(id);
      alert('Contrato eliminado correctamente');
      loadContratos();
    } catch (error) {
      console.error(error.message);
      alert('Error al eliminar el contrato: ' + error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Preparar los datos para el backend
      const cleanedData = {
        ...formData
      };

      if (editingContrato) {
        console.log('Actualizando contrato:', editingContrato.id, cleanedData);
        await updateContrato(editingContrato.id, cleanedData);
        alert('Contrato actualizado correctamente');
      } else {
        await createContrato(cleanedData);
        alert('Contrato creado correctamente');
      }
      setShowForm(false);
      setEditingContrato(null);
      loadContratos();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Tabla de contratos */}
      <ContratoList
        contratos={contratos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ContratoForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingContrato(null); }}
              initialData={editingContrato}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContratoPage;


