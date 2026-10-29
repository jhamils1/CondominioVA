import React, { useState, useEffect } from "react";
import MascotaList from "./MascotaList";
import MascotaForm from "./MascotaForm";
import {
  fetchAllMascotas,
  createMascota,
  updateMascota,
  deleteMascota,
  fetchAllPersonas,
} from "../../api/mascotasApi";

const MascotaPage = () => {
  const [mascotas, setMascotas] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMascota, setEditingMascota] = useState(null);
  const [error, setError] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadMascotas();
    loadPersonas();
  }, []);

  const loadMascotas = async () => {
    try {
      setLoading(true);
      const data = await fetchAllMascotas();
      setMascotas(data);
    } catch (error) {
      console.error("Error al cargar mascotas:", error);
      setError("Error al cargar las mascotas");
    } finally {
      setLoading(false);
    }
  };

  const loadPersonas = async () => {
    try {
      const data = await fetchAllPersonas();
      setPersonas(data);
    } catch (error) {
      console.error("Error al cargar personas:", error);
    }
  };

  const handleAddNew = () => {
    setEditingMascota(null);
    setShowForm(true);
  };

  const handleEdit = (mascota) => {
    setEditingMascota(mascota);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta mascota?")) {
      try {
        setLoading(true);
        await deleteMascota(id);
        await loadMascotas(); // Recargar la lista
      } catch (error) {
        console.error("Error al eliminar mascota:", error);
        setError("Error al eliminar la mascota");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      if (editingMascota) {
        // Actualizar mascota existente
        await updateMascota(editingMascota.id, formData);
      } else {
        // Crear nueva mascota
        await createMascota(formData);
      }

      // Recargar la lista y cerrar el formulario
      await loadMascotas();
      setShowForm(false);
      setEditingMascota(null);
    } catch (error) {
      console.error("Error al guardar mascota:", error);
      setError("Error al guardar la mascota");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMascota(null);
    setError(null);
  };

  if (showForm) {
    return (
      <MascotaForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={editingMascota}
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
        
        <MascotaList
          mascotas={mascotas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default MascotaPage;
