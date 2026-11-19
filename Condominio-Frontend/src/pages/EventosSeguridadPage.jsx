import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { crearEvento, listarEventos, listarHistorialEvento, obtenerEvento, revisarEvento, atenderEvento, redistribuirEvento, retirarHistorialEvento } from '../api/notificacionesApi.js';
import { useSession } from '../auth/sessionContext.js';
import CamaraDemostracion from './CamaraDemostracion.jsx';
import CamaraImou from './CamaraImou.jsx';
import CamaraCatalogo from './CamaraCatalogo.jsx';
import ProcesadorVision from '../components/ProcesadorVision.jsx';
import { camarasMonitor, capacidadImouRemota } from '../api/visionDemoApi.js';
import VideoArchivoDemostracion from './VideoArchivoDemostracion.jsx';
import EvidenciaEvento from '../components/EvidenciaEvento.jsx';
import ClipEvento from '../components/ClipEvento.jsx';
import EvidenciaMiniatura from '../components/EvidenciaMiniatura.jsx';
import LecturaPlacaEvidencia from '../components/LecturaPlacaEvidencia.jsx';
import { FaCamera, FaClipboardList, FaCog, FaPlusCircle, FaShieldAlt, FaVideo } from 'react-icons/fa';
import './EventosSeguridadPage.css';

const etiquetasEstado = { PENDIENTE_REVISION: 'Pendiente', CONFIRMADA: 'Confirmada',
  FALSO_POSITIVO: 'Descartada', EN_ATENCION: 'En atención', RESUELTA: 'Resuelta' };

