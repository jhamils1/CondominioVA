// src/pages/objetosPerdidos/ObjetoPerdidoList.jsx
import React from "react";
import Button from "../../components/button";

const ObjetoPerdidoList = ({ objetosPerdidos, onEdit, onDelete, onAddNew }) => {
  const columns = [
    { 
      key: "foto", 
      label: "Foto",
      render: (objeto) => {
        try {
          return (
            <img 
              src={objeto.foto || ''} 
              alt={objeto.titulo || 'Objeto'}
              className="w-16 h-16 object-cover rounded"
              onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23ddd"/></svg>'; }}
            />
          );
        } catch (error) {
          return <span className="text-xs text-gray-400">Sin imagen</span>;
        }
      }
    },
    { 
      key: "titulo", 
      label: "¿Qué es?",
      render: (objeto) => String(objeto.titulo || '-')
    },
    { 
      key: "lugar_encontrado", 
      label: "Lugar Encontrado",
      render: (objeto) => String(objeto.lugar_encontrado || '-')
    },
    {
      key: "fecha_encontrado",
      label: "Fecha Encontrado",
      render: (objeto) => {
        try {
          if (!objeto.fecha_encontrado) return '-';
          return new Date(objeto.fecha_encontrado).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (error) {
          return String(objeto.fecha_encontrado || '-');
        }
      }
    },
    {
      key: "estado",
      label: "Estado",
      render: (objeto) => {
        try {
          const estadoMap = {
            'P': { text: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
            'E': { text: 'Entregado', color: 'bg-green-100 text-green-800' }
          };
          const estado = estadoMap[objeto.estado] || { text: String(objeto.estado || 'Desconocido'), color: 'bg-gray-100 text-gray-800' };
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${estado.color}`}>
              {estado.text}
            </span>
          );
        } catch (error) {
          return <span>-</span>;
        }
      }
    },
    {
      key: "entregado_a",
      label: "Entregado a",
      render: (objeto) => {
        try {
          if (!objeto.entregado_a) return <span>-</span>;
          if (typeof objeto.entregado_a === 'object' && objeto.entregado_a !== null) {
            const nombre = String(objeto.entregado_a.nombre || '');
            const apellido = String(objeto.entregado_a.apellido || '');
            return <span>{nombre} {apellido}</span>;
          }
          return <span>-</span>;
        } catch (error) {
          return <span>-</span>;
        }
      }
    },
  ];

  // Asegurar que objetosPerdidos es un array
  const objetosArray = Array.isArray(objetosPerdidos) ? objetosPerdidos : [];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Objetos Perdidos</h2>
        <Button variant="guardar" onClick={onAddNew}>
          + Nuevo Objeto
        </Button>
      </div>
      
      {objetosArray.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay objetos perdidos registrados
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-800">
                {columns.map((col, index) => (
                  <th key={index} className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {objetosArray.map((objeto) => (
                <tr key={objeto.id} className="hover:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {col.render ? col.render(objeto) : objeto[col.key]}
                    </td>
                  ))}
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1 flex-wrap gap-1">
                      <Button 
                        variant="editar" 
                        onClick={() => onEdit(objeto)}
                        className="text-xs px-2 py-1 min-w-fit"
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="cancelar" 
                        onClick={() => onDelete(objeto.id)}
                        className="text-xs px-2 py-1 min-w-fit"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ObjetoPerdidoList;
