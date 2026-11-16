import { useState } from 'react';
import { scanPlate } from '../api/recognitionApi.jsx';
import ResultadoPlaca from './ResultadoPlaca.jsx';

export default function ConsultaPlacaFotograma({ obtenerFotograma, cameraId = '' }) {
  const [ocupado, setOcupado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  async function consultar() {
    if (ocupado) return;
    setOcupado(true); setResultado(null); setError('');
    try {
      const actual = await obtenerFotograma();
      if (!actual || performance.now() / 1000 - actual.tiempo > 3 || !(actual.imagen instanceof Blob) ||
          actual.imagen.type !== 'image/jpeg' || actual.imagen.size <= 0 || actual.imagen.size > 1024 * 1024) {
        throw new Error('Sin imagen reciente');
      }
      setResultado(await scanPlate(new File([actual.imagen], 'fotograma.jpg', { type: 'image/jpeg' }), cameraId));
    } catch { setError('No se pudo consultar la placa. Comprueba la imagen, la conexión y el servicio.'); }
    finally { setOcupado(false); }
  }
  return <section className="imou-notice">
    <h4>Consulta puntual de placa</h4>
    <p>Consulta un fotograma en Plate Recognizer.</p>
    <button type="button" className="imou-secondary" disabled={ocupado} onClick={consultar}>{ocupado ? 'Consultando…' : 'Consultar placa de la imagen'}</button>
    {error && <p role="alert">{error}</p>}
    <ResultadoPlaca resultado={resultado} />
  </section>;
}