export default function EventosSeguridadPage({ modo = 'monitor' }) {
  const { user } = useSession();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const detalleEventoRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [gestoActualizacion, setGestoActualizacion] = useState('');
  const zonaActualizacion = useRef(null);
  const actualizacionEnCurso = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const configuracion = modo === 'monitor' && searchParams.get('configuracion') === 'analisis';
  const [fuente, setFuente] = useState('imou');
  const [camaraAmpliada, setCamaraAmpliada] = useState(null);
  const [selectorCamaras, setSelectorCamaras] = useState(false);
  const dialogoCamaras = useRef(null);
  const [camarasOcultas, setCamarasOcultas] = useState(() => new Set());
  const [borradorOcultas, setBorradorOcultas] = useState(() => new Set());
  const [camaras, setCamaras] = useState([]);
  const [camaraImou, setCamaraImou] = useState(null);
  const [cargandoCamaras, setCargandoCamaras] = useState(true);
  const [errorCamaras, setErrorCamaras] = useState('');
  const [camarasSoloLocal, setCamarasSoloLocal] = useState(false);
  const [imouRemota, setImouRemota] = useState(false);
  const camaraSolicitada = searchParams.get('camara');
  useEffect(() => {
    if (!selectorCamaras) return undefined;
    const anterior = document.activeElement;
    const primerControl = dialogoCamaras.current?.querySelector('input, button, a[href]');
    primerControl?.focus();
    return () => anterior?.focus();
  }, [selectorCamaras]);
  useEffect(() => {
    if (modo !== 'monitor') return undefined;
    const controller = new AbortController();
    camarasMonitor(controller.signal).then(datos => {
      setCamaraImou(datos.find(c => c.es_imou_vinculada) || null);
      setCamaras(datos.filter(c => !c.es_imou_vinculada));
    })
      .catch(async error => {
        if (controller.signal.aborted) return;
        if (error.response?.status === 403) {
          try {
            const capacidad = await capacidadImouRemota(controller.signal);
            if (!controller.signal.aborted && capacidad.activa === true) {
              setImouRemota(true);
              setErrorCamaras('La Imou usa la PC y consume datos del túnel. Solo una sesión puede controlar el análisis y el registro.');
              return;
            }
          } catch { /* Conservar el bloqueo si no se puede verificar la capacidad. */ }
          setCamarasSoloLocal(true);
          setErrorCamaras('Las cámaras de red del monitor requieren una conexión local; el análisis de videos sigue disponible.');
          setFuente('laptop');
        } else setErrorCamaras('No se pudieron consultar las cámaras registradas.');
      })
      .finally(() => { if (!controller.signal.aborted) setCargandoCamaras(false); });
    return () => controller.abort();
  }, [modo]);
  useEffect(() => {
    if (modo !== 'monitor' || !camaraSolicitada || !/^\d+$/.test(camaraSolicitada)) return;
    if (camaras.some(c => String(c.id) === camaraSolicitada)) {
      setFuente(`camara-${camaraSolicitada}`);
      if (!configuracion) setCamaraAmpliada(`camara-${camaraSolicitada}`);
    }
  }, [modo, camaraSolicitada, camaras, configuracion]);
  const verVarias = !configuracion;
  const seleccionada = fuente === 'imou' ? { nombre: camaraImou?.nombre || 'Cámara Imou', ubicacion: camaraImou?.ubicacion }
    : fuente === 'laptop' ? { nombre: 'Cámara de laptop' }
      : camaras.find(c => fuente === `camara-${c.id}`);
  function alternarAmpliacion(valor) {
    setCamaraAmpliada(actual => actual === valor ? null : valor);
  }
  function abrirSelectorCamaras() {
    setBorradorOcultas(new Set(camarasOcultas));
    setSelectorCamaras(true);
  }
  function alternarCamaraEnBorrador(id) {
    setBorradorOcultas(actual => {
      const siguiente = new Set(actual);
      if (siguiente.has(id)) siguiente.delete(id); else siguiente.add(id);
      return siguiente;
    });
  }
  function seleccionarFuente(valor) {
    setFuente(valor);
    if (camaraSolicitada) {
      const siguiente = new URLSearchParams(searchParams);
      siguiente.delete('camara');
      setSearchParams(siguiente, { replace: true });
    }
  }
  const [pestana, setPestana] = useState('eventos');
  const vistaSolicitada = searchParams.get('vista');
  const vistaIncidencias = vistaSolicitada === 'historial' ? 'historial' : 'activas';
  const setVistaIncidencias = vista => setSearchParams(actual => {
    const siguiente = new URLSearchParams(actual);
    if (vista === 'activas') siguiente.delete('vista'); else siguiente.set('vista', vista);
    siguiente.delete('evento');
    return siguiente;
  });
  useEffect(() => {
    if (modo === 'monitor') return;
    setSelected(actual => {
      if (!actual) return null;
      const permitidos = vistaIncidencias === 'historial' ? ['CONFIRMADA', 'EN_ATENCION', 'RESUELTA'] : ['PENDIENTE_REVISION'];
      return permitidos.includes(actual.estado) ? actual : null;
    });
  }, [modo, vistaIncidencias]);
  const pendingEvent = useRef(null);
  const eventoAbierto = useRef(null);
  const manualForm = useRef(null);
  const load = useCallback(async () => {
    const data = await listarEventos();
    setItems(data.results || data);
    return data.results || data;
  }, []);
  const actualizarLista = useCallback(async () => {
    if (actualizacionEnCurso.current) return;
    actualizacionEnCurso.current = true;
    setActualizando(true); setError('');
    try { await load(); }
    catch { setError('No se pudieron actualizar las incidencias.'); }
    finally { actualizacionEnCurso.current = false; setActualizando(false); }
  }, [load]);
  useEffect(() => {
    const zona = zonaActualizacion.current;
    if (!zona || selected || pestana !== 'eventos') return undefined;
    let inicio = null;
    const arriba = target => {
      for (let nodo = target; nodo && nodo !== document.body; nodo = nodo.parentElement) {
        const estilo = getComputedStyle(nodo);
        if (/(auto|scroll)/.test(estilo.overflowY) && nodo.scrollHeight > nodo.clientHeight && nodo.scrollTop > 0) return false;
      }
      return (document.scrollingElement?.scrollTop || 0) <= 0;
    };
    const comenzar = e => {
      if (actualizacionEnCurso.current || e.touches.length !== 1 || e.target.closest('input, textarea, select') || !arriba(e.target)) return;
      inicio = { x: e.touches[0].clientX, y: e.touches[0].clientY, distancia: 0 };
    };
    const mover = e => {
      if (!inicio || e.touches.length !== 1) return;
      const delta = e.touches[0].clientY - inicio.y;
      if (delta <= 0 || Math.abs(e.touches[0].clientX - inicio.x) > delta) return;
      if (delta > 10 && e.cancelable) e.preventDefault();
      inicio.distancia = delta;
      setGestoActualizacion(delta >= 70 ? 'Suelta para actualizar' : 'Desliza para actualizar');
    };
    const terminar = () => {
      const refrescar = inicio?.distancia >= 70;
      inicio = null; setGestoActualizacion('');
      if (refrescar) actualizarLista();
    };
    const cancelar = () => { inicio = null; setGestoActualizacion(''); };
    zona.addEventListener('touchstart', comenzar, { passive: true });
    zona.addEventListener('touchmove', mover, { passive: false });
    zona.addEventListener('touchend', terminar);
    zona.addEventListener('touchcancel', cancelar);
    return () => {
      zona.removeEventListener('touchstart', comenzar); zona.removeEventListener('touchmove', mover);
      zona.removeEventListener('touchend', terminar); zona.removeEventListener('touchcancel', cancelar);
    };
  }, [actualizarLista, selected, pestana]);
  useEffect(() => {
    let active = true;
    let consultando = false;
    async function actualizar() {
      if (consultando) return;
      consultando = true;
      try {
        const data = await listarEventos();
        if (active) { setItems(data.results || data); setError(''); }
      } catch (err) {
        if (active) {
          if ([401, 403].includes(err.response?.status)) { setItems([]); setSelected(null); }
          setError(err.response?.status === 401 ? 'Tu sesión venció. Cierra sesión y vuelve a ingresar.'
            : err.response?.status === 403 ? 'Tu cuenta no tiene permiso para consultar incidencias.'
            : err.response?.status === 503 ? 'El módulo de seguridad aún no está habilitado.'
            : !err.response ? 'No se pudo conectar con el servidor. Comprueba que Django esté iniciado.'
            : 'No se pudieron cargar las incidencias. Intenta actualizar la lista.');
        }
      } finally { consultando = false; if (active) setLoading(false); }
    }
    actualizar();
    const timer = modo !== 'monitor' && user.role === 'guardia' ? setInterval(() => {
      if (document.visibilityState === 'visible') actualizar();
    }, 30000) : null;
    return () => { active = false; if (timer) clearInterval(timer); };
  }, [modo, user.role]);
  useEffect(() => {
    const id = searchParams.get('evento');
    if (!id) { eventoAbierto.current = null; return; }
    if (eventoAbierto.current === id || !items.length) return;
    const item = items.find(actual => actual.id === id);
    if (!item) return;
    if (item.estado === 'FALSO_POSITIVO') {
      eventoAbierto.current = id;
      setSelected(null);
      setNotice('Este evento ya fue descartado.');
      return;
    }
    const vista = item.estado === 'PENDIENTE_REVISION' ? 'activas' : 'historial';
    if (vista !== vistaIncidencias) {
      setSearchParams(vista === 'activas' ? { evento: id } : { vista, evento: id }, { replace: true });
      return;
    }
    eventoAbierto.current = id;
    setSelected(item); setObservation(''); setHistory([]);
    let active = true;
    listarHistorialEvento(id).then(entries => { if (active) setHistory(entries); })
      .catch(() => { if (active) setError('No se pudo cargar el historial.'); });
    return () => { active = false; };
  }, [items, searchParams, setSearchParams, vistaIncidencias, user.role]);
  async function select(item) {
    setError(''); setSelected(item); setObservation(''); setHistory([]);
    requestAnimationFrame(() => detalleEventoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    obtenerEvento(item.id).then(actualizado => {
      setSelected(actual => actual?.id === item.id ? actualizado : actual);
      setItems(actual => actual.map(evento => evento.id === item.id ? actualizado : evento));
    }).catch(() => {});
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
    const siguiente = new URLSearchParams(searchParams);
    siguiente.delete('configuracion');
    setSearchParams(siguiente);
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
  const clipAdjuntado = useCallback(id => {
    setItems(actual => actual.map(item => item.id === id ? { ...item, clip_disponible: true } : item));
    setSelected(actual => actual?.id === id ? { ...actual, clip_disponible: true } : actual);
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
      if (modo === 'monitor' && action === 'confirmar') {
        setNotice('Incidencia confirmada. Ya está disponible en el historial de incidencias.');
      }
      if (modo !== 'monitor' && ['confirmar', 'descartar'].includes(action)) {
        setVistaIncidencias(action === 'confirmar' ? 'historial' : 'activas');
        setNotice(action === 'confirmar'
          ? user.role === 'guardia' ? 'Incidencia confirmada y trasladada al historial. Puedes verificar la placa y solicitar el aviso al residente desde este detalle.' : 'Incidencia confirmada y trasladada al historial.'
          : 'Evento descartado y registrado.');
      }
      const [events, entries] = await Promise.all([load(), listarHistorialEvento(updated.id)]);
      setHistory(entries);
      if (!events.some(item => item.id === updated.id)) setSelected(null);
    } catch { setError('No se pudo completar la acción. Actualiza la lista para comprobar el estado.'); }
    finally { setBusy(false); }
  }
  async function retirarHistorial() {
    if (!selected || busy || !window.confirm('¿Retirar esta incidencia del historial para todos? Se conservará el registro de auditoría.')) return;
    setBusy(true); setError('');
    try { await retirarHistorialEvento(selected.id); setSelected(null); await load(); setNotice('Incidencia retirada del historial.'); }
    catch { setError('No se pudo retirar la incidencia. Actualiza la lista y vuelve a intentarlo.'); }
    finally { setBusy(false); }
  }
  async function redistribuir(item) {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const resultado = await redistribuirEvento(item.id);
      setNotice(resultado.guardias_activos ? 'Aviso enviado a la bandeja de los guardias activos.' : 'Todavía no hay guardias activos para recibir el aviso.');
      await load();
    } catch { setError('No se pudo reintentar la distribución del aviso.'); }
    finally { setBusy(false); }
  }
  const eventosVisibles = items.filter(item => {
    if (vistaIncidencias === 'historial') return ['CONFIRMADA', 'EN_ATENCION', 'RESUELTA'].includes(item.estado);
    return item.estado === 'PENDIENTE_REVISION';
  });
  return <div className="seguridad-dashboard">
    <div className={`seguridad-heading ${configuracion ? 'seguridad-heading-configuracion' : ''}`}><div className="seguridad-heading-icon">{configuracion ? <FaCog /> : <FaVideo />}</div><div><p>CENTRO DE SEGURIDAD</p><h2>{configuracion ? 'Configuración de incidencias' : modo === 'monitor' ? 'Monitor en vivo' : 'Eventos e incidencias de seguridad'}</h2></div><span className="seguridad-heading-mark"><FaShieldAlt /></span></div>
    {modo === 'monitor' && <>
    <div className="seguridad-topline">
      <div><span className="seguridad-eyebrow">{configuracion ? 'REGLAS DE DETECCIÓN' : 'MONITOREO EN VIVO'}</span><h3>{configuracion ? 'Selecciona una cámara para configurar' : 'Cámaras de seguridad'}</h3>{configuracion && <p className="seguridad-configuracion-descripcion">Define la zona, el tiempo de tolerancia y los avisos que se aplicarán al monitor.</p>}</div>
    </div>
    {configuracion && <>
    <ProcesadorVision />
    <p className="seguridad-source-label">Selecciona una cámara registrada</p>
    <div className="seguridad-source-tabs" aria-label="Seleccionar cámara">
      {!camarasSoloLocal && <button type="button" aria-pressed={fuente === 'imou'} onClick={() => seleccionarFuente('imou')}><FaVideo /> Cámara Imou</button>}
      <button type="button" aria-pressed={fuente === 'laptop'} onClick={() => seleccionarFuente('laptop')}><FaCamera /> Cámara de laptop</button>
      {camaras.map(c => <button type="button" key={c.id} aria-pressed={fuente === `camara-${c.id}`}
        onClick={() => seleccionarFuente(`camara-${c.id}`)}><FaVideo /> {c.nombre}</button>)}
    </div>
    {seleccionada && <section className="seguridad-camara-seleccionada" aria-label="Cámara seleccionada para configurar">
      <div><span>CONFIGURACIÓN INDIVIDUAL</span><strong>{seleccionada.nombre}</strong>{seleccionada.ubicacion && <small>{seleccionada.ubicacion}</small>}</div>
      <p>{fuente === 'laptop' ? 'Ajustes guardados en este navegador.' : 'Ajustes exclusivos de esta cámara.'}</p>
    </section>}
    </>}
    {errorCamaras && <p role="alert">{errorCamaras}</p>}
    {cargandoCamaras && <p className="seguridad-source-note">Cargando cámaras registradas…</p>}
    {!cargandoCamaras && !errorCamaras && camaras.length === 0 && <p className="seguridad-source-note">No hay cámaras de red adicionales. <Link to="/admin/camaras">Gestionar cámaras</Link>.</p>}
    {camaraSolicitada && !cargandoCamaras && !errorCamaras && !camaras.some(c => String(c.id) === camaraSolicitada) && <p role="status">La cámara seleccionada no está disponible. Comprueba que esté habilitada en Gestión de cámaras.</p>}
    {verVarias && <p className="seguridad-source-note">Inicia cada cámara y usa el icono de la esquina para ampliar o reducir su imagen.</p>}
    {!verVarias && <p className="seguridad-source-note">La vista y el análisis pueden detenerse al salir de esta pestaña.</p>}
    <div className={verVarias ? 'seguridad-mosaico' : ''}>
    <div hidden={configuracion ? fuente !== 'imou' : camarasOcultas.has('imou')} className={verVarias && camaraAmpliada === 'imou' ? 'mosaico-camara-ampliada' : ''}>
      {!cargandoCamaras && !camarasSoloLocal && <CamaraImou onRegistrarEvento={registrarEventoVideo} configuracion={configuracion} compacto={verVarias} ampliado={camaraAmpliada === 'imou'} onAmpliar={() => alternarAmpliacion('imou')} remota={imouRemota} />}
    </div>
    <div hidden={configuracion ? fuente !== 'laptop' : camarasOcultas.has('laptop')} className={`seguridad-webcam ${verVarias && camaraAmpliada === 'laptop' ? 'mosaico-camara-ampliada' : ''}`}>
      <CamaraDemostracion onRegistrarEvento={registrarEventoVideo} configuracion={configuracion} compacto={verVarias} ampliado={camaraAmpliada === 'laptop'} onAmpliar={() => alternarAmpliacion('laptop')} />
    </div>
    {camaras.map(c => <div key={c.id} hidden={configuracion ? fuente !== `camara-${c.id}` : camarasOcultas.has(`camara-${c.id}`)} className={verVarias && camaraAmpliada === `camara-${c.id}` ? 'mosaico-camara-ampliada' : ''}>
      <CamaraCatalogo camara={c} onRegistrarEvento={registrarEventoVideo} configuracion={configuracion} compacto={verVarias} ampliado={camaraAmpliada === `camara-${c.id}`} onAmpliar={() => alternarAmpliacion(`camara-${c.id}`)} />
    </div>)}
    {verVarias && <button type="button" className="seguridad-agregar-camara" onClick={abrirSelectorCamaras}><FaPlusCircle /><span>Agregar cámara</span><small>Seleccionar cámaras registradas</small></button>}
    </div>
    {selectorCamaras && <div className="seguridad-selector-fondo">
      <section ref={dialogoCamaras} className="seguridad-selector" role="dialog" aria-modal="true" aria-labelledby="selector-camaras-titulo" onKeyDown={e => {
        if (e.key === 'Escape') { setSelectorCamaras(false); return; }
        if (e.key === 'Tab') {
          const controles = [...e.currentTarget.querySelectorAll('input:not(:disabled), button:not(:disabled), a[href]')];
          if (!controles.length) return;
          if (e.shiftKey && document.activeElement === controles[0]) { e.preventDefault(); controles.at(-1).focus(); }
          else if (!e.shiftKey && document.activeElement === controles.at(-1)) { e.preventDefault(); controles[0].focus(); }
        }
      }}>
        <h3 id="selector-camaras-titulo">Seleccionar cámaras</h3>
        <p>Elige cámaras de red o la cámara local. Ocultarlas no detiene una vista iniciada.</p>
        <label><input type="checkbox" checked={!borradorOcultas.has('imou')} onChange={() => alternarCamaraEnBorrador('imou')} /> Cámara Imou</label>
        <label><input type="checkbox" checked={!borradorOcultas.has('laptop')} onChange={() => alternarCamaraEnBorrador('laptop')} /> Cámara local (laptop o USB)</label>
        {camaras.map(c => <label key={c.id}><input type="checkbox" checked={!borradorOcultas.has(`camara-${c.id}`)} onChange={() => alternarCamaraEnBorrador(`camara-${c.id}`)} /> {c.nombre}{c.ubicacion ? ` · ${c.ubicacion}` : ''}</label>)}
        {cargandoCamaras ? <p>Cargando cámaras registradas…</p> : errorCamaras ? <p role="alert">No se pudo cargar el catálogo de cámaras.</p> : !camaras.length && <p>No hay otras cámaras de red habilitadas.</p>}
        <div className="seguridad-selector-acciones">
          <Link to="/admin/camaras">Registrar cámara nueva</Link>
          <button type="button" onClick={() => setSelectorCamaras(false)}>Cancelar</button>
          <button type="button" className="seguridad-primary" onClick={() => { setCamarasOcultas(new Set(borradorOcultas)); setCamaraAmpliada(null); setSelectorCamaras(false); }}>Mostrar seleccionadas</button>
        </div>
      </section>
    </div>}
    <div hidden={!configuracion} className="seguridad-archivo">
      <div className="seguridad-section-title"><div><span className="seguridad-eyebrow">HERRAMIENTAS</span><h3>Análisis de videos</h3></div></div>
      <VideoArchivoDemostracion onPrepararEvento={prepararEventoVideo} onRegistrarEvento={registrarEventoVideo} onClipAdjuntado={clipAdjuntado} />
    </div>
    </>}
    {error && <p role="alert" className="seguridad-feedback is-error">{error}</p>}
    {notice && <p role="status" className="seguridad-feedback is-success">{notice}</p>}
    {modo !== 'monitor' && user.role === 'administrador' && items.filter(item => item.sin_guardias && item.estado === 'PENDIENTE_REVISION').map(item =>
      <div key={item.id} className="seguridad-feedback is-error"><p>Evento pendiente sin guardias activos: {item.categoria}</p>
        <button type="button" disabled={busy} className="seguridad-secondary" onClick={() => redistribuir(item)}>Reintentar distribución</button>
      </div>)}
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
        <div hidden={modo === 'monitor' && !!selected}>
        <div className="seguridad-incidencias-filtros" aria-label="Vista de incidencias">
          <button type="button" aria-pressed={vistaIncidencias === 'activas'} onClick={() => { setVistaIncidencias('activas'); setSelected(null); }}>Pendientes de revisión</button>
          <button type="button" aria-pressed={vistaIncidencias === 'historial'} onClick={() => { setVistaIncidencias('historial'); setSelected(null); }}>Historial de incidencias</button>
          <button type="button" className="seguridad-secondary" disabled={actualizando} onClick={actualizarLista}>{actualizando ? 'Actualizando…' : 'Actualizar'}</button>
        </div>
        {modo !== 'monitor' && <p className="seguridad-muted">{vistaIncidencias === 'historial' ? 'Incluye incidencias confirmadas, en atención o resueltas. Confirmar no significa resolver.' : 'Eventos que esperan la revisión del guardia.'}</p>}
        {modo !== 'monitor' && user.role === 'guardia' && <p className="seguridad-muted">La lista se actualiza cada 30 segundos mientras esta pestaña está visible.</p>}
        <div ref={zonaActualizacion} className="seguridad-zona-actualizacion" aria-label="Lista de incidencias">
        {(gestoActualizacion || actualizando) && <p role="status" className="seguridad-refresh-status">{actualizando ? 'Actualizando incidencias…' : gestoActualizacion}</p>}
        {loading ? <p className="seguridad-empty">Cargando eventos…</p> : eventosVisibles.length === 0 ? (!error && <div className="seguridad-empty"><FaClipboardList /><p>{modo === 'monitor' ? 'No hay eventos disponibles.' : vistaIncidencias === 'historial' ? 'No hay incidencias confirmadas.' : 'No hay incidencias pendientes de revisión.'}</p></div>) : <ul className="seguridad-event-list">{eventosVisibles.map(item => <li key={item.id}>
          <button type="button" className="seguridad-event-row" onClick={() => select(item)}>
            <EvidenciaMiniatura evento={item} />
            <span className="seguridad-event-info"><strong>{item.categoria}</strong><span>{item.origen} · {item.camara || 'Sin cámara'}</span><time>{new Date(item.fecha_evento).toLocaleString()}</time></span>
            <span className={`seguridad-status estado-${item.estado}`}>{etiquetasEstado[item.estado] || item.estado}</span>
          </button>
        </li>)}</ul>}
        </div>
        </div>
        {selected && <section ref={detalleEventoRef} className="seguridad-detail"><div className="seguridad-detail-heading"><div><span className="seguridad-eyebrow">REVISIÓN</span><h3>Detalle de la incidencia</h3></div><button type="button" className="seguridad-close" onClick={() => setSelected(null)}>Volver a incidencias</button></div>
          <p>{selected.descripcion}</p><p className="seguridad-muted">{selected.camara || 'Sin cámara'} · {selected.ubicacion || 'Sin ubicación'}</p>
          <p className="seguridad-muted">Estado: {selected.estado} · Origen: {selected.origen}</p>
          {user.role === 'administrador' && selected.estado === 'PENDIENTE_REVISION' && <div className="seguridad-review"><button disabled={busy} className="seguridad-primary" onClick={() => execute('confirmar')}>Confirmar incidencia</button></div>}
          {selected.clip_disponible
            ? <ClipEvento key={selected.id} evento={selected} />
            : <EvidenciaEvento key={selected.id} evento={selected} />}
          {selected.estado !== 'PENDIENTE_REVISION' && <p className="seguridad-muted">Esta incidencia ya fue revisada.</p>}
          {['administrador', 'guardia'].includes(user.role) && ['CONFIRMADA', 'EN_ATENCION', 'RESUELTA'].includes(selected.estado) && <button type="button" disabled={busy} className="seguridad-danger" onClick={retirarHistorial}>Retirar del historial</button>}
          {['guardia', 'administrador'].includes(user.role) && <LecturaPlacaEvidencia key={selected.id} evento={selected} puedeGestionar={user.role === 'guardia'} onRegistrada={async () => setHistory(await listarHistorialEvento(selected.id))} />}
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
