import { useCallback, useEffect, useRef, useState } from 'react';
import { fotogramaImou } from '../api/visionDemoApi.js';
import AnalisisImou from './AnalisisImou.jsx';
import { crearEventoImou } from '../vision/eventoImou.js';
import './CamaraImou.css';

export default function CamaraImou({ onRegistrarEvento }) {
  const [activa, setActiva] = useState(false);
  const [imagen, setImagen] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [automatico, setAutomatico] = useState(false);
  const [pendientes, setPendientes] = useState([]);
  const [avisoRegistro, setAvisoRegistro] = useState('');
  const visor = useRef(null);
  const ultimoFotograma = useRef(null);
  const automaticoRef = useRef(false);
  const pendientesRef = useRef(new Map());
  const enviandoRef = useRef(new Set());

  const cambiarAutomatico = useCallback(valor => {
    automaticoRef.current = valor;
    setAutomatico(valor);
  }, []);
  const desactivarRegistro = useCallback(() => cambiarAutomatico(false), [cambiarAutomatico]);
  const actualizarPendientes = useCallback(() => {
    setPendientes([...pendientesRef.current.values()].map(datos => ({
      datos, enviando: enviandoRef.current.has(datos.id),
    })));
  }, []);
  const enviar = useCallback(async datos => {
    if (enviandoRef.current.has(datos.id)) return;
    enviandoRef.current.add(datos.id);
    actualizarPendientes();
    try {
      const creado = await onRegistrarEvento(datos, { timeout: 15000 });
      pendientesRef.current.delete(datos.id);
      setAvisoRegistro(creado.sin_guardias
        ? 'Evento registrado. No hay guardias activos para recibir el aviso.'
        : 'Evento registrado para revisión de los guardias activos. La entrega al móvil depende del procesador y Firebase.');
    } catch {
      desactivarRegistro();
      setAvisoRegistro('No se pudo confirmar el registro. Se desactivó el registro automático; puedes reintentar con el mismo evento.');
    } finally {
      enviandoRef.current.delete(datos.id);
      actualizarPendientes();
    }
  }, [onRegistrarEvento, desactivarRegistro, actualizarPendientes]);
  const registrarHallazgo = useCallback((hallazgo, imagen) => {
    if (!automaticoRef.current) return;
    try {
      if (!(imagen instanceof Blob) || imagen.type !== 'image/jpeg' || imagen.size <= 0 || imagen.size > 1024 * 1024) throw new Error('Fotograma inválido');
      const datos = { ...crearEventoImou(hallazgo, crypto.randomUUID(), new Date().toISOString()), evidencia: imagen };
      pendientesRef.current.set(datos.id, datos);
      void enviar(datos);
    } catch {
      desactivarRegistro();
      setAvisoRegistro('No se pudo preparar el evento; se desactivó el registro automático.');
    }
  }, [enviar, desactivarRegistro]);

  useEffect(() => {
    if (!activa) return;
    let vigente = true;
    let timer;
    let url;
    let ultimaImagen = Date.now();
    const controller = new AbortController();
    async function actualizar() {
      try {
        const blob = await fotogramaImou(controller.signal);
        if (!vigente) return;
        if (blob) {
          ultimoFotograma.current = { imagen: blob, tiempo: performance.now() / 1000 };
          const anterior = url;
          url = URL.createObjectURL(blob);
          setImagen(url);
          if (anterior) URL.revokeObjectURL(anterior);
          ultimaImagen = Date.now();
          setMensaje('Vista en directo');
        } else if (Date.now() - ultimaImagen > 12000) {
          throw new Error('Sin imágenes');
        }
        timer = setTimeout(actualizar, 200);
      } catch (error) {
        if (!vigente) return;
        desactivarRegistro();
        setActiva(false);
        setImagen('');
        setMensaje([401, 403].includes(error.response?.status)
          ? 'Tu sesión no permite ver esta cámara. Comprueba tu acceso.'
          : 'No se pudo recibir la imagen. Comprueba que la cámara y el servicio Imou estén encendidos y vuelve a iniciar la vista.');
      }
    }
    function alOcultar() {
      if (document.hidden) {
        desactivarRegistro();
        setActiva(false);
        setImagen('');
        setMensaje('Vista detenida al salir de esta pestaña.');
      }
    }
    document.addEventListener('visibilitychange', alOcultar);
    actualizar();
    return () => {
      vigente = false;
      controller.abort();
      clearTimeout(timer);
      ultimoFotograma.current = null;
      if (url) URL.revokeObjectURL(url);
      document.removeEventListener('visibilitychange', alOcultar);
    };
  }, [activa, desactivarRegistro]);

  async function ampliar() {
    try { await visor.current?.requestFullscreen(); }
    catch { setMensaje('El navegador no permitió ampliar la vista.'); }
  }

  return <section className="border rounded p-4 mb-5" aria-label="Cámara Imou por red">
    <h3 className="font-semibold mb-2">Cámara Imou por red</h3>
    <p className="text-sm mb-3">Vista en directo con análisis local opcional. No se guardan grabaciones.</p>
    <div className="flex flex-wrap gap-3 mb-3">
      <button type="button" disabled={activa} className="bg-indigo-600 text-white rounded px-3 py-2 disabled:opacity-50"
        onClick={() => { setMensaje('Conectando con la cámara…'); setActiva(true); }}>Ver cámara Imou</button>
      <button type="button" disabled={!activa} className="border rounded px-3 py-2 disabled:opacity-50"
        onClick={() => { desactivarRegistro(); setActiva(false); setImagen(''); setMensaje('Vista detenida.'); }}>Detener vista Imou</button>
      {imagen && <button type="button" onClick={ampliar} className="border rounded px-3 py-2">Ampliar cámara Imou</button>}
    </div>
    {mensaje && <p role="status" className="mb-2">{mensaje}</p>}
    {activa && imagen && <div className="imou-comparacion">
      <h4 className="font-medium imou-titulo-directo">Cámara en directo</h4>
      <div ref={visor} className="imou-vista-directo bg-black flex items-center justify-center">
        <img src={imagen} alt="Vista en directo de la cámara Imou" />
      </div>
      <AnalisisImou ultimoFotograma={ultimoFotograma} automatico={automatico}
        cambiarAutomatico={cambiarAutomatico} desactivarRegistro={desactivarRegistro}
        registrarHallazgo={registrarHallazgo} hayPendientes={pendientes.length > 0} />
    </div>}
    {avisoRegistro && <p role="status" className="mt-3">{avisoRegistro}</p>}
    {pendientes.length > 0 && <div role="alert" className="mt-3 border rounded p-3">
      <p>Hay {pendientes.length} evento(s) por confirmar. Si cierras o recargas la página se perderán los reintentos pendientes.</p>
      {pendientes.map(({ datos, enviando }) => <button key={datos.id} type="button" disabled={enviando}
        className="border rounded px-3 py-1 mt-2 mr-2 disabled:opacity-50"
        onClick={() => enviar(datos)}>{enviando ? 'Enviando evento…' : 'Reintentar evento Imou'}</button>)}
    </div>}
  </section>;
}
