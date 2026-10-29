import React, { useMemo, useState } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import { generarPDFContrato, descargarPDFContrato } from "../../api/contratoApi.jsx";

const ContratoList = ({ contratos, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [generatingPDF, setGeneratingPDF] = useState(null);
  const [downloadingPDF, setDownloadingPDF] = useState(null);

  // Filtrado de contratos según búsqueda
  const filteredContratos = useMemo(() => {
    if (!contratos || !Array.isArray(contratos)) return [];
    if (!searchTerm) return contratos;
    return contratos.filter(
      (contrato) =>
        contrato && 
        ((contrato.propietario_nombre && contrato.propietario_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contrato.propietario_apellido && contrato.propietario_apellido.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contrato.propietario?.nombre_completo && contrato.propietario.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contrato.propietario?.nombre && contrato.propietario.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contrato.unidad_codigo && contrato.unidad_codigo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contrato.estado_display && contrato.estado_display.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [searchTerm, contratos]);

  const handleGenerarPDF = async (contratoId) => {
    setGeneratingPDF(contratoId);
    try {
      const result = await generarPDFContrato(contratoId);
      alert('PDF generado correctamente');
      // Recargar la lista para mostrar la URL del PDF
      window.location.reload();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar PDF: ' + error.message);
    } finally {
      setGeneratingPDF(null);
    }
  };

  const handleDescargarPDF = async (pdfUrl) => {
    if (!pdfUrl) {
      alert('No hay PDF disponible para este contrato');
      return;
    }
    
    setDownloadingPDF(pdfUrl);
    try {
      await descargarPDFContrato(pdfUrl);
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      alert('Error al descargar PDF: ' + error.message);
    } finally {
      setDownloadingPDF(null);
    }
  };

  // Debug: mostrar estructura de datos
  React.useEffect(() => {
    if (contratos.length > 0) {
      console.log('=== DEBUG CONTRATOS ===');
      console.log('Total contratos:', contratos.length);
      console.log('Primer contrato completo:', contratos[0]);
      console.log('Propietario completo:', contratos[0].propietario);
      console.log('Propietario nombre:', contratos[0].propietario_nombre);
      console.log('Propietario apellido:', contratos[0].propietario_apellido);
      console.log('Unidad completa:', contratos[0].unidad);
      console.log('Unidad codigo:', contratos[0].unidad_codigo);
      console.log('=====================');
    }
  }, [contratos]);

  const columns = ["ID", "Propietario", "Unidad", "Fecha Contrato", "Cuota Mensual", "Estado", "PDF"];
  const tableData = filteredContratos.map((contrato) => ({
    "ID": contrato?.id || '',
    "Propietario": (() => {
      // Intentar diferentes formas de obtener el nombre del propietario
      if (contrato?.propietario_nombre && contrato?.propietario_apellido) {
        return `${contrato.propietario_nombre} ${contrato.propietario_apellido}`.trim();
      }
      if (contrato?.propietario?.nombre_completo) {
        return contrato.propietario.nombre_completo;
      }
      if (contrato?.propietario?.nombre && contrato?.propietario?.apellido) {
        return `${contrato.propietario.nombre} ${contrato.propietario.apellido}`.trim();
      }
      if (contrato?.propietario?.nombre) {
        return contrato.propietario.nombre;
      }
      if (typeof contrato?.propietario === 'string') {
        return contrato.propietario;
      }
      return 'N/A';
    })(),
    "Unidad": contrato?.unidad_codigo || '',
    "Fecha Contrato": contrato?.fecha_contrato ? 
                     new Date(contrato.fecha_contrato).toLocaleDateString() : '',
    "Cuota Mensual": contrato?.cuota_mensual ? 
                     `$${parseFloat(contrato.cuota_mensual).toLocaleString()}` : 'N/A',
    "Estado": contrato?.estado_display || contrato?.estado || '',
    "PDF": contrato?.contrato_PDF ? 'Disponible' : 'No generado',
    id: contrato?.id || '',
    contrato_PDF: contrato?.contrato_PDF || null,
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Contratos
      </h2>

      {/* Botón Nuevo Contrato y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nuevo Contrato
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Contratos"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar el contrato original en la lista filtrada
            const contratoOriginal = filteredContratos.find(contrato => contrato.id === rowData.id);
            console.log('Contrato original encontrado:', contratoOriginal);
            onEdit(contratoOriginal);
          }}
          onDelete={onDelete}
          customActions={(rowData) => (
            <div className="flex gap-1">
              {/* Botones de PDF */}
              <Button
                variant="editar"
                onClick={() => handleGenerarPDF(rowData.id)}
                disabled={generatingPDF === rowData.id}
                className="text-xs px-2 py-1 min-w-fit"
              >
                {generatingPDF === rowData.id ? 'Gen...' : 'PDF'}
              </Button>
              {rowData.contrato_PDF && (
                <Button
                  variant="editar"
                  onClick={() => handleDescargarPDF(rowData.contrato_PDF)}
                  disabled={downloadingPDF === rowData.contrato_PDF}
                  className="text-xs px-2 py-1 min-w-fit"
                >
                  {downloadingPDF === rowData.contrato_PDF ? 'Desc...' : 'Descargar'}
                </Button>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default ContratoList;
