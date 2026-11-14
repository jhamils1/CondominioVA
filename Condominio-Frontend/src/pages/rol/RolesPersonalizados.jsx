import React, { useEffect, useState } from 'react';
import { assignCustomRole, createCustomRole, deleteCustomRole, fetchCustomRoles, updateCustomRole } from '../../api/rolApi.jsx';
import { fetchAllUsers } from '../../api/userApi.jsx';

export default function RolesPersonalizados() {
  const [roles, setRoles] = useState(null);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState('');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const [roleData, userData] = await Promise.all([fetchCustomRoles(), fetchAllUsers()]);
      setRoles(roleData);
      setUsers(userData.results || userData);
      setUnavailable(false);
      setLoadError(false);
    } catch (error) {
      setRoles(null);
      setUnavailable(error.response?.status === 503);
      setLoadError(error.response?.status !== 503);
    }
  }
  useEffect(() => { refresh(); }, []);

  async function run(action, success) {
    setBusy(true);
    setMessage('');
    try {
      await action();
      setMessage(success);
    } catch (error) {
      const data = error.response?.data;
      const detail = data?.detail || (data && Object.values(data).flat().find(value => typeof value === 'string'));
      setMessage(typeof detail === 'string' ? detail : 'No se pudo completar la operación. Verifica los datos y el estado antes de reintentar.');
    } finally {
      await refresh();
      setBusy(false);
    }
  }

  const role = roles?.find(item => item.id === selected);
  function removeRole() {
    if (!role || role.usuarios_asignados !== 0 || busy) return;
    if (!window.confirm(`¿Eliminar el rol personalizado ${role.nombre}? Esta acción no se puede deshacer.`)) return;
    run(async () => { await deleteCustomRole(role.id); setSelected(''); setUserId(''); }, 'Rol personalizado eliminado.');
  }
  return <section className="bg-white p-6 rounded-lg shadow-md mt-6">
    <h2 className="text-xl font-semibold mb-3">Roles personalizados</h2>
    {unavailable ? <p role="status">Esta función aún no está habilitada en este entorno. Requiere preparar la base de datos y activar la configuración correspondiente.</p> : loadError ? <p role="alert">No se pudieron cargar los roles personalizados. <button type="button" className="underline" onClick={refresh}>Reintentar</button></p> : !roles ? <p>Cargando…</p> : <>
      <p className="mb-4 text-sm">Un rol nuevo se crea inactivo y sin permisos. Por ahora solo puede configurarse la consulta de visitas pendientes y activas.</p>
      <form onSubmit={event => { event.preventDefault(); if (name.trim()) run(async () => { await createCustomRole(name.trim()); setName(''); }, 'Rol creado sin permisos.'); }} className="flex flex-wrap gap-2 mb-5">
        <label htmlFor="custom-role-name">Nombre del rol</label>
        <input id="custom-role-name" value={name} onChange={event => setName(event.target.value)} maxLength={100} required className="border rounded p-2" />
        <button type="submit" disabled={busy} className="admin-button rounded bg-gray-900 text-white px-4 py-2 disabled:opacity-50">Crear rol</button>
      </form>
      <label htmlFor="custom-role-select">Seleccionar rol</label>{' '}
      <select id="custom-role-select" value={selected} onChange={event => setSelected(event.target.value)} className="border rounded p-2">
        <option value="">Selecciona un rol</option>{roles.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
      </select>
      {role && <div className="border rounded p-4 mt-4">
        <p>Estado: {role.activo ? 'Activo' : 'Inactivo'} · Cuentas asignadas: {role.usuarios_asignados}</p>
        <label className="block mt-3"><input type="checkbox" disabled={busy} checked={role.consultar_visitas} onChange={event => run(() => updateCustomRole(role.id, { consultar_visitas: event.target.checked }), 'Permiso actualizado.')} /> Consultar visitas pendientes y activas</label>
        <p className="text-sm mt-1">Solo lectura: muestra nombres y horarios, sin cédulas ni teléfonos. El cambio afecta a todas las cuentas asignadas.</p>
        <button type="button" disabled={busy} className={`admin-button ${role.activo ? 'admin-button--peligro' : ''} border rounded px-3 py-2 mt-3`} onClick={() => run(() => updateCustomRole(role.id, { activo: !role.activo }), 'Estado actualizado.')}>{role.activo ? 'Desactivar rol' : 'Activar rol'}</button>
        <button type="button" disabled={busy || role.usuarios_asignados !== 0} className="admin-button admin-button--peligro border rounded px-3 py-2 mt-3 ml-2 disabled:opacity-50" onClick={removeRole}>Eliminar rol</button>
        {role.usuarios_asignados > 0 && <p className="text-sm mt-2">Para eliminar este rol, primero reasigna todas sus cuentas.</p>}
        <div className="mt-4"><label htmlFor="custom-role-user">Asignar a cuenta de empleado activo</label>{' '}
          <select id="custom-role-user" value={userId} onChange={event => setUserId(event.target.value)} className="border rounded p-2"><option value="">Selecciona una cuenta</option>{users.map(user => <option key={user.id} value={user.id}>{user.username}</option>)}</select>{' '}
          <button type="button" disabled={busy || !role.activo || !userId} className="admin-button rounded bg-gray-900 text-white px-3 py-2 disabled:opacity-50" onClick={() => {
            if (window.confirm('Esta cuenta dejará su rol actual y usará el rol personalizado. ¿Continuar?')) run(() => assignCustomRole(role.id, userId), 'Rol asignado a la cuenta.');
          }}>Asignar rol</button>
          <p className="text-sm mt-1">El servidor verifica que sea un empleado activo sin perfil residencial ni privilegios administrativos o técnicos.</p>
          <p className="text-sm mt-1">Las cuentas con dispositivos registrados requieren una revisión de notificaciones antes de cambiar de rol.</p>
        </div>
      </div>}
    </>}
    {message && <p role="status" className="mt-4">{message}</p>}
  </section>;
}
