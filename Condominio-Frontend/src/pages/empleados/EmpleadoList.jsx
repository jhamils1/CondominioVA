import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const EmpleadoList = ({ empleados, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de empleados según búsqueda
  const filteredEmpleados = useMemo(() => {
    if (!empleados || !Array.isArray(empleados)) return [];
    if (!searchTerm) return empleados;
    return empleados.filter(
      (empleado) =>
        empleado && 
        empleado.nombre_completo && 
        empleado.cargo_nombre &&
        (empleado.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.cargo_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (empleado.CI && empleado.CI.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (empleado.telefono && empleado.telefono.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [searchTerm, empleados]);

  const columns = ["Nombre", "Cargo", "Sueldo", "Ingreso", "Estado"];
  const tableData = filteredEmpleados.map((empleado) => ({
    "Nombre": empleado?.nombre_completo || '',
    "Cargo": empleado?.cargo_nombre || '',
    "Sueldo": empleado?.sueldo ? `$${parseFloat(empleado.sueldo).toLocaleString()}` : '',
    "Ingreso": empleado?.fecha_registro ? 
      new Date(empleado.fecha_registro).toLocaleDateString('es-ES') : '',
    "Estado": empleado?.estado === 'A' ? 'Activo' : 
             empleado?.estado === 'I' ? 'Inactivo' : 
             empleado?.estado === 'S' ? 'Suspendido' : empleado?.estado || '',
    id: empleado?.id || '',
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Empleados
      </h2>

      {/* Botón Nuevo Empleado y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nuevo Empleado
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Empleados"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar el empleado original en la lista filtrada
            const empleadoOriginal = filteredEmpleados.find(emp => emp.id === rowData.id);
            console.log('Empleado original encontrado:', empleadoOriginal);
            onEdit(empleadoOriginal);
          }}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default EmpleadoList;
