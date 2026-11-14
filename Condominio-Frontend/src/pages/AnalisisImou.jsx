import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { analizarFotograma, estadoCamaraDemo, obtenerZonaImou, guardarZonaImou } from '../api/visionDemoApi.js';
import { useSession } from '../auth/sessionContext.js';
import { crearSeguimiento, intervaloNoConfiable } from '../vision/permanencia.js';
import { colorDeteccion } from '../vision/coloresDeteccion.js';
import { zonaValida } from '../vision/zonas.js';
import ZonaVideo from './ZonaVideo.jsx';
import './VideoArchivoDemostracion.css';

const nombres = { person: 'persona', car: 'automóvil', motorcycle: 'motocicleta',
  bus: 'autobús', truck: 'camión', cat: 'gato', dog: 'perro' };
const vehiculos = new Set(['car', 'motorcycle', 'bus', 'truck']);

function dibujar(canvas, imagen, detecciones, config) {
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
    const permanencia = deteccion.permanencia;
    const detalle = advertencia ? ' · revisar'
      : permanencia ? ` · ${permanencia.segundos.toFixed(1)}/${config.segundos} s en zona` : '';
    const color = colorDeteccion(deteccion);
    const texto = `${nombres[deteccion.clase] || deteccion.clase} ${Math.round(deteccion.confianza * 100)}%${detalle}`;
    const y = Math.max(19, y1);
    ctx.strokeStyle = color;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    if (config.zona.length && vehiculos.has(deteccion.clase)) {
      // Punto que la regla comprueba sobre el suelo; no es el centro de toda la caja.
      ctx.beginPath(); ctx.arc((x1 + x2) / 2, y2, 4, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.stroke();
    }
    ctx.fillStyle = '#111';
    ctx.fillRect(x1, y - 19, ctx.measureText(texto).width + 8, 20);
    ctx.fillStyle = '#fff';
    ctx.fillText(texto, x1 + 4, y - 4);
  }
}

