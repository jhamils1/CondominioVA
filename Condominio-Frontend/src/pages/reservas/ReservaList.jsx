import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const ReservaList = ({ reservas, onEdit, onDelete, onAddNew, isAdmin }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredReservas = useMemo(() => {
    if (!reservas || !Array.isArray(reservas)) return [];
    if (!searchTerm) return reservas;
    const term = searchTerm.toLowerCase();
    return reservas.filter((reserva) => {
      const nombreArea = reserva?.nombre_area || "";
      const nombrePersona = reserva?.nombre_persona || "";
      const fecha = reserva?.fecha_reserva || "";
      const estado = reserva?.estado_reserva || "";
      return (
        nombreArea.toLowerCase().includes(term) ||
        nombrePersona.toLowerCase().includes(term) ||
        fecha.includes(term) ||
        estado.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, reservas]);

  // Función para obtener el color del badge según el estado
  const getEstadoBadge = (estado) => {
    const badges = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-800',
      'CONFIRMADA': 'bg-green-100 text-green-800',
      'CANCELADA': 'bg-red-100 text-red-800',
      'COMPLETADA': 'bg-blue-100 text-blue-800',
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

  const columns = isAdmin 
    ? ["Área", "Persona", "Fecha", "Horario", "Estado"]
    : ["Área", "Fecha", "Horario", "Estado"];

  const tableData = filteredReservas.map((reserva) => {
    const baseData = {
      "Área": reserva?.nombre_area || "",
      "Fecha": reserva?.fecha_reserva || "",
      "Horario": `${reserva?.hora_inicio || ""} - ${reserva?.hora_fin || ""}`,
      "Estado": (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(reserva?.estado_reserva)}`}>
          {reserva?.estado_reserva || ""}
        </span>
      ),
      id: reserva?.id || "",
    };

    // Solo agregar la columna Persona si es admin
    if (isAdmin) {
      return {
        ...baseData,
        "Persona": reserva?.nombre_persona || "",
      };
    }

    return baseData;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {isAdmin ? "Gestión de Reservas de Áreas Comunes" : "Mis Reservas"}
      </h2>

      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nueva Reserva
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <SearchBar 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por área, persona, fecha o estado..."
          />
        </div>
      </div>

      {/* Leyenda de estados */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm font-medium text-gray-700 mb-2">Estados de Reserva:</p>
        <div className="flex flex-wrap gap-3">
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            Pendiente
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            Confirmada
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Cancelada
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Completada
          </span>
        </div>
        {!isAdmin && (
          <p className="text-xs text-gray-600 mt-2">
            ℹ️ Solo puedes cancelar reservas en estado Pendiente. Para otros cambios, contacta a administración.
          </p>
        )}
      </div>

      <CustomTable
        title="Reservas"
        columns={columns}
        data={tableData}
        onEdit={(item) => onEdit(item)}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ReservaList;
