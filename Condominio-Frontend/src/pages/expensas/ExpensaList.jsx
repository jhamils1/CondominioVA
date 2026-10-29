import React, { useMemo, useState } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";
import PaymentModal from "../../components/PaymentModal.jsx";

const ExpensaList = ({ expensas, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedExpensa, setSelectedExpensa] = useState(null);

  // Filtrado de expensas según búsqueda
  const filteredExpensas = useMemo(() => {
    if (!expensas || !Array.isArray(expensas)) return [];
    if (!searchTerm) return expensas;
    return expensas.filter(
      (expensa) =>
        expensa && 
        ((expensa.id && expensa.id.toString().includes(searchTerm)) ||
        (expensa.unidad && expensa.unidad.toString().includes(searchTerm)) ||
        (expensa.monto && expensa.monto.toString().includes(searchTerm)) ||
        (expensa.fecha_emision && expensa.fecha_emision.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (expensa.fecha_vencimiento && expensa.fecha_vencimiento.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  }, [searchTerm, expensas]);

  // Debug: mostrar estructura de datos
  React.useEffect(() => {
    if (expensas.length > 0) {
      console.log('=== DEBUG EXPENSAS ===');
      console.log('Total expensas:', expensas.length);
      console.log('Primera expensa completa:', expensas[0]);
      console.log('=====================');
    }
  }, [expensas]);

  // Función para manejar el pago
  const handlePayment = (expensa) => {
    setSelectedExpensa(expensa);
    setShowPaymentModal(true);
  };

  // Función para manejar el éxito del pago
  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Pago completado:', paymentIntent);
    // Recargar la lista de expensas o actualizar el estado
    window.location.reload(); // Temporal - idealmente actualizar el estado
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedExpensa(null);
  };

  // Función para determinar el estado de la expensa
  const getEstadoExpensa = (expensa) => {
    const hoy = new Date();
    const fechaVencimiento = new Date(expensa.fecha_vencimiento);
    
    if (expensa.pagada) {
      return { texto: 'Pagada', color: 'text-green-600', bg: 'bg-green-50' };
    } else if (fechaVencimiento < hoy) {
      return { texto: 'Vencida', color: 'text-red-600', bg: 'bg-red-50' };
    } else {
      return { texto: 'Pendiente', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    }
  };

  const columns = ["ID", "Unidad", "Monto", "Descripción", "Fecha Emisión", "Fecha Vencimiento", "Estado"];
  const tableData = filteredExpensas.map((expensa) => {
    const estado = getEstadoExpensa(expensa);
    return {
      "ID": expensa?.id || '',
      "Unidad": expensa?.unidad_detalle ? 
        `${expensa.unidad_detalle.numero || 'N/A'} - ${expensa.unidad_detalle.bloque?.nombre || 'Sin bloque'}` : 
        expensa?.unidad || 'N/A',
      "Monto": expensa?.monto ? 
        `${expensa.currency?.toUpperCase() || 'USD'} $${parseFloat(expensa.monto).toLocaleString()}` : 'N/A',
      "Descripción": expensa?.descripcion || 'Sin descripción',
      "Fecha Emisión": expensa?.fecha_emision ? 
        new Date(expensa.fecha_emision).toLocaleDateString() : 'N/A',
      "Fecha Vencimiento": expensa?.fecha_vencimiento ? 
        new Date(expensa.fecha_vencimiento).toLocaleDateString() : 'N/A',
      "Estado": estado.texto,
      id: expensa?.id || '',
      estado_info: estado,
      pagada: expensa?.pagada || false,
      destinatario: expensa?.destinatario || null,
      dias_restantes: expensa?.dias_restantes || null,
      vencida: expensa?.vencida || false,
    };
  });

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Expensas
      </h2>

      {/* Botón Nueva Expensa y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nueva Expensa
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Total Expensas</h3>
          <p className="text-2xl font-bold text-blue-900">{expensas.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Pagadas</h3>
          <p className="text-2xl font-bold text-green-900">
            {expensas.filter(expensa => expensa.pagada).length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Vencidas</h3>
          <p className="text-2xl font-bold text-red-900">
            {expensas.filter(expensa => {
              const hoy = new Date();
              const fechaVencimiento = new Date(expensa.fecha_vencimiento);
              return !expensa.pagada && fechaVencimiento < hoy;
            }).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800">Monto Total</h3>
          <p className="text-2xl font-bold text-yellow-900">
            ${expensas.reduce((sum, expensa) => sum + (parseFloat(expensa.monto) || 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            {expensas.length > 0 && expensas[0].currency ? 
              `En ${expensas[0].currency.toUpperCase()}` : 'USD'}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Expensas"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar la expensa original en la lista filtrada
            const expensaOriginal = filteredExpensas.find(expensa => expensa.id === rowData.id);
            console.log('Expensa original encontrada:', expensaOriginal);
            onEdit(expensaOriginal);
          }}
          onDelete={onDelete}
          customActions={(rowData) => {
            const expensa = filteredExpensas.find(e => e.id === rowData.id);
            const estado = getEstadoExpensa(expensa);
            const isPaid = expensa?.pagada || false;
            
            return (
              <div className="flex gap-1">
                {/* Botón para ver detalles */}
                <Button
                  variant="editar"
                  onClick={() => {
                    const destinatario = expensa?.destinatario;
                    const diasRestantes = expensa?.dias_restantes;
                    
                    let detalles = `Detalles de la Expensa:\n\n`;
                    detalles += `ID: ${rowData.id}\n`;
                    detalles += `Unidad: ${rowData.Unidad}\n`;
                    detalles += `Monto: ${rowData.Monto}\n`;
                    detalles += `Descripción: ${rowData.Descripción}\n`;
                    detalles += `Fecha Emisión: ${rowData["Fecha Emisión"]}\n`;
                    detalles += `Fecha Vencimiento: ${rowData["Fecha Vencimiento"]}\n`;
                    detalles += `Estado: ${estado.texto}\n`;
                    detalles += `Pagada: ${isPaid ? 'Sí' : 'No'}\n`;
                    
                    if (destinatario) {
                      detalles += `\nDestinatario:\n`;
                      detalles += `- Nombre: ${destinatario.nombre_completo || 'N/A'}\n`;
                      detalles += `- ID: ${destinatario.id || 'N/A'}\n`;
                    }
                    
                    if (diasRestantes !== null && diasRestantes !== undefined) {
                      detalles += `\nDías restantes: ${diasRestantes}\n`;
                    }
                    
                    alert(detalles);
                  }}
                  className="text-xs px-2 py-1 min-w-fit"
                >
                  Ver Detalles
                </Button>
                
                {/* Botón de pago (solo si no está pagada) */}
                {!isPaid && (
                  <Button
                    variant="guardar"
                    onClick={() => handlePayment(expensa)}
                    className="text-xs px-2 py-1 min-w-fit"
                  >
                    Pagar
                  </Button>
                )}
                
                {/* Indicador de pagada */}
                {isPaid && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    ✅ Pagada
                  </span>
                )}
              </div>
            );
          }}
        />
      </div>

      {/* Modal de pago */}
      {showPaymentModal && selectedExpensa && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handleCloseModal}
          expensa={selectedExpensa}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default ExpensaList;
