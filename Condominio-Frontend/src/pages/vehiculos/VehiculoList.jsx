import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const VehiculoList = ({ vehiculos, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredVehiculos = useMemo(() => {
    if (!vehiculos || !Array.isArray(vehiculos)) return [];
    if (!searchTerm) return vehiculos;
    const term = searchTerm.toLowerCase();
    return vehiculos.filter((v) => {
      const marca = v?.marca || "";
      const modelo = v?.modelo || "";
      const placa = v?.placa || "";
      const color = v?.color || "";
      return (
        marca.toLowerCase().includes(term) ||
        modelo.toLowerCase().includes(term) ||
        placa.toLowerCase().includes(term) ||
        color.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, vehiculos]);

  const columns = ["Marca", "Modelo", "Placa", "Color", "Tipo", "Propietario"];
  const tableData = filteredVehiculos.map((v) => ({
    "Marca": v?.marca || "",
    "Modelo": v?.modelo || "",
    "Placa": v?.placa || "",
    "Color": v?.color || "",
    "Tipo": v?.tipo || "",
    "Propietario": v?.persona_nombre || v?.persona?.nombre || "",
    id: v?.id || "",
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Gestión de Vehículos</h2>

      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nuevo Vehículo
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <CustomTable
        title="Vehículos"
        columns={columns}
        data={tableData}
        onEdit={(item) => onEdit(item)}
        onDelete={onDelete}
      />
    </div>
  );
};

export default VehiculoList;


