import React from 'react';
import { estadoDeRoles } from './rolesPredeterminados.js';

export default function RolList({ roles, onEnable, enabling }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Roles y accesos</h2>
      <p className="mb-4 text-sm text-gray-600">Estos roles tienen accesos definidos por el sistema y no se pueden editar aquí. Asigna un rol desde la gestión de usuarios o al vincular una cuenta.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-800 text-white"><tr><th className="p-3">Rol</th><th className="p-3">Función</th><th className="p-3">Estado</th><th className="p-3">Acción</th></tr></thead>
          <tbody>
            {estadoDeRoles(roles).map(role => (
              <tr key={role.key} className="border-b align-top">
                <td className="p-3 font-medium">{role.name}</td>
                <td className="p-3">{role.description}</td>
                <td className="p-3">{role.status === 'ready' ? 'Disponible' : role.status === 'missing' ? 'No configurado' : 'Grupos duplicados: requiere revisión'}</td>
                <td className="p-3">
                  {role.status === 'missing' && <button type="button" disabled={Boolean(enabling)} onClick={() => onEnable(role)} className="rounded-full bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50">{enabling === role.key ? 'Habilitando…' : 'Habilitar rol'}</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-gray-600">Un rol no configurado no puede asignarse hasta habilitarlo. Habilitarlo no crea cuentas ni cambia permisos de grupos existentes.</p>
    </div>
  );
}
