import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const PropietarioList = ({ propietarios, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de propietarios según búsqueda
  const filteredPropietarios = useMemo(() => {
    if (!propietarios || !Array.isArray(propietarios)) return [];
    if (!searchTerm) return propietarios;
    return propietarios.filter(
      (propietario) =>
        propietario && 
        propietario.nombre_completo && 
        (propietario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (propietario.CI && propietario.CI.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (propietario.telefono && propietario.telefono.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [searchTerm, propietarios]);

  const columns = ["Nombre", "Cédula", "Teléfono", "Estado", "Fecha Registro"];
  const tableData = filteredPropietarios.map((propietario) => ({
    "Nombre": propietario?.nombre_completo || '',
    "Cédula": propietario?.CI || '',
    "Teléfono": propietario?.telefono || '',
    "Estado": propietario?.estado === 'A' ? 'Activo' : 
              propietario?.estado === 'I' ? 'Inactivo' : 
              propietario?.estado === 'S' ? 'Suspendido' : propietario?.estado || '',
    "Fecha Registro": propietario?.fecha_registro ? 
                     new Date(propietario.fecha_registro).toLocaleDateString() : '',
    id: propietario?.id || '',
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Propietarios
      </h2>

      {/* Botón Nuevo Propietario y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nuevo Propietario
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Propietarios"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar el propietario original en la lista filtrada
            const propietarioOriginal = filteredPropietarios.find(prop => prop.id === rowData.id);
            console.log('Propietario original encontrado:', propietarioOriginal);
            onEdit(propietarioOriginal);
          }}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default PropietarioList;
