import React, { useCallback, useEffect, useRef, useState } from 'react';
import { crearEvento, listarEventos, listarHistorialEvento, revisarEvento, atenderEvento } from '../api/notificacionesApi.js';
import { useSession } from '../auth/sessionContext.js';

export default function EventosSeguridadPage() {
  const { user } = useSession();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState('');
  const pendingEvent = useRef(null);
  const load = useCallback(async () => {
    const data = await listarEventos();
    setItems(data.results || data);
    return data.results || data;
  }, []);
  useEffect(() => {
    let active = true;
    listarEventos().then(data => { if (active) setItems(data.results || data); })
      .catch(err => { if (active) setError(err.response?.status === 503 ? 'El módulo de seguridad aún no está habilitado.' : 'No se pudieron cargar los eventos.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function select(item) {
    setError(''); setSelected(item); setObservation(''); setHistory([]);
    try { setHistory(await listarHistorialEvento(item.id)); }
    catch { setError('No se pudo cargar el historial.'); }
  }
  async function create(event) {
    event.preventDefault();
    if (creating) return;
    const categoria = category.trim();
    const descripcion = description.trim();
    if (!categoria || !descripcion) { setError('Indica la categoría y la descripción del evento.'); return; }
    setCreating(true); setError(''); setNotice('');
    try {
      if (!pendingEvent.current) pendingEvent.current = {
        id: crypto.randomUUID(), categoria, descripcion, fecha_evento: new Date().toISOString(),
      };
      const created = await crearEvento(pendingEvent.current);
      pendingEvent.current = null;
      setItems(current => [created, ...current.filter(item => item.id !== created.id)]);
      setCategory(''); setDescription('');
      setNotice(created.sin_guardias ? 'Evento registrado; no hay guardias activos para recibir la alerta.' : 'Evento registrado y enviado para revisión de los guardias activos.');
    } catch {
      setError('No se pudo confirmar el registro. Puedes reintentar sin cambiar los datos.');
    } finally { setCreating(false); }
  }
  async function execute(action) {
    if (['descartar', 'resolver', 'actuaciones'].includes(action) && !observation.trim()) {
      setError('Escribe el motivo o la observación requerida.'); return;
    }
    setBusy(true); setError('');
    try {
      const updated = ['confirmar', 'descartar'].includes(action)
        ? await revisarEvento(selected.id, action, observation)
        : await atenderEvento(selected.id, action, observation);
      setSelected(updated); setObservation('');
      const [events, entries] = await Promise.all([load(), listarHistorialEvento(updated.id)]);
      setHistory(entries);
      if (!events.some(item => item.id === updated.id)) setSelected(null);
    } catch { setError('No se pudo completar la acción. Actualiza la lista para comprobar el estado.'); }
    finally { setBusy(false); }
  }
  return <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-2xl font-semibold mb-4">Eventos e incidencias de seguridad</h2>
    {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
    {notice && <p role="status" className="text-green-700 mb-4">{notice}</p>}
    <form onSubmit={create} className="border rounded p-4 mb-5 space-y-3">
      <h3 className="font-semibold">Registrar evento manual</h3>
      <label className="block">Categoría <input required maxLength={80} disabled={creating} value={category} onChange={e => { setCategory(e.target.value); pendingEvent.current = null; }} className="block w-full border rounded p-2" /></label>
      <label className="block">Descripción <textarea required disabled={creating} value={description} onChange={e => { setDescription(e.target.value); pendingEvent.current = null; }} className="block w-full border rounded p-2" /></label>
      <button disabled={creating} className="bg-indigo-600 text-white rounded px-3 py-2 disabled:opacity-50">{creating ? 'Registrando…' : 'Enviar a revisión'}</button>
    </form>
    {loading ? <p>Cargando…</p> : items.length === 0 ? <p>No hay eventos disponibles.</p> : <ul>{items.map(item => <li key={item.id} className="border-t py-3"><button className="text-indigo-700 text-left" onClick={() => select(item)}>{item.categoria} · {item.estado} · {item.origen} · {new Date(item.fecha_evento).toLocaleString()}</button></li>)}</ul>}
    {selected && <section className="mt-5 border rounded p-4"><h3 className="font-semibold">Detalle</h3>
      <p>{selected.descripcion}</p><p>{selected.camara || 'Sin cámara'} · {selected.ubicacion || 'Sin ubicación'}</p>
      <p>Estado: {selected.estado} · Origen: {selected.origen}</p>
      {user.role === 'guardia' && ['PENDIENTE_REVISION', 'CONFIRMADA', 'EN_ATENCION'].includes(selected.estado) && <div className="mt-3 space-y-2">
        <label className="block">Motivo u observación <textarea className="block w-full border rounded p-2" value={observation} onChange={e => setObservation(e.target.value)} /></label>
        {selected.estado === 'PENDIENTE_REVISION' && <><button disabled={busy} className="mr-4 text-indigo-700" onClick={() => execute('confirmar')}>Confirmar</button><button disabled={busy} className="text-red-700" onClick={() => execute('descartar')}>Descartar</button></>}
        {selected.estado === 'CONFIRMADA' && <button disabled={busy} className="text-indigo-700" onClick={() => execute('atender')}>Iniciar atención</button>}
        {selected.estado === 'EN_ATENCION' && <><button disabled={busy} className="mr-4 text-indigo-700" onClick={() => execute('actuaciones')}>Registrar actuación</button><button disabled={busy} className="text-indigo-700" onClick={() => execute('resolver')}>Resolver</button></>}
      </div>}
      <h4 className="font-semibold mt-4">Historial</h4>{history.length ? <ul>{history.map((entry, index) => <li key={`${entry.fecha}-${index}`} className="border-t py-2 text-sm">{new Date(entry.fecha).toLocaleString()} · {entry.accion} · Usuario {entry.actor_id ?? 'sistema'} {entry.observacion && <p className="whitespace-pre-wrap">{entry.observacion}</p>}</li>)}</ul> : <p>No hay movimientos registrados.</p>}
      <button className="text-indigo-700 mt-3" onClick={() => setSelected(null)}>Cerrar</button>
    </section>}
  </div>;
}
