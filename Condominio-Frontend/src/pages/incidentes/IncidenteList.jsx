import React, { useMemo, useState } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const IncidenteList = ({ incidentes, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrado de incidentes según búsqueda
  const filteredIncidentes = useMemo(() => {
    if (!incidentes || !Array.isArray(incidentes)) return [];
    if (!searchTerm) return incidentes;
    return incidentes.filter(
      (incidente) =>
        incidente && 
        ((incidente.propietario_nombre && incidente.propietario_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (incidente.descripcion && incidente.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (incidente.fecha_incidente && incidente.fecha_incidente.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (incidente.multa_detalle && incidente.multa_detalle.descripcion && incidente.multa_detalle.descripcion.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [searchTerm, incidentes]);

  // Debug: mostrar estructura de datos
  React.useEffect(() => {
    if (incidentes.length > 0) {
      console.log('=== DEBUG INCIDENTES ===');
      console.log('Total incidentes:', incidentes.length);
      console.log('Primer incidente completo:', incidentes[0]);
      console.log('Propietario nombre:', incidentes[0].propietario_nombre);
      console.log('Multa detalle:', incidentes[0].multa_detalle);
      console.log('======================');
    }
  }, [incidentes]);

  const columns = ["ID", "Propietario", "Descripción", "Fecha Incidente", "Multa", "Fecha Registro"];
  const tableData = filteredIncidentes.map((incidente) => ({
    "ID": incidente?.id || '',
    "Propietario": incidente?.propietario_nombre || 'Sin propietario',
    "Descripción": incidente?.descripcion ? 
      (incidente.descripcion.length > 50 ? 
        incidente.descripcion.substring(0, 50) + '...' : 
        incidente.descripcion) : 'Sin descripción',
    "Fecha Incidente": incidente?.fecha_incidente ? 
      new Date(incidente.fecha_incidente).toLocaleString() : 'N/A',
    "Multa": incidente?.multa_detalle ? 
      `$${incidente.multa_detalle.monto || 'N/A'}` : 'Sin multa',
    "Fecha Registro": incidente?.fecha_registro ? 
      new Date(incidente.fecha_registro).toLocaleString() : 'N/A',
    id: incidente?.id || '',
    descripcion_completa: incidente?.descripcion || '',
    multa_detalle: incidente?.multa_detalle || null,
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Incidentes
      </h2>

      {/* Botón Nuevo Incidente y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nuevo Incidente
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Incidentes"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar el incidente original en la lista filtrada
            const incidenteOriginal = filteredIncidentes.find(incidente => incidente.id === rowData.id);
            console.log('Incidente original encontrado:', incidenteOriginal);
            onEdit(incidenteOriginal);
          }}
          onDelete={onDelete}
          customActions={(rowData) => (
            <div className="flex gap-1">
              {/* Botón para ver detalles completos */}
              <Button
                variant="editar"
                onClick={() => {
                  alert(`Descripción completa:\n\n${rowData.descripcion_completa}\n\nMulta: ${rowData.multa_detalle ? `$${rowData.multa_detalle.monto}` : 'Sin multa'}`);
                }}
                className="text-xs px-2 py-1 min-w-fit"
              >
                Ver Detalles
              </Button>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default IncidenteList;