export default function AnalisisImou({ ultimoFotograma, muestraAnalizada, automatico, cambiarAutomatico,
  desactivarRegistro, registrarHallazgo, hayPendientes, activo, setActivo,
  configuracion, visorAnalizado, monitorIndependiente }) {
  const { user } = useSession();
  const esAdmin = user?.role === 'administrador';
  const [mensaje, setMensaje] = useState('');
  const [zona, setZona] = useState([]);
  const [borrador, setBorrador] = useState([]);
  const [dibujando, setDibujando] = useState(false);
  const [mostrarZona, setMostrarZona] = useState(false);
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
      setConfirmacionGuardado('Configuración Imou guardada.');
    } catch {
      setZona(guardado.current.puntos); setSegundos(String(guardado.current.segundos));
      setAutomaticoBorrador(guardado.current.automatico);
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
                ? 'Amarillo: contando tiempo dentro de la zona. Rojo: tiempo mínimo cumplido; requiere revisión.'
                : coches.length ? 'El punto inferior de los vehículos detectados está fuera de la zona.'
                  : 'Sin vehículos detectados en esta imagen. Una pérdida breve pausa el conteo; no suma tiempo.';
          }
          ultimaMuestra.current = muestra.tiempo;
          dibujar(canvas.current, bitmap, detecciones, config);
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
      {configuracion && <p className="text-sm mb-2">El análisis puede ir más lento que la imagen en directo. El registro automático se activa por separado.</p>}
      {mensaje && <p role="status" className="text-sm mb-2">{mensaje}</p>}
      {activo && estadoSeguimiento && <p role="status" className="text-sm mb-2">{estadoSeguimiento}</p>}
      <div className="imou-registration-status" aria-label="Estado del registro Imou">
        {configError ? <p role="alert">{configError}</p> : <p role="status">
          {guardarOcupado ? 'Guardando configuración… Registro pausado temporalmente.'
            : !configLista ? 'Cargando configuración del registro…'
              : !zona.length ? 'Registro desactivado: todavía no hay una zona guardada. El administrador debe dibujarla y guardar la configuración de avisos.'
                : !activo ? 'Registro detenido: activa la IA para evaluar la zona guardada.'
                  : automatico ? 'Registro automático activo: los nuevos hallazgos se enviarán a revisión de los guardias.'
                    : hayPendientes ? 'Registro pausado: reintenta el evento pendiente antes de continuar.'
                      : automaticoBorrador ? 'El registro automático está detenido en esta sesión. Revisa la configuración o el mensaje de error.'
                        : 'Registro automático desactivado: se muestran detecciones, pero no se crean eventos ni avisos. El administrador puede habilitarlo en Configuración de análisis.'}
        </p>}
        {confirmacionGuardado && <p role="status">{confirmacionGuardado}</p>}
        {esAdmin && guardadoPendiente && <button type="button" disabled={guardarOcupado || hayPendientes}
          className="imou-primary" onClick={() => guardarConfiguracion(guardadoPendiente)}>Reintentar guardado</button>}
      </div>
      <div hidden={!configuracion}>
      {activo && imagenLista && <div className="mt-3 imou-zone-settings">
        <h4 className="font-medium">Zona de estacionamiento Imou</h4>
        <p className="text-sm mt-1">{esAdmin ? 'Al completar una zona se guarda automáticamente y reemplaza la anterior.' : 'La zona y el tiempo son configurados por el administrador.'}</p>
        <p className="text-sm mt-1">La zona se marca sobre el suelo. El punto en el centro inferior del recuadro indica la posición evaluada; debe quedar dentro de la zona.</p>
        {esAdmin && configLista && (!dibujando ? <div className="flex flex-wrap gap-2 mt-2">
          <button type="button" disabled={guardarOcupado || hayPendientes || !!guardadoPendiente} className="border rounded px-3 py-2" onClick={() => {
            bloqueoCarga.current = true; setBorrador([]); setDibujando(true); setErrorZona(''); setConfirmacionGuardado('');
          }}>{zona.length ? 'Cambiar zona Imou' : 'Dibujar zona Imou'}</button>
          {zona.length > 0 && <>
            <button type="button" className="border rounded px-3 py-2" onClick={() => setMostrarZona(actual => !actual)}>{mostrarZona ? 'Ocultar zona Imou' : 'Mostrar zona Imou'}</button>
            <button type="button" disabled={guardarOcupado || hayPendientes || !!guardadoPendiente} className="action-danger border rounded px-3 py-2" onClick={() => {
              if (window.confirm('¿Eliminar la zona Imou? Se detendrá el registro automático hasta configurar una nueva zona.')) {
                setMostrarZona(false);
                void guardarConfiguracion({ ...guardado.current, puntos: [], automatico: false });
              }
            }}>Eliminar zona Imou</button>
          </>}
        </div> : <div className="mt-2">
          <p className="text-sm">Marca al menos 3 puntos sobre la imagen analizada. Puntos: {borrador.length} de 30.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <button type="button" disabled={guardarOcupado || hayPendientes} className="bg-indigo-600 text-white rounded px-3 py-2" onClick={() => {
              if (!zonaValida(borrador)) { setErrorZona('Marca al menos 3 puntos distintos formando una zona sin cruces.'); return; }
              setDibujando(false); setMostrarZona(false); setErrorZona('');
              void guardarConfiguracion({ ...guardado.current, puntos: borrador });
            }}>Completar zona Imou</button>
            <button type="button" className="border rounded px-3 py-2" disabled={!borrador.length} onClick={() => setBorrador(actual => actual.slice(0, -1))}>Deshacer punto Imou</button>
            <button type="button" className="border rounded px-3 py-2" onClick={() => {
              bloqueoCarga.current = false; setDibujando(false); setErrorZona('');
            }}>Cancelar zona Imou</button>
          </div>
        </div>)}
        {errorZona && <p role="alert" className="text-red-700 mt-2">{errorZona}</p>}
        {zona.length > 0 && !dibujando && <div className="mt-2 text-sm">
          <label>Tiempo mínimo detenido Imou (2 a 120 segundos):{' '}
            <input type="number" min="2" max="120" step="1" value={segundos} className="border rounded p-1 w-20"
              disabled={!esAdmin || guardarOcupado || hayPendientes || !!guardadoPendiente}
              onFocus={() => { bloqueoCarga.current = true; }}
              onChange={event => { setConfirmacionGuardado(''); setSegundos(event.target.value); }}
              onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }}
              onBlur={() => {
                bloqueoCarga.current = false;
                if (pendientesRef.current || guardando.current) {
                  setSegundos(String(guardado.current.segundos));
                  setErrorZona('El cambio de tiempo no se aplicó porque hay un evento pendiente.');
                } else if (!tiempoValido || !segundos.trim()) {
                  setSegundos(String(guardado.current.segundos));
                  setErrorZona('El tiempo debe ser un número entero entre 2 y 120 segundos. Se conservó el valor anterior.');
                } else if (Number(segundos) !== guardado.current.segundos) {
                  setErrorZona(''); void guardarConfiguracion({ ...guardado.current, segundos: Number(segundos) });
                }
              }} />
          </label>
          {!tiempoValido && <p role="alert" className="text-red-700">Introduce un número entero entre 2 y 120 para activar la detección.</p>}
          <p className="mt-1">Rojo indica un posible vehículo detenido; necesita revisión.</p>
          <label className="block mt-2"><input type="checkbox" checked={automaticoBorrador}
            disabled={!esAdmin || guardarOcupado || hayPendientes || !!guardadoPendiente || !tiempoValido}
            onChange={event => { void guardarConfiguracion({ ...guardado.current, automatico: event.target.checked }); }} />{' '}
            Registrar automáticamente los hallazgos de la Imou y avisar a los guardias.</label>
          <p className="mt-1">Los cambios se guardan automáticamente.</p>
          <p className="mt-1">Al activarlo se crean eventos reales para revisión con el fotograma analizado. Una pérdida de seguimiento puede generar duplicados.</p>
        </div>}
      </div>}
      </div>
    </div>
    {visorAnalizado && createPortal(activo && <div className="imou-vista-ia bg-black">
      {configuracion && <span className="imou-view-label">Imagen analizada con IA</span>}
      <canvas ref={canvas} aria-label="Imagen Imou analizada con IA" />
      {imagenLista && configuracion && <ZonaVideo puntos={dibujando ? borrador : mostrarZona ? zona : []} activa={dibujando}
        onAgregar={punto => setBorrador(actual => actual.length < 30 ? [...actual, punto] : actual)} />}
    </div>, visorAnalizado)}
  </>;
}
