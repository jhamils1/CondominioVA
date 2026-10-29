// src/pages/objetosPerdidos/ObjetoPerdidoPage.jsx
import React, { useState, useEffect } from 'react';
import ObjetoPerdidoList from './ObjetoPerdidoList.jsx';
import ObjetoPerdidoForm from './ObjetoPerdidoForm.jsx';
import { 
  fetchAllObjetosPerdidos, 
  createObjetoPerdido, 
  updateObjetoPerdido, 
  deleteObjetoPerdido 
} from '../../api/objetoPerdidoApi.jsx';

const ObjetoPerdidoPage = () => {
  const [objetosPerdidos, setObjetosPerdidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingObjeto, setEditingObjeto] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadObjetosPerdidos = async () => {
    setLoading(true);
    try {
      const data = await fetchAllObjetosPerdidos();
      console.log('Datos recibidos del API:', data);
      const objetosArray = Array.isArray(data) ? data : (data.results || []);
      console.log('Objetos array:', objetosArray);
      setObjetosPerdidos(objetosArray);
    } catch (error) {
      console.error('Error completo:', error);
      alert('Error al cargar los objetos perdidos: ' + error.message);
      setObjetosPerdidos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObjetosPerdidos();
  }, []);

  const handleEdit = (objeto) => {
    console.log('Objeto seleccionado para editar:', objeto);
    setEditingObjeto(objeto);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este objeto perdido?")) return;
    try {
      await deleteObjetoPerdido(id);
      alert('Objeto perdido eliminado correctamente');
      loadObjetosPerdidos();
    } catch (error) {
      console.error(error.message);
      alert('Error al eliminar el objeto perdido');
    }
  };

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = { ...formData };
      
      // Si la foto es una URL (string), no incluirla en el payload a menos que sea nueva
      if (typeof payload.foto === 'string' && editingObjeto) {
        // No enviar foto si es la misma URL
        if (payload.foto === editingObjeto.foto) {
          delete payload.foto;
        }
      }

      if (editingObjeto) {
        console.log('Actualizando objeto perdido:', editingObjeto.id, payload);
        const result = await updateObjetoPerdido(editingObjeto.id, payload);
        console.log('Resultado de actualización:', result);
        alert('Objeto perdido actualizado correctamente');
      } else {
        console.log('Creando nuevo objeto perdido:', payload);
        const result = await createObjetoPerdido(payload);
        console.log('Resultado de creación:', result);
        alert('Objeto perdido registrado correctamente');
      }
      
      setShowForm(false);
      setEditingObjeto(null);
      await loadObjetosPerdidos();
    } catch (error) {
      console.error('Error completo:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      {/* Lista de objetos perdidos */}
      <ObjetoPerdidoList
        objetosPerdidos={objetosPerdidos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ObjetoPerdidoForm
              onSubmit={handleFormSubmit}
              onCancel={() => { 
                setShowForm(false); 
                setEditingObjeto(null); 
              }}
              initialData={editingObjeto}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ObjetoPerdidoPage;
