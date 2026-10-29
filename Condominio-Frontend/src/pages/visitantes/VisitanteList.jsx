import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const VisitanteList = ({ visitantes, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de visitantes según búsqueda
  const filteredVisitantes = useMemo(() => {
    if (!visitantes || !Array.isArray(visitantes)) return [];
    if (!searchTerm) return visitantes;
    return visitantes.filter(
      (visitante) =>
        visitante && 
        (visitante.nombre && visitante.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (visitante.apellido && visitante.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (visitante.CI && visitante.CI.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (visitante.telefono && visitante.telefono.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, visitantes]);


  const columns = ["Nombre", "Cédula", "Teléfono", "Estado", "Fecha Registro"];
  const tableData = filteredVisitantes.map((visitante) => ({
    "Nombre": `${visitante?.nombre || ''} ${visitante?.apellido || ''}`,
    "Cédula": visitante?.CI || '',
    "Teléfono": visitante?.telefono || 'Sin teléfono',
    "Estado": visitante?.estado === 'A' ? 'Activo' : 
              visitante?.estado === 'I' ? 'Inactivo' : 
              visitante?.estado === 'S' ? 'Suspendido' : visitante?.estado || '',
    "Fecha Registro": visitante?.fecha_registro ? 
                     new Date(visitante.fecha_registro).toLocaleDateString() : '',
    id: visitante?.id || '',
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Visitantes
      </h2>

      {/* Botón Nuevo Visitante y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nuevo Visitante
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Visitantes"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar el visitante original en la lista filtrada
            const visitanteOriginal = filteredVisitantes.find(vis => vis.id === rowData.id);
            console.log('Visitante original encontrado:', visitanteOriginal);
            onEdit(visitanteOriginal);
          }}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default VisitanteList;
