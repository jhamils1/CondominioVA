import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { analizarFotograma, estadoCamaraDemo, obtenerZonaImou, guardarZonaImou } from '../api/visionDemoApi.js';
import { useSession } from '../auth/sessionContext.js';
import { crearSeguimiento, intervaloNoConfiable } from '../vision/permanencia.js';
import { dibujar } from '../vision/dibujarMonitor.js';
import ModoDetecciones from '../components/ModoDetecciones.jsx';
import { zonaValida } from '../vision/zonas.js';
import ZonaVideo from './ZonaVideo.jsx';
import './VideoArchivoDemostracion.css';

const vehiculos = new Set(['car', 'motorcycle', 'bus', 'truck']);

export default function AnalisisImou({ ultimoFotograma, muestraAnalizada, automatico, cambiarAutomatico,
  desactivarRegistro, registrarHallazgo, hayPendientes, activo, setActivo,
  configuracion, visorAnalizado, monitorIndependiente, pieConfiguracion, piscinaSeleccionada = false }) {
  const { user } = useSession();
  const esAdmin = user?.role === 'administrador';
  const [mensaje, setMensaje] = useState('');
  const [zona, setZona] = useState([]);
  const [borrador, setBorrador] = useState([]);
  const [dibujando, setDibujando] = useState(false);
  const [mostrarZona, setMostrarZona] = useState(false);
  const [modoDetecciones, setModoDetecciones] = useState('todas');
  const modoDeteccionesRef = useRef('todas');
  const configuracionRef = useRef(configuracion);
  configuracionRef.current = configuracion;
  const [segundos, setSegundos] = useState('5');
  const [errorZona, setErrorZona] = useState('');
  const [imagenLista, setImagenLista] = useState(false);
  const [estadoSeguimiento, setEstadoSeguimiento] = useState('');
  const [configLista, setConfigLista] = useState(false);
  const [configError, setConfigError] = useState('');
  const [guardarOcupado, setGuardarOcupado] = useState(false);
  const [confirmacionGuardado, setConfirmacionGuardado] = useState('');
  const [guardadoPendiente, setGuardadoPendiente] = useState(null);
  const [automaticoBorrador, setAutomaticoBorrador] = useState(false);
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState(false);
  const versionZona = useRef(null);
  const bloqueoCarga = useRef(false);
  const guardando = useRef(false);
  const generacion = useRef(0);
  const guardado = useRef({ puntos: [], segundos: 5, automatico: false });
  const activoRef = useRef(activo);
  const pendientesRef = useRef(hayPendientes);
  activoRef.current = activo;
  pendientesRef.current = hayPendientes;
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
    // Al alternar entre proceso y vista web se reinicia el conteo local; no se
    // pierde un hallazgo porque otra fuente lo hubiera marcado como avisado.
    configurarSeguimiento(guardado.current.puntos, guardado.current.segundos);
  }, [monitorIndependiente]);

  useEffect(() => {
    let vigente = true;
    let timer;
    const controller = new AbortController();
    async function cargar() {
      const inicio = generacion.current;
      try {
        const datos = await obtenerZonaImou(controller.signal);
        if (!vigente) return;
        if (!Array.isArray(datos.puntos) || (datos.puntos.length && !zonaValida(datos.puntos)) ||
            !Number.isInteger(datos.segundos) || datos.segundos < 2 || datos.segundos > 120 || typeof datos.automatico !== 'boolean') throw new Error('Configuración inválida');
        const obsoleta = versionZona.current && (!datos.actualizado || Date.parse(datos.actualizado) < Date.parse(versionZona.current));
        if (!bloqueoCarga.current && !guardando.current && inicio === generacion.current && !obsoleta && versionZona.current !== datos.actualizado) {
          versionZona.current = datos.actualizado;
          guardado.current = { puntos: datos.puntos, segundos: datos.segundos, automatico: datos.automatico };
          setZona(datos.puntos); setSegundos(String(datos.segundos)); setAutomaticoBorrador(datos.automatico);
          configurarSeguimiento(datos.puntos, datos.segundos);
          cambiarAutomatico(activoRef.current && !pendientesRef.current && datos.automatico && datos.puntos.length > 0);
        }
        if (!bloqueoCarga.current && !guardando.current && inicio === generacion.current) {
          setConfigLista(true); setConfigError('');
        }
      } catch {
        if (!vigente) return;
        if (bloqueoCarga.current || guardando.current || inicio !== generacion.current) return;
        versionZona.current = null; desactivarRegistro(); setConfigLista(false);
        setConfigError('No se pudo cargar la zona compartida. El registro automático está detenido.');
      } finally {
        if (vigente) timer = setTimeout(cargar, 5000);
      }
    }
    cargar();
    return () => { vigente = false; controller.abort(); clearTimeout(timer); };
  }, [cambiarAutomatico, desactivarRegistro]);

  async function guardarConfiguracion(propuesta) {
    if (!esAdmin || guardando.current || pendientesRef.current) return;
    guardando.current = true; bloqueoCarga.current = true; generacion.current++;
    desactivarRegistro();
    setGuardarOcupado(true); setConfigError(''); setConfirmacionGuardado('');
    try {
      const datos = await guardarZonaImou(propuesta);
      versionZona.current = datos.actualizado;
      guardado.current = { puntos: datos.puntos, segundos: datos.segundos, automatico: datos.automatico };
      setZona(datos.puntos); setSegundos(String(datos.segundos)); setAutomaticoBorrador(datos.automatico);
      configurarSeguimiento(datos.puntos, datos.segundos);
      cambiarAutomatico(activoRef.current && !pendientesRef.current && datos.automatico && datos.puntos.length > 0);
      setConfigLista(true);
      setGuardadoPendiente(null); bloqueoCarga.current = false;
      setCambiosSinGuardar(false);
      setConfirmacionGuardado('Configuración Imou guardada.');
    } catch {
      setGuardadoPendiente(propuesta);
      desactivarRegistro(); setConfigError('No se pudo confirmar el guardado. El registro está pausado; reintenta para aplicar el cambio.');
    } finally { guardando.current = false; setGuardarOcupado(false); }
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
        muestraAnalizada.current = { imagen: muestra.imagen, tiempo: muestra.tiempo, detecciones: resultado.detecciones };
        const bitmap = await createImageBitmap(muestra.imagen);
        try {
          if (!vigente || !canvas.current) return;
          const config = ajustes.current;
          let detecciones = resultado.detecciones;
          let estado = '';
          if (config.zona.length && muestra.tiempo >= config.desde) {
            const intervaloInvalido = intervaloNoConfiable(ultimaMuestra.current, muestra.tiempo);
            if (!seguimiento.current
                || dimensiones.current?.ancho !== bitmap.width || dimensiones.current?.alto !== bitmap.height) {
              seguimiento.current = crearSeguimiento({ ...config, ancho: bitmap.width, alto: bitmap.height, toleranciaPerdida: 2 });
              dimensiones.current = { ancho: bitmap.width, alto: bitmap.height };
            }
            const resultadoSeguimiento = seguimiento.current(detecciones, muestra.tiempo);
            detecciones = resultadoSeguimiento.detecciones;
            resultadoSeguimiento.avisos.forEach(aviso => registrarHallazgo(aviso, muestra.imagen));
            const coches = detecciones.filter(d => vehiculos.has(d.clase));
            estado = intervaloInvalido
              ? 'Muestras demasiado separadas: se reinició el tiempo. No se puede confirmar permanencia con este ritmo de análisis.'
              : coches.some(d => d.permanencia)
                ? 'Verde: detectado. Amarillo: tiempo de tolerancia. Rojo: tiempo configurado cumplido; requiere revisión.'
                : coches.length ? 'El punto inferior de los vehículos detectados está fuera de la zona.'
                  : 'Sin vehículos detectados en esta imagen. Una pérdida breve pausa el conteo; no suma tiempo.';
          }
          ultimaMuestra.current = muestra.tiempo;
          // El monitor muestra únicamente vehículos dentro de la zona guardada;
          // la configuración conserva los modos de diagnóstico existentes.
          dibujar(canvas.current, bitmap, detecciones, config,
            configuracionRef.current ? modoDeteccionesRef.current : 'zona');
          setEstadoSeguimiento(estado);
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
          : 'No se pudo analizar la imagen. Comprueba el procesador de IA seleccionado. La vista de la cámara sigue disponible.');
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
          : 'No se pudo iniciar el análisis. Comprueba el procesador de IA seleccionado.');
      }
    }
    iniciar();
    return () => {
      vigente = false;
      controller.abort();
      muestraAnalizada.current = null;
      clearTimeout(timer);
      seguimiento.current = null;
      ultimaMuestra.current = null;
      dimensiones.current = null;
    };
  }, [activo, ultimoFotograma, muestraAnalizada, registrarHallazgo, desactivarRegistro, setActivo]);

  return <>
    <div className="imou-controles-ia">
      <div className="imou-ia-switch">
        <span>Detección</span>
        {activo ? <button type="button" className="imou-toggle is-active" aria-pressed="true"
          onClick={() => { desactivarRegistro(); setActivo(false); setImagenLista(false); setDibujando(false); setMensaje('Análisis detenido.'); }}>Detener IA en Imou</button>
          : <button type="button" className="imou-toggle" aria-pressed="false"
            onClick={() => { configurarSeguimiento(guardado.current.puntos, guardado.current.segundos); cambiarAutomatico(configLista && !bloqueoCarga.current && !hayPendientes && guardado.current.automatico && guardado.current.puntos.length > 0); setMensaje('Iniciando análisis…'); setActivo(true); }}>Activar IA en Imou</button>}
      </div>
      {mensaje && <p role="status" className="text-sm mb-2">{mensaje}</p>}
      {activo && estadoSeguimiento && <p role="status" className="text-sm mb-2">{estadoSeguimiento}</p>}
      {activo && configuracion && <ModoDetecciones value={modoDetecciones} tieneZona={zona.length > 0} onChange={modo => { modoDeteccionesRef.current = modo; setModoDetecciones(modo); }} />}
      <div className="imou-registration-status" aria-label="Estado del registro Imou">
        {configError ? <p role="alert">{configError}</p> : <p role="status">
          {guardarOcupado ? 'Guardando configuración… Registro pausado temporalmente.'
            : !configLista ? 'Cargando configuración del registro…'
              : !guardado.current.puntos.length ? 'Registro desactivado: todavía no hay una zona guardada. El administrador debe dibujarla y guardar la configuración de avisos.'
                : !activo ? 'Registro detenido: activa la IA para evaluar la zona guardada.'
                  : automatico ? 'Registro automático activo: los nuevos hallazgos se enviarán a revisión de los guardias.'
                    : hayPendientes ? 'Registro pausado: reintenta el evento pendiente antes de continuar.'
                      : automaticoBorrador ? 'El registro automático está detenido en esta sesión. Revisa la configuración o el mensaje de error.'
                        : 'Registro automático desactivado: se muestran detecciones, pero no se crean eventos ni avisos. El administrador puede habilitarlo en Configuración de incidencias.'}
        </p>}
        {confirmacionGuardado && <p role="status">{confirmacionGuardado}</p>}
        {esAdmin && !configuracion && guardadoPendiente && <button type="button" disabled={guardarOcupado || hayPendientes}
          className="imou-primary" onClick={() => guardarConfiguracion(guardadoPendiente)}>Reintentar guardado</button>}
      </div>
      <div hidden={!configuracion || piscinaSeleccionada}>
      {activo && imagenLista && <div className="mt-3 imou-zone-settings">
        <h4 className="font-medium">Configuración de incidencias para la cámara Imou</h4>
        <h5 className="font-medium">Zona de estacionamiento</h5>
        <p className="text-sm mt-1">Dibuja la zona sobre el suelo y define el tiempo permitido.</p>
        {esAdmin && configLista && (!dibujando ? <div className="flex flex-wrap gap-2 mt-2">
          <button type="button" disabled={guardarOcupado || hayPendientes || !!guardadoPendiente} className="border rounded px-3 py-2" onClick={() => {
            bloqueoCarga.current = true; setBorrador([]); setDibujando(true); setErrorZona(''); setConfirmacionGuardado('');
          }}>{zona.length ? 'Cambiar zona Imou' : 'Dibujar zona Imou'}</button>
          {zona.length > 0 && <>
            <button type="button" className="border rounded px-3 py-2" onClick={() => setMostrarZona(actual => !actual)}>{mostrarZona ? 'Ocultar zona Imou' : 'Mostrar zona Imou'}</button>
            <button type="button" disabled={guardarOcupado || hayPendientes || !!guardadoPendiente} className="action-danger border rounded px-3 py-2" onClick={() => {
              if (window.confirm('¿Preparar la eliminación de la zona? Se aplicará al guardar la configuración.')) {
                setMostrarZona(false);
                setZona([]); setAutomaticoBorrador(false); setCambiosSinGuardar(true);
                bloqueoCarga.current = true; setConfirmacionGuardado('');
              }
            }}>Eliminar zona Imou</button>
          </>}
        </div> : <div className="mt-2">
          <p className="text-sm">Marca al menos 3 puntos sobre la imagen analizada. Puntos: {borrador.length} de 30.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <button type="button" disabled={guardarOcupado || hayPendientes} className="bg-indigo-600 text-white rounded px-3 py-2" onClick={() => {
              if (!zonaValida(borrador)) { setErrorZona('Marca al menos 3 puntos distintos formando una zona sin cruces.'); return; }
              setDibujando(false); setMostrarZona(false); setErrorZona('');
              setZona(borrador); setCambiosSinGuardar(true); bloqueoCarga.current = true;
            }}>Completar zona Imou</button>
            <button type="button" className="border rounded px-3 py-2" disabled={!borrador.length} onClick={() => setBorrador(actual => actual.slice(0, -1))}>Deshacer punto Imou</button>
            <button type="button" className="border rounded px-3 py-2" onClick={() => {
              bloqueoCarga.current = cambiosSinGuardar; setDibujando(false); setErrorZona('');
            }}>Cancelar zona Imou</button>
          </div>
        </div>)}
        {errorZona && <p role="alert" className="text-red-700 mt-2">{errorZona}</p>}
        {zona.length > 0 && !dibujando && <div className="mt-2 text-sm">
          <p>Verde al detectar el vehículo; amarillo durante la tolerancia y rojo con aviso al alcanzar el tiempo configurado.</p>
          <label>Tiempo mínimo detenido Imou (2 a 120 segundos):{' '}
            <input type="number" min="2" max="120" step="1" value={segundos} className="border rounded p-1 w-20"
              disabled={!esAdmin || guardarOcupado || hayPendientes || !!guardadoPendiente}
              onChange={event => { bloqueoCarga.current = true; setCambiosSinGuardar(true); setConfirmacionGuardado(''); setSegundos(event.target.value); }}
              onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }}
              />
          </label>
          {!tiempoValido && <p role="alert" className="text-red-700">Introduce un número entero entre 2 y 120 para activar la detección.</p>}
          <p className="mt-1">Rojo indica un posible vehículo detenido; necesita revisión.</p>
          <label className="block mt-2"><input type="checkbox" checked={automaticoBorrador}
            disabled={!esAdmin || guardarOcupado || hayPendientes || !!guardadoPendiente || !tiempoValido}
            onChange={event => { bloqueoCarga.current = true; setCambiosSinGuardar(true); setConfirmacionGuardado(''); setAutomaticoBorrador(event.target.checked); }} />{' '}
            Registrar automáticamente los hallazgos de la Imou y avisar a los guardias.</label>
        </div>}
        {esAdmin && configLista && pieConfiguracion && !piscinaSeleccionada && createPortal(<div className="configuracion-guardar">
          {cambiosSinGuardar && <p role="status">Cambios sin guardar. El monitor sigue usando la configuración guardada.</p>}
          <button type="button" className="imou-primary" disabled={dibujando || guardarOcupado || hayPendientes || (!guardadoPendiente && (!cambiosSinGuardar || !tiempoValido))}
            onClick={() => { setErrorZona(''); void guardarConfiguracion(guardadoPendiente || { puntos: zona, segundos: Number(segundos), automatico: zona.length > 0 && automaticoBorrador }); }}>
            {guardarOcupado ? 'Guardando…' : 'Guardar configuración'}
          </button>
        </div>, pieConfiguracion)}
      </div>}
      </div>
    </div>
    {visorAnalizado && createPortal(activo && <div className="imou-vista-ia bg-black">
      {configuracion && <span className="imou-view-label">Imagen analizada con IA</span>}
      <canvas ref={canvas} aria-label="Imagen Imou analizada con IA" />
      {imagenLista && configuracion && !piscinaSeleccionada && <ZonaVideo puntos={dibujando ? borrador : mostrarZona ? zona : []} activa={dibujando}
        onAgregar={punto => setBorrador(actual => actual.length < 30 ? [...actual, punto] : actual)} />}
    </div>, visorAnalizado)}
  </>;
}
