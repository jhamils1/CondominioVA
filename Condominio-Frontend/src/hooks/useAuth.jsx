import { useState } from 'react';
import axios from 'axios';
import { apiBase, useSession } from '../auth/sessionContext.js';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loadUser, logout } = useSession();
  const login = async (username, password) => {
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${apiBase}login/`, { username, password });
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      await loadUser(data.access);
      return true;
    } catch (err) {
      logout();
      setError(err.response?.status === 401 ? 'Usuario, contraseña o cuenta no autorizada.' :
        err.response?.status === 403 ? 'La cuenta no tiene acceso al sistema.' :
        'No se pudo conectar con el servidor. Revisa la configuración y vuelve a intentar.');
      return false;
    } finally { setLoading(false); }
  };
  return { login, loading, error };
}
