// src/pages/reservas/ReservaForm.jsx
import React, { useEffect, useState } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { fetchAreasComunes, fetchPersonasDisponibles } from "../../api/reservaApi";

const ReservaForm = ({ onSubmit, onCancel, initialData, loading, isAdmin }) => {
  const [formData, setFormData] = useState({
    area_comun: "",
    persona: "",
    fecha_reserva: "",
    hora_inicio: "",
    hora_fin: "",
    estado_reserva: "PENDIENTE",
  });

  const [areasComunes, setAreasComunes] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadFormData();
  }, [isAdmin]); // Recargar cuando cambie isAdmin

  useEffect(() => {
    if (initialData) {
      setFormData({
        area_comun: initialData.area_comun || "",
        persona: initialData.persona || "",
        fecha_reserva: initialData.fecha_reserva || "",
        hora_inicio: initialData.hora_inicio || "",
        hora_fin: initialData.hora_fin || "",
        estado_reserva: initialData.estado_reserva || "PENDIENTE",
      });
    }
  }, [initialData]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      
      const [areasData, personasData] = await Promise.all([
        fetchAreasComunes(),
        isAdmin ? fetchPersonasDisponibles() : Promise.resolve([])
      ]);

      const areas = areasData.results || areasData;
      // Filtrar solo áreas activas
      const areasActivas = areas.filter(area => area.estado === 'A');
      setAreasComunes(areasActivas);
      
      if (isAdmin) {
        setPersonas(personasData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos del formulario');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.area_comun) {
      alert("Debe seleccionar un área común");
      return;
    }
    
    if (isAdmin && !formData.persona) {
      alert("Debe seleccionar una persona");
      return;
    }
    
    if (!formData.fecha_reserva || !formData.hora_inicio || !formData.hora_fin) {
      alert("Debe completar todos los campos de fecha y hora");
      return;
    }

    // Preparar datos para enviar
    const dataToSend = { ...formData };
    
    // Si no es admin, no enviar el campo persona (se asigna automáticamente en backend)
    if (!isAdmin) {
      delete dataToSend.persona;
    }
    
    onSubmit(dataToSend);
  };

  const isEditing = !!initialData;

  // Obtener la fecha mínima (hoy)
  const today = new Date().toISOString().split('T')[0];

  return (
    <StyledForm title={isEditing ? "Editar Reserva" : "Nueva Reserva"} onSubmit={handleSubmit}>
      {loadingData ? (
        <div className="text-center py-4">Cargando datos...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="area_comun">
                Área Común <span className="text-red-500">*</span>
              </label>
              <select
                id="area_comun"
                name="area_comun"
                value={formData.area_comun}
                onChange={handleChange}
                required
                disabled={isEditing}
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <option value="">Seleccione un área común</option>
                {areasComunes.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.nombre} - {area.ubicacion} (Capacidad: {area.capacidad_maxima})
                  </option>
                ))}
              </select>
              {isEditing && (
                <p className="text-xs text-gray-500 mt-1">El área común no puede modificarse una vez creada la reserva</p>
              )}
            </div>

            {isAdmin && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="persona">
                  Persona que Reserva <span className="text-red-500">*</span>
                </label>
                <select
                  id="persona"
                  name="persona"
                  value={formData.persona}
                  onChange={handleChange}
                  required
                  disabled={isEditing}
                  className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccione una persona</option>
                  {personas.map((persona) => (
                    <option key={persona.id} value={persona.id}>
                      {persona.nombre_completo}
                    </option>
                  ))}
                </select>
                {personas.length === 0 && !loadingData && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ No hay personas disponibles</p>
                )}
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">La persona no puede modificarse una vez creada la reserva</p>
                )}
              </div>
            )}

            {!isAdmin && (
              <div className="md:col-span-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-blue-800">
                  ℹ️ <strong>Nota:</strong> Esta reserva se registrará automáticamente a tu nombre.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fecha_reserva">
                Fecha de Reserva <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="fecha_reserva"
                name="fecha_reserva"
                value={formData.fecha_reserva}
                onChange={handleChange}
                min={today}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="estado_reserva">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="estado_reserva"
                name="estado_reserva"
                value={formData.estado_reserva}
                onChange={handleChange}
                required
                disabled={!isAdmin}
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="COMPLETADA">Completada</option>
              </select>
              {!isAdmin && (
                <p className="text-xs text-gray-500 mt-1">Solo administradores pueden cambiar el estado</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="hora_inicio">
                Hora de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="hora_inicio"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="hora_fin">
                Hora de Fin <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="hora_fin"
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Las reservas que cruzan medianoche son válidas (ej: 22:00 a 02:00)
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 mt-6 border-t">
            {onCancel && (
              <Button variant="cancelar" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button variant="guardar" type="submit" disabled={loading || loadingData}>
              {isEditing ? "Guardar Cambios" : "Guardar"}
            </Button>
          </div>
        </>
      )}
    </StyledForm>
  );
};

export default ReservaForm;
