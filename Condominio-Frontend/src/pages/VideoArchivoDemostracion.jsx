import React, { useEffect, useRef, useState } from 'react';
import { analizarFotograma, estadoCamaraDemo } from '../api/visionDemoApi.js';
import { zonaValida } from '../vision/zonas.js';
import { crearSeguimiento } from '../vision/permanencia.js';
import { crearSeguimientoPiscina } from '../vision/personaSolaPiscina.js';
import { colorDeteccion, esVehiculo, filtrarDetecciones } from '../vision/coloresDeteccion.js';
import ModoDetecciones from '../components/ModoDetecciones.jsx';
import { crearEventoVideo } from '../vision/eventoVideo.js';
import { exportarVideo } from '../vision/exportarVideo.js';
import ZonaVideo from './ZonaVideo.jsx';
import './VideoArchivoDemostracion.css';

const nombres = { person: 'persona', car: 'automóvil', motorcycle: 'motocicleta',
  bus: 'autobús', truck: 'camión', cat: 'gato', dog: 'perro' };
const vehiculos = new Set(['car', 'motorcycle', 'bus', 'truck']);
const MAX_BYTES = 250 * 1024 * 1024;
const MAX_SEGUNDOS = 300;
const INTERVALO = 0.5;

function dibujarCajas(contexto, detecciones, segundos, tieneZona, modo, tipo = 'estacionamiento') {
  contexto.font = '600 14px system-ui, sans-serif';
  contexto.lineWidth = 2;
  for (const deteccion of filtrarDetecciones(detecciones, modo, tipo === 'piscina' ? 'personas' : 'vehiculos')) {
    if (!Array.isArray(deteccion.caja) || deteccion.caja.length !== 4 ||
        !deteccion.caja.every(Number.isFinite) || !Number.isFinite(deteccion.confianza)) continue;
    const [x1, y1, x2, y2] = deteccion.caja;
    const color = tipo === 'piscina' && deteccion.permanencia && !deteccion.permanencia.superaUmbral ? '#ffc247' : colorDeteccion(deteccion);
    contexto.strokeStyle = color;
    contexto.strokeRect(x1, y1, x2 - x1, y2 - y1);
    if (tieneZona && vehiculos.has(deteccion.clase)) {
      contexto.beginPath(); contexto.arc((x1 + x2) / 2, y2, 4, 0, Math.PI * 2);
      contexto.fillStyle = color; contexto.fill(); contexto.strokeStyle = '#fff'; contexto.stroke();
    }
    const permanencia = deteccion.permanencia;
    const nombre = modo !== 'todas' && esVehiculo(deteccion) ? 'Vehículo detectado' : nombres[deteccion.clase] || deteccion.clase;
    const texto = `${nombre} ${Math.round(deteccion.confianza * 100)}%${permanencia ? permanencia.superaUmbral ? ' · revisar' : ` · ${permanencia.segundos.toFixed(1)}/${segundos} s en zona` : ''}`;
    const y = Math.max(19, y1);
    contexto.fillStyle = 'rgba(5, 20, 36, 0.88)';
    contexto.fillRect(x1, y - 19, contexto.measureText(texto).width + 10, 20);
    contexto.fillStyle = '#fff';
    contexto.fillText(texto, x1 + 4, y - 4);
  }
}

function buscarFotograma(video, tiempo, signal) {
  return new Promise((resolve, reject) => {
    let temporizador;
    function limpiar() {
      clearTimeout(temporizador);
      video.removeEventListener('seeked', completado);
      video.removeEventListener('error', fallido);
      signal.removeEventListener('abort', cancelado);
    }
    function completado() { limpiar(); resolve(); }
    function fallido() { limpiar(); reject(new Error('No se pudo leer el video.')); }
    function cancelado() { limpiar(); reject(new DOMException('Cancelado', 'AbortError')); }
    if (signal.aborted) return cancelado();
    if (Math.abs(video.currentTime - tiempo) < 0.000001 && video.readyState >= 2) return resolve();
    video.addEventListener('seeked', completado, { once: true });
    video.addEventListener('error', fallido, { once: true });
    signal.addEventListener('abort', cancelado, { once: true });
    temporizador = setTimeout(fallido, 10000);
    try { video.currentTime = tiempo; } catch { fallido(); }
  });
}

