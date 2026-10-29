// src/pages/rol/RolList.jsx
import React from 'react';
import CustomTable from '../../components/table.jsx';
import Button from '../../components/button.jsx';

const RolList = ({ roles, onEdit, onDelete, onAddNew }) => {
  const columns = ['name'];
  const tableData = roles.map(rol => ({
    id: rol.id,
    name: rol.name,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de Roles
      </h2>
      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nuevo Rol
        </Button>
      </div>
      <CustomTable
        columns={columns}
        data={tableData}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default RolList;