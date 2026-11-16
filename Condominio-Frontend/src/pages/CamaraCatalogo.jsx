import { useCallback, useEffect, useRef, useState } from 'react';
import ConsultaPlacaFotograma from '../components/ConsultaPlacaFotograma.jsx';
import AnalisisCamaraCatalogo from '../components/AnalisisCamaraCatalogo.jsx';
import ReglaPiscina from '../components/ReglaPiscina.jsx';
import { fotogramaCamara, obtenerZonaCamara, guardarZonaCamara } from '../api/visionDemoApi.js';
import { useSession } from '../auth/sessionContext.js';
import ZonaVideo from './ZonaVideo.jsx';
import { zonaValida } from '../vision/zonas.js';
import { FaCompress, FaExpand } from 'react-icons/fa';
import { crearEventoImou } from '../vision/eventoImou.js';
import { useClipEvento } from '../vision/useClipEvento.js';
import './VideoArchivoDemostracion.css';

export default function CamaraCatalogo({ camara, onRegistrarEvento, configuracion, compacto = false, ampliado = false, onAmpliar }) {
  const { user } = useSession();
  const esAdmin = user?.role === 'administrador';
  const [activo, setActivo] = useState(false);
  const [imagen, setImagen] = useState('');
  const ultimoFotograma = useRef(null);
  const muestraAnalizada = useRef(null);
  const visor = useRef(null);
  const [visorAnalizado, setVisorAnalizado] = useState(null);
  const [espacioPlacas, setEspacioPlacas] = useState(null);
  const [piePiscina, setPiePiscina] = useState(null);
  const [regla, setRegla] = useState('estacionamiento');
  const asignarVisor = useCallback(elemento => { visor.current = elemento; setVisorAnalizado(elemento); }, []);
  const [mensaje, setMensaje] = useState('');
  const [zona, setZona] = useState(null);
  const [errorZona, setErrorZona] = useState('');
  const [dibujando, setDibujando] = useState(false);
  const [borrador, setBorrador] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [puntosPendientes, setPuntosPendientes] = useState([]);
  const [segundosPendientes, setSegundosPendientes] = useState('5');
  const [automaticoPendiente, setAutomaticoPendiente] = useState(false);
  const [eventosPendientes, setEventosPendientes] = useState([]);
  const [registroPausado, setRegistroPausado] = useState(false);
  const [mensajeRegistro, setMensajeRegistro] = useState('');
  const { buffer: bufferClip, registrarConClip } = useClipEvento(onRegistrarEvento, setMensajeRegistro);
  const tiemposClip = useRef(new Map());
  const enviando = useRef(new Set());
  const [cambios, setCambios] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    if (guardando) return undefined;
    const controller = new AbortController();
    let timer;
    async function consultarZona() {
      try {
        const datos = await obtenerZonaCamara(camara.id, controller.signal);
        if (controller.signal.aborted) return;
        setZona(actual => actual?.version === datos.version && actual?.automatico === datos.automatico ? actual : datos);
        if (!cambios && !dibujando) { setPuntosPendientes(datos.puntos); setSegundosPendientes(String(datos.segundos)); setAutomaticoPendiente(Boolean(datos.automatico)); }
        setErrorZona('');
      } catch {
        if (!controller.signal.aborted) { setZona(null); setErrorZona('No se pudo cargar la zona. El análisis de incidencias está pausado.'); }
      } finally { if (!controller.signal.aborted) timer = setTimeout(consultarZona, 5000); }
    }
    consultarZona();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [camara.id, cambios, dibujando, guardando]);

  async function guardar(puntos, segundos) {
    if (!zona || guardando) return;
    setGuardando(true); setErrorZona('');
    try {
      const guardada = await guardarZonaCamara(camara.id, { puntos, segundos, automatico: puntos.length > 0 && automaticoPendiente, version: zona.version });
      setZona(guardada); setPuntosPendientes(guardada.puntos); setSegundosPendientes(String(guardada.segundos));
      setAutomaticoPendiente(Boolean(guardada.automatico));
      setDibujando(false); setBorrador([]); setCambios(false); setAviso('Configuración guardada.');
    } catch (error) {
      setErrorZona(error.response?.status === 409
        ? 'La zona cambió en otra sesión. Vuelve a seleccionar la cámara antes de editar.'
        : 'No se pudo guardar la zona. La configuración anterior se conserva.');
    } finally { setGuardando(false); }
  }

  const enviar = useCallback(async datos => {
    if (enviando.current.has(datos.id)) return;
    enviando.current.add(datos.id);
    try {
      const resultado = await registrarConClip(datos, { timeout: 15000, instanteClip: tiemposClip.current.get(datos.id) });
      tiemposClip.current.delete(datos.id);
      setEventosPendientes(actual => actual.filter(item => item.id !== datos.id));
      setMensajeRegistro(resultado.sin_guardias ? 'Evento registrado, pero no hay guardias activos.' : 'Evento enviado a revisión de los guardias.');
      return true;
    } catch {
      setRegistroPausado(true);
      setMensajeRegistro('No se pudo confirmar el evento. Reintenta antes de cerrar esta vista.');
      return false;
    } finally { enviando.current.delete(datos.id); }
  }, [registrarConClip]);
  const registrarHallazgo = useCallback((hallazgo, imagen, instante) => {
    if (registroPausado || !(imagen instanceof Blob) || imagen.type !== 'image/jpeg' || !imagen.size || imagen.size > 1024 * 1024) {
      setRegistroPausado(true); setMensajeRegistro('Registro pausado: revisa la evidencia o el evento pendiente.'); return;
    }
    const datos = { ...crearEventoImou(hallazgo, crypto.randomUUID(), new Date().toISOString()),
      camara: `${camara.nombre} (#${camara.id})`.slice(0, 100),
      descripcion: `Posible vehículo detenido ${Math.floor(hallazgo.duracion)} segundos en la zona configurada. Requiere revisión. Se adjunta el fotograma analizado.`, evidencia: imagen };
    tiemposClip.current.set(datos.id, instante);
    setEventosPendientes(actual => [...actual, datos]);
    void enviar(datos);
  }, [registroPausado, camara.id, camara.nombre, enviar]);

  useEffect(() => {
    if (!activo) return undefined;
    const buffer = bufferClip.current;
    let vigente = true, timer, actual = '';
    const controller = new AbortController();
    async function consultar() {
      try {
        const blob = await fotogramaCamara(camara.id, controller.signal);
        if (!vigente) return;
        if (blob) {
          ultimoFotograma.current = { imagen: blob, tiempo: performance.now() / 1000 };
          buffer.agregar(blob, ultimoFotograma.current.tiempo);
          const siguiente = URL.createObjectURL(blob);
          setImagen(siguiente);
          if (actual) URL.revokeObjectURL(actual);
          actual = siguiente;
          setMensaje('Imagen en directo.');
        } else setMensaje('Conectando con la cámara…');
        timer = setTimeout(consultar, 300);
      } catch (error) {
        if (!vigente) return;
        setImagen('');
        ultimoFotograma.current = null;
        if ([401, 403].includes(error.response?.status)) {
          setActivo(false);
          setMensaje('Tu sesión no permite ver esta cámara. Comprueba tu acceso.');
        } else {
          setMensaje('Cámara no disponible. Reintentando la conexión…');
          timer = setTimeout(consultar, 5000);
        }
      }
    }
    consultar();
    function ocultar() { if (document.hidden) { setActivo(false); setImagen(''); setMensaje('Vista detenida al salir de esta pestaña.'); } }
    document.addEventListener('visibilitychange', ocultar);
    return () => { vigente = false; controller.abort(); clearTimeout(timer); ultimoFotograma.current = null; buffer.limpiar(); if (actual) URL.revokeObjectURL(actual); document.removeEventListener('visibilitychange', ocultar); };
  }, [activo, camara.id, bufferClip]);

  return <section className={`imou-panel ${compacto ? 'camara-mosaico-catalogo' : ''}`}>
    <div className="camara-catalogo-cabecera"><h3>{camara.nombre}</h3>
    <div className="camara-catalogo-acciones">
      <button type="button" disabled={activo} aria-label="Ver cámara" onClick={() => { setMensaje('Conectando…'); setActivo(true); }}>{compacto ? 'Ver' : 'Ver cámara'}</button>
      <button type="button" disabled={!activo} aria-label="Detener vista" onClick={() => { setActivo(false); setImagen(''); setMensaje('Vista detenida.'); }}>{compacto ? 'Detener' : 'Detener vista'}</button>
      {compacto && <button type="button" className="mosaico-ampliar" onClick={onAmpliar} aria-label={`${ampliado ? 'Reducir' : 'Ampliar'} ${camara.nombre}`} title={`${ampliado ? 'Reducir' : 'Ampliar'} ${camara.nombre}`}>{ampliado ? <FaCompress /> : <FaExpand />}</button>}
    </div></div>
    {camara.ubicacion && <p>{camara.ubicacion}</p>}
    <p role="status">{mensaje}</p>
    {(imagen || compacto) && <div ref={asignarVisor} className="camara-catalogo-visor">{imagen ? <img src={imagen} alt={`Vista en vivo: ${camara.nombre}`} /> : <div className="mosaico-sin-imagen">Cámara sin conectar</div>}
      {configuracion && regla !== 'piscina' && <ZonaVideo puntos={dibujando ? borrador : puntosPendientes} activa={dibujando}
        onAgregar={punto => setBorrador(actual => actual.length < 30 ? [...actual, punto] : actual)} />}
      {!configuracion && !compacto && <button type="button" className="camara-catalogo-expand" aria-label={`Pantalla completa: ${camara.nombre}`}
        onClick={async () => { try { await visor.current?.requestFullscreen(); } catch { setMensaje('El navegador no permitió ampliar la cámara.'); } }}><FaExpand /></button>}
    </div>}
    {configuracion && <label className="selector-incidencia">Tipo de incidencia: <select value={regla} onChange={e => setRegla(e.target.value)}><option value="estacionamiento">Estacionamiento prohibido</option><option value="piscina">Persona sola cerca de piscina</option></select></label>}
    <div hidden={compacto}>
      {activo && imagen && <AnalisisCamaraCatalogo camara={camara} ultimoFotograma={ultimoFotograma} muestraAnalizada={muestraAnalizada} zona={guardando ? null : zona} visor={visorAnalizado} configuracion={configuracion} pausado={registroPausado} onHallazgo={registrarHallazgo} onError={setMensajeRegistro} espacioPlacas={espacioPlacas} />}
    </div>
    {configuracion && regla !== 'piscina' && <div>
      <h4>Configuración de incidencias para {camara.nombre}</h4>
      <h5>Zona de estacionamiento</h5>
      <p>Dibuja la zona y define el tiempo permitido.</p>
      {errorZona && <p role="alert">{errorZona}</p>}
      {zona && esAdmin && <>
        {!dibujando ? <>
          <button type="button" disabled={!imagen || guardando} onClick={() => { setBorrador([]); setDibujando(true); }}>Dibujar o cambiar zona</button>
          <button type="button" className="action-danger" disabled={!puntosPendientes.length || guardando} onClick={() => { setPuntosPendientes([]); setCambios(true); setAviso(''); }}>Eliminar zona</button>
        </> : <>
          <p>Marca al menos tres puntos sobre la imagen: {borrador.length} de 30.</p>
          <button type="button" disabled={guardando} onClick={() => { if (zonaValida(borrador)) { setPuntosPendientes(borrador); setCambios(true); setAviso(''); setDibujando(false); setErrorZona(''); } else setErrorZona('Dibuja una zona válida sin cruces.'); }}>Completar zona</button>
          <button type="button" onClick={() => { setDibujando(false); setBorrador([]); setErrorZona(''); }}>Cancelar</button>
        </>}
        <label>Tiempo mínimo detenido (2 a 120 segundos):{' '}
          <input type="number" min="2" max="120" value={segundosPendientes} disabled={guardando || dibujando}
            onChange={e => { setSegundosPendientes(e.target.value); setCambios(true); setAviso(''); }} />
        </label>
        <label><input type="checkbox" checked={automaticoPendiente} disabled={!puntosPendientes.length || guardando} onChange={e => { setAutomaticoPendiente(e.target.checked); setCambios(true); }} /> Registrar incidencias y avisar a los guardias</label>
        {cambios && <p role="status">Cambios sin guardar.</p>}
        {aviso && <p role="status">{aviso}</p>}
      </>}
      {zona && !esAdmin && <p>Solo el administrador puede configurar esta zona.</p>}
    </div>}
    {activo && imagen && <ReglaPiscina fuente={`catalogo-${camara.id}`} nombre={`${camara.nombre} (#${camara.id})`} muestraAnalizada={muestraAnalizada} visor={visorAnalizado} activo configuracion={configuracion} seleccionada={regla === 'piscina'} pie={piePiscina} onRegistrarEvento={registrarConClip} />}
    <div hidden={compacto}>
      {activo && imagen && <section className="configuracion-placas-camara" aria-label={`Lectura de placas de ${camara.nombre}`}>
        {configuracion && <h4>Lectura de placas</h4>}
        <div ref={setEspacioPlacas} />
        <ConsultaPlacaFotograma obtenerFotograma={() => ultimoFotograma.current} cameraId={`catalogo-${camara.id}`} />
      </section>}
    </div>
    {compacto && errorZona && <p className="camara-catalogo-aviso" role="alert">{errorZona}</p>}
    {mensajeRegistro && <p className="camara-catalogo-aviso" role="status">{mensajeRegistro}</p>}
    {eventosPendientes.map(datos => <button key={datos.id} type="button" onClick={async () => { if (await enviar(datos) && eventosPendientes.length === 1) setRegistroPausado(false); }}>Reintentar evento</button>)}
    {configuracion && regla !== 'piscina' && zona && esAdmin && <div className="configuracion-guardar">
      <button type="button" className="imou-primary" disabled={!cambios || guardando || dibujando || eventosPendientes.length > 0 || !Number.isInteger(Number(segundosPendientes)) || Number(segundosPendientes) < 2 || Number(segundosPendientes) > 120}
        onClick={() => guardar(puntosPendientes, Number(segundosPendientes))}>Guardar configuración</button>
      <p>Guarda la zona y los avisos de esta cámara.</p>
    </div>}
    {configuracion && <div ref={setPiePiscina} />}
  </section>;
}
