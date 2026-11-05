import React, { useState } from 'react';
import { normalizarPunto } from '../vision/zonas.js';

export default function ZonaVideo({ puntos, activa = false, onAgregar }) {
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });
  const [cursorTeclado, setCursorTeclado] = useState(false);
  const posiciones = puntos.map(p => `${p.x * 100},${p.y * 100}`).join(' ');

  function pulsar(event) {
    if (!activa) return;
    const punto = normalizarPunto(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    if (punto) onAgregar(punto);
  }

  function teclado(event) {
    if (!activa) return;
    const pasos = { ArrowLeft: [-0.02, 0], ArrowRight: [0.02, 0],
      ArrowUp: [0, -0.02], ArrowDown: [0, 0.02] };
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setCursorTeclado(true);
      onAgregar(cursor);
    } else if (pasos[event.key]) {
      event.preventDefault();
      setCursorTeclado(true);
      const [dx, dy] = pasos[event.key];
      setCursor(({ x, y }) => ({ x: Math.min(1, Math.max(0, x + dx)),
        y: Math.min(1, Math.max(0, y + dy)) }));
    }
  }

  if (!activa && puntos.length === 0) return null;
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none"
    className={`zona-video ${activa ? 'zona-video-activa' : ''}`}
    onClick={pulsar} onKeyDown={teclado} tabIndex={activa ? 0 : undefined}
    role={activa ? 'application' : 'img'}
    aria-label={activa ? 'Dibuja la zona con clics, o usa las flechas y Enter para añadir puntos' : 'Zona prohibida marcada'}>
    {puntos.length >= 3 && <polygon points={posiciones} fill="rgba(239, 68, 68, 0.28)"
      stroke="#dc2626" strokeWidth="2" vectorEffect="non-scaling-stroke" />}
    {puntos.length === 2 && <polyline points={posiciones} fill="none" stroke="#dc2626"
      strokeWidth="2" vectorEffect="non-scaling-stroke" />}
    {activa && puntos.map((p, i) => <circle key={i} cx={p.x * 100} cy={p.y * 100}
      r="1" fill="#dc2626" stroke="white" strokeWidth="0.4" />)}
    {activa && cursorTeclado && <circle cx={cursor.x * 100} cy={cursor.y * 100} r="1.2"
      fill="white" stroke="#111" strokeWidth="0.5" />}
  </svg>;
}
