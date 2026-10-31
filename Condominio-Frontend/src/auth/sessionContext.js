import { createContext, useContext } from 'react';
export const apiBase = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/').replace(/\/?$/, '/');
export const SessionContext = createContext(null);
export function useSession() { return useContext(SessionContext); }
