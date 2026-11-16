import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { obtenerReglaPiscina, guardarReglaPiscina } from '../api/visionDemoApi.js';
import { crearSeguimientoPiscina } from '../vision/personaSolaPiscina.js';
import { zonaValida } from '../vision/zonas.js';
import ZonaVideo from '../pages/ZonaVideo.jsx';
import { useSession } from '../auth/sessionContext.js';

const inicial = { puntos: [], segundos: 10, automatico: false, version: null };

export default function ReglaPiscina({ fuente, nombre, muestraAnalizada, visor, activo, configuracion, seleccionada, pie, onRegistrarEvento }) {
  const { user } = useSession();
  const esAdmin = user?.role === 'administrador';
  const [guardado, setGuardado] = useState(null);
  const [puntos, setPuntos] = useState([]);
  const [segundos, setSegundos] = useState('10');
  const [automatico, setAutomatico] = useState(false);
  const [dibujando, setDibujando] = useState(false);
  const [borrador, setBorrador] = useState([]);
  const [cambios, setCambios] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [conflicto, setConflicto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState('');
  const [pendiente, setPendiente] = useState(null);
  const pendienteRef = useRef(null);
  const tiemposClip = useRef(new Map());
  const guardadoRef = useRef(null);
  const analisisRef = useRef(null);
  const ultimoRef = useRef(null);
  const generacion = useRef(0);
  const tiempoValido = Number.isInteger(Number(segundos)) && Number(segundos) >= 2 && Number(segundos) <= 120;
  const local = fuente.startsWith('local-');

  useEffect(() => {
    guardadoRef.current = null; analisisRef.current = null; ultimoRef.current = null; generacion.current++;
    setGuardado(null); setPuntos([]); setSegundos('10'); setAutomatico(false); setCambios(false); setDibujando(false); setConflicto(false); setMensaje('');
  }, [fuente]);

  useEffect(() => {
    if (!fuente || fuente === 'local-') return undefined;
    let vigente = true, timer;
    const controller = new AbortController();
    async function cargar() {
      try {
        const datos = local ? JSON.parse(localStorage.getItem(`piscina:${fuente}`) || 'null') || inicial : await obtenerReglaPiscina(fuente, controller.signal);
        if (!vigente) return;
        if (!Array.isArray(datos.puntos) || (datos.puntos.length && !zonaValida(datos.puntos)) || !Number.isInteger(datos.segundos) || datos.segundos < 2 || datos.segundos > 120 || typeof datos.automatico !== 'boolean') throw new Error('Configuración inválida');
        if (!guardadoRef.current || JSON.stringify(guardadoRef.current) !== JSON.stringify(datos)) {
          guardadoRef.current = datos; setGuardado(datos); analisisRef.current = null;
          if (!cambios && !dibujando && !guardando) { setPuntos(datos.puntos); setSegundos(String(datos.segundos)); setAutomatico(datos.automatico); }
        }
      } catch {
        if (vigente) { guardadoRef.current = null; setGuardado(null); analisisRef.current = null; setMensaje('No se pudo cargar la regla de piscina.'); }
      } finally { if (vigente && !local) timer = setTimeout(cargar, 5000); }
    }
    void cargar();
    return () => { vigente = false; controller.abort(); clearTimeout(timer); };
  }, [fuente, local, cambios, dibujando, guardando]);

  async function guardar() {
    if (!guardado || guardando || conflicto || !tiempoValido || dibujando || (automatico && !zonaValida(puntos))) return;
    const datos = { puntos, segundos: Number(segundos), automatico: puntos.length > 0 && automatico, version: guardado.version };
    setGuardando(true); setMensaje(''); generacion.current++;
    try {
      const respuesta = local ? { ...datos, version: new Date().toISOString() } : await guardarReglaPiscina(fuente, datos);
      if (local) localStorage.setItem(`piscina:${fuente}`, JSON.stringify(respuesta));
      guardadoRef.current = respuesta; setGuardado(respuesta); analisisRef.current = null;
      setCambios(false); setMensaje('Configuración de piscina guardada.');
    } catch (error) {
      if (error.response?.status === 409) { setConflicto(true); setMensaje('La regla cambió en otra sesión. Recarga la página antes de volver a guardar.'); }
      else setMensaje('No se pudo guardar la regla. Intenta nuevamente.');
    }
    finally { setGuardando(false); }
  }

  const enviar = useCallback(async datos => {
    try {
      const resultado = await onRegistrarEvento(datos, { timeout: 15000, instanteClip: tiemposClip.current.get(datos.id) });
      tiemposClip.current.delete(datos.id);
      pendienteRef.current = null; setPendiente(null);
      setMensaje(resultado.sin_guardias ? 'Evento registrado sin guardias activos.' : 'Evento enviado a revisión de los guardias.');
    } catch { pendienteRef.current = datos; setPendiente(datos); setMensaje('No se pudo confirmar el evento. Reintenta antes de cerrar.'); }
  }, [onRegistrarEvento]);

  useEffect(() => {
    if (!activo || !fuente) { analisisRef.current = null; ultimoRef.current = null; return undefined; }
    let vigente = true, ocupado = false;
    const timer = setInterval(async () => {
      const muestra = muestraAnalizada.current, config = guardadoRef.current;
      if (!muestra || performance.now() / 1000 - muestra.tiempo > 3) { analisisRef.current = null; ultimoRef.current = null; setEstado(''); return; }
      if (!config?.puntos?.length) { analisisRef.current = null; setEstado(''); return; }
      if (ocupado || muestra.tiempo === ultimoRef.current) return;
      ocupado = true; ultimoRef.current = muestra.tiempo;
      const version = generacion.current;
      try {
        const bitmap = await createImageBitmap(muestra.imagen);
        try {
          if (!vigente || version !== generacion.current || guardadoRef.current !== config) return;
          if (!analisisRef.current || analisisRef.current.ancho !== bitmap.width || analisisRef.current.alto !== bitmap.height) {
            analisisRef.current = { ancho: bitmap.width, alto: bitmap.height, procesar: crearSeguimientoPiscina({ zona: config.puntos, ancho: bitmap.width, alto: bitmap.height, segundos: config.segundos }) };
          }
          const resultado = analisisRef.current.procesar(muestra.detecciones, muestra.tiempo);
          const persona = resultado.detecciones.find(item => item.clase === 'person' && item.permanencia);
          setEstado(persona ? persona.permanencia.superaUmbral ? 'Posible persona sola: revisar' : `Una persona detectada · ${persona.permanencia.segundos.toFixed(1)}/${config.segundos} s` : '');
          if (resultado.avisos.length && config.automatico && !pendienteRef.current) {
            const escala = Math.min(1, 1280 / bitmap.width, 1280 / bitmap.height);
            const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(bitmap.width * escala)); canvas.height = Math.max(1, Math.round(bitmap.height * escala));
            canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            const evidencia = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .7));
            if (!vigente || version !== generacion.current || guardadoRef.current !== config) return;
            if (!evidencia || evidencia.size > 1024 * 1024) { setMensaje('No se pudo preparar la evidencia de piscina.'); return; }
            const datos = { id: crypto.randomUUID(), camara: nombre.slice(0, 100), categoria: 'Posible persona sola cerca de piscina',
              descripcion: `Una persona fue detectada en la zona de piscina sin otra persona detectada en la imagen durante al menos ${config.segundos} segundos. Requiere revisión del guardia. Se adjunta el fotograma analizado.`, fecha_evento: new Date().toISOString(), evidencia };
            tiemposClip.current.set(datos.id, muestra.tiempo);
            pendienteRef.current = datos; setPendiente(datos); void enviar(datos);
          }
        } finally { bitmap.close(); }
      } catch { if (vigente) { analisisRef.current = null; setEstado('No se pudo analizar la regla de piscina.'); } }
      finally { ocupado = false; }
    }, 250);
    return () => { vigente = false; clearInterval(timer); analisisRef.current = null; ultimoRef.current = null; setEstado(''); };
  }, [activo, fuente, muestraAnalizada, nombre, enviar]);

  return <>
    {activo && estado && configuracion && <p role="status" className="imou-registration-status">Piscina: {estado}</p>}
    {activo && estado && !configuracion && visor && createPortal(<span role="status" className="piscina-estado">{estado}</span>, visor)}
    {configuracion && seleccionada && <section className="imou-zone-settings">
      <h4>Persona sola cerca de piscina</h4>
      <p>Una persona en la zona y ninguna otra detectada en la imagen. No detecta ahogamientos ni personas fuera de cámara.</p>
      {!fuente || fuente === 'local-' ? <p>Inicia la cámara para configurar esta regla.</p> : guardado && esAdmin ? <>
        {!dibujando ? <><button type="button" disabled={!visor || guardando} onClick={() => { setBorrador([]); setDibujando(true); }}>Dibujar zona de piscina</button>
          <button type="button" disabled={!puntos.length || guardando} onClick={() => { setPuntos([]); setAutomatico(false); setCambios(true); }}>Borrar zona de piscina</button></>
          : <><p>Marca al menos tres puntos: {borrador.length}.</p><button type="button" onClick={() => { if (!zonaValida(borrador)) { setMensaje('Dibuja una zona válida.'); return; } setPuntos(borrador); setDibujando(false); setCambios(true); setMensaje(''); }}>Completar zona de piscina</button><button type="button" onClick={() => setDibujando(false)}>Cancelar zona</button></>}
        <label>Tiempo sola (2 a 120 segundos): <input type="number" min="2" max="120" value={segundos} onChange={e => { setSegundos(e.target.value); setCambios(true); }} /></label>
        <label><input type="checkbox" checked={automatico} disabled={!puntos.length} onChange={e => { setAutomatico(e.target.checked); setCambios(true); }} /> Avisar a los guardias</label>
      </> : !esAdmin && <p>Solo el administrador puede configurar esta regla.</p>}
      {mensaje && <p role="status">{mensaje}</p>}
    </section>}
    {pendiente && <div role="alert"><p>No se confirmó el aviso de piscina.</p><button type="button" onClick={() => enviar(pendiente)}>Reintentar aviso de piscina</button></div>}
    {configuracion && seleccionada && visor && dibujando && createPortal(<ZonaVideo puntos={borrador} activa onAgregar={punto => setBorrador(actual => actual.length < 30 ? [...actual, punto] : actual)} />, visor)}
    {configuracion && seleccionada && pie && guardado && esAdmin && createPortal(<div className="configuracion-guardar"><button type="button" disabled={!cambios || guardando || conflicto || dibujando || !tiempoValido || !!pendiente} onClick={guardar}>Guardar configuración</button></div>, pie)}
  </>;
}
