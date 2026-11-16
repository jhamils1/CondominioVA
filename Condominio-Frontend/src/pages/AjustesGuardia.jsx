import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import { useSession } from '../auth/sessionContext.js';
import PasswordField from '../components/PasswordField.jsx';
import './EventosSeguridadPage.css';

export default function AjustesGuardia() {
  const { user, endSession } = useSession();
  const navigate = useNavigate();
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetida, setRepetida] = useState('');
  const [busy, setBusy] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cambiar(event) {
    event.preventDefault();
    if (busy) return;
    setMensaje(''); setError('');
    if (nueva !== repetida) { setError('Las contraseñas nuevas no coinciden.'); return; }
    setBusy(true);
    try {
      await client.create({}).post('change-password/', { old_password: actual, new_password: nueva },
        { headers: { Authorization: `Bearer ${localStorage.getItem('access')}` } });
      setActual(''); setNueva(''); setRepetida('');
      setMensaje('Contraseña actualizada. Las otras sesiones se cerraron.');
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo cambiar la contraseña. Inténtalo de nuevo.');
    } finally { setBusy(false); }
  }

  async function salir() {
    if (busy) return;
    setBusy(true);
    await endSession();
    navigate('/login', { replace: true });
  }

  return <div className="seguridad-dashboard"><div className="seguridad-detail">
    <h2>Ajustes</h2><p className="seguridad-muted">Cuenta: {user.username}</p>
    <form className="seguridad-review" onSubmit={cambiar}>
      <h3>Cambiar contraseña</h3>
      <PasswordField id="actual" label="Contraseña actual" autoComplete="current-password" required disabled={busy} value={actual} onChange={e => setActual(e.target.value)} />
      <PasswordField id="nueva" label="Nueva contraseña" required disabled={busy} value={nueva} onChange={e => setNueva(e.target.value)} />
      <PasswordField id="repetida" label="Repetir nueva contraseña" required disabled={busy} value={repetida} onChange={e => setRepetida(e.target.value)} />
      {error && <p role="alert">{error}</p>}{mensaje && <p role="status">{mensaje}</p>}
      <button type="submit" disabled={busy} className="seguridad-primary">Cambiar contraseña</button>
    </form>
    <button type="button" disabled={busy} onClick={salir} className="seguridad-secondary">Cerrar sesión</button>
  </div></div>;
}
