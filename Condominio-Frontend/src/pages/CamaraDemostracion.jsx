import React, { useEffect, useRef, useState } from 'react';
import { analizarFotograma, estadoCamaraDemo } from '../api/visionDemoApi.js';
import { zonaValida } from '../vision/zonas.js';
import { crearSeguimiento, intervaloNoConfiable } from '../vision/permanencia.js';
import { crearEventoCamara } from '../vision/eventoCamara.js';
import ZonaVideo from './ZonaVideo.jsx';
import './VideoArchivoDemostracion.css';

const nombres = { person: 'persona', car: 'automóvil', motorcycle: 'motocicleta',
  bus: 'autobús', truck: 'camión', cat: 'gato', dog: 'perro' };

export default function CamaraDemostracion({ onRegistrarEvento }) {
  const video = useRef(null);
  const canvas = useRef(null);
  const flujo = useRef(null);
  const actual = useRef(0);
  const solicitud = useRef(null);
  const temporizador = useRef(null);
  const seguimiento = useRef(null);
  const ultimoFotograma = useRef(null);
  const ajustes = useRef({ zona: [], segundos: 5 });
  const automaticoRef = useRef(false);
  const pistasEnviadas = useRef(new Set());
  const [estado, setEstado] = useState('inicial');
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
  const tiempoValido = Number.isInteger(Number(segundos)) && Number(segundos) >= 2 && Number(segundos) <= 120;

  function configurarSeguimiento(nuevaZona, nuevoTiempo) {
    const valido = Number.isInteger(nuevoTiempo) && nuevoTiempo >= 2 && nuevoTiempo <= 120;
    ajustes.current = { zona: valido ? nuevaZona : [], segundos: nuevoTiempo };
    seguimiento.current = null;
    ultimoFotograma.current = null;
    pistasEnviadas.current.clear();
  }

  function desactivarRegistro() {
    automaticoRef.current = false;
    setAutomatico(false);
  }

  async function enviarEvento(datos, reintento = false) {
    try {
      const creado = await onRegistrarEvento(datos);
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
    clearTimeout(temporizador.current);
    solicitud.current?.abort();
    flujo.current?.getTracks().forEach(track => track.stop());
    flujo.current = null;
    seguimiento.current = null;
    ultimoFotograma.current = null;
    if (video.current) video.current.srcObject = null;
  }

  useEffect(() => () => liberar(), []);

  async function analizar(id) {
    if (actual.current !== id || !video.current || !canvas.current) return;
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
      if (!blob || actual.current !== id) return;
      solicitud.current = new AbortController();
      const resultado = await analizarFotograma(blob, solicitud.current.signal);
      if (actual.current !== id) return;
      const config = ajustes.current;
      let detecciones = resultado.detecciones || [];
      if (config.zona.length) {
        // Una pausa larga de muestreo no demuestra que el vehículo siguiera quieto.
        if (!seguimiento.current || intervaloNoConfiable(ultimoFotograma.current, tiempoCaptura)) {
          seguimiento.current = crearSeguimiento({ ...config, ancho, alto });
          pistasEnviadas.current.clear();
        }
        const resultadoSeguimiento = seguimiento.current(detecciones, tiempoCaptura);
        detecciones = resultadoSeguimiento.detecciones;
        if (automaticoRef.current) for (const aviso of resultadoSeguimiento.avisos) {
          if (pistasEnviadas.current.has(aviso.id)) continue;
          pistasEnviadas.current.add(aviso.id);
          const datos = crearEventoCamara(aviso, crypto.randomUUID(), new Date().toISOString());
          void enviarEvento(datos);
        }
        ultimoFotograma.current = tiempoCaptura;
      }
      contexto.font = '16px sans-serif';
      contexto.lineWidth = 2;
      for (const deteccion of detecciones) {
        const [x1, y1, x2, y2] = deteccion.caja;
        contexto.strokeStyle = deteccion.permanencia?.superaUmbral ? '#ff3030' : '#00ff40';
        contexto.strokeRect(x1, y1, x2 - x1, y2 - y1);
        const texto = `${nombres[deteccion.clase] || deteccion.clase} ${Math.round(deteccion.confianza * 100)}%${deteccion.permanencia?.superaUmbral ? ' · revisar' : ''}`;
        const y = Math.max(19, y1);
        contexto.fillStyle = '#111';
        contexto.fillRect(x1, y - 19, contexto.measureText(texto).width + 8, 20);
        contexto.fillStyle = '#fff';
        contexto.fillText(texto, x1 + 4, y - 4);
      }
      setEstado('activa');
      temporizador.current = setTimeout(() => analizar(id), 200);
    } catch (error) {
      if (actual.current !== id) return;
      liberar();
      setEstado('error');
      setMensaje(error.message === 'La cámara no entrega imágenes.' ? error.message
        : 'No se pudo analizar la imagen. Comprueba que el procesador local siga iniciado.');
    }
  }

  async function iniciar() {
    liberar();
    desactivarRegistro(); setAvisoRegistro('');
    setZona([]); setBorrador([]); setDibujando(false); setMostrarZona(false); setErrorZona('');
    configurarSeguimiento([], Number(segundos));
    const id = actual.current;
    setEstado('iniciando');
    setMensaje('');
    try {
      solicitud.current = new AbortController();
      await estadoCamaraDemo(solicitud.current.signal);
      if (actual.current !== id) return;
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('La cámara no está disponible en este navegador.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (actual.current !== id) { stream.getTracks().forEach(track => track.stop()); return; }
      flujo.current = stream;
      stream.getVideoTracks()[0].onended = () => {
        if (actual.current !== id) return;
        liberar();
        setEstado('error');
        setMensaje('La cámara dejó de estar disponible.');
      };
      video.current.srcObject = stream;
      await video.current.play();
      if (actual.current === id) analizar(id);
    } catch (error) {
      if (actual.current !== id) return;
      liberar();
      setEstado('error');
      setMensaje(error.name === 'NotAllowedError' ? 'Se denegó el permiso de cámara en el navegador.'
        : error.name === 'NotFoundError' ? 'No se encontró una cámara disponible.'
        : error.message === 'La cámara no está disponible en este navegador.' ? error.message
        : 'No se pudo iniciar. Comprueba que Django y el procesador local de cámara estén en marcha.');
    }
  }

  function detener() {
    liberar();
    desactivarRegistro();
    setZona([]); setBorrador([]); setDibujando(false); setMostrarZona(false);
    configurarSeguimiento([], Number(segundos));
    setEstado('inicial');
    setMensaje('');
  }

  return <section className="border rounded p-4 mb-5">
    <h3 className="font-semibold">Probar cámara con visión artificial</h3>
    <p className="my-2 text-sm">Prueba para navegador y servidor en esta computadora. Las imágenes se analizan localmente; el registro de eventos debe activarse y no se guardan grabaciones.</p>
    <button type="button" onClick={iniciar} disabled={['iniciando', 'activa'].includes(estado)}
      className="bg-indigo-600 text-white rounded px-3 py-2 mr-3 disabled:opacity-50">
      {estado === 'iniciando' ? 'Iniciando…' : 'Iniciar cámara'}
    </button>
    <button type="button" onClick={detener} disabled={!['iniciando', 'activa'].includes(estado)}
      className="border rounded px-3 py-2 disabled:opacity-50">Detener cámara</button>
    {mensaje && <p role="alert" className="text-red-700 mt-2">{mensaje}</p>}
    <video ref={video} muted playsInline className="hidden" />
    <div className={`camara-zona-marco mt-3 ${estado === 'activa' ? '' : 'hidden'}`}>
      <canvas ref={canvas} className="camara-zona-imagen" aria-label="Cámara con detecciones" />
      <ZonaVideo puntos={dibujando ? borrador : mostrarZona ? zona : []} activa={dibujando}
        onAgregar={punto => setBorrador(actual => actual.length < 30 ? [...actual, punto] : actual)} />
    </div>
    {estado === 'activa' && <div className="mt-3">
      <h4 className="font-medium">Zona temporal de la cámara</h4>
      <p className="text-sm mt-1">Dibuja la zona sobre la imagen. Se oculta durante la vigilancia y se elimina al detener la cámara.</p>
      {!dibujando ? <div className="flex flex-wrap gap-2 mt-2">
        <button type="button" className="border rounded px-3 py-2" onClick={() => {
          desactivarRegistro(); setBorrador([]); setDibujando(true); setErrorZona(''); configurarSeguimiento([], Number(segundos));
        }}>{zona.length ? 'Cambiar zona' : 'Dibujar zona'}</button>
        {zona.length > 0 && <>
          <button type="button" className="border rounded px-3 py-2" onClick={() => setMostrarZona(actual => !actual)}>{mostrarZona ? 'Ocultar zona' : 'Mostrar zona'}</button>
          <button type="button" className="border rounded px-3 py-2" onClick={() => { desactivarRegistro(); setZona([]); setMostrarZona(false); configurarSeguimiento([], Number(segundos)); }}>Borrar zona</button>
        </>}
      </div> : <div className="mt-2">
        <p className="text-sm">Marca al menos 3 puntos sobre la imagen. Puntos: {borrador.length} de 30.</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <button type="button" className="bg-indigo-600 text-white rounded px-3 py-2" onClick={() => {
            if (!zonaValida(borrador)) { setErrorZona('Marca al menos 3 puntos distintos formando una zona sin cruces.'); return; }
            setZona(borrador); setDibujando(false); setMostrarZona(false); setErrorZona('');
            configurarSeguimiento(borrador, Number(segundos));
          }}>Completar zona</button>
          <button type="button" className="border rounded px-3 py-2" disabled={!borrador.length} onClick={() => setBorrador(actual => actual.slice(0, -1))}>Deshacer punto</button>
          <button type="button" className="border rounded px-3 py-2" onClick={() => { setDibujando(false); setErrorZona(''); configurarSeguimiento(zona, Number(segundos)); }}>Cancelar</button>
        </div>
      </div>}
      {errorZona && <p role="alert" className="text-red-700 mt-2">{errorZona}</p>}
      {zona.length > 0 && !dibujando && <div className="mt-2 text-sm">
        <label>Tiempo mínimo detenido (2 a 120 segundos):{' '}
          <input type="number" min="2" max="120" step="1" value={segundos} className="border rounded p-1 w-20"
            onChange={event => { desactivarRegistro(); const valor = event.target.value; setSegundos(valor); const n = Number(valor); configurarSeguimiento(Number.isInteger(n) && n >= 2 && n <= 120 ? zona : [], n); }} />
        </label>
        {!tiempoValido && <p role="alert" className="text-red-700">Introduce un número entero entre 2 y 120 para activar la detección.</p>}
        <p className="mt-1">Un recuadro rojo indica posible permanencia y desaparece cuando deja de cumplirse la regla. Requiere revisión.</p>
        <label className="block mt-2"><input type="checkbox" checked={automatico} disabled={!tiempoValido}
          onChange={event => {
            const activo = event.target.checked;
            automaticoRef.current = activo; setAutomatico(activo);
            configurarSeguimiento(zona, Number(segundos));
          }} />{' '}Registrar automáticamente los hallazgos de esta cámara de prueba y avisar a los guardias.</label>
        <p className="mt-1">El registro puede generar avisos reales. Esta prueba no guarda evidencia ni identifica la cámara; una pérdida de seguimiento puede generar duplicados.</p>
      </div>}
    </div>}
    {avisoRegistro && <p role="status" className="mt-2">{avisoRegistro}</p>}
    {pendientes.length > 0 && <div role="alert" className="mt-3 border rounded p-3 text-red-700">
      <p>No se pudo confirmar el registro de {pendientes.length} evento(s). Reintenta antes de cerrar o recargar; se conservará el identificador para evitar duplicados por reintento.</p>
      {pendientes.map(datos => <button key={datos.id} type="button" disabled={reintentando} className="border rounded px-3 py-1 mt-2 mr-2 disabled:opacity-50"
        onClick={async () => { setReintentando(true); try { await enviarEvento(datos, true); } finally { setReintentando(false); } }}>Reintentar registro</button>)}
    </div>}
  </section>;
}
