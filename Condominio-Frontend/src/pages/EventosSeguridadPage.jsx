import React, { useCallback, useEffect, useRef, useState } from 'react';
import { crearEvento, listarEventos, listarHistorialEvento, revisarEvento, atenderEvento } from '../api/notificacionesApi.js';
import { useSession } from '../auth/sessionContext.js';
import CamaraDemostracion from './CamaraDemostracion.jsx';
import CamaraImou from './CamaraImou.jsx';
import CamaraCatalogo from './CamaraCatalogo.jsx';
import { camarasMonitor } from '../api/visionDemoApi.js';
import VideoArchivoDemostracion from './VideoArchivoDemostracion.jsx';
import EvidenciaEvento from '../components/EvidenciaEvento.jsx';
import EvidenciaMiniatura from '../components/EvidenciaMiniatura.jsx';
import LecturaPlacaEvidencia from '../components/LecturaPlacaEvidencia.jsx';
import { FaCamera, FaChevronLeft, FaClipboardList, FaCog, FaPlusCircle, FaShieldAlt, FaVideo } from 'react-icons/fa';
import './EventosSeguridadPage.css';

const etiquetasEstado = { PENDIENTE_REVISION: 'Pendiente', CONFIRMADA: 'Confirmada',
  FALSO_POSITIVO: 'Descartada', EN_ATENCION: 'En atención', RESUELTA: 'Resuelta' };

