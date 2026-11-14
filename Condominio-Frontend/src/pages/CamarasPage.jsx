import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from '../api/client.js';
import './CamarasPage.css';
import FuncionesPropuestasCamara from '../components/FuncionesPropuestasCamara.jsx';
import { posibleDuplicada } from './camarasDuplicadas.js';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('access')}`;
  return config;
});
const inicial = { nombre: '', ubicacion: '', tipo: 'RED', fabricante: '', modelo: '', direccion_ip: '', puerto_rtsp: '554', usuario_dispositivo: '', ruta_rtsp: '', contrasena_nueva: '', eliminar_contrasena: false, activa: true };
const rutaPerfilImou = '/cam/realmonitor?channel=1&subtype=1';

export default function CamarasPage() {
  const [camaras, setCamaras] = useState([]);
  const [verPosiblesDuplicadas, setVerPosiblesDuplicadas] = useState(false);
  const [form, setForm] = useState(inicial);
  const [editando, setEditando] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [probando, setProbando] = useState(null);
  const [incorporando, setIncorporando] = useState(false);
  const [vinculando, setVinculando] = useState(false);
  const [pruebas, setPruebas] = useState({});
  const controladorPrueba = useRef(null);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarActual, setMostrarActual] = useState(false);
  const [claveActual, setClaveActual] = useState('');
  const [rutaImou, setRutaImou] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [halladas, setHalladas] = useState(null);
  const [estadoBusqueda, setEstadoBusqueda] = useState('');
  const [puertoOnvif, setPuertoOnvif] = useState('80');
  const [origenPuerto, setOrigenPuerto] = useState('predeterminado');
  const [dispositivos, setDispositivos] = useState([]);
  const [consultandoOnvif, setConsultandoOnvif] = useState(false);
  const [perfilesOnvif, setPerfilesOnvif] = useState([]);
  const [mensajeOnvif, setMensajeOnvif] = useState('');
  const [editarRuta, setEditarRuta] = useState(false);
  const [perfilRuta, setPerfilRuta] = useState('manual');
  const [nombrePerfilOnvif, setNombrePerfilOnvif] = useState('');
  const rutaManual = useRef('');
  const accesoVersion = useRef(0);
  const onvifVersion = useRef(0);

  function limpiarAcceso() { accesoVersion.current += 1; onvifVersion.current += 1; setClaveActual(''); setMostrarActual(false); setMostrarNueva(false); setRutaImou(null); setPerfilRuta('manual'); setNombrePerfilOnvif(''); rutaManual.current = ''; setHalladas(null); setDispositivos([]); setEstadoBusqueda(''); setBuscando(false); setPuertoOnvif('80'); setOrigenPuerto('predeterminado'); setConsultandoOnvif(false); setPerfilesOnvif([]); setMensajeOnvif(''); setEditarRuta(false); }

  useEffect(() => () => controladorPrueba.current?.abort(), []);

  useEffect(() => {
    let vigente = true;
    api.get('camaras/').then(({ data }) => { if (vigente) setCamaras(data.results || data); })
      .catch(() => { if (vigente) setError('No se pudo cargar el catálogo de cámaras.'); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, []);
  function nuevo() { limpiarAcceso(); setForm(inicial); setEditando(null); setError(''); setAviso(''); setAbierto(true); }
  async function incorporarImou() {
    if (incorporando) return;
    setIncorporando(true); setError(''); setAviso('');
    try {
      const { data } = await api.post('camaras/registrar-imou/');
      setCamaras(actual => [...actual, data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setAviso('Imou local agregada al catálogo. Ahora puedes probar la conexión.');
    } catch (err) {
      setError(err.response?.status === 409
        ? 'No se encontró la configuración local de Imou o ya existe un registro con esa dirección y puerto.'
        : 'No se pudo agregar la Imou. Comprueba tu acceso y vuelve a intentarlo.');
    } finally { setIncorporando(false); }
  }
  async function vincularMonitor(camara) {
    if (vinculando) return;
    setVinculando(true); setError(''); setAviso('');
    try {
      const { data } = await api.post(`camaras/${camara.id}/vincular-monitor/`);
      setCamaras(actual => actual.map(c => c.id === data.id ? data : c));
      setAviso('Cámara vinculada al monitor. Reinicia el puente de cámara para usar la configuración del catálogo.');
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo vincular la cámara al monitor.');
    } finally { setVinculando(false); }
  }
  function editar(camara) {
    limpiarAcceso();
    if (camara.vinculo_imou === 'sin_vinculo' && camara.modelo === 'IPC-K3DN-3H0WF' && camara.ruta_rtsp === rutaPerfilImou) setPerfilRuta('imou_bullet_2e');
    rutaManual.current = camara.ruta_rtsp || '';
    setForm({ ...camara, direccion_ip: camara.direccion_ip || '', puerto_rtsp: camara.puerto_rtsp || '', usuario_dispositivo: camara.usuario_dispositivo || '', ruta_rtsp: camara.ruta_rtsp || '', contrasena_nueva: '', eliminar_contrasena: false });
    setEditando(camara.id); setError(''); setAviso(''); setAbierto(true);
    if (['vinculada', 'deshabilitada'].includes(camara.vinculo_imou)) {
      const version = accesoVersion.current;
      api.get(`camaras/${camara.id}/acceso-local/`).then(({ data }) => {
        if (version === accesoVersion.current) { setForm(actual => ({ ...actual, usuario_dispositivo: data.usuario || '' })); setRutaImou(data.ruta_rtsp_local || null); }
      }).catch(() => { if (version === accesoVersion.current) setError('No se pudo consultar el usuario de la Imou local.'); });
    }
  }
  async function alternarActual() {
    if (mostrarActual) { setMostrarActual(false); return; }
    if (claveActual) { setMostrarActual(true); return; }
    const version = accesoVersion.current;
    try {
      const { data } = await api.post(`camaras/${editando}/acceso-local/`);
      if (version === accesoVersion.current) { setClaveActual(data.contrasena); setMostrarActual(true); }
    } catch { if (version === accesoVersion.current) setError('No se pudo consultar la contraseña. Comprueba que accedes como administrador desde este equipo.'); }
  }
  function cambiar(e) {
    const { name, value, type, checked } = e.target;
    if (name === 'direccion_ip') { setPuertoOnvif('80'); setOrigenPuerto('predeterminado'); }
    if (['direccion_ip', 'usuario_dispositivo', 'contrasena_nueva', 'tipo'].includes(name)) { onvifVersion.current += 1; setPerfilesOnvif([]); setMensajeOnvif(''); setConsultandoOnvif(false); }
    if (name === 'direccion_ip' && perfilRuta === 'onvif') setPerfilRuta('manual');
    if (name === 'tipo') { setPerfilRuta('manual'); rutaManual.current = ''; }
    if (name === 'ruta_rtsp' && perfilRuta === 'manual') rutaManual.current = value;
    setForm(actual => ({ ...actual, [name]: type === 'checkbox' ? checked : value,
      ...(name === 'direccion_ip' && perfilRuta === 'onvif' ? { ruta_rtsp: rutaManual.current } : {}),
      ...(name === 'tipo' ? { direccion_ip: '', puerto_rtsp: value === 'RED' ? '554' : '', usuario_dispositivo: '', ruta_rtsp: '', contrasena_nueva: '' } : {}) }));
  }
  function seleccionarPerfil(e) {
    const nuevoPerfil = e.target.value;
    if (perfilRuta === 'manual') rutaManual.current = form.ruta_rtsp;
    setPerfilRuta(nuevoPerfil);
    setForm(actual => ({ ...actual, ruta_rtsp: nuevoPerfil === 'imou_bullet_2e' ? rutaPerfilImou : rutaManual.current,
      ...(nuevoPerfil === 'imou_bullet_2e' ? { fabricante: 'Imou', modelo: 'IPC-K3DN-3H0WF' } : {}) }));
  }
  async function buscarCamaras() {
    if (buscando) return;
    const version = accesoVersion.current;
    setBuscando(true); setHalladas(null); setEstadoBusqueda('');
    try {
      const { data } = await api.post('camaras/buscar-red/', null, { timeout: 8000 });
      if (version !== accesoVersion.current) return;
      if (data.estado === 'completado') {
        setHalladas(data.direcciones);
        setDispositivos(data.dispositivos || []);
        setEstadoBusqueda(data.direcciones.length ? 'Estos dispositivos respondieron a la búsqueda. Verifica a qué cámara corresponde cada dirección.' : 'Ningún dispositivo respondió a esta búsqueda. Esto no significa que las cámaras registradas estén desconectadas.');
      } else setEstadoBusqueda(data.estado === 'ocupado' ? 'Ya hay una búsqueda en curso. Inténtalo nuevamente.' : 'No se pudo buscar en la red local. Puedes introducir la IP manualmente.');
    } catch { if (version === accesoVersion.current) setEstadoBusqueda('No se pudo buscar en la red local. Puedes introducir la IP manualmente.'); }
    finally { if (version === accesoVersion.current) setBuscando(false); }
  }
  function usarDireccion(ip) {
    cambiar({ target: { name: 'direccion_ip', value: ip } });
    const puerto = dispositivos.find(d => d.ip === ip)?.puerto_onvif;
    if (puerto) { setPuertoOnvif(String(puerto)); setOrigenPuerto('anunciado'); }
  }
  async function consultarOnvif() {
    if (consultandoOnvif) return;
    const version = accesoVersion.current;
    const solicitud = ++onvifVersion.current;
    setConsultandoOnvif(true); setPerfilesOnvif([]); setMensajeOnvif('');
    try {
      const { data } = await api.post('camaras/consultar-onvif/', { ip: form.direccion_ip.trim(), puerto_onvif: Number(puertoOnvif), usuario: form.usuario_dispositivo.trim(), contrasena: form.contrasena_nueva }, { timeout: 45000 });
      if (version !== accesoVersion.current || solicitud !== onvifVersion.current) return;
      setPerfilesOnvif(data.perfiles);
      setMensajeOnvif(data.perfiles.length ? 'Selecciona el perfil de video que deseas usar y prueba la conexión después de guardar.' : 'No se encontraron perfiles de video compatibles. Puedes ingresar la ruta manualmente.');
    } catch { if (version === accesoVersion.current && solicitud === onvifVersion.current) setMensajeOnvif('No se pudo consultar ONVIF. Revisa IP, puerto ONVIF, credenciales y compatibilidad; también puedes ingresar la ruta manualmente.'); }
    finally { if (version === accesoVersion.current && solicitud === onvifVersion.current) setConsultandoOnvif(false); }
  }
  function usarPerfilOnvif(perfil) {
    if (perfilRuta === 'manual') rutaManual.current = form.ruta_rtsp;
    setNombrePerfilOnvif(perfil.nombre);
    setPerfilRuta('onvif');
    setForm(actual => ({ ...actual, ruta_rtsp: perfil.ruta_rtsp, puerto_rtsp: String(perfil.puerto_rtsp) }));
  }
  async function guardar(e) {
    e.preventDefault(); if (ocupado) return;
    setOcupado(true); setError(''); setAviso('');
    const datos = { nombre: form.nombre.trim(), ubicacion: form.ubicacion.trim(), tipo: form.tipo,
      fabricante: form.fabricante.trim(), modelo: form.modelo.trim(), activa: form.activa,
      usuario_dispositivo: form.tipo === 'RED' ? form.usuario_dispositivo.trim() : '',
      ruta_rtsp: form.tipo === 'RED' ? form.ruta_rtsp.trim() : '',
      direccion_ip: form.tipo === 'RED' ? form.direccion_ip.trim() : null,
      puerto_rtsp: form.tipo === 'RED' ? Number(form.puerto_rtsp) : null };
    if (form.contrasena_nueva) datos.contrasena_nueva = form.contrasena_nueva;
    if (form.eliminar_contrasena) datos.eliminar_contrasena = true;
    try {
      const respuesta = editando ? await api.put(`camaras/${editando}/`, datos) : await api.post('camaras/', datos);
      setCamaras(actual => [...actual.filter(c => c.id !== respuesta.data.id), respuesta.data].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      limpiarAcceso(); setAbierto(false); setForm(inicial); setPruebas({}); setAviso('Cámara guardada en el catálogo.');
    } catch (err) {
      setError(err.response?.status === 400 ? 'Revisa los campos y la configuración de credenciales; no incluyas contraseñas en la ruta RTSP.' : 'No se pudo guardar la cámara. Comprueba tu conexión y vuelve a intentarlo.');
    } finally { setOcupado(false); }
  }
  async function probar(camara) {
    if (probando !== null) return;
    const controller = new AbortController();
    controladorPrueba.current = controller;
    setProbando(camara.id); setPruebas(actual => ({ ...actual, [camara.id]: 'Comprobando…' }));
    try {
      let data;
      if (camara.vinculo_imou !== 'vinculada') {
        ({ data } = await api.post(`camaras/${camara.id}/probar-red/`, null, { timeout: 20000, signal: controller.signal }));
      } else for (let intento = 0; intento < 12 && !controller.signal.aborted; intento++) {
        ({ data } = await api.post(`camaras/${camara.id}/probar-imou/`, null, { timeout: 6000, signal: controller.signal }));
        if (data.estado !== 'conectando') break;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      if (controller.signal.aborted) return;
      const mensajes = { disponible: 'Conexión comprobada: el puente recibió una imagen.',
        conectando: 'La cámara no entregó una imagen a tiempo. Comprueba la cámara y el servicio local, y vuelve a probar.',
        no_disponible: 'No se recibió imagen. Revisa conexión, usuario, contraseña y ruta RTSP.',
        configuracion_incompleta: 'Completa la IP privada, puerto y ruta RTSP; si usas credenciales, indica usuario y contraseña.',
        servicio_no_disponible: 'No está disponible el entorno local de visión para comprobar la cámara.',
        ocupado: 'Hay otra comprobación en curso. Inténtalo de nuevo en unos segundos.' };
      if (data?.estado === 'disponible' && camara.vinculo_imou !== 'vinculada') mensajes.disponible = 'Conexión comprobada: se recibió una imagen de la cámara.';
      setPruebas(actual => ({ ...actual, [camara.id]: mensajes[data?.estado] || 'No se pudo comprobar la conexión.' }));
    } catch (err) {
      if (controller.signal.aborted) return;
      setPruebas(actual => ({ ...actual, [camara.id]: err.response?.status === 409
        ? 'No se puede identificar una Imou única y habilitada con esta configuración.'
        : 'No se pudo comprobar la conexión. Revisa el acceso y los servicios locales.' }));
    } finally {
      if (!controller.signal.aborted) setProbando(null);
      if (controladorPrueba.current === controller) controladorPrueba.current = null;
    }
  }
  const posiblesDuplicadas = camaras.filter(c => posibleDuplicada(c, camaras));
  const visibles = verPosiblesDuplicadas ? camaras : camaras.filter(c => !posibleDuplicada(c, camaras));
  return <div className="cam-catalogo">
    <header><div><p>ADMINISTRACIÓN</p><h1>Gestión de cámaras</h1></div><div className="cam-botones"><button onClick={incorporarImou} disabled={incorporando}>{incorporando ? 'Agregando…' : 'Agregar Imou configurada'}</button><button onClick={nuevo}>Añadir cámara</button></div></header>
    <p className="cam-ayuda">Registra tus cámaras. El catálogo reconoce la Imou local cuando su IP y puerto coinciden con la configuración existente. Habilitar o deshabilitar aquí solo modifica el catálogo; no detiene la cámara ni el monitoreo.</p>
    {error && !abierto && <p role="alert" className="cam-error">{error}</p>}{aviso && <p role="status" className="cam-aviso">{aviso}</p>}
    {posiblesDuplicadas.length > 0 && <div className="cam-busqueda"><p>Hay {posiblesDuplicadas.length} registro(s) con la misma dirección y puerto que la cámara vinculada. Podrían corresponder a la misma cámara; no se han eliminado ni desactivado.</p>
      <button type="button" aria-expanded={verPosiblesDuplicadas} onClick={() => setVerPosiblesDuplicadas(!verPosiblesDuplicadas)}>{verPosiblesDuplicadas ? 'Ocultar posibles duplicados' : 'Ver posibles duplicados'}</button></div>}
    {cargando ? <p>Cargando cámaras…</p> : <div className="cam-lista">
      {!camaras.length && <p>No hay cámaras registradas.</p>}
      {visibles.map(c => <article key={c.id}><div><h2>{c.nombre}</h2><p>{c.ubicacion || 'Ubicación no indicada'} · {c.tipo === 'RED' ? 'Cámara de red' : 'Cámara local'}</p><p>{c.fabricante || 'Fabricante no indicado'} {c.modelo}</p>
        {posibleDuplicada(c, camaras) && <p>Posible duplicado de la cámara vinculada al monitor. Verifica el dispositivo antes de modificarlo.</p>}
        {c.vinculo_imou === 'vinculada' && <p>{c.monitor_en_catalogo ? 'Vinculada al monitor: la conexión usa los datos del catálogo.' : 'Coincide con la Imou configurada en este equipo.'}</p>}
        {c.vinculo_imou === 'ambiguo' && <p>Hay varios registros con la misma IP y puerto; corrígelos para identificar la Imou.</p>}
        {c.vinculo_imou === 'deshabilitada' && <p>El registro coincide con la Imou local, pero está deshabilitado en el catálogo.</p>}
        {pruebas[c.id] && <p role="status">{pruebas[c.id]}</p>}
        <FuncionesPropuestasCamara camara={c} api={api} />
      </div><div><span>{c.activa ? 'Habilitada en catálogo' : 'Deshabilitada en catálogo'}</span>
        {c.activa && c.tipo === 'RED' && (c.vinculo_imou === 'vinculada' || c.vinculo_imou === 'sin_vinculo') && <button onClick={() => probar(c)} disabled={probando !== null}>{probando === c.id ? 'Comprobando…' : 'Probar conexión'}</button>}
        {c.vinculo_imou === 'vinculada' && <Link to="/admin/monitor-camaras">Abrir monitor</Link>}
        {c.vinculo_imou === 'vinculada' && !c.monitor_en_catalogo && <button onClick={() => vincularMonitor(c)} disabled={vinculando || probando !== null}>{vinculando ? 'Vinculando…' : 'Vincular al monitor'}</button>}
        <button onClick={() => editar(c)} disabled={probando !== null}>Editar</button></div></article>)}
    </div>}
    {abierto && <div className="cam-formulario"><form onSubmit={guardar}>
      <h2>{editando ? 'Editar cámara' : 'Registrar cámara'}</h2>
      <p>Las contraseñas del catálogo se guardan cifradas. Para ver una contraseña guardada, utiliza el ojo desde este equipo como administrador.</p>
      {['vinculada', 'deshabilitada'].includes(form.vinculo_imou) && <p>{form.monitor_en_catalogo ? 'El monitor utiliza esta configuración del catálogo. Detén y reinicia la vista tras cambiar la IP.' : 'Los cambios de acceso en este formulario no modifican la conexión local de la Imou existente.'}</p>}
      {error && <p role="alert" className="cam-error">{error}</p>}
      {!editando && form.tipo === 'RED' && <div className="cam-busqueda"><button type="button" onClick={buscarCamaras} disabled={buscando}>{buscando ? 'Buscando…' : 'Buscar cámaras en la red'}</button><p>Busca dispositivos ONVIF compatibles en la red local. La búsqueda no configura cámaras ni obtiene contraseñas o rutas de video.</p>{estadoBusqueda && <p role="status">{estadoBusqueda}</p>}
        {halladas && camaras.some(c => c.tipo === 'RED' && c.direccion_ip) && <div><strong>Ya registradas en el sistema</strong>{camaras.filter(c => c.tipo === 'RED' && c.direccion_ip).map(c => <div key={c.id}><p>{c.nombre} · {c.direccion_ip} · {halladas.includes(c.direccion_ip) ? 'Respondió una dirección coincidente' : 'No respondió en esta búsqueda'}</p>{halladas.includes(c.direccion_ip) && dispositivos.find(d => d.ip === c.direccion_ip)?.puerto_onvif && <small>Puerto ONVIF anunciado: {dispositivos.find(d => d.ip === c.direccion_ip).puerto_onvif}; no comprobado.</small>}</div>)}<small>La coincidencia de IP no confirma la identidad; la dirección guardada puede haber cambiado.</small></div>}
        {halladas?.map(ip => camaras.some(c => c.tipo === 'RED' && c.direccion_ip === ip) ? null : <button type="button" key={ip} onClick={() => usarDireccion(ip)}>Usar {ip}</button>)}
      </div>}
      <div className="cam-campos">
        <label>Nombre <input required maxLength="100" name="nombre" value={form.nombre} onChange={cambiar} /></label>
        <label>Ubicación <input maxLength="150" name="ubicacion" value={form.ubicacion} onChange={cambiar} /></label>
        <label>Tipo de cámara <select name="tipo" value={form.tipo} onChange={cambiar}><option value="RED">Cámara de red (Wi‑Fi o cable)</option><option value="LOCAL">Cámara local</option></select></label>
        <label>Fabricante <input maxLength="80" name="fabricante" value={form.fabricante} onChange={cambiar} /></label>
        <label>Modelo <input maxLength="100" name="modelo" value={form.modelo} onChange={cambiar} /></label>
        {form.tipo === 'RED' && <><label>Dirección IPv4 <input required name="direccion_ip" value={form.direccion_ip} onChange={cambiar} placeholder="Ejemplo: 192.168.0.31" /></label>
          <label>Puerto RTSP <input required type="number" min="1" max="65535" name="puerto_rtsp" value={form.puerto_rtsp} onChange={cambiar} /></label>
          <label>Usuario de la cámara <input maxLength="150" name="usuario_dispositivo" value={form.usuario_dispositivo} onChange={cambiar} autoComplete="off" /></label>
          {!['vinculada', 'deshabilitada'].includes(form.vinculo_imou) && <label>Perfil de conexión <select value={perfilRuta} onChange={seleccionarPerfil}><option value="manual">Otra cámara: ingresar ruta manualmente</option><option value="imou_bullet_2e">Imou Bullet 2E (IPC-K3DN-3H0WF): flujo secundario</option>{perfilRuta === 'onvif' && <option value="onvif">ONVIF: {nombrePerfilOnvif}</option>}</select><small>El perfil propone la ruta utilizada con tu cámara. Verifica la conexión después de guardarla.</small></label>}
          <label>Ruta RTSP <input maxLength="500" name="ruta_rtsp" value={['vinculada', 'deshabilitada'].includes(form.vinculo_imou) ? (rutaImou || '') : form.ruta_rtsp} onChange={cambiar} readOnly={['vinculada', 'deshabilitada'].includes(form.vinculo_imou) || perfilRuta !== 'manual' || (!!editando && !editarRuta)} placeholder={['vinculada', 'deshabilitada'].includes(form.vinculo_imou) ? 'Ruta no disponible' : 'Ejemplo: /cam/realmonitor?channel=1&subtype=1'} />{['vinculada', 'deshabilitada'].includes(form.vinculo_imou) && <small>{form.monitor_en_catalogo ? 'Ruta guardada en el catálogo (solo lectura).' : 'Ruta de la configuración local de Imou (solo lectura).'}</small>}{perfilRuta !== 'manual' && <small>Ruta propuesta por el perfil; selecciona la opción manual para usar otra.</small>}{editando && !['vinculada', 'deshabilitada'].includes(form.vinculo_imou) && perfilRuta === 'manual' && <button type="button" onClick={() => setEditarRuta(!editarRuta)}>{editarRuta ? 'Bloquear edición de ruta' : 'Permitir edición de ruta'}</button>}</label>
          {(form.contrasena_configurada || ['vinculada', 'deshabilitada'].includes(form.vinculo_imou)) && <label>Contraseña actual <span className="cam-clave"><input type={mostrarActual ? 'text' : 'password'} value={claveActual} placeholder="Contraseña guardada" readOnly autoComplete="off" /><button type="button" aria-label={mostrarActual ? 'Ocultar contraseña actual' : 'Mostrar contraseña actual'} onClick={alternarActual}>{mostrarActual ? <FaEyeSlash /> : <FaEye />}</button></span></label>}
          <label>{form.contrasena_configurada || ['vinculada', 'deshabilitada'].includes(form.vinculo_imou) ? 'Nueva contraseña del catálogo (opcional)' : 'Contraseña de la cámara'} <span className="cam-clave"><input type={mostrarNueva ? 'text' : 'password'} maxLength="512" name="contrasena_nueva" value={form.contrasena_nueva} onChange={cambiar} disabled={form.eliminar_contrasena} autoComplete="new-password" /><button type="button" aria-label={mostrarNueva ? 'Ocultar contraseña nueva' : 'Mostrar contraseña nueva'} onClick={() => setMostrarNueva(!mostrarNueva)}>{mostrarNueva ? <FaEyeSlash /> : <FaEye />}</button></span></label></>}
        {form.contrasena_configurada && <label className="cam-check"><input type="checkbox" name="eliminar_contrasena" checked={form.eliminar_contrasena} onChange={cambiar} disabled={!!form.contrasena_nueva} /> Eliminar contraseña guardada</label>}
        <label className="cam-check"><input type="checkbox" name="activa" checked={form.activa} onChange={cambiar} /> Habilitada en el catálogo (no detiene el monitoreo)</label>
      </div>
      {!editando && form.tipo === 'RED' && <div className="cam-busqueda"><label>Puerto ONVIF <input type="number" min="1" max="65535" value={puertoOnvif} onChange={e => { onvifVersion.current += 1; setConsultandoOnvif(false); setPerfilesOnvif([]); setMensajeOnvif(''); setOrigenPuerto('manual'); setPuertoOnvif(e.target.value); }} /></label><p>{origenPuerto === 'anunciado' ? 'Puerto anunciado por el dispositivo; aún falta comprobar la conexión.' : origenPuerto === 'manual' ? 'Puerto indicado manualmente; aún falta comprobar la conexión.' : 'Puerto 80 sugerido por defecto; puede no corresponder a esta cámara.'}</p><p>Introduce la IP y, si la cámara las exige, sus credenciales arriba. El puerto ONVIF puede ser distinto al RTSP.</p><button type="button" onClick={consultarOnvif} disabled={consultandoOnvif || !form.direccion_ip}>{consultandoOnvif ? 'Consultando…' : 'Obtener perfiles mediante ONVIF'}</button>{mensajeOnvif && <p role="status">{mensajeOnvif}</p>}{perfilesOnvif.map((perfil, i) => <button type="button" key={i} onClick={() => usarPerfilOnvif(perfil)}>Usar {perfil.nombre} · puerto {perfil.puerto_rtsp}</button>)}</div>}
      <div className="cam-botones"><button type="button" onClick={() => { limpiarAcceso(); setAbierto(false); setForm(inicial); }} disabled={ocupado}>Cancelar</button><button type="submit" disabled={ocupado}>{ocupado ? 'Guardando…' : 'Guardar cámara'}</button></div>
    </form></div>}
  </div>;
}
