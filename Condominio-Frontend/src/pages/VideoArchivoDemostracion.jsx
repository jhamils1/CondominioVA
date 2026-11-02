import React, { useEffect, useRef, useState } from 'react';
import { analizarFotograma, estadoCamaraDemo } from '../api/visionDemoApi.js';
import './VideoArchivoDemostracion.css';

const nombres = { person: 'persona', car: 'automóvil', motorcycle: 'motocicleta',
  bus: 'autobús', truck: 'camión', cat: 'gato', dog: 'perro' };
const MAX_BYTES = 250 * 1024 * 1024;
const MAX_SEGUNDOS = 300;
const INTERVALO = 0.5;

function dibujarCajas(contexto, detecciones) {
  contexto.font = '16px sans-serif';
  contexto.lineWidth = 2;
  for (const deteccion of detecciones) {
    const [x1, y1, x2, y2] = deteccion.caja;
    contexto.strokeStyle = '#00ff40';
    contexto.strokeRect(x1, y1, x2 - x1, y2 - y1);
    const texto = `${nombres[deteccion.clase] || deteccion.clase} ${Math.round(deteccion.confianza * 100)}%`;
    const y = Math.max(19, y1);
    contexto.fillStyle = '#111';
    contexto.fillRect(x1, y - 19, contexto.measureText(texto).width + 8, 20);
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

export default function VideoArchivoDemostracion() {
  const video = useRef(null);
  const videoAnalizado = useRef(null);
  const canvas = useRef(null);
  const solicitud = useRef(null);
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

  useEffect(() => () => {
    solicitud.current?.abort();
    cancelAnimationFrame(animacion.current);
  }, []);
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
    setProgreso(''); setMensaje(''); setEstado('inicial');
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

  async function iniciar() {
    if (!video.current || !canvas.current || !duracion) return;
    const controlador = new AbortController();
    solicitud.current = controlador;
    reproducible.current = false;
    resultados.current = [];
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
        const detecciones = resultado.detecciones || [];
        resultados.current.push(detecciones);
        dibujarCajas(contexto, detecciones);
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
        'No se pudo analizar el video. Comprueba que el procesador local esté iniciado y que el navegador pueda abrir el archivo.');
    }
  }

  function detener() {
    solicitud.current?.abort();
    setEstado('inicial');
    setMensaje('Análisis detenido.');
  }

  function pintarReproduccion() {
    const fuente = videoAnalizado.current || video.current;
    const lienzo = canvas.current;
    if (!reproducible.current || !fuente || !lienzo || fuente.readyState < 2) return;
    const contexto = lienzo.getContext('2d');
    contexto.clearRect(0, 0, lienzo.width, lienzo.height);
    const indice = Math.min(Math.floor(fuente.currentTime / INTERVALO), resultados.current.length - 1);
    dibujarCajas(contexto, resultados.current[Math.max(0, indice)] || []);
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

  return <section className="border rounded p-4 mb-5">
    <h3 className="font-semibold">Analizar un video desde un archivo</h3>
    <p className="my-2 text-sm">Selecciona un video de hasta 5 minutos y 250 MB. Se analiza una imagen cada medio segundo; el archivo completo no se guarda en el servidor. No se crean alertas.</p>
    <label className="block my-2">Seleccionar video
      <input type="file" accept="video/*" onChange={seleccionar} disabled={estado === 'procesando'}
        className="block mt-1 max-w-full" />
    </label>
    {nombre && <p className="text-sm break-all">{nombre}</p>}
    {url && <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="min-w-0">
        <h4 className="font-medium mb-2">Video original</h4>
        <video ref={video} src={url} controls={estado !== 'procesando'} muted playsInline preload="metadata"
          onPointerDown={() => { controlActual.current = 'original'; }}
          onKeyDown={() => { controlActual.current = 'original'; }}
          onLoadedMetadata={cargarDatos} onPlay={() => reproducir('original')} onPause={() => pausar('original')}
          onTimeUpdate={() => sincronizarPosicion('original', 0.35)}
          onVolumeChange={() => controlarSonido('original')}
          onSeeked={() => posicionCambiada('original')}
          onError={() => { setDuracion(0); setMensaje('El navegador no puede abrir este video.'); }}
          className="w-full max-h-96 bg-black" />
      </div>
      <div className="min-w-0">
        <h4 className="font-medium mb-2">Video analizado</h4>
        {!progreso && <p className="text-sm">Las detecciones aparecerán aquí al iniciar el análisis.</p>}
        <div ref={visor} className="visor-analizado">
          <div className={`visor-marco ${progreso ? '' : 'hidden'}`}
            style={{ '--proporcion': proporcion }}>
            {estado === 'terminado' && <video ref={videoAnalizado} src={url} controls muted playsInline preload="auto"
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
            {estado === 'terminado' && <button type="button" className="boton-pantalla-analizada"
              onClick={alternarPantallaCompleta} title={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
              aria-label={pantallaCompleta ? 'Salir de pantalla completa del video analizado' : 'Pantalla completa del video analizado'}>⛶</button>}
          </div>
        </div>
      </div>
    </div>}
    <div className="mt-3">
      <button type="button" onClick={iniciar} disabled={!duracion || estado === 'procesando'}
        className="bg-indigo-600 text-white rounded px-3 py-2 mr-3 disabled:opacity-50">
        {estado === 'procesando' ? 'Analizando…' : 'Analizar video'}
      </button>
      <button type="button" onClick={detener} disabled={estado !== 'procesando'}
        className="border rounded px-3 py-2 disabled:opacity-50">Detener análisis</button>
    </div>
    {progreso && <p role="status" className="text-sm mt-2">{progreso}</p>}
    {estado === 'terminado' && <p className="text-sm mt-2">Los recuadros se basan en una imagen analizada cada medio segundo y pueden no coincidir exactamente con objetos en movimiento.</p>}
    {mensaje && <p role={estado === 'error' ? 'alert' : 'status'} className="mt-2">{mensaje}</p>}
  </section>;
}
