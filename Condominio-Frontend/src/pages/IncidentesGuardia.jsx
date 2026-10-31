import React, { useEffect, useState } from 'react';
import axios from '../api/client.js';
const client = axios.create({ baseURL: import.meta.env.VITE_API_URL });
client.interceptors.request.use(config => { config.headers.Authorization = `Bearer ${localStorage.getItem('access')}`; return config; });
export default function IncidentesGuardia() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ descripcion: '', fecha_incidente: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  async function load() {
    try { const { data } = await client.get('incidentes/'); setItems(data.results || data); }
    catch (err) { setError(err.response?.status === 403 ? 'No tienes permiso para consultar incidencias.' : 'No se pudieron cargar las incidencias.'); }
  }
  useEffect(() => { load(); }, []);
  async function save(event) {
    event.preventDefault(); setError('');
    try {
      if (editing) await client.patch(`incidentes/${editing}/`, form);
      else await client.post('incidentes/', form);
      setForm({ descripcion: '', fecha_incidente: '' }); setEditing(null); await load();
    } catch (err) { setError(err.response?.status === 403 ? 'No tienes permiso para modificar esta incidencia.' : 'No se pudo guardar la incidencia.'); }
  }
  return <div className="bg-white rounded-lg shadow-md p-6"><h2 className="text-2xl font-semibold mb-4">Incidencias</h2>
    {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
    <form onSubmit={save} className="space-y-3 mb-6"><label className="block">Descripción<textarea required value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="block w-full border rounded p-2" /></label>
      <label className="block">Fecha y hora<input type="datetime-local" required value={form.fecha_incidente} onChange={e => setForm({ ...form, fecha_incidente: e.target.value })} className="block border rounded p-2" /></label>
      <button className="bg-indigo-600 text-white rounded px-4 py-2">{editing ? 'Guardar cambios' : 'Registrar incidencia'}</button>
      {editing && <button type="button" className="ml-4" onClick={() => { setEditing(null); setForm({ descripcion: '', fecha_incidente: '' }); }}>Cancelar</button>}
    </form>
    {items.map(item => <div key={item.id} className="border-t py-3"><p>{item.descripcion}</p><p className="text-sm text-gray-500">{new Date(item.fecha_incidente).toLocaleString()}</p><button className="text-indigo-700" onClick={() => { const date = new Date(item.fecha_incidente); const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16); setEditing(item.id); setForm({ descripcion: item.descripcion, fecha_incidente: local }); }}>Editar</button></div>)}
  </div>;
}
