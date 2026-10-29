import React, { useState, useEffect } from 'react';
import CargoList from './CargoList.jsx';
import CargoForm from './CargoForm.jsx';
import Button from '../../components/button.jsx';
import { fetchAllCargos, createCargo, updateCargo, deleteCargo } from '../../api/cargosApi.jsx';

const CargoPage = () => {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCargo, setEditingCargo] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadCargos = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCargos();
      setCargos(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCargos();
  }, []);

  const handleEdit = (cargo) => {
    setEditingCargo(cargo);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este cargo?")) return;
    try {
      await deleteCargo(id);
      loadCargos();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCargo) {
        console.log('Actualizando cargo:', editingCargo.id, formData);
        await updateCargo(editingCargo.id, formData);
        alert('Cargo actualizado correctamente');
      } else {
        await createCargo(formData);
        alert('Cargo creado correctamente');
      }
      setShowForm(false);
      setEditingCargo(null);
      loadCargos();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Tabla de cargos */}
      <CargoList
        cargos={cargos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CargoForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingCargo(null); }}
              initialData={editingCargo}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CargoPage;