export default function EventosSeguridadPage({ modo = 'monitor' }) {
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
  const [configuracion, setConfiguracion] = useState(false);
  const [fuente, setFuente] = useState('imou');
  const [camaras, setCamaras] = useState([]);
  const [errorCamaras, setErrorCamaras] = useState('');
  useEffect(() => {
    if (modo !== 'monitor') return undefined;
    const controller = new AbortController();
    camarasMonitor(controller.signal).then(datos => setCamaras(datos.filter(c => !c.es_imou_vinculada)))
      .catch(() => { if (!controller.signal.aborted) setErrorCamaras('No se pudieron consultar las cámaras registradas.'); });
    return () => controller.abort();
  }, [modo]);
  const [pestana, setPestana] = useState('eventos');
  const [vistaIncidencias, setVistaIncidencias] = useState('activas');
  const pendingEvent = useRef(null);
  const manualForm = useRef(null);
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
  function prepararEventoVideo(hallazgo) {
    setConfiguracion(false);
    setPestana('manual');
    if (creating || category.trim() || description.trim() || pendingEvent.current) {
      setError('El formulario ya contiene datos o un envío pendiente. Complétalo o límpialo antes de preparar otro evento.');
      requestAnimationFrame(() => manualForm.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    const momento = `${Math.floor(hallazgo.tiempo / 60)}:${String(Math.floor(hallazgo.tiempo % 60)).padStart(2, '0')}`;
    setCategory('Posible estacionamiento en zona prohibida');
    setDescription(`Resultado orientativo de análisis de video seleccionado: ${hallazgo.clase}, aproximadamente ${Math.floor(hallazgo.duracion)} segundos detenido en la zona marcada, en el minuto ${momento} del video. La fecha de grabación y la ubicación no están verificadas. Requiere revisión. No se adjunta el video.`);
    setError('');
    setNotice('Datos preparados. Revisa el formulario: todavía no se ha registrado el evento ni se han enviado avisos.');
    requestAnimationFrame(() => manualForm.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }
  const registrarEventoVideo = useCallback(async (datos, configuracion) => {
    const creado = await crearEvento(datos, configuracion);
    setItems(actual => [creado, ...actual.filter(item => item.id !== creado.id)]);
    return creado;
  }, []);
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
      if (modo !== 'monitor' && ['confirmar', 'descartar'].includes(action)) {
        setVistaIncidencias(action === 'confirmar' ? 'historial' : 'descartadas');
        setNotice(action === 'confirmar'
          ? 'Incidencia confirmada y trasladada al historial. Puedes verificar la placa y solicitar el aviso al residente desde este detalle.'
          : 'Evento descartado y conservado en la sección de descartados.');
      }
      const [events, entries] = await Promise.all([load(), listarHistorialEvento(updated.id)]);
      setHistory(entries);
      if (!events.some(item => item.id === updated.id)) setSelected(null);
    } catch { setError('No se pudo completar la acción. Actualiza la lista para comprobar el estado.'); }
    finally { setBusy(false); }
  }
  const eventosVisibles = modo === 'monitor' ? items : items.filter(item => {
    if (vistaIncidencias === 'historial') return ['CONFIRMADA', 'EN_ATENCION', 'RESUELTA'].includes(item.estado);
    if (vistaIncidencias === 'descartadas') return item.estado === 'FALSO_POSITIVO';
    return item.estado === 'PENDIENTE_REVISION';
  });
  return <div className="seguridad-dashboard">
    <div className="seguridad-heading"><div className="seguridad-heading-icon"><FaVideo /></div><div><p>CENTRO DE SEGURIDAD</p><h2>{modo === 'monitor' ? 'Monitor en vivo' : 'Eventos e incidencias de seguridad'}</h2></div><span className="seguridad-heading-mark"><FaShieldAlt /></span></div>
    {modo === 'monitor' && <>
    <div className="seguridad-topline">
      <div><span className="seguridad-eyebrow">{configuracion ? 'AJUSTES DE MONITOREO' : 'MONITOREO EN VIVO'}</span><h3>{configuracion ? 'Configuración de análisis' : 'Cámaras de seguridad'}</h3></div>
      {configuracion && <button type="button" className="seguridad-back" onClick={() => setConfiguracion(false)}><FaChevronLeft /> Volver al monitoreo</button>}
    </div>
    <div className="seguridad-source-tabs" aria-label="Seleccionar cámara">
      <button type="button" aria-pressed={fuente === 'imou'} onClick={() => setFuente('imou')}><FaVideo /> Cámara Imou</button>
      <button type="button" aria-pressed={fuente === 'laptop'} onClick={() => setFuente('laptop')}><FaCamera /> Cámara de laptop</button>
      {camaras.map(c => <button type="button" key={c.id} aria-pressed={fuente === `camara-${c.id}`}
        onClick={() => { setConfiguracion(false); setFuente(`camara-${c.id}`); }}><FaVideo /> {c.nombre}</button>)}
    </div>
    {errorCamaras && <p role="alert">{errorCamaras}</p>}
    <p className="seguridad-source-note">Al cambiar de vista, las cámaras iniciadas siguen funcionando hasta que las detengas.</p>
    <div hidden={fuente !== 'imou'}><CamaraImou onRegistrarEvento={registrarEventoVideo} configuracion={configuracion} onAbrirConfiguracion={() => setConfiguracion(actual => !actual)} /></div>
    <div hidden={fuente !== 'laptop'} className="seguridad-webcam">
      <CamaraDemostracion onRegistrarEvento={registrarEventoVideo} configuracion={configuracion} />
      <button type="button" className="seguridad-configuration-button" onClick={() => setConfiguracion(actual => !actual)}><FaCog /> {configuracion ? 'Volver al monitoreo' : 'Configuración de análisis'}</button>
    </div>
    {camaras.filter(c => fuente === `camara-${c.id}`).map(c => <CamaraCatalogo key={c.id} camara={c}
      configuracion={configuracion} onConfigurar={() => setConfiguracion(actual => !actual)} />)}
    <div hidden={!configuracion} className="seguridad-archivo">
      <div className="seguridad-section-title"><div><span className="seguridad-eyebrow">HERRAMIENTAS</span><h3>Análisis de videos</h3></div></div>
      <VideoArchivoDemostracion onPrepararEvento={prepararEventoVideo} onRegistrarEvento={registrarEventoVideo} />
    </div>
    </>}
    {error && <p role="alert" className="seguridad-feedback is-error">{error}</p>}
    {notice && <p role="status" className="seguridad-feedback is-success">{notice}</p>}
    <div hidden={configuracion} className="seguridad-eventos">
      <div className="seguridad-eventos-tabs" role="tablist" aria-label="Eventos de seguridad">
        <button type="button" role="tab" aria-selected={pestana === 'eventos'} onClick={() => setPestana('eventos')}><FaClipboardList /> Eventos registrados</button>
        <button type="button" role="tab" aria-selected={pestana === 'manual'} onClick={() => setPestana('manual')}><FaPlusCircle /> Registrar evento manual</button>
      </div>
      <form ref={manualForm} onSubmit={create} hidden={pestana !== 'manual'} className="seguridad-manual">
        <h3>Registrar evento manual</h3>
        <p>Al enviar se registra un evento pendiente de revisión y se generan avisos para los guardias activos. No se adjunta video.</p>
        <label>Categoría <input required maxLength={80} disabled={creating} value={category} onChange={e => { setCategory(e.target.value); pendingEvent.current = null; }} /></label>
        <label>Descripción <textarea required disabled={creating} value={description} onChange={e => { setDescription(e.target.value); pendingEvent.current = null; }} /></label>
        <button disabled={creating} className="seguridad-primary">{creating ? 'Registrando…' : 'Enviar a revisión'}</button>
      </form>
      <div hidden={pestana !== 'eventos'}>
        {modo !== 'monitor' && <div className="seguridad-incidencias-filtros" aria-label="Vista de incidencias">
          <button type="button" aria-pressed={vistaIncidencias === 'activas'} onClick={() => { setVistaIncidencias('activas'); setSelected(null); }}>Pendientes de revisión</button>
          <button type="button" aria-pressed={vistaIncidencias === 'historial'} onClick={() => { setVistaIncidencias('historial'); setSelected(null); }}>Historial de incidencias</button>
          <button type="button" aria-pressed={vistaIncidencias === 'descartadas'} onClick={() => { setVistaIncidencias('descartadas'); setSelected(null); }}>Eventos descartados</button>
          <button type="button" className="seguridad-secondary" onClick={() => { setError(''); load().catch(() => setError('No se pudieron actualizar las incidencias.')); }}>Actualizar</button>
        </div>}
        {modo !== 'monitor' && <p className="seguridad-muted">{vistaIncidencias === 'historial' ? 'Incluye incidencias confirmadas, en atención o resueltas. Confirmar no significa resolver.' : vistaIncidencias === 'descartadas' ? 'Eventos revisados que se descartaron como falsos positivos.' : 'Eventos que esperan la revisión del guardia.'}</p>}
        {loading ? <p className="seguridad-empty">Cargando eventos…</p> : eventosVisibles.length === 0 ? <div className="seguridad-empty"><FaClipboardList /><p>{modo === 'monitor' ? 'No hay eventos disponibles.' : vistaIncidencias === 'historial' ? 'No hay incidencias confirmadas.' : vistaIncidencias === 'descartadas' ? 'No hay eventos descartados.' : 'No hay incidencias pendientes de revisión.'}</p></div> : <ul className="seguridad-event-list">{eventosVisibles.map(item => <li key={item.id}>
          <button type="button" className="seguridad-event-row" onClick={() => select(item)}>
            <EvidenciaMiniatura evento={item} />
            <span className="seguridad-event-info"><strong>{item.categoria}</strong><span>{item.origen} · {item.camara || 'Sin cámara'}</span><time>{new Date(item.fecha_evento).toLocaleString()}</time></span>
            <span className={`seguridad-status estado-${item.estado}`}>{etiquetasEstado[item.estado] || item.estado}</span>
          </button>
        </li>)}</ul>}
        {selected && <section className="seguridad-detail"><div className="seguridad-detail-heading"><div><span className="seguridad-eyebrow">REVISIÓN</span><h3>Detalle del evento</h3></div><button type="button" className="seguridad-close" onClick={() => setSelected(null)}>Cerrar</button></div>
          <p>{selected.descripcion}</p><p className="seguridad-muted">{selected.camara || 'Sin cámara'} · {selected.ubicacion || 'Sin ubicación'}</p>
          <p className="seguridad-muted">Estado: {selected.estado} · Origen: {selected.origen}</p>
          <EvidenciaEvento key={selected.id} evento={selected} />
          {user.role === 'guardia' && <LecturaPlacaEvidencia key={selected.id} evento={selected} onRegistrada={async () => setHistory(await listarHistorialEvento(selected.id))} />}
          {user.role === 'guardia' && ['PENDIENTE_REVISION', 'CONFIRMADA', 'EN_ATENCION'].includes(selected.estado) && <div className="seguridad-review">
            <label>Motivo u observación <textarea value={observation} onChange={e => setObservation(e.target.value)} /></label>
            {selected.estado === 'PENDIENTE_REVISION' && <><button disabled={busy} className="seguridad-primary" onClick={() => execute('confirmar')}>Confirmar</button><button disabled={busy} className="seguridad-danger" onClick={() => execute('descartar')}>Descartar</button></>}
            {selected.estado === 'CONFIRMADA' && <button disabled={busy} className="seguridad-primary" onClick={() => execute('atender')}>Iniciar atención</button>}
            {selected.estado === 'EN_ATENCION' && <><button disabled={busy} className="seguridad-primary" onClick={() => execute('actuaciones')}>Registrar actuación</button><button disabled={busy} className="seguridad-secondary" onClick={() => execute('resolver')}>Resolver</button></>}
          </div>}
          <h4 className="seguridad-history-title">Historial</h4>{history.length ? <ul>{history.map((entry, index) => <li key={`${entry.fecha}-${index}`} className="seguridad-history-row">{new Date(entry.fecha).toLocaleString()} · {entry.accion} · Usuario {entry.actor_id ?? 'sistema'} {entry.observacion && <p className="whitespace-pre-wrap">{entry.observacion}</p>}</li>)}</ul> : <p className="seguridad-muted">No hay movimientos registrados.</p>}
        </section>}
      </div>
    </div>
  </div>;
}
