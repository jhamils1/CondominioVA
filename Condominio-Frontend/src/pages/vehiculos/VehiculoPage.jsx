import React, { useEffect, useState } from 'react';
import VehiculoList from './VehiculoList.jsx';
import VehiculoForm from './VehiculoForm.jsx';
import { fetchAllVehiculos, createVehiculo, updateVehiculo, deleteVehiculo, fetchVehiculoById } from '../../api/vehiculoApi.jsx';

const VehiculoPage = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadVehiculos = async () => {
    setLoading(true);
    try {
      const data = await fetchAllVehiculos();
      setVehiculos(data.results || data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehiculos();
  }, []);

  const handleEdit = async (vehiculo) => {
    try {
      const fullData = await fetchVehiculoById(vehiculo.id);
      setEditingVehiculo(fullData);
      setShowForm(true);
    } catch (e) {
      console.error(e.message);
      alert('Error al cargar datos del vehículo');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este vehículo?')) return;
    try {
      await deleteVehiculo(id);
      loadVehiculos();
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
      if (editingVehiculo) {
        await updateVehiculo(editingVehiculo.id, dataToSend);
        alert('Vehículo actualizado correctamente');
      } else {
        await createVehiculo(dataToSend);
        alert('Vehículo creado correctamente');
      }
      setShowForm(false);
      setEditingVehiculo(null);
      loadVehiculos();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative">
      <VehiculoList
        vehiculos={vehiculos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => { setEditingVehiculo(null); setShowForm(true); }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <VehiculoForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingVehiculo(null); }}
              initialData={editingVehiculo}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiculoPage;


