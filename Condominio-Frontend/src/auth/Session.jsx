import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { apiBase, SessionContext } from './sessionContext.js';
import { closeSession } from './closeSession.js';
export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(localStorage.getItem('access') ? 'loading' : 'anonymous');
  const [notice, setNotice] = useState('');
  const [sessionNotice, setSessionNotice] = useState('');
  const logout = useCallback(() => {
    ['access', 'refresh', 'username', 'userRole'].forEach(key => localStorage.removeItem(key));
    setUser(null); setStatus('anonymous');
  }, []);
  const endSession = useCallback(async () => {
    const revoked = await closeSession({
      access: localStorage.getItem('access'), refresh: localStorage.getItem('refresh'),
      revoke: (access, refresh) => axios.post(`${apiBase}logout/`, { refresh }, {
        headers: { Authorization: `Bearer ${access}` }, timeout: 5000,
      }),
      clear: logout,
    });
    setSessionNotice(revoked ? '' : 'La sesión local se cerró, pero no se pudo confirmar el cierre en el servidor.');
    return revoked;
  }, [logout]);
  const loadUser = useCallback(async (token) => {
    const response = await axios.get(`${apiBase}me/`, { headers: { Authorization: `Bearer ${token}` } });
    setUser(response.data); setStatus('authenticated');
    return response.data;
  }, []);
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) loadUser(token).catch(error => {
      if ([401, 403].includes(error.response?.status)) logout();
      else setStatus('error');
    });
  }, [loadUser, logout]);
  useEffect(() => {
    const handler = () => setNotice('No tienes permiso para realizar esta operación.');
    window.addEventListener('api-forbidden', handler);
    return () => window.removeEventListener('api-forbidden', handler);
  }, []);
  return <SessionContext.Provider value={{ user, status, loadUser, logout, endSession, notice, setNotice, sessionNotice, setSessionNotice }}>{children}</SessionContext.Provider>;
}
