import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const UnidadList = ({ unidades, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredUnidades = useMemo(() => {
    if (!unidades || !Array.isArray(unidades)) return [];
    if (!searchTerm) return unidades;
    const term = searchTerm.toLowerCase();
    return unidades.filter((u) => {
      const numero = u?.numero || "";
      const codigo = u?.codigo || "";
      const descripcion = u?.descripcion || "";
      const bloque = u?.bloque_nombre || u?.bloque?.nombre || "";
      return (
        numero.toLowerCase().includes(term) ||
        codigo.toLowerCase().includes(term) ||
        descripcion.toLowerCase().includes(term) ||
        bloque.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, unidades]);

  const getTipoDisplay = (tipo) => {
    const tipos = {
      'A': 'Apartamento',
      'C': 'Casa',
      'L': 'Local Comercial',
      'E': 'Estacionamiento'
    };
    return tipos[tipo] || tipo;
  };

  const getEstadoDisplay = (estado) => {
    const estados = {
      'D': 'Disponible',
      'O': 'Ocupada',
      'M': 'En Mantenimiento',
      'R': 'Reservada'
    };
    return estados[estado] || estado;
  };

  const columns = ["Código", "Número", "Bloque", "Tipo", "Estado", "Piso", "Área (m²)"];
  const tableData = filteredUnidades.map((u) => {
    console.log('Datos de unidad:', u);
    console.log('Bloque completo:', u?.bloque);
    console.log('Bloque nombre:', u?.bloque?.nombre);
    return {
      "Código": u?.codigo || "",
      "Número": u?.numero || "",
      "Bloque": u?.bloque_nombre || u?.bloque?.nombre || "",
      "Tipo": getTipoDisplay(u?.tipo_unidad),
      "Estado": getEstadoDisplay(u?.estado),
      "Piso": u?.numero_piso || "",
      "Área (m²)": u?.area_m2 || "",
      id: u?.id || "",
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Gestión de Unidades</h2>

      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nueva Unidad
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <CustomTable
        title="Unidades"
        columns={columns}
        data={tableData}
        onEdit={(item) => onEdit(item)}
        onDelete={onDelete}
      />
    </div>
  );
};

export default UnidadList;
