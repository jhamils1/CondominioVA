import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const InquilinoList = ({ inquilinos, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de inquilinos según búsqueda
  const filteredInquilinos = useMemo(() => {
    if (!inquilinos || !Array.isArray(inquilinos)) return [];
    if (!searchTerm) return inquilinos;
    return inquilinos.filter(
      (inquilino) =>
        inquilino && 
        (inquilino.nombre && inquilino.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inquilino.apellido && inquilino.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inquilino.CI && inquilino.CI.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (inquilino.propietario_nombre && inquilino.propietario_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, inquilinos]);

  const columns = ["Nombre", "CI", "Teléfono", "Propietario", "Fecha Inicio", "Fecha Fin", "Estado"];
  const tableData = filteredInquilinos.map((inquilino) => ({
    "Nombre": `${inquilino?.nombre || ''} ${inquilino?.apellido || ''}`,
    "CI": inquilino?.CI || '',
    "Teléfono": inquilino?.telefono || 'Sin teléfono',
    "Propietario": inquilino?.propietario_nombre || '',
    "Fecha Inicio": inquilino?.fecha_inicio ? 
                   new Date(inquilino.fecha_inicio).toLocaleDateString() : '',
    "Fecha Fin": inquilino?.fecha_fin ? 
                new Date(inquilino.fecha_fin).toLocaleDateString() : 'Sin fecha',
    "Estado": inquilino?.estado_inquilino === 'A' ? 'Activo' : 
              inquilino?.estado_inquilino === 'I' ? 'Inactivo' : 
              inquilino?.estado_inquilino === 'F' ? 'Finalizado' : inquilino?.estado_inquilino || '',
    id: inquilino?.id || '',
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Inquilinos
      </h2>

      {/* Botón Nuevo Inquilino y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nuevo Inquilino
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Inquilinos"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar el inquilino original en la lista filtrada
            const inquilinoOriginal = filteredInquilinos.find(inq => inq.id === rowData.id);
            console.log('Inquilino original encontrado:', inquilinoOriginal);
            onEdit(inquilinoOriginal);
          }}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default InquilinoList;
