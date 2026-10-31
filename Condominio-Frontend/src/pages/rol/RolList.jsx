// src/pages/rol/RolList.jsx
import React from 'react';
import CustomTable from '../../components/table.jsx';
import Button from '../../components/button.jsx';
import { roleKey } from '../../auth/access.js';

const RolList = ({ roles, onEdit, onAddNew, currentRole }) => {
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
      <p className="mb-4 text-sm text-gray-600">Los permisos de Django se administran aquí; los accesos de la aplicación se definen en el backend. No puedes modificar tu propio rol.</p>
      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nuevo Rol
        </Button>
      </div>
      <CustomTable
        columns={columns}
        data={tableData}
        onEdit={onEdit}
        canEdit={(row) => roleKey(row.name) !== currentRole}
      />
    </div>
  );
};

export default RolList;
