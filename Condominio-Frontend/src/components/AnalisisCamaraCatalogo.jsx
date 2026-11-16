import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { analizarFotograma, estadoCamaraDemo } from '../api/visionDemoApi.js';
import LecturaAutomaticaImou from './LecturaAutomaticaImou.jsx';
import { crearSeguimiento } from '../vision/permanencia.js';
import { dibujar } from '../vision/dibujarMonitor.js';
import ModoDetecciones from './ModoDetecciones.jsx';

async function prepararEvidencia(imagen, bitmap) {
  if (imagen.type === 'image/jpeg' && imagen.size > 0 && imagen.size <= 1024 * 1024 && bitmap.width <= 1280 && bitmap.height <= 1280) return imagen;
  const proporcion = Math.min(1, 1280 / bitmap.width, 1280 / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * proporcion));
  canvas.height = Math.max(1, Math.round(bitmap.height * proporcion));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const evidencia = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .7));
  if (!evidencia || evidencia.size > 1024 * 1024) throw new Error('No se pudo preparar la evidencia.');
  return evidencia;
}

export default function AnalisisCamaraCatalogo({ camara, ultimoFotograma, muestraAnalizada, zona, visor, onHallazgo, onError, configuracion, pausado, espacioPlacas }) {
  const [activo, setActivo] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [modo, setModo] = useState('todas');
  const modoRef = useRef('todas');
  const canvas = useRef(null);
  const seguimiento = useRef(null);
  const dimensiones = useRef(null);
  const zonaRef = useRef(zona);
  const hallazgoRef = useRef(onHallazgo);
  const errorRef = useRef(onError);
  const pausadoRef = useRef(pausado);
  zonaRef.current = zona;
  hallazgoRef.current = onHallazgo;
  errorRef.current = onError;
  pausadoRef.current = pausado;
  useEffect(() => { seguimiento.current = null; dimensiones.current = null; }, [zona?.version, pausado]);
  useEffect(() => {
    if (!activo) return undefined;
    let vigente = true, timer, ultimoTiempo = null;
    const controller = new AbortController();
    async function analizar() {
      try {
        const muestra = ultimoFotograma.current;
        if (muestra && muestra.tiempo !== ultimoTiempo && performance.now() / 1000 - muestra.tiempo <= 3) {
          const respuesta = await analizarFotograma(muestra.imagen, controller.signal);
          if (!vigente) return;
          if (!Array.isArray(respuesta.detecciones)) throw new Error('Respuesta inválida');
          ultimoTiempo = muestra.tiempo;
          muestraAnalizada.current = { ...muestra, detecciones: respuesta.detecciones };
          const bitmap = await createImageBitmap(muestra.imagen);
          try {
            if (!vigente || !canvas.current) return;
            const config = zonaRef.current;
            let detecciones = respuesta.detecciones;
            if (config?.puntos?.length) {
              if (!seguimiento.current || dimensiones.current?.ancho !== bitmap.width || dimensiones.current?.alto !== bitmap.height) {
                seguimiento.current = crearSeguimiento({ zona: config.puntos, segundos: config.segundos, ancho: bitmap.width, alto: bitmap.height, toleranciaPerdida: 2 });
                dimensiones.current = { ancho: bitmap.width, alto: bitmap.height };
              }
              const resultado = seguimiento.current(detecciones, muestra.tiempo);
              detecciones = resultado.detecciones;
              if (config.automatico && !pausado && resultado.avisos.length) {
                const evidencia = await prepararEvidencia(muestra.imagen, bitmap);
                if (!vigente || zonaRef.current !== config || pausadoRef.current) return;
                resultado.avisos.forEach(aviso => hallazgoRef.current(aviso, evidencia));
              }
            }
            dibujar(canvas.current, bitmap, detecciones, { zona: config?.puntos || [], segundos: config?.segundos || 5 }, configuracion ? modoRef.current : 'zona');
          } finally { bitmap.close(); }
          const total = respuesta.detecciones.filter(d => ['car', 'motorcycle', 'bus', 'truck'].includes(d.clase)).length;
          setMensaje(total ? `Vehículos detectados en la muestra: ${total}.` : 'Sin vehículos detectados en la muestra.');
        }
        timer = setTimeout(analizar, 800);
      } catch {
        if (vigente) { setActivo(false); setMensaje('No se pudo analizar la imagen. Comprueba el procesador de IA.'); errorRef.current('IA detenida: comprueba el procesador seleccionado.'); }
      }
    }
    async function iniciar() {
      try { await estadoCamaraDemo(controller.signal); if (vigente) await analizar(); }
      catch { if (vigente) { setActivo(false); setMensaje('No se pudo iniciar la IA seleccionada.'); errorRef.current('No se pudo iniciar la IA seleccionada.'); } }
    }
    iniciar();
    return () => { vigente = false; controller.abort(); clearTimeout(timer); muestraAnalizada.current = null; seguimiento.current = null; dimensiones.current = null; };
  }, [activo, ultimoFotograma, muestraAnalizada, configuracion, pausado]);
  return <>
  <section className="imou-notice" hidden={!configuracion}>
    <h4>Procesador de IA</h4>
    <button type="button" onClick={() => { setActivo(!activo); setMensaje(''); }}>
      {activo ? 'Detener IA en esta cámara' : 'Activar IA en esta cámara'}
    </button>
    <p role="status">{mensaje}</p>
    <p>El análisis usa la configuración guardada.</p>
    {activo && <ModoDetecciones value={modo} tieneZona={Boolean(zona?.puntos?.length)} onChange={valor => { modoRef.current = valor; setModo(valor); }} />}
  </section>
  {activo && configuracion && espacioPlacas && createPortal(<LecturaAutomaticaImou muestraAnalizada={muestraAnalizada} cameraId={`catalogo-${camara.id}`} />, espacioPlacas)}
  {activo && visor && createPortal(<canvas ref={canvas} className="camara-catalogo-analisis" aria-label={`Imagen analizada: ${camara.nombre}`} />, visor)}
  </>;
}
