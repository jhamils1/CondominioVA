import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";
import SearchBar from "../../components/SearchBar.jsx";

const MascotaList = ({ mascotas, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de mascotas según búsqueda
  const filteredMascotas = useMemo(() => {
    if (!mascotas || !Array.isArray(mascotas)) return [];
    if (!searchTerm) return mascotas;
    return mascotas.filter(
      (mascota) =>
        mascota && 
        (mascota.nombre && mascota.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mascota.especie && mascota.especie.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mascota.raza && mascota.raza.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (mascota.persona_nombre && mascota.persona_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, mascotas]);

  const columns = ["Nombre", "Especie", "Raza", "Propietario", "Fecha Registro"];
  const tableData = filteredMascotas.map((mascota) => ({
    "Nombre": mascota?.nombre || '',
    "Especie": mascota?.especie === 'PERRO' ? 'Perro' : 
              mascota?.especie === 'GATO' ? 'Gato' : 
              mascota?.especie === 'AVE' ? 'Ave' : 
              mascota?.especie === 'ROEDOR' ? 'Roedor' : 
              mascota?.especie === 'REPTIL' ? 'Reptil' : 
              mascota?.especie === 'OTRO' ? 'Otro' : mascota?.especie || '',
    "Raza": mascota?.raza || 'Sin raza',
    "Propietario": mascota?.persona_nombre || '',
    "Fecha Registro": mascota?.fecha_registro ? 
                     new Date(mascota.fecha_registro).toLocaleDateString() : '',
    id: mascota?.id || '',
  }));

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-full">
      <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-800">
        Gestión de Mascotas
      </h2>

      {/* Botón Nueva Mascota y Buscador */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <Button
          variant="guardar"
          onClick={onAddNew}
          className="w-full sm:w-auto"
        >
          Nueva Mascota
        </Button>
        <div className="w-full sm:w-64">
          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <CustomTable
          title="Mascotas"
          columns={columns}
          data={tableData}
          onEdit={(rowData) => {
            // Buscar la mascota original en la lista filtrada
            const mascotaOriginal = filteredMascotas.find(mas => mas.id === rowData.id);
            console.log('Mascota original encontrada:', mascotaOriginal);
            onEdit(mascotaOriginal);
          }}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default MascotaList;
