import { useEffect, useRef, useState } from 'react';
import { analizarFotograma, estadoCamaraDemo } from '../api/visionDemoApi.js';
import LecturaAutomaticaImou from './LecturaAutomaticaImou.jsx';

export default function AnalisisCamaraCatalogo({ camara, ultimoFotograma }) {
  const [activo, setActivo] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const muestraAnalizada = useRef(null);
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
          const total = respuesta.detecciones.filter(d => ['car', 'motorcycle', 'bus', 'truck'].includes(d.clase)).length;
          setMensaje(total ? `Vehículos detectados en la muestra: ${total}.` : 'Sin vehículos detectados en la muestra.');
        }
        timer = setTimeout(analizar, 800);
      } catch {
        if (vigente) { setActivo(false); setMensaje('No se pudo analizar la imagen. Comprueba el procesador de IA.'); }
      }
    }
    async function iniciar() {
      try { await estadoCamaraDemo(controller.signal); if (vigente) await analizar(); }
      catch { if (vigente) { setActivo(false); setMensaje('No se pudo iniciar la IA local.'); } }
    }
    iniciar();
    return () => { vigente = false; controller.abort(); clearTimeout(timer); muestraAnalizada.current = null; };
  }, [activo, ultimoFotograma]);
  return <section className="imou-notice">
    <h4>IA local de prueba</h4>
    <button type="button" onClick={() => { setActivo(!activo); setMensaje(''); }}>
      {activo ? 'Detener IA en esta cámara' : 'Activar IA en esta cámara'}
    </button>
    <p role="status">{mensaje}</p>
    <p>Analiza muestras mientras esta vista esté abierta. Las zonas de cámaras adicionales todavía no generan eventos ni alertas.</p>
    {activo && <LecturaAutomaticaImou muestraAnalizada={muestraAnalizada} cameraId={`catalogo-${camara.id}`} />}
  </section>;
}
