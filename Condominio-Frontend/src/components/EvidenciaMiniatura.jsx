import { useEffect, useRef, useState } from 'react';
import { FaImage } from 'react-icons/fa';
import { obtenerEvidencia } from '../api/notificacionesApi.js';

export default function EvidenciaMiniatura({ evento }) {
  const contenedor = useRef(null);
  const [visible, setVisible] = useState(false);
  const [imagen, setImagen] = useState('');

  useEffect(() => {
    if (!evento.evidencia_disponible || !contenedor.current) return;
    if (!('IntersectionObserver' in window)) {
      const timer = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '100px' });
    observer.observe(contenedor.current);
    return () => observer.disconnect();
  }, [evento.evidencia_disponible]);

  useEffect(() => {
    if (!visible || !evento.evidencia_disponible) return;
    const controller = new AbortController();
    let vigente = true;
    let url;
    obtenerEvidencia(evento.id, controller.signal).then(blob => {
      if (!vigente) return;
      url = URL.createObjectURL(blob);
      setImagen(url);
    }).catch(() => {});
    return () => { vigente = false; controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [evento.id, evento.evidencia_disponible, visible]);

  return <span ref={contenedor} className="seguridad-evento-miniatura" aria-hidden="true">
    {imagen ? <img src={imagen} alt="" /> : <FaImage />}
  </span>;
}
