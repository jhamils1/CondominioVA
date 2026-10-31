import React, { useState, useEffect } from 'react';
import EmpleadoList from './EmpleadoList.jsx';
import EmpleadoForm from './EmpleadoForm.jsx';
import Button from '../../components/button.jsx';
import CuentaPerfil from '../../components/CuentaPerfil.jsx';
import { fetchAllEmpleados, fetchAllCargos, createEmpleado, updateEmpleado, deleteEmpleado } from '../../api/empleadosApi.jsx';

const EmpleadoPage = () => {
  const [empleados, setEmpleados] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdEmpleado, setCreatedEmpleado] = useState(null);
  const [createdAccount, setCreatedAccount] = useState(false);
  const [accountBusy, setAccountBusy] = useState(false);

  const closeForm = () => {
    setShowForm(false);
    setEditingEmpleado(null);
    setCreatedEmpleado(null);
    setCreatedAccount(false);
    setAccountBusy(false);
  };

  const loadEmpleados = async () => {
    setLoading(true);
    try {
      const data = await fetchAllEmpleados();
      setEmpleados(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCargos = async () => {
    try {
      const data = await fetchAllCargos();
      setCargos(data.results || data); // Adaptado para paginación
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    loadEmpleados();
    loadCargos();
  }, []);

  const handleEdit = (empleado) => {
    console.log('Empleado seleccionado para editar:', empleado);
    setEditingEmpleado(empleado);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este empleado?")) return;
    try {
      await deleteEmpleado(id);
      loadEmpleados();
    } catch (error) {
      console.error(error.message);
    }
  };


  const handleFormSubmit = async (formData) => {
    if (saving) return;
    setSaving(true);
    try {
      // Preparar los datos para el backend (estructura plana)
      const cleanedData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono || null,
        direccion: formData.direccion,
        sexo: formData.sexo,
        CI: formData.CI,
        fecha_nacimiento: formData.fecha_nacimiento,
        estado: formData.estado,
        sueldo: parseFloat(formData.sueldo),
        cargo: formData.cargo, // ID del cargo (se convierte en backend)
        imagen: formData.imagen, // Archivo o URL existente
      };

      // Remover campos null, undefined o vacíos, excepto imagen que puede ser null
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === null || 
            cleanedData[key] === undefined || 
            cleanedData[key] === '') {
          if (key !== 'imagen') {
            delete cleanedData[key];
          }
        }
      });

      // Si estamos editando y no hay nueva imagen, mantener la existente
      if (editingEmpleado && !formData.imagen && editingEmpleado.imagen) {
        cleanedData.imagen = editingEmpleado.imagen;
      }

      if (editingEmpleado) {
        console.log('Actualizando empleado:', editingEmpleado.id, cleanedData);
        await updateEmpleado(editingEmpleado.id, cleanedData);
        alert('Empleado actualizado correctamente');
      } else {
        console.log('Creando empleado:', cleanedData);
        const created = await createEmpleado(cleanedData);
        if (!created?.id) {
          throw new Error('No se pudo confirmar el identificador del empleado. Revisa la lista antes de volver a registrar.');
        }
        setCreatedEmpleado(created);
        loadEmpleados();
        return;
      }
      closeForm();
      loadEmpleados();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Tabla de empleados */}
      <EmpleadoList
        empleados={empleados}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {createdEmpleado ? (
              <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-md shadow-md space-y-4">
                <h2 className="text-2xl font-semibold">Empleado registrado</h2>
                <p role="status">El empleado se guardó correctamente. Puedes crear o vincular una cuenta y elegir su rol de acceso, o finalizar sin cuenta.</p>
                <CuentaPerfil tipo="empleado" perfilId={createdEmpleado.id} onLinked={() => setCreatedAccount(true)} onBusyChange={setAccountBusy} />
                <button type="button" onClick={closeForm} disabled={accountBusy} className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-50">
                  {createdAccount ? 'Finalizar' : 'Finalizar sin cuenta'}
                </button>
              </div>
            ) : (
              <EmpleadoForm
                onSubmit={handleFormSubmit}
                onCancel={closeForm}
                initialData={editingEmpleado}
                cargos={cargos}
                loading={loading || saving}
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default EmpleadoPage;
