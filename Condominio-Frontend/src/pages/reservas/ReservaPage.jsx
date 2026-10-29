import React, { useEffect, useState } from 'react';
import ReservaList from './ReservaList.jsx';
import ReservaForm from './ReservaForm.jsx';
import { fetchAllReservas, createReserva, updateReserva, deleteReserva, fetchReservaById } from '../../api/reservaApi.jsx';
import { fetchCurrentUser } from '../../api/userApi.jsx';

const ReservaPage = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingReserva, setEditingReserva] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserRole();
    loadReservas();
  }, []);

  const checkUserRole = () => {
    // Obtener el rol desde localStorage (ya se guarda correctamente en el login)
    const userRole = localStorage.getItem('userRole');
    const normalizedRole = userRole ? userRole.toLowerCase().trim() : '';
    
    // Verificar si es administrador
    const isUserAdmin = normalizedRole === 'administrador' || normalizedRole === 'admin';
    
    setIsAdmin(isUserAdmin);
  };

  const loadReservas = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReservas();
      setReservas(data.results || data);
    } catch (error) {
      console.error(error.message);
      alert('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (reserva) => {
    try {
      const fullData = await fetchReservaById(reserva.id);
      setEditingReserva(fullData);
      setShowForm(true);
    } catch (e) {
      console.error(e.message);
      alert('Error al cargar datos de la reserva');
    }
  };

  const handleDelete = async (id) => {
    // Encontrar la reserva para verificar su estado
    const reserva = reservas.find(r => r.id === id);
    
    if (!isAdmin && reserva && reserva.estado_reserva !== 'PENDIENTE') {
      alert('Solo puedes cancelar reservas que están en estado Pendiente. Para otros cambios, contacta a administración.');
      return;
    }

    const mensaje = isAdmin 
      ? '¿Seguro que quieres eliminar esta reserva?' 
      : '¿Seguro que quieres cancelar esta reserva?';
    
    if (!window.confirm(mensaje)) return;
    
    try {
      await deleteReserva(id);
      alert(isAdmin ? 'Reserva eliminada correctamente' : 'Reserva cancelada correctamente');
      loadReservas();
    } catch (error) {
      console.error(error.message);
      // Intentar parsear el mensaje de error del backend
      try {
        const errorObj = JSON.parse(error.message);
        const errorMsg = errorObj.error || errorObj.detail || JSON.stringify(errorObj);
        alert('Error: ' + errorMsg);
      } catch {
        alert('Error al eliminar la reserva: ' + error.message);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingReserva) {
        await updateReserva(editingReserva.id, formData);
        alert('Reserva actualizada correctamente');
      } else {
        await createReserva(formData);
        alert('Reserva creada correctamente');
      }
      setShowForm(false);
      setEditingReserva(null);
      loadReservas();
    } catch (error) {
      console.error('Error:', error.message);
      
      // Intentar parsear y mostrar errores de validación del backend
      try {
        const errorObj = JSON.parse(error.message);
        
        // Si hay errores de campo específicos
        if (errorObj.non_field_errors) {
          alert('Error: ' + errorObj.non_field_errors.join(', '));
        } else if (errorObj.fecha_reserva) {
          alert('Error en fecha: ' + errorObj.fecha_reserva.join(', '));
        } else if (errorObj.hora_inicio || errorObj.hora_fin) {
          const horaErrors = [
            ...(errorObj.hora_inicio || []),
            ...(errorObj.hora_fin || [])
          ];
          alert('Error en horario: ' + horaErrors.join(', '));
        } else {
          // Mostrar el primer error que encuentre
          const firstError = Object.values(errorObj)[0];
          if (Array.isArray(firstError)) {
            alert('Error: ' + firstError.join(', '));
          } else {
            alert('Error: ' + JSON.stringify(errorObj));
          }
        }
      } catch {
        alert('Error: ' + error.message);
      }
    }
  };

  return (
    <div className="relative">
      <ReservaList
        reservas={reservas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => { setEditingReserva(null); setShowForm(true); }}
        isAdmin={isAdmin}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ReservaForm
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setEditingReserva(null); }}
              initialData={editingReserva}
              loading={loading}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservaPage;
