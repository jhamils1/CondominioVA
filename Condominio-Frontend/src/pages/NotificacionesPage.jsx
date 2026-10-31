import React, { useEffect, useState } from 'react';
import { listarNotificaciones, leerNotificacion, obtenerEvento, revisarEvento, atenderEvento, listarEventos, redistribuirEvento } from '../api/notificacionesApi.js';
import { useSession } from '../auth/sessionContext.js';

export default function NotificacionesPage() {
  const [items, setItems] = useState([]);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [motivo, setMotivo] = useState('');
  const [sinGuardias, setSinGuardias] = useState([]);
  const { user } = useSession();
  useEffect(() => {
    let active = true;
    Promise.all([listarNotificaciones(), user.role === 'administrador' ? listarEventos() : Promise.resolve([])]).then(([data, events]) => { if (active) { setItems(data.results || data); setSinGuardias((events.results || events).filter(item => item.sin_guardias && item.estado === 'PENDIENTE_REVISION')); } })
      .catch(err => { if (active) setError(err.response?.status === 503 ? 'Las notificaciones de seguridad aún no están habilitadas.' : 'No se pudieron consultar las notificaciones.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user.role]);
  async function open(item) {
    setError('');
    try {
      const data = await obtenerEvento(item.evento);
      const read = await leerNotificacion(item.id);
      setItems(current => current.map(entry => entry.id === read.id ? read : entry));
      setMotivo('');
      setEvent(data);
    } catch { setError('No se pudo abrir la notificación.'); }
  }
  async function review(action) {
    if (action === 'descartar' && !motivo.trim()) { setError('Indica el motivo del descarte.'); return; }
    setError('');
    try { setEvent(await revisarEvento(event.id, action, motivo)); }
    catch (err) { setError(err.response?.data?.detail || 'No se pudo revisar el evento; quizá ya fue revisado.'); }
  }
  async function attend(action) {
    if (action === 'resolver' && !motivo.trim()) { setError('Indica una observación para resolver la incidencia.'); return; }
    setError('');
    try { setEvent(await atenderEvento(event.id, action, motivo)); setMotivo(''); }
    catch { setError('No se pudo actualizar la incidencia; comprueba su estado.'); }
  }
  async function retry(item) {
    setError('');
    try {
      const result = await redistribuirEvento(item.id);
      if (result.guardias_activos) setSinGuardias(current => current.filter(entry => entry.id !== item.id));
      else setError('Todavía no hay guardias activos para recibir la alerta.');
    } catch { setError('No se pudo redistribuir la alerta.'); }
  }
  return <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-2xl font-semibold mb-4">Notificaciones de seguridad</h2>
    {error && <p role="alert" className="text-red-700 mb-4">{error}</p>}
    {sinGuardias.map(item => <div key={item.id} className="border border-amber-300 p-3 mb-3"><p>Evento pendiente sin guardias activos: {item.categoria}</p><button className="text-indigo-700" onClick={() => retry(item)}>Reintentar distribución</button></div>)}
    {loading ? <p>Cargando…</p> : !error && items.length === 0 ? <p>No hay notificaciones.</p> : items.map(item => <div key={item.id} className="border-t py-3">
      <p>{item.mensaje} {item.leida_en ? '· Leída' : '· Sin leer'}</p><p className="text-sm text-gray-500">{new Date(item.creada).toLocaleString()}</p>
      <button className="text-indigo-700" onClick={() => open(item)}>Ver evento</button></div>)}
    {event && <section className="mt-5 border rounded p-4"><h3 className="font-semibold">Detalle del evento</h3>
      <p>{event.categoria} · {event.estado}</p><p>{event.descripcion}</p><p>{event.camara || 'Sin cámara'} · {event.ubicacion || 'Sin ubicación'}</p>
      <p>{new Date(event.fecha_evento).toLocaleString()}</p>
      {user.role === 'guardia' && event.estado === 'PENDIENTE_REVISION' && <div className="mt-3 space-y-2">
        <button className="bg-indigo-600 text-white rounded px-3 py-2" onClick={() => review('confirmar')}>Confirmar incidencia</button>
        <label className="block">Motivo del descarte <input className="border rounded p-1" value={motivo} onChange={e => setMotivo(e.target.value)} /></label>
        <button className="text-red-700" onClick={() => review('descartar')}>Descartar como falso positivo</button>
      </div>}
      {user.role === 'guardia' && ['CONFIRMADA', 'EN_ATENCION'].includes(event.estado) && <div className="mt-3 space-y-2">
        <label className="block">Observación <input className="border rounded p-1" value={motivo} onChange={e => setMotivo(e.target.value)} /></label>
        <button className="text-indigo-700" onClick={() => attend(event.estado === 'CONFIRMADA' ? 'atender' : 'resolver')}>{event.estado === 'CONFIRMADA' ? 'Marcar en atención' : 'Marcar resuelta'}</button>
      </div>}
      <button className="text-indigo-700 mt-3" onClick={() => setEvent(null)}>Cerrar</button></section>}
  </div>;
}
