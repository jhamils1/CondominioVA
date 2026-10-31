import React, { useState } from 'react';
import { fetchAllUsers, provisionarCuenta } from '../api/userApi.jsx';
import { roleKey } from '../auth/access.js';

export default function CuentaPerfil({ tipo, perfilId, onLinked, onBusyChange }) {
  const [mode, setMode] = useState('crear');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [linked, setLinked] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const role = tipo === 'empleado' ? selectedRole : tipo;

  async function changeMode(value) {
    setMode(value); setError(''); setPassword('');
    if (value === 'vincular') {
      setBusy(true); onBusyChange?.(true);
      try {
        const data = await fetchAllUsers();
        setUsers((data.results || data).filter(user => user.is_active));
      } catch { setError('No se pudieron cargar las cuentas disponibles.'); }
      finally { setBusy(false); onBusyChange?.(false); }
    }
  }
  async function submit() {
    setError('');
    if (!role) { setError('Selecciona un rol para la cuenta.'); return; }
    if (mode === 'crear' && (!username.trim() || !email.trim() || !password)) {
      setError('Indica nombre de usuario, correo y contraseña.'); return;
    }
    if (mode === 'vincular' && !userId) { setError('Selecciona una cuenta.'); return; }
    setBusy(true); onBusyChange?.(true);
    try {
      const payload = mode === 'crear'
        ? { tipo, perfil_id: perfilId, modo: mode, username: username.trim(), email: email.trim(), password }
        : { tipo, perfil_id: perfilId, modo: mode, usuario_id: Number(userId) };
      if (tipo === 'empleado') payload.rol = role;
      const result = await provisionarCuenta(payload);
      setPassword(''); setLinked(true); onLinked?.(result.id);
    } catch (err) { setError(`${err.message} Si hubo un corte de conexión, verifica si la cuenta quedó vinculada antes de reintentar.`); }
    finally { setBusy(false); onBusyChange?.(false); }
  }
  if (!perfilId) return <p className="text-sm text-gray-600">Guarda el registro y vuelve a editarlo para crear o vincular una cuenta.</p>;
  if (linked) return <p role="status" className="text-green-700">La cuenta quedó vinculada correctamente.</p>;
  return <section className="border rounded-md p-4 space-y-3">
    <h3 className="font-semibold">Cuenta de acceso</h3>
    <p className="text-xs text-gray-600">La cuenta se vincula al registro guardado. Guarda primero los cambios pendientes del perfil.</p>
    {tipo === 'empleado' && <>
      <label className="block text-sm">Rol de acceso <select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); setUserId(''); setError(''); }} className="block w-full border rounded p-2">
        <option value="">Selecciona un rol</option><option value="administrador">Administrador</option><option value="guardia">Guardia de seguridad</option><option value="propietario">Propietario</option><option value="inquilino">Inquilino</option>
      </select></label>
      {role === 'administrador' && <p className="text-amber-700 text-sm">Este rol concede acceso administrativo completo.</p>}
      {['propietario', 'inquilino'].includes(role) && <p className="text-sm">Debe existir un perfil residencial activo de este tipo con la misma cédula del empleado. Si ya tiene cuenta, selecciona Vincular cuenta existente.</p>}
    </>}
    <label className="block text-sm">Operación <select value={mode} onChange={e => changeMode(e.target.value)} className="block w-full border rounded p-2">
      <option value="crear">Crear cuenta nueva</option><option value="vincular">Vincular cuenta existente</option>
    </select></label>
    {mode === 'crear' ? <>
      <label className="block text-sm">Nombre de usuario <input value={username} onChange={e => setUsername(e.target.value)} autoComplete="off" className="block w-full border rounded p-2" /></label>
      <label className="block text-sm">Correo <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full border rounded p-2" /></label>
      <label className="block text-sm">Contraseña elegida <input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" className="block w-full border rounded p-2" /></label>
      <p className="text-xs text-gray-600">La contraseña debe tener al menos ocho caracteres, con letras y números.</p>
    </> : <label className="block text-sm">Cuenta con rol compatible <select value={userId} onChange={e => setUserId(e.target.value)} className="block w-full border rounded p-2">
      <option value="">Selecciona una cuenta</option>{users.filter(user => roleKey(user.role) === role).map(user => <option key={user.id} value={user.id}>{user.username}</option>)}
    </select><span className="text-xs text-gray-600">El servidor comprobará que la cuenta y los perfiles sean compatibles.</span></label>}
    {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
    <button type="button" disabled={busy} onClick={submit} className="bg-indigo-600 text-white rounded px-4 py-2 disabled:opacity-50">{busy ? 'Guardando…' : mode === 'crear' ? 'Crear y vincular cuenta' : 'Vincular cuenta'}</button>
  </section>;
}
