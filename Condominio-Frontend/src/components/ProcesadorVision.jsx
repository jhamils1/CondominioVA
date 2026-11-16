import { useEffect, useRef, useState } from 'react';
import { estadoCamaraDemo, guardarProcesadorVision, procesadorVision } from '../api/visionDemoApi.js';

export default function ProcesadorVision() {
  const actual = procesadorVision();
  const [modo, setModo] = useState(actual);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const solicitud = useRef(null);
  useEffect(() => () => solicitud.current?.abort(), []);

  async function aplicar() {
    if (ocupado || modo === actual) return;
    const controller = new AbortController();
    solicitud.current = controller;
    setOcupado(true); setMensaje('Comprobando el procesador…');
    try {
      const resultado = await estadoCamaraDemo(controller.signal, modo);
      if (controller.signal.aborted) return;
      if (!resultado?.disponible) throw new Error('Procesador no disponible');
      guardarProcesadorVision(modo);
      window.location.reload();
    } catch {
      if (!controller.signal.aborted) setMensaje(modo === 'remoto'
        ? 'La IA por internet no está configurada o no responde. El modo actual se conserva.'
        : 'La IA local no responde. Iníciala y vuelve a intentarlo. El modo actual se conserva.');
    } finally { if (!controller.signal.aborted) setOcupado(false); }
  }

  return <section className="seguridad-procesador" aria-label="Procesador de IA">
    <div><h3>Procesador de IA</h3><p>Actual: <strong>{actual === 'local' ? 'IA local' : 'IA por internet'}</strong></p></div>
    <label>Usar <select value={modo} disabled={ocupado} onChange={e => { setModo(e.target.value); setMensaje(''); }}>
      <option value="local">IA local</option><option value="remoto">IA por internet</option>
    </select></label>
    <button type="button" className="seguridad-primary" disabled={ocupado || modo === actual} onClick={aplicar}>Aplicar cambio</button>
    <p>Solo esta pestaña. Al cambiar se recarga la página; guarda tus cambios y resuelve los eventos pendientes. El monitoreo independiente mantiene su configuración.</p>
    {modo === 'remoto' && <p>Envía imágenes por internet y consume créditos. La conexión se comprueba al analizar.</p>}
    {mensaje && <p role="status">{mensaje}</p>}
  </section>;
}
