import { useState } from 'react';
import { reconocerPlacaEvidencia, posiblesLecturasEntrada, registrarPlacaEvento, consultarDestinatarioPlaca, confirmarDestinatarioPlaca, prepararAvisoResidente, encolarAvisoResidente } from '../api/notificacionesApi.js';

export default function LecturaPlacaEvidencia({ evento, onRegistrada }) {
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [placa, setPlaca] = useState('');
  const [guardado, setGuardado] = useState('');
  const [candidato, setCandidato] = useState(null);
  const [avisoPreparado, setAvisoPreparado] = useState(false);
  const [lecturasPrevias, setLecturasPrevias] = useState(null);
  async function analizar() {
    if (procesando) return;
    setProcesando(true); setResultado(null); setError('');
    setLecturasPrevias(null);
    try {
      const lectura = await reconocerPlacaEvidencia(evento.id);
      setResultado(lectura);
      setPlaca(lectura.plate || '');
      if (lectura.sugerencia_asociada === true) {
        setGuardado('Lectura sugerida asociada al historial; todavía debes verificarla y registrarla.');
        try { await onRegistrada(); } catch { /* La sugerencia ya fue guardada. */ }
      }
    } catch { setError('No se pudo reconocer la placa. Revisa la conexión e inténtalo de nuevo.'); }
    finally { setProcesando(false); }
  }
  async function buscarLecturas() {
    setProcesando(true); setError(''); setLecturasPrevias(null);
    try { setLecturasPrevias(await posiblesLecturasEntrada(evento.id)); }
    catch { setError('No se pudieron consultar las lecturas previas.'); }
    finally { setProcesando(false); }
  }
  async function registrar(event) {
    event.preventDefault();
    if (procesando) return;
    setProcesando(true); setError(''); setGuardado('');
    try {
      const dato = await registrarPlacaEvento(evento.id, placa);
      setPlaca(dato.placa); setCandidato(null); setAvisoPreparado(false); setGuardado('Placa registrada en el historial del evento.');
      try { await onRegistrada(); } catch { setGuardado('Placa registrada; actualiza la página para ver el historial.'); }
    } catch { setError('No se pudo registrar la placa. Verifica el estado del evento y vuelve a intentar.'); }
    finally { setProcesando(false); }
  }
  async function consultar() {
    setProcesando(true); setError(''); setCandidato(null);
    try { setCandidato(await consultarDestinatarioPlaca(evento.id)); }
    catch { setError('No se pudo consultar el destinatario.'); }
    finally { setProcesando(false); }
  }
  async function confirmar() {
    setProcesando(true); setError('');
    try {
      const data = await confirmarDestinatarioPlaca(evento.id, candidato.vehiculo_id);
      setCandidato(data); setGuardado('Destinatario verificado y registrado. No se ha enviado ningún aviso.');
      try { await onRegistrada(); } catch { /* El registro ya fue guardado. */ }
    } catch { setCandidato(null); setError('No se pudo confirmar. Vuelve a consultar y verifica la cuenta.'); }
    finally { setProcesando(false); }
  }
  async function prepararAviso() {
    setProcesando(true); setError('');
    try {
      await prepararAvisoResidente(evento.id);
      setAvisoPreparado(true);
      setGuardado('Aviso interno preparado. Todavía no se ha enviado una notificación al teléfono.');
      try { await onRegistrada(); } catch { /* El aviso ya quedó preparado. */ }
    } catch { setError('No se pudo preparar el aviso. Vuelve a verificar la placa y el destinatario.'); }
    finally { setProcesando(false); }
  }
  async function enviarAviso() {
    setProcesando(true); setError('');
    try {
      const data = await encolarAvisoResidente(evento.id);
      setGuardado(data.estado === 'encolado' ? 'Aviso en cola; aún no se confirma la recepción en el teléfono.' :
        data.estado === 'aceptado' ? 'El proveedor aceptó el envío; no confirma la recepción en el teléfono.' :
        data.estado === 'sin_dispositivos' ? 'No hay dispositivos móviles elegibles para este residente.' :
        'No hay envíos pendientes; revisa el estado de las entregas.');
    } catch { setError('No se pudo encolar el aviso. Revisa la configuración y vuelve a verificar al destinatario.'); }
    finally { setProcesando(false); }
  }
  return <section className="seguridad-review">
    <h4>Consultar placa de la evidencia</h4>
    {evento.evidencia_disponible && <><p>Al pulsar el botón, la imagen se enviará al servicio externo Plate Recognizer. Revisa el resultado antes de identificar a una persona.</p>
    <button type="button" className="seguridad-secondary" onClick={analizar} disabled={procesando}>{procesando ? 'Procesando…' : 'Reconocer placa'}</button></>}
    {error && <p role="alert">{error}</p>}
    {resultado && <div role="status">
      {resultado.plate ? <><p>Placa sugerida: <strong>{resultado.plate}</strong></p>
        <p>{resultado.coincidencia_ambigua ? 'Hay más de un vehículo con esa placa. Revisa los registros antes de identificar a una persona.' : resultado.match ? `Coincidencia registrada: ${resultado.lectura?.propietario || 'persona vinculada sin nombre disponible'}.` : 'No se encontró una coincidencia registrada.'}</p>
        <p>Confirma la placa en la imagen. Una coincidencia no identifica al conductor ni confirma responsabilidad.</p></>
        : <p>No se pudo leer una placa. Revisa la evidencia manualmente.</p>}
    </div>}
    <button type="button" className="seguridad-secondary" onClick={buscarLecturas} disabled={procesando}>Buscar lecturas previas de esta placa</button>
    {lecturasPrevias && <div role="status"><p>Lecturas previas coincidentes en los 30 minutos anteriores. La cámara indicada proviene de la lectura y no está verificada; estas lecturas no incluyen imagen. La coincidencia no prueba que sea el mismo vehículo.</p>
      {lecturasPrevias.estado === 'sin_sugerencia' ? <p>Primero solicita la lectura de la evidencia de este evento.</p> : lecturasPrevias.lecturas.length === 0 ? <p>No se encontraron lecturas previas.</p> : <ul>{lecturasPrevias.lecturas.map(l => <li key={l.id}>{l.placa} · {l.camara} · {new Date(l.fecha).toLocaleString()}</li>)}</ul>}
    </div>}
    {['PENDIENTE_REVISION', 'CONFIRMADA', 'EN_ATENCION'].includes(evento.estado) && <form onSubmit={registrar}>
      <label>Placa verificada por el guardia <input required maxLength={20} value={placa} onChange={e => { setPlaca(e.target.value); setGuardado(''); }} /></label>
      <button type="submit" className="seguridad-secondary" disabled={procesando}>Registrar placa revisada</button>
      <p>Registra la placa en el historial; no identifica a una persona ni envía avisos.</p>
    </form>}
    {guardado && <p role="status">{guardado}</p>}
    {['CONFIRMADA', 'EN_ATENCION'].includes(evento.estado) && <div>
      <button type="button" className="seguridad-secondary" disabled={procesando} onClick={consultar}>Buscar residente por placa registrada</button>
      {candidato?.estado === 'candidato' && <div><p>Persona vinculada: {candidato.nombre} ({candidato.tipo}). Comprueba que corresponde al vehículo de la incidencia.</p>
        {candidato.cuenta_activa ? <button type="button" className="seguridad-secondary" disabled={procesando} onClick={confirmar}>Confirmar destinatario</button> : <p>No tiene una cuenta activa compatible; no se puede confirmar para avisos.</p>}</div>}
      {candidato?.estado === 'verificado' && <button type="button" className="seguridad-secondary" disabled={procesando} onClick={prepararAviso}>Preparar aviso interno</button>}
      {avisoPreparado && <button type="button" className="seguridad-primary" disabled={procesando} onClick={enviarAviso}>Enviar aviso al residente</button>}
      {candidato && !['candidato', 'verificado'].includes(candidato.estado) && <p>No se pudo identificar un residente activo único con la placa registrada. Revisa los datos.</p>}
    </div>}
  </section>;
}
