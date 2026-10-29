import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const CargoList = ({ cargos, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de cargos según búsqueda
  const filteredCargos = useMemo(() => {
    if (!cargos || !Array.isArray(cargos)) return [];
    if (!searchTerm) return cargos;
    return cargos.filter(
      (cargo) =>
        cargo && 
        cargo.nombre && 
        cargo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, cargos]);

  const columns = ["Nombre", "Salario Base", "Estado"];
  const tableData = filteredCargos.map((cargo) => ({
    "Nombre": cargo?.nombre || '',
    "Salario Base": cargo?.salario_base ? `$${parseFloat(cargo.salario_base).toLocaleString()}` : '$0.00',
    "Estado": cargo?.estado ? 'Activo' : 'Inactivo',
    id: cargo?.id || '',
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Cargos
      </h2>

      {/* Botón Nuevo Cargo y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nuevo Cargo
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Cargos"
          columns={columns}
          data={tableData}
          onEdit={(cargo) => onEdit(cargo)}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default CargoList;
