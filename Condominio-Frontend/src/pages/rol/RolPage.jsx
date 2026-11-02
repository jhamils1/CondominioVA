import React, { useCallback, useEffect, useState } from 'react';
import RolList from './RolList.jsx';
import RolesPersonalizados from './RolesPersonalizados.jsx';
import { createRol, fetchAllRoles } from '../../api/rolApi.jsx';

export default function RolPage() {
  const [roles, setRoles] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [enabling, setEnabling] = useState('');

  const loadRoles = useCallback(async () => {
    try {
      const data = await fetchAllRoles();
      const list = data.results || data;
      if (!Array.isArray(list)) throw new Error('Respuesta inválida');
      setRoles(list);
      setError('');
    } catch {
      setRoles(null);
      setError('No se pudieron consultar los roles. Verifica la conexión y vuelve a intentarlo.');
    }
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  const enableRole = async role => {
    if (!window.confirm(`¿Habilitar el rol ${role.name}? No se crearán cuentas ni se cambiarán grupos existentes.`)) return;
    setEnabling(role.key);
    setNotice('');
    try {
      await createRol({ name: role.group, permission_ids: [] });
      setNotice(`Se habilitó el rol ${role.name}.`);
    } catch {
      setNotice('No se pudo confirmar si se habilitó el rol. Revisa su estado antes de volver a intentarlo.');
    } finally {
      await loadRoles();
      setEnabling('');
    }
  };

  return (
    <div>
      {error && <div role="alert" className="mb-4 rounded bg-red-50 p-4 text-red-700">{error} <button type="button" onClick={loadRoles} className="underline">Reintentar</button></div>}
      {notice && <p role="status" className="mb-4">{notice}</p>}
      {roles ? <RolList roles={roles} onEnable={enableRole} enabling={enabling} /> : !error && <p>Cargando roles…</p>}
      {roles && <RolesPersonalizados />}
    </div>
  );
}
