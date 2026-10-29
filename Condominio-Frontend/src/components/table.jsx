// src/components/CustomTable.jsx
import React from "react";
import Button from "./button"; // tu componente de botones

const CustomTable = ({ title = "Lista", columns = [], data = [], onEdit, onDelete, onAddPhoto, customActions }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-800">
            {columns.map((col, index) => (
              <th key={index} className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                {col}
              </th>
            ))}
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-xs truncate" title={row[col]}>
                    {row[col]}
                  </div>
                </td>
              ))}
              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-1 flex-wrap gap-1">
                  {/* Botones por defecto */}
                  <Button 
                    variant="editar" 
                    onClick={() => onEdit(row)}
                    className="text-xs px-2 py-1 min-w-fit"
                  >
                    Editar
                  </Button>
                  {onAddPhoto && (
                    <Button 
                      variant="guardar" 
                      onClick={() => onAddPhoto(row)}
                      className="text-xs px-2 py-1"
                      title="Agregar foto extra para reconocimiento facial"
                    >
                      📸 Foto
                    </Button>
                  )}
                  <Button 
                    variant="cancelar" 
                    onClick={() => onDelete(row.id)}
                    className="text-xs px-2 py-1 min-w-fit"
                  >
                    Eliminar
                  </Button>
                  
                  {/* Acciones personalizadas */}
                  {customActions && customActions(row)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomTable;