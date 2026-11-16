import { useEffect, useState } from 'react';
import { obtenerClipEvento } from '../api/notificacionesApi.js';

export default function ClipEvento({ evento }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    let objeto = '';
    obtenerClipEvento(evento.id, controller.signal).then(blob => {
      if (controller.signal.aborted) return;
      objeto = URL.createObjectURL(blob); setUrl(objeto);
    }).catch(() => { if (!controller.signal.aborted) setError('No se pudo cargar el clip.'); });
    return () => { controller.abort(); if (objeto) URL.revokeObjectURL(objeto); };
  }, [evento.id]);
  return <section className="mt-3"><h4>Video de la incidencia</h4>
    {error ? <p role="alert">{error}</p> : url ? <video controls playsInline src={url} style={{ width: '100%', maxWidth: 640 }} /> : <p>Cargando clip…</p>}
  </section>;
}
