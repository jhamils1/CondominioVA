import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const VisitaList = ({ visitas, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de visitas según búsqueda
  const filteredVisitas = useMemo(() => {
    if (!visitas || !Array.isArray(visitas)) return [];
    if (!searchTerm) return visitas;
    return visitas.filter(
      (visita) =>
        visita && 
        (visita.visitante_nombre && visita.visitante_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (visita.recibe_persona_nombre && visita.recibe_persona_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (visita.estado && visita.estado.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, visitas]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'text-yellow-600 bg-yellow-100';
      case 'ACTIVA': return 'text-green-600 bg-green-100';
      case 'FINALIZADA': return 'text-blue-600 bg-blue-100';
      case 'CANCELADA': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'ACTIVA': return 'Activa';
      case 'FINALIZADA': return 'Finalizada';
      case 'CANCELADA': return 'Cancelada';
      default: return estado;
    }
  };

  const columns = ["Visitante", "Recibe", "Estado", "Entrada", "Salida"];
  const tableData = filteredVisitas.map((visita) => ({
    "Visitante": visita?.visitante_nombre || '',
    "Recibe": visita?.recibe_persona_nombre || '',
    "Estado": (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(visita?.estado)}`}>
        {getEstadoText(visita?.estado)}
      </span>
    ),
    "Entrada": visita?.fecha_hora_entrada ? 
               new Date(visita.fecha_hora_entrada).toLocaleString() : '',
    "Salida": visita?.fecha_hora_salida ? 
              new Date(visita.fecha_hora_salida).toLocaleString() : 'No registrada',
    id: visita?.id || '',
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Visitas
      </h2>

      {/* Botón Nueva Visita y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nueva Visita
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Visitas"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar la visita original en la lista filtrada
            const visitaOriginal = filteredVisitas.find(vis => vis.id === rowData.id);
            console.log('Visita original encontrada:', visitaOriginal);
            onEdit(visitaOriginal);
          }}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default VisitaList;
