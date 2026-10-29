import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const FamiliarList = ({ familiares, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de familiares según búsqueda
  const filteredFamiliares = useMemo(() => {
    if (!familiares || !Array.isArray(familiares)) return [];
    if (!searchTerm) return familiares;
    return familiares.filter(
      (familiar) =>
        familiar && 
        (familiar.nombre && familiar.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (familiar.apellido && familiar.apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (familiar.CI && familiar.CI.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (familiar.telefono && familiar.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (familiar.persona_relacionada_nombre && familiar.persona_relacionada_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, familiares]);

  const columns = ["Nombre", "CI", "Teléfono", "Parentesco", "Persona Relacionada", "Estado"];
  const tableData = filteredFamiliares.map((familiar) => ({
    "Nombre": `${familiar?.nombre || ''} ${familiar?.apellido || ''}`,
    "CI": familiar?.CI || '',
    "Teléfono": familiar?.telefono || 'Sin teléfono',
    "Parentesco": familiar?.parentesco === 'PADRE' ? 'Padre' :
                  familiar?.parentesco === 'MADRE' ? 'Madre' :
                  familiar?.parentesco === 'HIJO' ? 'Hijo' :
                  familiar?.parentesco === 'HIJA' ? 'Hija' :
                  familiar?.parentesco === 'HERMANO' ? 'Hermano' :
                  familiar?.parentesco === 'HERMANA' ? 'Hermana' :
                  familiar?.parentesco === 'ESPOSO' ? 'Esposo' :
                  familiar?.parentesco === 'ESPOSA' ? 'Esposa' : familiar?.parentesco || '',
    "Persona Relacionada": familiar?.persona_relacionada_nombre || '',
    "Estado": familiar?.estado === 'A' ? 'Activo' : 
              familiar?.estado === 'I' ? 'Inactivo' : 
              familiar?.estado === 'S' ? 'Suspendido' : familiar?.estado || '',
    id: familiar?.id || '',
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Familiares
      </h2>

      {/* Botón Nuevo Familiar y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nuevo Familiar
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Familiares"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar el familiar original en la lista filtrada
            const familiarOriginal = filteredFamiliares.find(fam => fam.id === rowData.id);
            console.log('Familiar original encontrado:', familiarOriginal);
            onEdit(familiarOriginal);
          }}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default FamiliarList;
