import './ResultadoPlaca.css';

export default function ResultadoPlaca({ resultado }) {
  if (!resultado) return null;
  const hayPlaca = typeof resultado.plate === 'string' && resultado.plate.trim().length > 0;
  const ambigua = hayPlaca && resultado.coincidencia_ambigua === true;
  const coincide = hayPlaca && !ambigua && resultado.match === true;
  const titulo = !hayPlaca ? 'Placa no detectada' : ambigua ? 'Coincidencia ambigua' : coincide ? 'Vehículo registrado' : 'Sin coincidencia registrada';
  const confianza = typeof resultado.score === 'number' && Number.isFinite(resultado.score) && resultado.score >= 0 && resultado.score <= 1
    ? `${(resultado.score * 100).toFixed(1)}%` : 'No disponible';
  const estado = resultado.status === 'ok' ? 'Lectura completada'
    : resultado.status === 'no-plate-found' ? 'Sin placa detectada' : 'No disponible';
  const propietario = resultado.lectura?.propietario || resultado.vehiculo?.persona_nombre
    || resultado.vehiculo?.persona?.nombre_completo || resultado.vehiculo?.persona?.nombre;
  return <section className={`resultado-placa ${coincide ? 'resultado-placa--coincide' : 'resultado-placa--revision'}`} role="status" aria-label="Resultado de lectura de placa">
    <div className="resultado-placa-cabecera"><span className="resultado-placa-punto" aria-hidden="true" /><h4>{titulo}</h4></div>
    <dl className="resultado-placa-datos">
      <div className="resultado-placa-principal"><dt>Placa detectada</dt><dd>{hayPlaca ? resultado.plate : 'No detectada'}</dd></div>
      <div><dt>Confianza</dt><dd>{confianza}</dd></div>
      <div><dt>Estado</dt><dd>{estado}</dd></div>
    </dl>
    {coincide && propietario && <p className="resultado-placa-vinculo">Persona vinculada: <strong>{propietario}</strong></p>}
    {coincide && resultado.vehiculo && <p className="resultado-placa-vinculo">Vehículo: {[resultado.vehiculo.marca, resultado.vehiculo.modelo, resultado.vehiculo.color].filter(Boolean).join(' · ') || 'Datos no disponibles'}</p>}
    <p className="resultado-placa-nota">{ambigua ? 'Hay varios registros con esta placa. ' : ''}Lectura orientativa: revisa la imagen. No identifica al conductor ni autoriza el ingreso.</p>
  </section>;
}
