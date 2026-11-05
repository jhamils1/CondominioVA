import { useEffect, useRef, useState } from 'react';
import { analizarFotograma, estadoCamaraDemo } from '../api/visionDemoApi.js';
import { crearSeguimiento, intervaloNoConfiable } from '../vision/permanencia.js';
import { zonaValida } from '../vision/zonas.js';
import ZonaVideo from './ZonaVideo.jsx';
import './VideoArchivoDemostracion.css';

const nombres = { person: 'persona', car: 'automóvil', motorcycle: 'motocicleta',
  bus: 'autobús', truck: 'camión', cat: 'gato', dog: 'perro' };

function dibujar(canvas, imagen, detecciones) {
  canvas.width = imagen.width;
  canvas.height = imagen.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imagen, 0, 0);
  ctx.font = '16px sans-serif';
  ctx.lineWidth = 2;
  for (const deteccion of detecciones) {
    if (!Array.isArray(deteccion.caja) || deteccion.caja.length !== 4 ||
        !deteccion.caja.every(Number.isFinite) || !Number.isFinite(deteccion.confianza)) continue;
    const [x1, y1, x2, y2] = deteccion.caja;
    const advertencia = deteccion.permanencia?.superaUmbral;
    const texto = `${nombres[deteccion.clase] || deteccion.clase} ${Math.round(deteccion.confianza * 100)}%${advertencia ? ' · revisar' : ''}`;
    const y = Math.max(19, y1);
    ctx.strokeStyle = advertencia ? '#ff3030' : '#00ff40';
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.fillStyle = '#111';
    ctx.fillRect(x1, y - 19, ctx.measureText(texto).width + 8, 20);
    ctx.fillStyle = '#fff';
    ctx.fillText(texto, x1 + 4, y - 4);
  }
}

