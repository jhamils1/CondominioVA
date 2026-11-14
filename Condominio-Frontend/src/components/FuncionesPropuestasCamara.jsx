import { useState } from 'react';

export default function FuncionesPropuestasCamara({ camara, api }) {
  const [abierto, setAbierto] = useState(false);
  const [datos, setDatos] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState('');

  async function abrir() {
    if (abierto) { setAbierto(false); setDatos(null); setMensaje(''); return; }
    setAbierto(true); setOcupado(true); setMensaje('');
    try {
      const { data } = await api.get(`camaras/${camara.id}/funciones-propuestas/`);
      setDatos({ lectura_placas: data.lectura_placas, incidencias_zona: data.incidencias_zona });
    } catch { setMensaje('No se pudo cargar esta configuración.'); }
    finally { setOcupado(false); }
  }
  async function guardar(event) {
    event.preventDefault(); setOcupado(true); setMensaje('');
    try { await api.put(`camaras/${camara.id}/funciones-propuestas/`, datos); setMensaje('Preferencias guardadas. Estas funciones aún no están operativas.'); }
    catch { setMensaje('No se pudieron guardar las preferencias.'); }
    finally { setOcupado(false); }
  }
  return <section className="cam-funciones">
    <button type="button" onClick={abrir} disabled={ocupado}>{abierto ? 'Cerrar preferencias' : 'Funciones previstas'}</button>
    {abierto && <div>
      <p>Preferencias para una futura integración. No activan detección, lectura de placas ni alertas; la vigilancia actual continúa igual.</p>
      {datos && <form onSubmit={guardar}>
        <label><input type="checkbox" checked={datos.lectura_placas} disabled={ocupado} onChange={e => setDatos({ ...datos, lectura_placas: e.target.checked })} /> Lectura de placas prevista</label>
        <label><input type="checkbox" checked={datos.incidencias_zona} disabled={ocupado} onChange={e => setDatos({ ...datos, incidencias_zona: e.target.checked })} /> Incidencias en zona previstas</label>
        <button type="submit" disabled={ocupado}>Guardar preferencias</button>
      </form>}
      {mensaje && <p role="status">{mensaje}</p>}
    </div>}
  </section>;
}
