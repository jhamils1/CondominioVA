import React, { useEffect, useRef, useState } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { analizarFotograma, estadoCamaraDemo } from '../api/visionDemoApi.js';
import { zonaValida } from '../vision/zonas.js';
import { crearSeguimiento } from '../vision/permanencia.js';
import { crearEventoCamara } from '../vision/eventoCamara.js';
import { useClipEvento } from '../vision/useClipEvento.js';
import { colorDeteccionMonitor, filtrarDetecciones } from '../vision/coloresDeteccion.js';
import ConsultaPlacaFotograma from '../components/ConsultaPlacaFotograma.jsx';
import LecturaAutomaticaImou from '../components/LecturaAutomaticaImou.jsx';
import ModoDetecciones from '../components/ModoDetecciones.jsx';
import ReglaPiscina from '../components/ReglaPiscina.jsx';
import ZonaVideo from './ZonaVideo.jsx';
import './VideoArchivoDemostracion.css';

const nombres = { person: 'persona', car: 'automóvil', motorcycle: 'motocicleta',
  bus: 'autobús', truck: 'camión', cat: 'gato', dog: 'perro' };

export default function CamaraDemostracion({ onRegistrarEvento, configuracion = false, compacto = false, ampliado = false, onAmpliar }) {
  const video = useRef(null);
  const canvas = useRef(null);
  const flujo = useRef(null);
  const actual = useRef(0);
  const versionIA = useRef(0);
  const iaHabilitada = useRef(false);
  const solicitud = useRef(null);
  const temporizador = useRef(null);
  const seguimiento = useRef(null);
  const ultimoFotograma = useRef(null);
  const muestraAnalizada = useRef(null);
  const modoDeteccionesRef = useRef('todas');
  const ajustes = useRef({ zona: [], segundos: 5 });
  const guardadoLocal = useRef({ zona: [], segundos: 5, automatico: false });
  const automaticoRef = useRef(false);
  const pistasEnviadas = useRef(new Set());
  const configuracionRef = useRef(configuracion);
  const nombreCamara = useRef('Cámara local (laptop o USB)');
  configuracionRef.current = configuracion;
  const [estado, setEstado] = useState('inicial');
  const [iaActiva, setIaActiva] = useState(false);
  const [iaIniciando, setIaIniciando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [zona, setZona] = useState([]);
  const [borrador, setBorrador] = useState([]);
  const [dibujando, setDibujando] = useState(false);
  const [mostrarZona, setMostrarZona] = useState(false);
  const [segundos, setSegundos] = useState('5');
  const [errorZona, setErrorZona] = useState('');
  const [automatico, setAutomatico] = useState(false);
  const [pendientes, setPendientes] = useState([]);
  const [reintentando, setReintentando] = useState(false);
  const [avisoRegistro, setAvisoRegistro] = useState('');
  const { buffer: bufferClip, registrarConClip } = useClipEvento(onRegistrarEvento, setAvisoRegistro);
  const tiemposClip = useRef(new Map());
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivo, setDispositivo] = useState('');
  const [identificadorLectura, setIdentificadorLectura] = useState('');
  const [avisoGuardado, setAvisoGuardado] = useState('');
  const [modoDetecciones, setModoDetecciones] = useState('todas');
  const [regla, setRegla] = useState('estacionamiento');
  const [visorPiscina, setVisorPiscina] = useState(null);
  const [piePiscina, setPiePiscina] = useState(null);
  const tiempoValido = Number.isInteger(Number(segundos)) && Number(segundos) >= 2 && Number(segundos) <= 120;

  function configurarSeguimiento(nuevaZona, nuevoTiempo) {
    const valido = Number.isInteger(nuevoTiempo) && nuevoTiempo >= 2 && nuevoTiempo <= 120;
    ajustes.current = { zona: valido ? nuevaZona : [], segundos: nuevoTiempo };
    seguimiento.current = null;
    ultimoFotograma.current = null;
    muestraAnalizada.current = null;
    pistasEnviadas.current.clear();
  }

  function desactivarRegistro() {
    automaticoRef.current = false;
    setAutomatico(false);
  }

  async function enviarEvento(datos, reintento = false) {
    try {
      const creado = await registrarConClip(datos, { instanteClip: tiemposClip.current.get(datos.id) });
      tiemposClip.current.delete(datos.id);
      if (reintento) setPendientes(actual => actual.filter(item => item.id !== datos.id));
      setAvisoRegistro(creado.sin_guardias ? 'Evento registrado; no hay guardias activos para recibir el aviso.' : 'Evento registrado y enviado a la bandeja de guardias.');
    } catch {
      if (!reintento) setPendientes(actual => [...actual, datos]);
      desactivarRegistro();
      setAvisoRegistro('No se pudo confirmar el registro. El registro automático se desactivó; reintenta sin cerrar la página.');
    }
  }

  function liberar() {
    actual.current += 1;
    versionIA.current += 1;
    iaHabilitada.current = false;
    clearTimeout(temporizador.current);
    solicitud.current?.abort();
    flujo.current?.getTracks().forEach(track => track.stop());
    flujo.current = null;
    seguimiento.current = null;
    ultimoFotograma.current = null;
    muestraAnalizada.current = null;
    if (video.current) video.current.srcObject = null;
  }

  useEffect(() => () => liberar(), []);

  useEffect(() => {
    if (estado !== 'activa') return undefined;
    const buffer = bufferClip.current;
    let vigente = true, ocupado = false;
    const lienzo = document.createElement('canvas');
    const timer = setInterval(() => {
      const fuente = video.current;
      if (!vigente || ocupado || !fuente?.videoWidth || !fuente.videoHeight) return;
      const escala = Math.min(1, 640 / fuente.videoWidth, 640 / fuente.videoHeight);
      lienzo.width = Math.max(2, Math.round(fuente.videoWidth * escala));
      lienzo.height = Math.max(2, Math.round(fuente.videoHeight * escala));
      const ctx = lienzo.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(fuente, 0, 0, lienzo.width, lienzo.height);
      const instante = performance.now() / 1000;
      ocupado = true;
      lienzo.toBlob(blob => { ocupado = false; if (vigente && blob) buffer.agregar(blob, instante); }, 'image/jpeg', 0.7);
    }, 200);
    return () => { vigente = false; clearInterval(timer); buffer.limpiar(); };
  }, [estado, bufferClip]);

  async function analizar(id, version) {
    if (actual.current !== id || versionIA.current !== version || !iaHabilitada.current || !video.current || !canvas.current) return;
    try {
      const fuente = video.current;
      if (!fuente.videoWidth || !fuente.videoHeight) throw new Error('La cámara no entrega imágenes.');
      const ancho = 640;
      const alto = Math.max(1, Math.round(ancho * fuente.videoHeight / fuente.videoWidth));
      const lienzo = canvas.current;
      lienzo.width = ancho;
      lienzo.height = alto;
      const contexto = lienzo.getContext('2d');
      contexto.drawImage(fuente, 0, 0, ancho, alto);
      const tiempoCaptura = performance.now() / 1000;
      const blob = await new Promise(resolve => lienzo.toBlob(resolve, 'image/jpeg', 0.75));
      if (!blob || actual.current !== id || versionIA.current !== version) return;
      solicitud.current = new AbortController();
      const resultado = await analizarFotograma(blob, solicitud.current.signal);
      if (actual.current !== id || versionIA.current !== version || !iaHabilitada.current) return;
      const config = ajustes.current;
      let detecciones = resultado.detecciones || [];
      muestraAnalizada.current = { imagen: blob, tiempo: tiempoCaptura, detecciones };
      if (config.zona.length) {
        // Una pausa larga de muestreo no demuestra que el vehículo siguiera quieto.
        if (!seguimiento.current) {
          seguimiento.current = crearSeguimiento({ ...config, ancho, alto, toleranciaPerdida: 2 });
          pistasEnviadas.current.clear();
        }
        const resultadoSeguimiento = seguimiento.current(detecciones, tiempoCaptura);
        detecciones = resultadoSeguimiento.detecciones;
        if (automaticoRef.current) for (const aviso of resultadoSeguimiento.avisos) {
          if (pistasEnviadas.current.has(aviso.id)) continue;
          pistasEnviadas.current.add(aviso.id);
          if (blob.type !== 'image/jpeg' || blob.size > 1024 * 1024) { desactivarRegistro(); setAvisoRegistro('El fotograma no es válido; registro automático detenido.'); continue; }
          const datos = { ...crearEventoCamara(aviso, crypto.randomUUID(), new Date().toISOString()), camara: nombreCamara.current, evidencia: blob };
          tiemposClip.current.set(datos.id, tiempoCaptura);
          void enviarEvento(datos);
        }
        ultimoFotograma.current = tiempoCaptura;
      }
      contexto.font = '16px sans-serif';
      contexto.lineWidth = 2;
      for (const deteccion of filtrarDetecciones(detecciones, configuracionRef.current ? modoDeteccionesRef.current : 'zona')) {
        const [x1, y1, x2, y2] = deteccion.caja;
        contexto.strokeStyle = colorDeteccionMonitor(deteccion);
        contexto.strokeRect(x1, y1, x2 - x1, y2 - y1);
        const texto = `${nombres[deteccion.clase] || deteccion.clase} ${Math.round(deteccion.confianza * 100)}%${deteccion.permanencia?.superaUmbral ? ' · revisar' : deteccion.permanencia ? ` · ${deteccion.permanencia.segundos.toFixed(1)}/${config.segundos} s` : ''}`;
        const y = Math.max(19, y1);
        contexto.fillStyle = '#111';
        contexto.fillRect(x1, y - 19, contexto.measureText(texto).width + 8, 20);
        contexto.fillStyle = '#fff';
        contexto.fillText(texto, x1 + 4, y - 4);
      }
      setEstado('activa');
      temporizador.current = setTimeout(() => analizar(id, version), 200);
    } catch (error) {
      if (actual.current !== id || versionIA.current !== version) return;
      iaHabilitada.current = false;
      setIaActiva(false);
      desactivarRegistro();
      setMensaje(error.message === 'La cámara no entrega imágenes.' ? error.message
        : 'No se pudo analizar la imagen. La cámara sigue activa; comprueba el procesador seleccionado.');
    }
  }

  async function activarIA(id = actual.current, configInicial = null) {
    if (!flujo.current || iaHabilitada.current) return;
    const version = ++versionIA.current;
    setIaIniciando(true);
    setMensaje('');
    try {
      solicitud.current = new AbortController();
      await estadoCamaraDemo(solicitud.current.signal);
      if (actual.current !== id || versionIA.current !== version || !flujo.current) return;
      const config = configInicial || guardadoLocal.current;
      configurarSeguimiento(config.zona, config.segundos);
      if (config.automatico && config.zona.length) {
        automaticoRef.current = true;
        setAutomatico(true);
      }
      iaHabilitada.current = true;
      setIaActiva(true);
      void analizar(id, version);
    } catch {
      if (actual.current === id && versionIA.current === version) {
        setMensaje('No se pudo activar la IA. La cámara sigue activa; comprueba el procesador seleccionado.');
      }
    } finally {
      if (versionIA.current === version) setIaIniciando(false);
    }
  }

  function detenerIA() {
    versionIA.current += 1;
    iaHabilitada.current = false;
    muestraAnalizada.current = null;
    clearTimeout(temporizador.current);
    solicitud.current?.abort();
    setIaActiva(false);
    setIaIniciando(false);
    desactivarRegistro();
    setDibujando(false);
    configurarSeguimiento(zona, Number(segundos));
    setMensaje('IA detenida. La cámara continúa en directo.');
  }

  async function iniciar(dispositivoElegido = '') {
    liberar();
    desactivarRegistro(); setAvisoRegistro('');
    setZona([]); setBorrador([]); setDibujando(false); setMostrarZona(false); setErrorZona('');
    configurarSeguimiento([], Number(segundos));
    setIaActiva(false); setIaIniciando(false);
    const id = actual.current;
    setEstado('iniciando');
    setMensaje('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('La cámara no está disponible en este navegador.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: dispositivoElegido ? { deviceId: { exact: dispositivoElegido } } : true, audio: false });
      if (actual.current !== id) { stream.getTracks().forEach(track => track.stop()); return; }
      flujo.current = stream;
      const idDispositivo = stream.getVideoTracks()[0]?.getSettings?.().deviceId || dispositivoElegido;
      nombreCamara.current = `Local: ${stream.getVideoTracks()[0]?.label || 'cámara laptop o USB'}`.slice(0, 100);
      setDispositivo(idDispositivo || '');
      let idLectura = '';
      if (idDispositivo && crypto.subtle) {
        try {
          const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(idDispositivo));
          idLectura = `local-${Array.from(new Uint8Array(hash).slice(0, 12), byte => byte.toString(16).padStart(2, '0')).join('')}`;
        } catch { /* La vista sigue funcionando si el navegador no identifica la fuente. */ }
      }
      if (actual.current !== id) { stream.getTracks().forEach(track => track.stop()); return; }
      setIdentificadorLectura(idLectura);
      let guardado = null;
      if (idDispositivo) {
        try {
          const datos = JSON.parse(localStorage.getItem(`camara-local-config:${idDispositivo}`) || 'null');
          if (datos && (datos.zona?.length === 0 || zonaValida(datos.zona)) && Number.isInteger(datos.segundos) && datos.segundos >= 2 && datos.segundos <= 120) guardado = datos;
        } catch { /* El navegador puede bloquear o tener datos inválidos. */ }
      }
      const configInicial = guardado || { zona: [], segundos: 5, automatico: false };
      guardadoLocal.current = configInicial;
      setZona(configInicial.zona); setSegundos(String(configInicial.segundos));
      configurarSeguimiento(configInicial.zona, configInicial.segundos);
      setAvisoGuardado(guardado ? 'Configuración guardada recuperada para esta cámara.' : '');
      try {
        const lista = await navigator.mediaDevices.enumerateDevices();
        if (actual.current !== id) { stream.getTracks().forEach(track => track.stop()); return; }
        setDispositivos(lista.filter(item => item.kind === 'videoinput'));
      } catch { setDispositivos([]); }
      stream.getVideoTracks()[0].onended = () => {
        if (actual.current !== id) return;
        liberar();
        setIaActiva(false); setIaIniciando(false);
        setEstado('error');
        setMensaje('La cámara dejó de estar disponible.');
      };
      video.current.srcObject = stream;
      await video.current.play();
      if (actual.current === id) { setEstado('activa'); void activarIA(id, configInicial); }
    } catch (error) {
      if (actual.current !== id) return;
      liberar();
      setEstado('error');
      setMensaje(error.name === 'NotAllowedError' ? 'Se denegó el permiso de cámara en el navegador.'
        : error.name === 'NotFoundError' ? 'No se encontró una cámara disponible.'
        : error.message === 'La cámara no está disponible en este navegador.' ? error.message
        : 'No se pudo iniciar. Comprueba la cámara y el procesador seleccionado.');
    }
  }

  function detener() {
    liberar();
    setIaActiva(false); setIaIniciando(false);
    desactivarRegistro();
    setZona([]); setBorrador([]); setDibujando(false); setMostrarZona(false);
    configurarSeguimiento([], Number(segundos));
    setEstado('inicial');
    setMensaje('');
  }

  function guardarConfiguracion() {
    if (!dispositivo) { setAvisoGuardado('El navegador no identificó esta cámara; no se puede guardar su configuración por separado.'); return; }
    if (dibujando || !tiempoValido) { setAvisoGuardado('Termina la zona e indica un tiempo válido antes de guardar.'); return; }
    try {
      localStorage.setItem(`camara-local-config:${dispositivo}`, JSON.stringify({ zona, segundos: Number(segundos), automatico }));
      guardadoLocal.current = { zona, segundos: Number(segundos), automatico };
      configurarSeguimiento(zona, Number(segundos));
      automaticoRef.current = Boolean(automatico && zona.length && iaHabilitada.current);
      setAvisoGuardado('Configuración guardada en este navegador.');
    } catch { setAvisoGuardado('No se pudo guardar la configuración en este navegador.'); }
  }

  async function capturarFotograma() {
    const fuente = video.current;
    if (!flujo.current || !fuente?.videoWidth || !fuente?.videoHeight) return null;
    const id = actual.current;
    const proporcion = Math.min(1, 1280 / fuente.videoWidth, 1280 / fuente.videoHeight);
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.max(1, Math.round(fuente.videoWidth * proporcion));
    lienzo.height = Math.max(1, Math.round(fuente.videoHeight * proporcion));
    lienzo.getContext('2d').drawImage(fuente, 0, 0, lienzo.width, lienzo.height);
    const imagen = await new Promise(resolve => lienzo.toBlob(resolve, 'image/jpeg', 0.7));
    return actual.current === id ? { imagen, tiempo: performance.now() / 1000 } : null;
  }

  return <section className={`border rounded p-4 mb-5 ${compacto ? 'camara-local-compacta' : ''}`}>
    <div className="camara-local-barra">
    <h3 className="font-semibold">Cámara local</h3>
    <button type="button" onClick={() => iniciar(dispositivo)} disabled={['iniciando', 'activa'].includes(estado)}
      className="bg-indigo-600 text-white rounded px-3 py-2 mr-3 disabled:opacity-50">
      {estado === 'iniciando' ? 'Iniciando…' : 'Iniciar cámara'}
    </button>
    <button type="button" onClick={detener} disabled={!['iniciando', 'activa'].includes(estado)}
      className="border rounded px-3 py-2 disabled:opacity-50">Detener cámara</button>
    {!compacto && estado === 'activa' && (iaActiva
      ? <button type="button" onClick={detenerIA} className="border rounded px-3 py-2 ml-2">Detener IA de laptop</button>
      : <button type="button" onClick={() => activarIA()} disabled={iaIniciando} className="border rounded px-3 py-2 ml-2">{iaIniciando ? 'Iniciando IA…' : 'Activar IA de laptop'}</button>)}
    {compacto && <button type="button" className="mosaico-ampliar" onClick={onAmpliar} aria-label={ampliado ? 'Reducir cámara local' : 'Ampliar cámara local'}>{ampliado ? <FaCompress /> : <FaExpand />}</button>}
    </div>
    {estado === 'activa' && dispositivos.length > 1 && <label className="camara-local-dispositivo">Cámara: <select value={dispositivo} onChange={event => iniciar(event.target.value)}>{dispositivos.map((item, indice) => <option key={item.deviceId} value={item.deviceId}>{item.label || `Cámara ${indice + 1}`}</option>)}</select></label>}
    {mensaje && <p role="alert" className="text-red-700 mt-2">{mensaje}</p>}
    <div ref={setVisorPiscina} hidden={estado !== 'activa'} className="camara-zona-marco mt-3">
      <video ref={video} muted playsInline hidden={iaActiva} className="camara-zona-imagen" aria-label="Cámara de laptop en directo" />
      <canvas ref={canvas} hidden={!iaActiva} className="camara-zona-imagen" aria-label="Cámara con detecciones" />
      {iaActiva && configuracion && regla !== 'piscina' && <ZonaVideo puntos={dibujando ? borrador : mostrarZona ? zona : []} activa={dibujando}
        onAgregar={punto => setBorrador(actual => actual.length < 30 ? [...actual, punto] : actual)} />}
    </div>
    {compacto && estado !== 'activa' && <div className="camara-local-placeholder">Inicia la cámara para ver la imagen</div>}
    {configuracion && estado === 'activa' && <label className="selector-incidencia">Tipo de incidencia: <select value={regla} onChange={e => setRegla(e.target.value)}><option value="estacionamiento">Estacionamiento prohibido</option><option value="piscina">Persona sola cerca de piscina</option></select></label>}
    {estado === 'activa' && iaActiva && <div className="mt-3" hidden={!configuracion || regla === 'piscina'}>
      <ModoDetecciones value={modoDetecciones} tieneZona={zona.length > 0} onChange={modo => { modoDeteccionesRef.current = modo; setModoDetecciones(modo); }} />
      <h4 className="font-medium">Incidencias · zona de estacionamiento</h4>
      <p className="text-sm mt-1">Dibuja la zona y define el tiempo permitido.</p>
      {!dibujando ? <div className="flex flex-wrap gap-2 mt-2">
        <button type="button" className="border rounded px-3 py-2" onClick={() => {
          setBorrador([]); setDibujando(true); setErrorZona('');
        }}>{zona.length ? 'Cambiar zona' : 'Dibujar zona'}</button>
        {zona.length > 0 && <>
          <button type="button" className="border rounded px-3 py-2" onClick={() => setMostrarZona(actual => !actual)}>{mostrarZona ? 'Ocultar zona' : 'Mostrar zona'}</button>
          <button type="button" className="action-danger border rounded px-3 py-2" onClick={() => { setZona([]); setAutomatico(false); setMostrarZona(false); }}>Borrar zona</button>
        </>}
      </div> : <div className="mt-2">
        <p className="text-sm">Marca al menos 3 puntos sobre la imagen. Puntos: {borrador.length} de 30.</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <button type="button" className="bg-indigo-600 text-white rounded px-3 py-2" onClick={() => {
            if (!zonaValida(borrador)) { setErrorZona('Marca al menos 3 puntos distintos formando una zona sin cruces.'); return; }
            setZona(borrador); setDibujando(false); setMostrarZona(false); setErrorZona('');
          }}>Completar zona</button>
          <button type="button" className="border rounded px-3 py-2" disabled={!borrador.length} onClick={() => setBorrador(actual => actual.slice(0, -1))}>Deshacer punto</button>
          <button type="button" className="border rounded px-3 py-2" onClick={() => { setDibujando(false); setErrorZona(''); }}>Cancelar</button>
        </div>
      </div>}
      {errorZona && <p role="alert" className="text-red-700 mt-2">{errorZona}</p>}
      {zona.length > 0 && !dibujando && <div className="mt-2 text-sm">
        <label>Tiempo mínimo detenido (2 a 120 segundos):{' '}
          <input type="number" min="2" max="120" step="1" value={segundos} className="border rounded p-1 w-20"
            onChange={event => setSegundos(event.target.value)} />
        </label>
        {!tiempoValido && <p role="alert" className="text-red-700">Introduce un número entero entre 2 y 120 para activar la detección.</p>}
        <label className="block mt-2"><input type="checkbox" checked={automatico} disabled={!tiempoValido}
          onChange={event => {
            setAutomatico(event.target.checked);
          }} />{' '}Registrar automáticamente los hallazgos de esta cámara de prueba y avisar a los guardias.</label>
      </div>}
    </div>}
    {estado === 'activa' && <ReglaPiscina fuente={`local-${dispositivo}`} nombre={nombreCamara.current} muestraAnalizada={muestraAnalizada} visor={visorPiscina} activo={iaActiva} configuracion={configuracion} seleccionada={regla === 'piscina'} pie={piePiscina} onRegistrarEvento={registrarConClip} />}
    {configuracion && estado === 'activa' && <section className="configuracion-placas-camara" aria-label="Lectura de placas de la cámara local">
      <h4>Lectura de placas</h4>
      {iaActiva && <LecturaAutomaticaImou key={dispositivo} muestraAnalizada={muestraAnalizada} cameraId={identificadorLectura} />}
      <ConsultaPlacaFotograma key={dispositivo} obtenerFotograma={capturarFotograma} cameraId={identificadorLectura} />
    </section>}
    {avisoRegistro && <p role="status" className="mt-2">{avisoRegistro}</p>}
    {pendientes.length > 0 && <div role="alert" className="mt-3 border rounded p-3 text-red-700">
      <p>No se pudo confirmar el registro de {pendientes.length} evento(s). Reintenta antes de cerrar o recargar; se conservará el identificador para evitar duplicados por reintento.</p>
      {pendientes.map(datos => <button key={datos.id} type="button" disabled={reintentando} className="border rounded px-3 py-1 mt-2 mr-2 disabled:opacity-50"
        onClick={async () => { setReintentando(true); try { await enviarEvento(datos, true); } finally { setReintentando(false); } }}>Reintentar registro</button>)}
    </div>}
    {configuracion && regla !== 'piscina' && estado === 'activa' && iaActiva && <div className="configuracion-guardar">
      {avisoGuardado && <p role="status">{avisoGuardado}</p>}
      <button type="button" disabled={dibujando || !tiempoValido} className="bg-indigo-600 text-white rounded px-3 py-2" onClick={guardarConfiguracion}>Guardar configuración</button>
      <p>Guarda la zona y los avisos en este navegador.</p>
    </div>}
    {configuracion && <div ref={setPiePiscina} />}
  </section>;
}
