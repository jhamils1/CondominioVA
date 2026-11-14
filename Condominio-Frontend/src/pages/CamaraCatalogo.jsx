import { useEffect, useRef, useState } from 'react';
import ConsultaPlacaFotograma from '../components/ConsultaPlacaFotograma.jsx';
import AnalisisCamaraCatalogo from '../components/AnalisisCamaraCatalogo.jsx';
import { fotogramaCamara, obtenerZonaCamara, guardarZonaCamara } from '../api/visionDemoApi.js';
import { useSession } from '../auth/sessionContext.js';
import ZonaVideo from './ZonaVideo.jsx';
import { zonaValida } from '../vision/zonas.js';
import './VideoArchivoDemostracion.css';

export default function CamaraCatalogo({ camara, configuracion, onConfigurar }) {
  const { user } = useSession();
  const esAdmin = user?.role === 'administrador';
  const [activo, setActivo] = useState(false);
  const [imagen, setImagen] = useState('');
  const ultimoFotograma = useRef(null);
  const [mensaje, setMensaje] = useState('');
  const [zona, setZona] = useState(null);
  const [errorZona, setErrorZona] = useState('');
  const [dibujando, setDibujando] = useState(false);
  const [borrador, setBorrador] = useState([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    obtenerZonaCamara(camara.id, controller.signal).then(setZona)
      .catch(() => { if (!controller.signal.aborted) setErrorZona('No se pudo cargar la zona.'); });
    return () => controller.abort();
  }, [camara.id]);

  async function guardar(puntos, segundos) {
    if (!zona || guardando) return;
    setGuardando(true); setErrorZona('');
    try {
      setZona(await guardarZonaCamara(camara.id, { puntos, segundos, version: zona.version }));
      setDibujando(false); setBorrador([]);
    } catch (error) {
      setErrorZona(error.response?.status === 409
        ? 'La zona cambió en otra sesión. Vuelve a seleccionar la cámara antes de editar.'
        : 'No se pudo guardar la zona. La configuración anterior se conserva.');
    } finally { setGuardando(false); }
  }

  useEffect(() => {
    if (!activo) return undefined;
    let vigente = true, timer, actual = '';
    const controller = new AbortController();
    async function consultar() {
      try {
        const blob = await fotogramaCamara(camara.id, controller.signal);
        if (!vigente) return;
        if (blob) {
          ultimoFotograma.current = { imagen: blob, tiempo: performance.now() / 1000 };
          const siguiente = URL.createObjectURL(blob);
          setImagen(siguiente);
          if (actual) URL.revokeObjectURL(actual);
          actual = siguiente;
          setMensaje('Imagen en directo.');
        } else setMensaje('Conectando con la cámara…');
        timer = setTimeout(consultar, 300);
      } catch {
        if (vigente) { setActivo(false); setImagen(''); setMensaje('No se recibió imagen. Comprueba la conexión y el servicio de cámaras.'); }
      }
    }
    consultar();
    function ocultar() { if (document.hidden) { setActivo(false); setImagen(''); setMensaje('Vista detenida al salir de esta pestaña.'); } }
    document.addEventListener('visibilitychange', ocultar);
    return () => { vigente = false; controller.abort(); clearTimeout(timer); ultimoFotograma.current = null; if (actual) URL.revokeObjectURL(actual); document.removeEventListener('visibilitychange', ocultar); };
  }, [activo, camara.id]);

  return <section className="imou-panel">
    <h3>{camara.nombre}</h3>
    {camara.ubicacion && <p>{camara.ubicacion}</p>}
    <button type="button" disabled={activo} onClick={() => { setMensaje('Conectando…'); setActivo(true); }}>Ver cámara</button>{' '}
    <button type="button" disabled={!activo} onClick={() => { setActivo(false); setImagen(''); setMensaje('Vista detenida.'); }}>Detener vista</button>
    <p role="status">{mensaje}</p>
    <button type="button" onClick={onConfigurar}>{configuracion ? 'Volver al monitoreo' : 'Configuración de análisis'}</button>
    {imagen && <div className="camara-catalogo-visor"><img src={imagen} alt={`Vista en vivo: ${camara.nombre}`} />
      {configuracion && <ZonaVideo puntos={dibujando ? borrador : zona?.puntos || []} activa={dibujando}
        onAgregar={punto => setBorrador(actual => actual.length < 30 ? [...actual, punto] : actual)} />}
    </div>}
    {activo && imagen && <ConsultaPlacaFotograma obtenerFotograma={() => ultimoFotograma.current} />}
    {activo && imagen && <AnalisisCamaraCatalogo camara={camara} ultimoFotograma={ultimoFotograma} />}
    {configuracion && <div>
      <h4>Zona de estacionamiento</h4>
      <p>La zona se guarda para esta cámara. Su análisis y sus avisos todavía no están activos.</p>
      {errorZona && <p role="alert">{errorZona}</p>}
      {zona && esAdmin && <>
        {!dibujando ? <>
          <button type="button" disabled={!imagen || guardando} onClick={() => { setBorrador([]); setDibujando(true); }}>Dibujar o cambiar zona</button>
          <button type="button" disabled={!zona.puntos.length || guardando} onClick={() => guardar([], zona.segundos)}>Eliminar zona</button>
        </> : <>
          <p>Marca al menos tres puntos sobre la imagen: {borrador.length} de 30.</p>
          <button type="button" disabled={guardando} onClick={() => { if (zonaValida(borrador)) guardar(borrador, zona.segundos); else setErrorZona('Dibuja una zona válida sin cruces.'); }}>Guardar zona</button>
          <button type="button" onClick={() => { setDibujando(false); setBorrador([]); setErrorZona(''); }}>Cancelar</button>
        </>}
        <label>Tiempo mínimo detenido (2 a 120 segundos):{' '}
          <input key={zona.version || 'nueva'} type="number" min="2" max="120" defaultValue={zona.segundos} disabled={guardando || dibujando}
            onBlur={e => { const valor = Number(e.target.value); if (Number.isInteger(valor) && valor >= 2 && valor <= 120) { if (valor !== zona.segundos) guardar(zona.puntos, valor); } else { e.target.value = zona.segundos; setErrorZona('Indica un número entre 2 y 120.'); } }} />
        </label>
      </>}
      {zona && !esAdmin && <p>Solo el administrador puede configurar esta zona.</p>}
    </div>}
  </section>;
}
