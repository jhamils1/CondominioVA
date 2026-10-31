import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const UserList = ({ users, onEdit, onDeactivate, onAddNew, currentUserId }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de usuarios según búsqueda
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user && 
        user.username && 
        (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.role || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, users]);

  const columns = ["username", "email", "role", "estado"];
  const tableData = filteredUsers.map((user) => ({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'Sin rol único',
    estado: user.is_active ? 'Activa' : 'Inactiva',
    is_active: user.is_active,
    id: user?.id || '',
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de usuarios
      </h2>

      {/* Botón Nuevo Usuario y Buscador */}
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="guardar"
          onClick={onAddNew}
        >
          nuevo usuario
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <CustomTable
        title="Usuarios"
        columns={columns}
        data={tableData}
        onEdit={(user) => onEdit(user)}
        customActions={(row) => row.is_active && row.id !== currentUserId && <Button variant="cancelar" onClick={() => onDeactivate(row.id)}>Desactivar</Button>}
      />
    </div>
  );
};

export default UserList;
