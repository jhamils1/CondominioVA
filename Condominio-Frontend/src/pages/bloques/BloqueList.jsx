import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const BloqueList = ({ bloques, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredBloques = useMemo(() => {
    if (!bloques || !Array.isArray(bloques)) return [];
    if (!searchTerm) return bloques;
    const term = searchTerm.toLowerCase();
    return bloques.filter((b) => {
      const nombre = b?.nombre || "";
      const direccion = b?.direccion || "";
      return (
        nombre.toLowerCase().includes(term) ||
        direccion.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, bloques]);

  const columns = ["Nombre", "Dirección"];
  const tableData = filteredBloques.map((b) => ({
    "Nombre": b?.nombre || "",
    "Dirección": b?.direccion || "",
    id: b?.id || "",
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Gestión de Bloques</h2>

      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nuevo Bloque
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <CustomTable
        title="Bloques"
        columns={columns}
        data={tableData}
        onEdit={(item) => onEdit(item)}
        onDelete={onDelete}
      />
    </div>
  );
};

export default BloqueList;
