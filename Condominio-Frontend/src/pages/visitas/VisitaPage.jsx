import React, { useState, useEffect } from "react";
import VisitaList from "./VisitaList";
import VisitaForm from "./VisitaForm";
import {
  fetchAllVisitas,
  createVisita,
  updateVisita,
  deleteVisita,
  fetchVisitantesDisponibles,
  fetchPersonasDisponibles,
} from "../../api/visitasApi";

const VisitaPage = () => {
  const [visitas, setVisitas] = useState([]);
  const [visitantes, setVisitantes] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVisita, setEditingVisita] = useState(null);
  const [error, setError] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadVisitas();
    loadVisitantes();
    loadPersonas();
  }, []);

  const loadVisitas = async () => {
    try {
      setLoading(true);
      const data = await fetchAllVisitas();
      setVisitas(data);
    } catch (error) {
      console.error("Error al cargar visitas:", error);
      setError("Error al cargar las visitas");
    } finally {
      setLoading(false);
    }
  };

  const loadVisitantes = async () => {
    try {
      const data = await fetchVisitantesDisponibles();
      setVisitantes(data);
    } catch (error) {
      console.error("Error al cargar visitantes:", error);
    }
  };

  const loadPersonas = async () => {
    try {
      const data = await fetchPersonasDisponibles();
      setPersonas(data);
    } catch (error) {
      console.error("Error al cargar personas:", error);
    }
  };

  const handleAddNew = () => {
    setEditingVisita(null);
    setShowForm(true);
  };

  const handleEdit = (visita) => {
    setEditingVisita(visita);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta visita?")) {
      try {
        setLoading(true);
        await deleteVisita(id);
        await loadVisitas(); // Recargar la lista
      } catch (error) {
        console.error("Error al eliminar visita:", error);
        setError("Error al eliminar la visita");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      if (editingVisita) {
        // Actualizar visita existente
        await updateVisita(editingVisita.id, formData);
      } else {
        // Crear nueva visita
        await createVisita(formData);
      }

      // Recargar la lista y cerrar el formulario
      await loadVisitas();
      setShowForm(false);
      setEditingVisita(null);
    } catch (error) {
      console.error("Error al guardar visita:", error);
      setError("Error al guardar la visita");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVisita(null);
    setError(null);
  };

  if (showForm) {
    return (
      <VisitaForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={editingVisita}
        visitantes={visitantes}
        personas={personas}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <VisitaList
          visitas={visitas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default VisitaPage;
