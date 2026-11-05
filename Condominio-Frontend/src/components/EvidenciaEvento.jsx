import { useEffect, useState } from 'react';
import { obtenerEvidencia } from '../api/notificacionesApi.js';

export default function EvidenciaEvento({ evento }) {
  const [imagen, setImagen] = useState('');
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);
  const id = evento?.id;
  const disponible = evento?.evidencia_disponible === true;

  useEffect(() => {
    if (!id || !disponible) return;
    const controller = new AbortController();
    let vigente = true;
    let url;
    obtenerEvidencia(id, controller.signal).then(blob => {
      if (!vigente) return;
      url = URL.createObjectURL(blob);
      setImagen(url);
      setError('');
    }).catch(() => {
      if (vigente) setError('No se pudo cargar la evidencia. Comprueba tu sesión e inténtalo de nuevo.');
    });
    return () => { vigente = false; controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [id, disponible, intento]);

  if (!disponible) return null;
  return <section className="mt-3">
    <h4 className="font-semibold">Evidencia del evento</h4>
    {error ? <div><p role="alert">{error}</p><button type="button" className="text-indigo-700" onClick={() => { setError(''); setImagen(''); setIntento(actual => actual + 1); }}>Reintentar evidencia</button></div>
      : imagen ? <img src={imagen} alt="Fotograma de evidencia del evento" className="mt-2 max-w-full rounded" style={{ maxHeight: '480px' }} />
        : <p>Cargando evidencia…</p>}
  </section>;
}