export default function AnalisisImou({ ultimoFotograma, automatico, cambiarAutomatico,
  desactivarRegistro, registrarHallazgo, hayPendientes }) {
  const [activo, setActivo] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [zona, setZona] = useState([]);
  const [borrador, setBorrador] = useState([]);
  const [dibujando, setDibujando] = useState(false);
  const [mostrarZona, setMostrarZona] = useState(false);
  const [segundos, setSegundos] = useState('5');
  const [errorZona, setErrorZona] = useState('');
  const [imagenLista, setImagenLista] = useState(false);
  const canvas = useRef(null);
  const ajustes = useRef({ zona: [], segundos: 5, desde: 0 });
  const seguimiento = useRef(null);
  const ultimaMuestra = useRef(null);
  const dimensiones = useRef(null);
  const tiempoValido = Number.isInteger(Number(segundos)) && Number(segundos) >= 2 && Number(segundos) <= 120;

  function configurarSeguimiento(nuevaZona, nuevoTiempo) {
    const valido = Number.isInteger(nuevoTiempo) && nuevoTiempo >= 2 && nuevoTiempo <= 120;
    ajustes.current = { zona: valido ? nuevaZona : [], segundos: nuevoTiempo, desde: performance.now() / 1000 };
    seguimiento.current = null;
    ultimaMuestra.current = null;
    dimensiones.current = null;
  }

  useEffect(() => {
    if (!activo) return;
    let vigente = true;
    let timer;
    const controller = new AbortController();

    async function analizar() {
      try {
        const muestra = ultimoFotograma.current;
        if (!muestra || muestra.tiempo === ultimaMuestra.current) {
          timer = setTimeout(analizar, 200);
          return;
        }
        // Una solicitud a la vez: no se acumulan fotogramas si la IA es lenta.
        const resultado = await analizarFotograma(muestra.imagen, controller.signal);
        if (!vigente) return;
        if (!Array.isArray(resultado.detecciones)) throw new Error('Respuesta inválida');
        const bitmap = await createImageBitmap(muestra.imagen);
        try {
          if (!vigente || !canvas.current) return;
          const config = ajustes.current;
          let detecciones = resultado.detecciones;
          if (config.zona.length && muestra.tiempo >= config.desde) {
            if (!seguimiento.current || intervaloNoConfiable(ultimaMuestra.current, muestra.tiempo)
                || dimensiones.current?.ancho !== bitmap.width || dimensiones.current?.alto !== bitmap.height) {
              seguimiento.current = crearSeguimiento({ ...config, ancho: bitmap.width, alto: bitmap.height });
              dimensiones.current = { ancho: bitmap.width, alto: bitmap.height };
            }
            const resultadoSeguimiento = seguimiento.current(detecciones, muestra.tiempo);
            detecciones = resultadoSeguimiento.detecciones;
            resultadoSeguimiento.avisos.forEach(aviso => registrarHallazgo(aviso, muestra.imagen));
          }
          ultimaMuestra.current = muestra.tiempo;
          dibujar(canvas.current, bitmap, detecciones);
        } finally {
          bitmap.close();
        }
        setImagenLista(true);
        setMensaje('Análisis activo. Los recuadros corresponden a este fotograma.');
        timer = setTimeout(analizar, 500);
      } catch (error) {
        if (!vigente) return;
        desactivarRegistro();
        setActivo(false);
        setImagenLista(false);
        setDibujando(false);
        setMensaje([401, 403].includes(error.response?.status)
          ? 'Tu sesión no permite analizar imágenes. Comprueba tu acceso.'
          : 'No se pudo analizar la imagen. Comprueba que el procesador local de IA esté iniciado. La vista de la cámara sigue disponible.');
      }
    }

    async function iniciar() {
      try {
        await estadoCamaraDemo(controller.signal);
        if (vigente) await analizar();
      } catch (error) {
        if (!vigente) return;
        desactivarRegistro();
        setActivo(false);
        setMensaje([401, 403].includes(error.response?.status)
          ? 'Tu sesión no permite analizar imágenes. Comprueba tu acceso.'
          : 'No se pudo iniciar el análisis. Comprueba que el procesador local de IA esté iniciado.');
      }
    }
    iniciar();
    return () => {
      vigente = false;
      controller.abort();
      clearTimeout(timer);
      seguimiento.current = null;
      ultimaMuestra.current = null;
      dimensiones.current = null;
    };
  }, [activo, ultimoFotograma, registrarHallazgo, desactivarRegistro]);

  return <>
    <div className="imou-controles-ia">
      <div className="flex flex-wrap gap-2 mb-2">
        <button type="button" disabled={activo} className="bg-indigo-600 text-white rounded px-3 py-2 disabled:opacity-50"
          onClick={() => { configurarSeguimiento(zona, Number(segundos)); setMensaje('Iniciando análisis…'); setActivo(true); }}>Activar IA en Imou</button>
        <button type="button" disabled={!activo} className="border rounded px-3 py-2 disabled:opacity-50"
          onClick={() => { desactivarRegistro(); setActivo(false); setImagenLista(false); setDibujando(false); setMensaje('Análisis detenido.'); }}>Detener IA en Imou</button>
      </div>
      <p className="text-sm mb-2">El análisis puede ir más lento que la imagen en directo. El registro automático se activa por separado.</p>
      {mensaje && <p role="status" className="text-sm mb-2">{mensaje}</p>}
      {activo && imagenLista && <div className="mt-3">
        <h4 className="font-medium">Zona temporal de estacionamiento Imou</h4>
        <p className="text-sm mt-1">Dibuja la zona sobre la imagen analizada. Se oculta al terminar y se borra al detener la cámara.</p>
        {!dibujando ? <div className="flex flex-wrap gap-2 mt-2">
          <button type="button" className="border rounded px-3 py-2" onClick={() => {
            desactivarRegistro(); setBorrador([]); setDibujando(true); setErrorZona(''); configurarSeguimiento([], Number(segundos));
          }}>{zona.length ? 'Cambiar zona Imou' : 'Dibujar zona Imou'}</button>
          {zona.length > 0 && <>
            <button type="button" className="border rounded px-3 py-2" onClick={() => setMostrarZona(actual => !actual)}>{mostrarZona ? 'Ocultar zona Imou' : 'Mostrar zona Imou'}</button>
            <button type="button" className="border rounded px-3 py-2" onClick={() => {
              desactivarRegistro(); setZona([]); setMostrarZona(false); configurarSeguimiento([], Number(segundos));
            }}>Borrar zona Imou</button>
          </>}
        </div> : <div className="mt-2">
          <p className="text-sm">Marca al menos 3 puntos sobre la imagen analizada. Puntos: {borrador.length} de 30.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <button type="button" className="bg-indigo-600 text-white rounded px-3 py-2" onClick={() => {
              if (!zonaValida(borrador)) { setErrorZona('Marca al menos 3 puntos distintos formando una zona sin cruces.'); return; }
              setZona(borrador); setDibujando(false); setMostrarZona(false); setErrorZona('');
              configurarSeguimiento(borrador, Number(segundos));
            }}>Completar zona Imou</button>
            <button type="button" className="border rounded px-3 py-2" disabled={!borrador.length} onClick={() => setBorrador(actual => actual.slice(0, -1))}>Deshacer punto Imou</button>
            <button type="button" className="border rounded px-3 py-2" onClick={() => {
              setDibujando(false); setErrorZona(''); configurarSeguimiento(zona, Number(segundos));
            }}>Cancelar zona Imou</button>
          </div>
        </div>}
        {errorZona && <p role="alert" className="text-red-700 mt-2">{errorZona}</p>}
        {zona.length > 0 && !dibujando && <div className="mt-2 text-sm">
          <label>Tiempo mínimo detenido Imou (2 a 120 segundos):{' '}
            <input type="number" min="2" max="120" step="1" value={segundos} className="border rounded p-1 w-20"
              onChange={event => { desactivarRegistro(); const valor = event.target.value; setSegundos(valor); configurarSeguimiento(zona, Number(valor)); }} />
          </label>
          {!tiempoValido && <p role="alert" className="text-red-700">Introduce un número entero entre 2 y 120 para activar la detección.</p>}
          <p className="mt-1">Rojo indica un posible vehículo detenido; necesita revisión. La zona es temporal.</p>
          <label className="block mt-2"><input type="checkbox" checked={automatico}
            disabled={!tiempoValido || (!automatico && hayPendientes)}
            onChange={event => { cambiarAutomatico(event.target.checked); configurarSeguimiento(zona, Number(segundos)); }} />{' '}
            Registrar automáticamente los hallazgos de la Imou y avisar a los guardias.</label>
          <p className="mt-1">Al activarlo se crean eventos reales para revisión con el fotograma analizado. Una pérdida de seguimiento puede generar duplicados.</p>
        </div>}
      </div>}
    </div>
    <h4 className="font-medium imou-titulo-ia">Imagen analizada con IA</h4>
    {activo && <div className="imou-vista-ia bg-black">
      <canvas ref={canvas} aria-label="Imagen Imou analizada con IA" />
      {imagenLista && <ZonaVideo puntos={dibujando ? borrador : mostrarZona ? zona : []} activa={dibujando}
        onAgregar={punto => setBorrador(actual => actual.length < 30 ? [...actual, punto] : actual)} />}
    </div>}
  </>;
}
