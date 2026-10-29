import React, { useMemo, useState } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const MultaList = ({ multas, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrado de multas según búsqueda
  const filteredMultas = useMemo(() => {
    if (!multas || !Array.isArray(multas)) return [];
    if (!searchTerm) return multas;
    return multas.filter(
      (multa) =>
        multa && 
        ((multa.id && multa.id.toString().includes(searchTerm)) ||
        (multa.monto && multa.monto.toString().includes(searchTerm)) ||
        (multa.tipo && multa.tipo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (multa.fecha_multa && multa.fecha_multa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (multa.expensa && multa.expensa.toString().includes(searchTerm)))
    );
  }, [searchTerm, multas]);

  // Debug: mostrar estructura de datos
  React.useEffect(() => {
    if (multas.length > 0) {
      console.log('=== DEBUG MULTAS ===');
      console.log('Total multas:', multas.length);
      console.log('Primera multa completa:', multas[0]);
      console.log('===================');
    }
  }, [multas]);

  // Función para obtener el texto del tipo de multa
  const getTipoText = (tipo) => {
    switch (tipo) {
      case 'I': return 'Incidente';
      case 'F': return 'Falta de Pago';
      case 'O': return 'Otros';
      default: return tipo || 'N/A';
    }
  };

  const columns = ["ID", "Expensa", "Monto", "Tipo", "Fecha Multa"];
  const tableData = filteredMultas.map((multa) => ({
    "ID": multa?.id || '',
    "Expensa": multa?.expensa || 'N/A',
    "Monto": multa?.monto ? `$${parseFloat(multa.monto).toLocaleString()}` : 'N/A',
    "Tipo": getTipoText(multa?.tipo),
    "Fecha Multa": multa?.fecha_multa ? 
      new Date(multa.fecha_multa).toLocaleDateString() : 'N/A',
    id: multa?.id || '',
    tipo_original: multa?.tipo || '',
    monto_original: multa?.monto || '',
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Multas
      </h2>

      {/* Botón Nueva Multa y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nueva Multa
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Multas</h3>
          <p className="text-2xl font-bold text-blue-900">{multas.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Monto Total</h3>
          <p className="text-2xl font-bold text-green-900">
            ${multas.reduce((sum, multa) => sum + (parseFloat(multa.monto) || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Por Incidentes</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {multas.filter(multa => multa.tipo === 'I').length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Multas"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar la multa original en la lista filtrada
            const multaOriginal = filteredMultas.find(multa => multa.id === rowData.id);
            console.log('Multa original encontrada:', multaOriginal);
            onEdit(multaOriginal);
          }}
          onDelete={onDelete}
          customActions={(rowData) => (
            <div className="flex gap-1">
              {/* Botón para ver detalles */}
              <Button
                variant="editar"
                onClick={() => {
                  alert(`Detalles de la Multa:\n\nID: ${rowData.id}\nExpensa: ${rowData.Expensa}\nMonto: ${rowData.Monto}\nTipo: ${rowData.Tipo}\nFecha: ${rowData["Fecha Multa"]}`);
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

export default MultaList;
