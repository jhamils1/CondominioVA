import { useCallback, useEffect, useRef, useState } from 'react';
import { fotogramaImou, estadoMonitoreoImou, exclusionImouRemota } from '../api/visionDemoApi.js';
import AnalisisImou from './AnalisisImou.jsx';
import ConsultaPlacaFotograma from '../components/ConsultaPlacaFotograma.jsx';
import LecturaAutomaticaImou from '../components/LecturaAutomaticaImou.jsx';
import ReglaPiscina from '../components/ReglaPiscina.jsx';
import ReglaMascota from '../components/ReglaMascota.jsx';
import { crearEventoImou } from '../vision/eventoImou.js';
import { useClipEvento } from '../vision/useClipEvento.js';
import { FaCamera, FaCompress, FaExpand, FaPowerOff } from 'react-icons/fa';
import './CamaraImou.css';

export default function CamaraImou({ onRegistrarEvento, configuracion = false, compacto = false, ampliado = false, onAmpliar, remota = false }) {
  const [activa, setActiva] = useState(false);
  const [imagen, setImagen] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [automatico, setAutomatico] = useState(false);
  const [pendientes, setPendientes] = useState([]);
  const [avisoRegistro, setAvisoRegistro] = useState('');
  const sesionImou = useRef(null);
  if (!sesionImou.current) sesionImou.current = crypto.randomUUID().replaceAll('-', '');
  const controlRemoto = useRef(false);
  const montado = useRef(true);
  const [iniciando, setIniciando] = useState(false);
  const [puedeRecuperar, setPuedeRecuperar] = useState(false);
  const registrarConSesion = useCallback((datos, opciones = {}) => onRegistrarEvento(datos,
    remota ? { ...opciones, headers: { ...opciones.headers, 'X-Imou-Session': sesionImou.current } } : opciones),
  [onRegistrarEvento, remota]);
  const { buffer: bufferClip, registrarConClip } = useClipEvento(registrarConSesion, setAvisoRegistro);
  const [iaActiva, setIaActiva] = useState(false);
  const [visorAnalizado, setVisorAnalizado] = useState(null);
  const [pieConfiguracion, setPieConfiguracion] = useState(null);
  const [regla, setRegla] = useState('estacionamiento');
  const [monitorIndependiente, setMonitorIndependiente] = useState(null);
  const visor = useRef(null);
  const ultimoFotograma = useRef(null);
  const muestraAnalizada = useRef(null);
  const automaticoRef = useRef(false);
  const pendientesRef = useRef(new Map());
  const enviandoRef = useRef(new Set());
  const tiemposClip = useRef(new Map());
  const monitorRef = useRef(null);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
      if (remota && controlRemoto.current) {
        void exclusionImouRemota('liberar', sesionImou.current).catch(() => {});
      }
    };
  }, [remota]);

  useEffect(() => {
    if (remota && !activa) return undefined;
    let vigente = true, timer;
    const controller = new AbortController();
    async function consultar() {
      try {
        const datos = await estadoMonitoreoImou(controller.signal, remota ? sesionImou.current : undefined);
        if (typeof datos.ocupado !== 'boolean') throw new Error('Estado inválido');
        if (vigente) { monitorRef.current = datos.ocupado; setMonitorIndependiente(datos.ocupado); }
      } catch {
        if (vigente) { monitorRef.current = null; setMonitorIndependiente(null); }
      } finally { if (vigente) timer = setTimeout(consultar, 3000); }
    }
    consultar();
    return () => { vigente = false; controller.abort(); clearTimeout(timer); };
  }, [remota, activa]);

  const cambiarAutomatico = useCallback(valor => {
    automaticoRef.current = valor;
    setAutomatico(valor);
  }, []);
  const desactivarRegistro = useCallback(() => cambiarAutomatico(false), [cambiarAutomatico]);
  const liberarControl = useCallback(async () => {
    if (!remota || !controlRemoto.current) return;
    try {
      await exclusionImouRemota('liberar', sesionImou.current);
      controlRemoto.current = false;
    } catch {
      if (montado.current) setMensaje('No se pudo liberar el control de la cámara; revisa la conexión antes de volver a iniciarla.');
    }
  }, [remota]);
  const detenerVista = useCallback(() => {
    desactivarRegistro(); setIaActiva(false); setActiva(false); setImagen(''); setMensaje('Vista detenida.');
    void liberarControl();
  }, [desactivarRegistro, liberarControl]);
  async function iniciarVista() {
    setIniciando(true);
    setPuedeRecuperar(false);
    setMensaje('Conectando con la cámara…');
    try {
      if (remota) {
        await exclusionImouRemota('adquirir', sesionImou.current);
        controlRemoto.current = true;
        if (!montado.current) { await liberarControl(); return; }
      }
      setIaActiva(true); setActiva(true);
    } catch {
      if (montado.current) {
        setPuedeRecuperar(remota);
        setMensaje('No se pudo obtener el control de la cámara. Comprueba si otro monitor está activo o si la PC está conectada.');
      }
    } finally {
      if (montado.current) setIniciando(false);
    }
  }
  async function recuperarControl() {
    if (!window.confirm('Esto puede detener el análisis iniciado por otro administrador. ¿Liberar el control anterior?')) return;
    setIniciando(true);
    try {
      await exclusionImouRemota('recuperar', sesionImou.current);
      controlRemoto.current = false;
      setPuedeRecuperar(false);
      setMensaje('Control liberado. Puedes iniciar la cámara.');
    } catch {
      setMensaje('No se pudo liberar el control. Puede haber una incidencia guardándose o una interrupción pendiente de revisar.');
    } finally { if (montado.current) setIniciando(false); }
  }
  const actualizarPendientes = useCallback(() => {
    setPendientes([...pendientesRef.current.values()].map(datos => ({
      datos, enviando: enviandoRef.current.has(datos.id),
    })));
  }, []);
  const enviar = useCallback(async datos => {
    if (enviandoRef.current.has(datos.id)) return;
    enviandoRef.current.add(datos.id);
    actualizarPendientes();
    try {
      const creado = await registrarConClip(datos, { timeout: 15000, instanteClip: tiemposClip.current.get(datos.id) });
      tiemposClip.current.delete(datos.id);
      pendientesRef.current.delete(datos.id);
      setAvisoRegistro(creado.sin_guardias
        ? 'Evento registrado. No hay guardias activos para recibir el aviso.'
        : 'Evento registrado para revisión de los guardias activos. La entrega al móvil depende del procesador y Firebase.');
    } catch {
      desactivarRegistro();
      setAvisoRegistro('No se pudo confirmar el registro. Se desactivó el registro automático; puedes reintentar con el mismo evento.');
    } finally {
      enviandoRef.current.delete(datos.id);
      actualizarPendientes();
    }
  }, [registrarConClip, desactivarRegistro, actualizarPendientes]);
  const registrarHallazgo = useCallback((hallazgo, imagen, instante) => {
    if (!automaticoRef.current || monitorRef.current !== false) return;
    try {
      if (!(imagen instanceof Blob) || imagen.type !== 'image/jpeg' || imagen.size <= 0 || imagen.size > 1024 * 1024) throw new Error('Fotograma inválido');
      const datos = { ...crearEventoImou(hallazgo, crypto.randomUUID(), new Date().toISOString()), evidencia: imagen };
      tiemposClip.current.set(datos.id, instante);
      pendientesRef.current.set(datos.id, datos);
      void enviar(datos);
    } catch {
      desactivarRegistro();
      setAvisoRegistro('No se pudo preparar el evento; se desactivó el registro automático.');
    }
  }, [enviar, desactivarRegistro]);

  useEffect(() => {
    if (!activa) return;
    const buffer = bufferClip.current;
    let vigente = true;
    let timer;
    let url;
    let ultimaImagen = Date.now();
    const controller = new AbortController();
    async function actualizar() {
      try {
        const blob = await fotogramaImou(controller.signal);
        if (!vigente) return;
        if (blob) {
          ultimoFotograma.current = { imagen: blob, tiempo: performance.now() / 1000 };
          buffer.agregar(blob, ultimoFotograma.current.tiempo);
          const anterior = url;
          url = URL.createObjectURL(blob);
          setImagen(url);
          if (anterior) URL.revokeObjectURL(anterior);
          ultimaImagen = Date.now();
          setMensaje('Vista en directo');
        } else if (Date.now() - ultimaImagen > 12000) {
          throw new Error('Sin imágenes');
        }
        timer = setTimeout(actualizar, remota ? 500 : 200);
      } catch (error) {
        if (!vigente) return;
        desactivarRegistro();
        setIaActiva(false);
        setImagen('');
        ultimoFotograma.current = null;
        if ([401, 403].includes(error.response?.status)) {
          setActiva(false);
          void liberarControl();
          setMensaje('Tu sesión no permite ver esta cámara. Comprueba tu acceso.');
        } else {
          ultimaImagen = Date.now();
          setMensaje('Cámara no disponible. Reintentando la conexión…');
          timer = setTimeout(actualizar, 5000);
        }
      }
    }
    function alOcultar() {
      if (document.hidden) {
        detenerVista();
        setMensaje('Vista detenida al salir de esta pestaña.');
      }
    }
    document.addEventListener('visibilitychange', alOcultar);
    actualizar();
    return () => {
      vigente = false;
      controller.abort();
      clearTimeout(timer);
      ultimoFotograma.current = null; buffer.limpiar();
      if (url) URL.revokeObjectURL(url);
      document.removeEventListener('visibilitychange', alOcultar);
    };
  }, [activa, desactivarRegistro, bufferClip, remota, detenerVista, liberarControl]);

  async function ampliar() {
    try { await visor.current?.requestFullscreen(); }
    catch { setMensaje('El navegador no permitió ampliar la vista.'); }
  }
  const controlesCamara = <div className="imou-side-buttons" aria-label="Controles de la cámara Imou">
    <button type="button" disabled={activa || iniciando} className="imou-primary" aria-label="Ver cámara Imou"
      onClick={iniciarVista}><FaPowerOff /> {iniciando ? 'Conectando…' : compacto ? 'Ver' : 'Ver cámara Imou'}</button>
    <button type="button" disabled={!activa} className="imou-secondary" aria-label="Detener vista Imou"
      onClick={detenerVista}>{compacto ? 'Detener' : 'Detener vista Imou'}</button>
  </div>;

  return <section className={`imou-monitor ${compacto ? 'camara-mosaico-imou' : ''}`} aria-label="Cámara Imou por red">
    <div className="imou-monitor-layout">
      <div className="imou-camera-card">
        <div className="imou-card-heading">
          <div className="imou-card-title"><span className="imou-icon"><FaCamera /></span><div><h3>Cámara Imou</h3><p>Monitoreo de seguridad</p></div></div>
          <span className={`imou-live-badge ${activa && imagen ? 'is-live' : ''}`}><span />{activa && imagen ? 'En vivo' : activa ? 'Conectando' : 'Desconectada'}</span>
          {compacto && controlesCamara}
          {compacto && <button type="button" className="mosaico-ampliar" onClick={onAmpliar} aria-label={ampliado ? 'Reducir cámara Imou' : 'Ampliar cámara Imou'} title={ampliado ? 'Reducir cámara Imou' : 'Ampliar cámara Imou'}>{ampliado ? <FaCompress /> : <FaExpand />}</button>}
        </div>
        {!compacto && controlesCamara}
        <div ref={visor} className="imou-stage">
          <div className="imou-vista-directo" hidden={iaActiva && !!imagen}>
            {activa && imagen ? <><img src={imagen} alt="Vista en directo de la cámara Imou" />{configuracion && <span className="imou-view-label">Cámara en directo</span>}</>
              : <div className="imou-placeholder"><FaCamera aria-hidden="true" /><strong>Cámara lista para conectar</strong><span>Inicia la cámara para ver la imagen en vivo.</span></div>}
          </div>
          <div ref={setVisorAnalizado} className="imou-analysis-slot" hidden={!iaActiva} />
          {activa && imagen && <><span className="imou-camera-caption">Cámara Imou · Red local</span>
            <button type="button" onClick={ampliar} className="imou-expand" title="Ampliar cámara Imou" aria-label="Ampliar cámara Imou"><FaExpand /></button></>}
        </div>
        {mensaje && <p role="status" className="imou-camera-message">{mensaje}</p>}
        {puedeRecuperar && <button type="button" disabled={iniciando} onClick={recuperarControl}>Liberar control anterior</button>}
      </div>
      <aside className="imou-side-card" hidden={compacto}>
        <div className="imou-side-heading"><span className="imou-icon"><FaCamera /></span><div><h3>Control de cámara</h3><p>Imou · red local</p></div></div>
        {configuracion && <label className="selector-incidencia">Tipo de incidencia: <select value={regla} onChange={e => setRegla(e.target.value)}><option value="estacionamiento">Estacionamiento prohibido</option><option value="piscina">Persona sola cerca de piscina</option><option value="mascota">Mascota en área restringida</option></select></label>}
        {activa && imagen && <AnalisisImou ultimoFotograma={ultimoFotograma} muestraAnalizada={muestraAnalizada} automatico={automatico}
          cambiarAutomatico={cambiarAutomatico} desactivarRegistro={desactivarRegistro}
          registrarHallazgo={registrarHallazgo} hayPendientes={pendientes.length > 0}
          activo={iaActiva} setActivo={setIaActiva} configuracion={configuracion} visorAnalizado={visorAnalizado}
          monitorIndependiente={monitorIndependiente} pieConfiguracion={pieConfiguracion} piscinaSeleccionada={regla !== 'estacionamiento'} />}
        {activa && imagen && <ReglaPiscina fuente="imou" nombre="Imou · piscina" muestraAnalizada={muestraAnalizada} visor={visorAnalizado} activo={iaActiva} configuracion={configuracion} seleccionada={regla === 'piscina'} pie={pieConfiguracion} onRegistrarEvento={registrarConClip} />}
        {activa && imagen && <ReglaMascota fuente="imou" nombre="Imou" muestraAnalizada={muestraAnalizada} visor={visorAnalizado} activo={iaActiva} configuracion={configuracion} seleccionada={regla === 'mascota'} pie={pieConfiguracion} onRegistrarEvento={registrarConClip} />}
        {activa && imagen && <section className="configuracion-placas-camara" aria-label="Lectura de placas de la cámara Imou">
          {configuracion && <h4>Lectura de placas</h4>}
          {iaActiva && <LecturaAutomaticaImou muestraAnalizada={muestraAnalizada} cameraId="Imou" />}
          <ConsultaPlacaFotograma obtenerFotograma={() => ultimoFotograma.current} cameraId="Imou" />
        </section>}
        <p role="status" className="imou-notice">{monitorIndependiente === null
          ? 'No se puede comprobar el monitor independiente; el registro desde esta vista está pausado.'
          : monitorIndependiente
            ? 'Registro desde esta vista pausado: el monitor independiente está iniciado o su puerto está ocupado. Revisa la consola del monitor. Detener la cámara o la IA aquí no detiene ese proceso.'
            : 'Proceso independiente detenido. El monitoreo desde esta vista requiere mantener la página abierta.'}</p>
        {avisoRegistro && <p role="status" className="imou-notice">{avisoRegistro}</p>}
        {pendientes.length > 0 && <div role="alert" className="imou-pending">
          <p>Hay {pendientes.length} evento(s) por confirmar. Si cierras o recargas la página se perderán los reintentos pendientes.</p>
          {pendientes.map(({ datos, enviando }) => <button key={datos.id} type="button" disabled={enviando}
            onClick={() => enviar(datos)}>{enviando ? 'Enviando evento…' : 'Reintentar evento Imou'}</button>)}
        </div>}
        {configuracion && <div ref={setPieConfiguracion} />}
      </aside>
    </div>
  </section>;
}