export default function VideoArchivoDemostracion({ onPrepararEvento, onRegistrarEvento }) {
  const video = useRef(null);
  const videoAnalizado = useRef(null);
  const canvas = useRef(null);
  const solicitud = useRef(null);
  const exportacion = useRef(null);
  const desmontado = useRef(false);
  const resultados = useRef([]);
  const reproducible = useRef(false);
  const animacion = useRef(null);
  const visor = useRef(null);
  const controlActual = useRef('original');
  const ignorar = useRef({
    original: { play: false, pause: false, seek: false },
    analizado: { play: false, pause: false, seek: false },
  });
  const [url, setUrl] = useState('');
  const [nombre, setNombre] = useState('');
  const [duracion, setDuracion] = useState(0);
  const [estado, setEstado] = useState('inicial');
  const [mensaje, setMensaje] = useState('');
  const [progreso, setProgreso] = useState('');
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [proporcion, setProporcion] = useState(16 / 9);
  const [zona, setZona] = useState([]);
  const [mostrarZona, setMostrarZona] = useState(false);
  const [borradorZona, setBorradorZona] = useState([]);
  const [marcandoZona, setMarcandoZona] = useState(false);
  const [errorZona, setErrorZona] = useState('');
  const [umbral, setUmbral] = useState('15');
  const [tipoRegla, setTipoRegla] = useState('estacionamiento');
  const [modoDetecciones, setModoDetecciones] = useState('todas');
  const modoDeteccionesRef = useRef('todas');
  const [hallazgos, setHallazgos] = useState([]);
  const [registroAutomatico, setRegistroAutomatico] = useState(false);
  const [pendientes, setPendientes] = useState([]);
  const [reintentando, setReintentando] = useState(false);
  const [registrados, setRegistrados] = useState(0);
  const [sinGuardias, setSinGuardias] = useState(0);
  const [exportando, setExportando] = useState(false);
  const [avanceExportacion, setAvanceExportacion] = useState(0);
  const [mensajeExportacion, setMensajeExportacion] = useState('');
  const umbralValido = Number.isInteger(Number(umbral)) && Number(umbral) >= 2 && Number(umbral) <= 120;

  useEffect(() => { desmontado.current = false; return () => {
    desmontado.current = true;
    solicitud.current?.abort();
    exportacion.current?.abort();
    cancelAnimationFrame(animacion.current);
  }; }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  useEffect(() => {
    function sincronizarPantalla() { setPantallaCompleta(document.fullscreenElement === visor.current); }
    document.addEventListener('fullscreenchange', sincronizarPantalla);
    return () => document.removeEventListener('fullscreenchange', sincronizarPantalla);
  }, []);

  function seleccionar(event) {
    solicitud.current?.abort();
    cancelAnimationFrame(animacion.current);
    reproducible.current = false;
    resultados.current = [];
    ignorar.current = {
      original: { play: false, pause: false, seek: false },
      analizado: { play: false, pause: false, seek: false },
    };
    const archivo = event.target.files?.[0];
    event.target.value = '';
    setDuracion(0);
    setRegistroAutomatico(true);
    setZona([]); setMostrarZona(false); setBorradorZona([]); setMarcandoZona(false); setErrorZona('');
    setProgreso(''); setMensaje(''); setEstado('inicial');
    setMensajeExportacion('');
    setHallazgos([]);
    setUrl(''); setNombre('');
    if (!archivo) return;
    if (archivo.size > MAX_BYTES || archivo.size === 0) {
      setMensaje('Elige un video de hasta 250 MB.');
      return;
    }
    setNombre(archivo.name);
    setUrl(URL.createObjectURL(archivo));
  }

  function cargarDatos() {
    const segundos = video.current?.duration;
    if (!Number.isFinite(segundos) || segundos <= 0 || segundos > MAX_SEGUNDOS) {
      setMensaje('El video debe tener una duración de hasta 5 minutos.');
      setDuracion(0);
      return;
    }
    setDuracion(segundos);
    if (video.current.videoWidth && video.current.videoHeight) {
      setProporcion(video.current.videoWidth / video.current.videoHeight);
    }
  }

  function empezarZona() {
    video.current?.pause();
    setBorradorZona([]);
    setErrorZona('');
    setMarcandoZona(true);
  }

  function agregarPuntoZona(punto) {
    setErrorZona('');
    setBorradorZona(actual => actual.length < 30 ? [...actual, punto] : actual);
  }

  function completarZona() {
    if (!zonaValida(borradorZona)) {
      setErrorZona('Marca al menos 3 puntos distintos formando una zona sin cruces.');
      return;
    }
    invalidarResultados();
    setZona(borradorZona);
    setMostrarZona(false);
    setMarcandoZona(false);
    setErrorZona('');
  }

  function invalidarResultados() {
    reproducible.current = false;
    resultados.current = [];
    cancelAnimationFrame(animacion.current);
    video.current?.pause();
    videoAnalizado.current?.pause();
    setHallazgos([]); setProgreso(''); setMensaje(''); setEstado('inicial');
  }

  async function iniciar() {
    if (!video.current || !canvas.current || !duracion || (zona.length && !umbralValido)) return;
    const controlador = new AbortController();
    solicitud.current = controlador;
    reproducible.current = false;
    resultados.current = [];
    setHallazgos([]);
    setRegistrados(0);
    setSinGuardias(0);
    cancelAnimationFrame(animacion.current);
    videoAnalizado.current?.pause();
    controlActual.current = 'original';
    setEstado('procesando'); setMensaje(''); setProgreso('');
    const fuente = video.current;
    fuente.pause();
    try {
      await estadoCamaraDemo(controlador.signal);
      const ancho = 640;
      const alto = Math.max(1, Math.round(ancho * fuente.videoHeight / fuente.videoWidth));
      if (!fuente.videoWidth || !fuente.videoHeight || alto > 1280) {
        throw new Error('El formato o las dimensiones del video no son compatibles.');
      }
      const lienzo = canvas.current;
      lienzo.width = ancho; lienzo.height = alto;
      const contexto = lienzo.getContext('2d');
      const seguimiento = zona.length ? (tipoRegla === 'piscina' ? crearSeguimientoPiscina({ zona, ancho, alto, segundos: Number(umbral) }) : crearSeguimiento({ zona, ancho, alto, segundos: Number(umbral), toleranciaPerdida: 2 })) : null;
      const total = Math.ceil(duracion / INTERVALO);
      for (let indice = 0; indice < total; indice += 1) {
        const tiempo = Math.min(indice * INTERVALO + 0.001, Math.max(0, duracion - 0.01));
        await buscarFotograma(fuente, tiempo, controlador.signal);
        contexto.drawImage(fuente, 0, 0, ancho, alto);
        const imagen = await new Promise(resolve => lienzo.toBlob(resolve, 'image/jpeg', 0.75));
        if (!imagen) throw new Error('No se pudo leer el fotograma.');
        if (controlador.signal.aborted) throw new DOMException('Cancelado', 'AbortError');
        const resultado = await analizarFotograma(imagen, controlador.signal);
        if (controlador.signal.aborted) throw new DOMException('Cancelado', 'AbortError');
        const analisis = seguimiento?.(resultado.detecciones || [], tiempo);
        const detecciones = analisis?.detecciones || resultado.detecciones || [];
        if (analisis?.avisos.length) {
          setHallazgos(actual => [...actual, ...analisis.avisos]);
          if (registroAutomatico) for (const aviso of analisis.avisos) {
            const datos = { ...crearEventoVideo(aviso, crypto.randomUUID(), new Date().toISOString()), evidencia: imagen };
            try {
              const creado = await onRegistrarEvento(datos);
              setRegistrados(actual => actual + 1);
              if (creado.sin_guardias) setSinGuardias(actual => actual + 1);
            } catch {
              setPendientes(actual => [...actual, datos]);
            }
            if (controlador.signal.aborted) return;
          }
        }
        resultados.current.push(detecciones);
        dibujarCajas(contexto, detecciones, umbral, zona.length > 0, modoDeteccionesRef.current, tipoRegla);
        setProgreso(`${indice + 1} de ${total} imágenes analizadas`);
      }
      reproducible.current = true;
      setEstado('terminado');
      setMensaje('Análisis terminado. Usa los controles de cualquiera de las dos vistas para reproducir ambas.');
      fuente.currentTime = 0;
    } catch (error) {
      if (error.name === 'AbortError' || controlador.signal.aborted) return;
      setEstado('error');
      setMensaje(error.message?.includes('video') ? error.message :
        'No se pudo analizar el video. Comprueba el procesador seleccionado y que el navegador pueda abrir el archivo.');
    }
  }

  function detener() {
    solicitud.current?.abort();
    setEstado('inicial');
    setHallazgos([]);
    setMensaje('Análisis detenido. Los resultados de permanencia incompletos se descartaron.');
  }

  async function reintentarEvento(datos) {
    if (reintentando) return;
    setReintentando(true);
    try {
      const creado = await onRegistrarEvento(datos);
      setPendientes(actual => actual.filter(item => item.id !== datos.id));
      setRegistrados(actual => actual + 1);
      if (creado.sin_guardias) setSinGuardias(actual => actual + 1);
    } catch {
      setMensaje('No se pudo confirmar el registro. Puedes reintentar con el mismo identificador.');
    } finally { setReintentando(false); }
  }

  function pintarReproduccion(modo = modoDeteccionesRef.current) {
    const fuente = videoAnalizado.current || video.current;
    const lienzo = canvas.current;
    if (!reproducible.current || !fuente || !lienzo || fuente.readyState < 2) return;
    const contexto = lienzo.getContext('2d');
    contexto.clearRect(0, 0, lienzo.width, lienzo.height);
    const indice = Math.min(Math.floor(fuente.currentTime / INTERVALO), resultados.current.length - 1);
    dibujarCajas(contexto, resultados.current[Math.max(0, indice)] || [], umbral, zona.length > 0, modo, tipoRegla);
  }

  function otros(lado) {
    return lado === 'original' ? [video.current, videoAnalizado.current] : [videoAnalizado.current, video.current];
  }

  function sincronizarPosicion(lado, limite = 0.15) {
    if (!reproducible.current || controlActual.current !== lado) return;
    const [fuente, otra] = otros(lado);
    if (fuente && otra && Math.abs(fuente.currentTime - otra.currentTime) > limite) {
      const destino = lado === 'original' ? 'analizado' : 'original';
      ignorar.current[destino].seek = true;
      otra.currentTime = fuente.currentTime;
    }
  }

  function reproducir(lado) {
    const sincronizado = ignorar.current[lado].play;
    ignorar.current[lado].play = false;
    if (reproducible.current && !sincronizado) {
      controlActual.current = lado;
      const [, otra] = otros(lado);
      sincronizarPosicion(lado);
      if (otra?.paused) {
        const destino = lado === 'original' ? 'analizado' : 'original';
        ignorar.current[destino].play = true;
        otra.play().catch(() => {
          ignorar.current[destino].play = false;
          setMensaje('No se pudo sincronizar la reproducción.');
        });
      }
    }
    cancelAnimationFrame(animacion.current);
    function actualizar() {
      pintarReproduccion();
      if ((video.current && !video.current.paused) || (videoAnalizado.current && !videoAnalizado.current.paused)) {
        animacion.current = requestAnimationFrame(actualizar);
      }
    }
    actualizar();
  }

  function pausar(lado) {
    const sincronizado = ignorar.current[lado].pause;
    ignorar.current[lado].pause = false;
    if (reproducible.current && !sincronizado) {
      controlActual.current = lado;
      const [, otra] = otros(lado);
      if (otra && !otra.paused) {
        const destino = lado === 'original' ? 'analizado' : 'original';
        ignorar.current[destino].pause = true;
        otra.pause();
      }
    }
    cancelAnimationFrame(animacion.current);
    pintarReproduccion();
  }

  function posicionCambiada(lado) {
    const sincronizado = ignorar.current[lado].seek;
    ignorar.current[lado].seek = false;
    if (reproducible.current && !sincronizado) {
      controlActual.current = lado;
      sincronizarPosicion(lado);
    }
    pintarReproduccion();
  }

  function controlarSonido(lado) {
    const [fuente, otra] = otros(lado);
    if (fuente && otra && !fuente.muted && fuente.volume > 0) otra.muted = true;
  }

  async function alternarPantallaCompleta() {
    try {
      if (document.fullscreenElement === visor.current) await document.exitFullscreen();
      else if (visor.current?.requestFullscreen) await visor.current.requestFullscreen();
      else setMensaje('Este navegador no permite ampliar la vista analizada a pantalla completa.');
    } catch {
      setMensaje('No se pudo ampliar la vista analizada a pantalla completa.');
    }
  }

  async function descargarAnalizado() {
    if (exportacion.current || !reproducible.current || !canvas.current) return;
    const controlador = new AbortController();
    exportacion.current = controlador;
    setExportando(true); setAvanceExportacion(0); setMensajeExportacion('');
    try {
      const blob = await exportarVideo({ src: url, ancho: canvas.current.width, alto: canvas.current.height,
        duracion, resultados: resultados.current.slice(), intervalo: INTERVALO,
        modo: modoDeteccionesRef.current, segundos: umbral, tieneZona: zona.length > 0,
        zonaVisible: mostrarZona ? zona : [], dibujar: (...args) => dibujarCajas(...args, tipoRegla), signal: controlador.signal,
        onProgreso: valor => { if (!desmontado.current) setAvanceExportacion(valor); },
      });
      if (controlador.signal.aborted) return;
      const enlace = document.createElement('a');
      const objeto = URL.createObjectURL(blob);
      enlace.href = objeto;
      enlace.download = `${nombre.replace(/\.[^.]+$/, '') || 'video'}-analizado.webm`;
      enlace.click();
      setTimeout(() => URL.revokeObjectURL(objeto), 60000);
      setMensajeExportacion('Descarga preparada con la visualización seleccionada.');
    } catch (error) {
      if (!controlador.signal.aborted && !desmontado.current) setMensajeExportacion(error.message || 'No se pudo exportar el video.');
    } finally {
      if (exportacion.current === controlador) exportacion.current = null;
      if (!desmontado.current) setExportando(false);
    }
  }

  return <section className="video-analisis-panel border rounded p-4 mb-5">
    <h3 className="font-semibold">Analizar video</h3>
    <p className="my-2 text-sm">Hasta 5 minutos y 250 MB. Se analiza una imagen cada 0,5 segundos.</p>
    <label className="block my-2">Seleccionar video
      <input type="file" accept="video/*" onChange={seleccionar} disabled={estado === 'procesando' || exportando}
        className="block mt-1 max-w-full" />
    </label>
    {nombre && <p className="text-sm break-all">{nombre}</p>}
    {url && <div className="video-comparacion mt-3">
      <div className="min-w-0">
        <h4 className="font-medium mb-2">Video original</h4>
        <div className="zona-original-marco" style={{ '--proporcion': proporcion }}>
        <video ref={video} src={url} controls={estado !== 'procesando' && !marcandoZona} muted playsInline preload="metadata"
          onPointerDown={() => { controlActual.current = 'original'; }}
          onKeyDown={() => { controlActual.current = 'original'; }}
          onLoadedMetadata={cargarDatos} onPlay={() => reproducir('original')} onPause={() => pausar('original')}
          onTimeUpdate={() => sincronizarPosicion('original', 0.35)}
          onVolumeChange={() => controlarSonido('original')}
          onSeeked={() => posicionCambiada('original')}
          onError={() => { setDuracion(0); setMensaje('El navegador no puede abrir este video.'); }}
          className="zona-original-video" />
        <ZonaVideo puntos={marcandoZona ? borradorZona : mostrarZona ? zona : []} activa={marcandoZona}
          onAgregar={agregarPuntoZona} />
        </div>
      </div>
      <div className="min-w-0">
        <h4 className="font-medium mb-2">Video analizado</h4>
        <div ref={visor} className="visor-analizado">
          {!progreso && <div className="video-resultado-vacio" style={{ '--proporcion': proporcion }}>El resultado aparecerá aquí</div>}
          <div className={`visor-marco ${progreso ? '' : 'hidden'}`}
            style={{ '--proporcion': proporcion }}>
            {estado === 'terminado' && <video ref={videoAnalizado} src={url} controls controlsList="nodownload" disablePictureInPicture muted playsInline preload="auto"
              aria-label="Video analizado"
              onPointerDown={() => { controlActual.current = 'analizado'; }}
              onKeyDown={() => { controlActual.current = 'analizado'; }}
              onLoadedData={() => { sincronizarPosicion('original', 0.01); pintarReproduccion(); }}
              onPlay={() => reproducir('analizado')} onPause={() => pausar('analizado')}
              onTimeUpdate={() => sincronizarPosicion('analizado', 0.35)}
              onVolumeChange={() => controlarSonido('analizado')}
              onSeeked={() => posicionCambiada('analizado')} />}
            <canvas ref={canvas} className={estado === 'terminado' ? 'capa-detecciones' : 'imagen-analisis'}
              aria-label="Detecciones del video" />
            {mostrarZona && <ZonaVideo puntos={zona} />}
            {estado === 'terminado' && <button type="button" className="boton-pantalla-analizada"
              onClick={alternarPantallaCompleta} title={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
              aria-label={pantallaCompleta ? 'Salir de pantalla completa del video analizado' : 'Pantalla completa del video analizado'}>⛶</button>}
          </div>
        </div>
        {estado === 'terminado' && <div className="mt-3">
          <button type="button" onClick={descargarAnalizado} disabled={exportando} className="seguridad-primary">Descargar video analizado</button>
          {exportando && <button type="button" className="seguridad-secondary" onClick={() => { exportacion.current?.abort(); setMensajeExportacion('Exportación cancelada.'); }}>Cancelar descarga</button>}
          <p className="text-sm mt-2">WebM sin sonido. Mantén esta pestaña abierta durante la descarga.</p>
          {exportando && <p role="status">Preparando video: {avanceExportacion}%</p>}
          {mensajeExportacion && <p role="status">{mensajeExportacion}</p>}
        </div>}
      </div>
    </div>}
    {url && <div className="video-visualizacion"><ModoDetecciones value={modoDetecciones} tipo={tipoRegla === 'piscina' ? 'personas' : 'vehiculos'} tieneZona={zona.length > 0} disabled={exportando} onChange={modo => { modoDeteccionesRef.current = modo; setModoDetecciones(modo); pintarReproduccion(modo); }} /></div>}
    {url && <div className="zona-acciones mt-4">
      <label>Tipo de incidencia:{' '}<select value={tipoRegla} disabled={estado === 'procesando' || exportando} onChange={event => { invalidarResultados(); setTipoRegla(event.target.value); setZona([]); setBorradorZona([]); setMarcandoZona(false); setUmbral(event.target.value === 'piscina' ? '10' : '15'); }}>
        <option value="estacionamiento">Estacionamiento prohibido</option>
        <option value="piscina">Persona sola cerca de piscina</option>
      </select></label>
      <h4 className="font-medium">{tipoRegla === 'piscina' ? 'Zona de piscina' : 'Zona de estacionamiento prohibido'}</h4>
      <p className="text-sm">Pausa el video y dibuja la zona en la imagen original. Se conserva mientras el video esté abierto.</p>
      {!marcandoZona ? <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={empezarZona} disabled={!duracion || estado === 'procesando' || exportando}
          className="border rounded px-3 py-2 disabled:opacity-50">{zona.length ? 'Cambiar zona' : 'Dibujar zona'}</button>
        {zona.length > 0 && <button type="button" disabled={exportando} onClick={() => setMostrarZona(actual => !actual)} className="border rounded px-3 py-2">{mostrarZona ? 'Ocultar zona' : 'Mostrar zona'}</button>}
        {zona.length > 0 && <button type="button" onClick={() => { invalidarResultados(); setZona([]); }}
          disabled={estado === 'procesando' || exportando} className="border rounded px-3 py-2 disabled:opacity-50">Borrar zona</button>}
      </div> : <div className="mt-2">
        <p className="text-sm">Haz clic en al menos 3 puntos sobre el video. También puedes enfocar la imagen y usar las flechas y Enter.</p>
        <p className="text-sm">Puntos marcados: {borradorZona.length} de 30</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <button type="button" onClick={completarZona} className="bg-indigo-600 text-white rounded px-3 py-2">Completar zona</button>
          <button type="button" onClick={() => setBorradorZona(actual => actual.slice(0, -1))}
            disabled={!borradorZona.length} className="border rounded px-3 py-2 disabled:opacity-50">Deshacer punto</button>
          <button type="button" onClick={() => { setMarcandoZona(false); setErrorZona(''); }}
            className="border rounded px-3 py-2">Cancelar</button>
        </div>
      </div>}
      {errorZona && <p role="alert" className="text-red-700 mt-2">{errorZona}</p>}
      {zona.length > 0 && !marcandoZona && <div className="mt-2">
        <label className="text-sm">{tipoRegla === 'piscina' ? 'Tiempo mínimo sola (segundos, de 2 a 120):' : 'Tiempo mínimo detenido (segundos, de 2 a 120):'}{' '}
          <input type="number" min="2" max="120" step="1" value={umbral} disabled={estado === 'procesando' || exportando}
            onChange={event => { invalidarResultados(); setUmbral(event.target.value); }} className="border rounded p-1 w-20" />
        </label>
        {!umbralValido && <p role="alert" className="text-red-700 text-sm">Introduce un número entero entre 2 y 120.</p>}
        {tipoRegla === 'piscina' ? <p className="text-sm mt-2">Se avisa si hay una persona dentro de la zona y ninguna otra detectada en la imagen durante el tiempo indicado. No detecta ahogamientos ni personas fuera de cámara.</p> : <><p className="text-sm mt-1">Amarillo desde los 5 s detenido en zona. Si el límite es de 5 s o menos, pasa directamente a rojo y solicita el aviso.</p><p className="text-sm mt-2">Se busca un vehículo prácticamente detenido dentro de la zona. Los resultados son orientativos y necesitan revisión.</p></>}
        <label className="block mt-2 text-sm">
          <input type="checkbox" checked={registroAutomatico} disabled={estado === 'procesando'}
            onChange={event => setRegistroAutomatico(event.target.checked)} />{' '}
          Registrar automáticamente los hallazgos de este video y avisar a los guardias.
        </label>
        <p className="text-sm mt-1">Se adjunta una imagen del video; la fecha y ubicación originales no se verifican. Repetir el análisis puede duplicar eventos.</p>
      </div>}
    </div>}
    <div className="mt-3">
      <button type="button" onClick={iniciar} disabled={!duracion || estado === 'procesando' || exportando || marcandoZona || (zona.length > 0 && !umbralValido) || (tipoRegla === 'piscina' && !zona.length)}
        className="bg-indigo-600 text-white rounded px-3 py-2 mr-3 disabled:opacity-50">
        {estado === 'procesando' ? 'Analizando…' : 'Analizar video'}
      </button>
      <button type="button" onClick={detener} disabled={estado !== 'procesando'}
        className="border rounded px-3 py-2 disabled:opacity-50">Detener análisis</button>
    </div>
    {progreso && <p role="status" className="text-sm mt-2">{progreso}</p>}
    {registroAutomatico && <p className="text-sm mt-2">Eventos registrados en este análisis: {registrados}. Los avisos push dependen del procesador y Firebase.</p>}
    {sinGuardias > 0 && <p role="alert" className="text-sm mt-2">{sinGuardias} evento(s) se registraron sin guardias activos para recibir el aviso. El administrador puede reintentar la distribución.</p>}
    {pendientes.length > 0 && <div role="alert" className="mt-3 border rounded p-3 text-red-700">
      <p>No se pudo confirmar el registro de {pendientes.length} evento(s). Si ya se guardó, reintentar usa el mismo identificador. No recargues ni cierres la página antes de resolverlo.</p>
      {pendientes.map(datos => <button key={datos.id} type="button" disabled={reintentando || estado === 'procesando'}
        onClick={() => reintentarEvento(datos)} className="border rounded px-3 py-1 mt-2 mr-2 disabled:opacity-50">Reintentar registro</button>)}
    </div>}
    {estado === 'terminado' && <p className="text-sm mt-2">Los recuadros se basan en una imagen analizada cada medio segundo y pueden no coincidir exactamente con objetos en movimiento.</p>}
    {estado === 'terminado' && zona.length > 0 && <div className="mt-3 border rounded p-3">
      <h4 className="font-medium">{tipoRegla === 'piscina' ? 'Posible persona sola para revisar' : 'Posibles vehículos detenidos para revisar'}</h4>
      {hallazgos.length === 0 ? <p className="text-sm mt-1">No se encontró ninguno que cumpla el tiempo configurado.</p> :
        <ul className="list-disc pl-5 text-sm mt-1">{hallazgos.map((h, i) => <li key={`${h.id}-${i}`}>
          {nombres[h.clase] || h.clase} · aproximadamente {Math.floor(h.duracion)} s {tipoRegla === 'piscina' ? 'sin otra persona detectada' : 'detenido'} ·{' '}
          <button type="button" className="text-indigo-700 underline" onClick={() => {
            if (video.current) { controlActual.current = 'original'; video.current.currentTime = h.tiempo; }
          }}>Ver momento {Math.floor(h.tiempo / 60)}:{String(Math.floor(h.tiempo % 60)).padStart(2, '0')}</button>
          {tipoRegla !== 'piscina' && <> {' · '}<button type="button" className="text-indigo-700 underline" onClick={() => onPrepararEvento({
            clase: nombres[h.clase] || h.clase, tiempo: h.tiempo, duracion: h.duracion,
          })}>Preparar evento manual</button></>}
        </li>)}</ul>}
      <p className="text-sm mt-2">Una pérdida breve de detección pausa el conteo. La lista puede contener repeticiones y no confirma una infracción.</p>
    </div>}
    {mensaje && <p role={estado === 'error' ? 'alert' : 'status'} className="mt-2">{mensaje}</p>}
  </section>;
}
