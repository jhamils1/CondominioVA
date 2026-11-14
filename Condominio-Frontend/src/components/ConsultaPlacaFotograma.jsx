import { useState } from 'react';
import { scanPlate } from '../api/recognitionApi.jsx';

export default function ConsultaPlacaFotograma({ obtenerFotograma }) {
  const [ocupado, setOcupado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  async function consultar() {
    if (ocupado) return;
    setOcupado(true); setResultado(null); setError('');
    try {
      const actual = obtenerFotograma();
      if (!actual || performance.now() / 1000 - actual.tiempo > 3 || !(actual.imagen instanceof Blob) ||
          actual.imagen.type !== 'image/jpeg' || actual.imagen.size <= 0 || actual.imagen.size > 1024 * 1024) {
        throw new Error('Sin imagen reciente');
      }
      setResultado(await scanPlate(new File([actual.imagen], 'fotograma.jpg', { type: 'image/jpeg' })));
    } catch { setError('No se pudo consultar la placa. Comprueba la imagen, la conexión y el servicio.'); }
    finally { setOcupado(false); }
  }
  return <section className="imou-notice">
    <h4>Consulta puntual de placa</h4>
    <p>Al pulsar se envía un fotograma al servicio externo Plate Recognizer. No hay lectura continua.</p>
    <button type="button" className="imou-secondary" disabled={ocupado} onClick={consultar}>{ocupado ? 'Consultando…' : 'Consultar placa de la imagen'}</button>
    {error && <p role="alert">{error}</p>}
    {resultado && <div role="status">{resultado.plate ? <>
      <p>Placa sugerida: <strong>{resultado.plate}</strong></p>
      <p>{resultado.coincidencia_ambigua ? 'Hay varios registros con esta placa.' : resultado.match
        ? `Persona vinculada: ${resultado.lectura?.propietario || 'no disponible'}.` : 'No se encontró coincidencia registrada.'}</p>
      <p>Revisa la imagen: la lectura no identifica al conductor ni autoriza el ingreso.</p>
    </> : <p>No se pudo leer una placa en esta imagen.</p>}</div>}
  </section>;
}
