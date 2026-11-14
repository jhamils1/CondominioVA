import { useEffect, useState } from 'react';
import { scanPlate } from '../api/recognitionApi.jsx';
import { crearControlLectura } from '../vision/lecturaAutomatica.js';

export default function LecturaAutomaticaImou({ muestraAnalizada, cameraId = 'Imou' }) {
  const [activa, setActiva] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [resultado, setResultado] = useState(null);
  useEffect(() => {
    if (!activa) return undefined;
    let vigente = true, ocupado = false, ultimoTiempo = null;
    const controller = new AbortController();
    const observar = crearControlLectura();
    const timer = setInterval(async () => {
      const muestra = muestraAnalizada.current;
      if (!vigente || !muestra || muestra.tiempo === ultimoTiempo) return;
      ultimoTiempo = muestra.tiempo;
      if (ocupado || performance.now() / 1000 - muestra.tiempo > 3 || !observar(muestra.detecciones, muestra.tiempo)) return;
      if (!(muestra.imagen instanceof Blob) || muestra.imagen.type !== 'image/jpeg' || muestra.imagen.size <= 0 || muestra.imagen.size > 1024 * 1024) return;
      ocupado = true;
      try {
        const archivo = new File([muestra.imagen], 'fotograma.jpg', { type: 'image/jpeg' });
        const data = await scanPlate(archivo, cameraId, controller.signal);
        if (vigente) { setResultado(data); setMensaje('Lectura orientativa; comprueba la imagen y la placa.'); }
      } catch {
        if (vigente) { setActiva(false); setMensaje('La lectura automática se detuvo por un error. Puedes iniciarla nuevamente.'); }
      } finally { ocupado = false; }
    }, 300);
    return () => { vigente = false; controller.abort(); clearInterval(timer); };
  }, [activa, muestraAnalizada, cameraId]);
  return <section className="imou-notice">
    <h4>Lectura automática de placas de prueba</h4>
    <p>Al activarla se enviarán fotogramas a Plate Recognizer cuando la IA detecte un único vehículo; mientras esté activa espera al menos 30 segundos entre consultas. Requiere internet, puede generar consumo del servicio y solo funciona con esta vista y la IA activas.</p>
    <button type="button" className="imou-secondary" onClick={() => { setActiva(!activa); setResultado(null); setMensaje(''); }}>
      {activa ? 'Detener lectura automática' : 'Activar lectura automática'}
    </button>
    {mensaje && <p role="status">{mensaje}</p>}
    {resultado?.plate && <p>Placa sugerida: <strong>{resultado.plate}</strong>. {resultado.coincidencia_ambigua ? 'Coincidencia ambigua.' : resultado.match ? 'Hay un vehículo registrado coincidente.' : 'Sin coincidencia registrada.'} No confirma identidad ni está vinculada automáticamente a una incidencia.</p>}
    {resultado && !resultado.plate && <p>No se pudo leer una placa en la imagen.</p>}
  </section>;
}
