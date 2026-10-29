import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const AreaComunList = ({ areasComunes, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredAreasComunes = useMemo(() => {
    if (!areasComunes || !Array.isArray(areasComunes)) return [];
    if (!searchTerm) return areasComunes;
    const term = searchTerm.toLowerCase();
    return areasComunes.filter((area) => {
      const nombre = area?.nombre || "";
      const ubicacion = area?.ubicacion || "";
      const descripcion = area?.descripcion || "";
      return (
        nombre.toLowerCase().includes(term) ||
        ubicacion.toLowerCase().includes(term) ||
        descripcion.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, areasComunes]);

  const columns = ["Nombre", "Ubicación", "Capacidad", "Horario", "Estado"];
  const tableData = filteredAreasComunes.map((area) => ({
    "Nombre": area?.nombre || "",
    "Ubicación": area?.ubicacion || "",
    "Capacidad": area?.capacidad_maxima || 0,
    "Horario": `${area?.horario_apertura || ""} - ${area?.horario_cierre || ""}`,
    "Estado": area?.estado === 'A' ? 'Activo' : 'Inactivo',
    id: area?.id || "",
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Gestión de Áreas Comunes</h2>

      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nueva Área Común
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <CustomTable
        title="Áreas Comunes"
        columns={columns}
        data={tableData}
        onEdit={(item) => onEdit(item)}
        onDelete={onDelete}
      />
    </div>
  );
};

export default AreaComunList;
