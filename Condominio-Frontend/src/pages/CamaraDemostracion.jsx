import React, { useEffect, useRef, useState } from 'react';
import { analizarFotograma, estadoCamaraDemo } from '../api/visionDemoApi.js';

const nombres = { person: 'persona', car: 'automóvil', motorcycle: 'motocicleta',
  bus: 'autobús', truck: 'camión', cat: 'gato', dog: 'perro' };

export default function CamaraDemostracion() {
  const video = useRef(null);
  const canvas = useRef(null);
  const flujo = useRef(null);
  const actual = useRef(0);
  const solicitud = useRef(null);
  const temporizador = useRef(null);
  const [estado, setEstado] = useState('inicial');
  const [mensaje, setMensaje] = useState('');

  function liberar() {
    actual.current += 1;
    clearTimeout(temporizador.current);
    solicitud.current?.abort();
    flujo.current?.getTracks().forEach(track => track.stop());
    flujo.current = null;
    if (video.current) video.current.srcObject = null;
  }

  useEffect(() => () => liberar(), []);

  async function analizar(id) {
    if (actual.current !== id || !video.current || !canvas.current) return;
    try {
      const fuente = video.current;
      if (!fuente.videoWidth || !fuente.videoHeight) throw new Error('La cámara no entrega imágenes.');
      const ancho = 640;
      const alto = Math.max(1, Math.round(ancho * fuente.videoHeight / fuente.videoWidth));
      const lienzo = canvas.current;
      lienzo.width = ancho;
      lienzo.height = alto;
      const contexto = lienzo.getContext('2d');
      contexto.drawImage(fuente, 0, 0, ancho, alto);
      const blob = await new Promise(resolve => lienzo.toBlob(resolve, 'image/jpeg', 0.75));
      if (!blob || actual.current !== id) return;
      solicitud.current = new AbortController();
      const resultado = await analizarFotograma(blob, solicitud.current.signal);
      if (actual.current !== id) return;
      contexto.font = '16px sans-serif';
      contexto.lineWidth = 2;
      for (const deteccion of resultado.detecciones || []) {
        const [x1, y1, x2, y2] = deteccion.caja;
        contexto.strokeStyle = '#00ff40';
        contexto.strokeRect(x1, y1, x2 - x1, y2 - y1);
        const texto = `${nombres[deteccion.clase] || deteccion.clase} ${Math.round(deteccion.confianza * 100)}%`;
        const y = Math.max(19, y1);
        contexto.fillStyle = '#111';
        contexto.fillRect(x1, y - 19, contexto.measureText(texto).width + 8, 20);
        contexto.fillStyle = '#fff';
        contexto.fillText(texto, x1 + 4, y - 4);
      }
      setEstado('activa');
      temporizador.current = setTimeout(() => analizar(id), 200);
    } catch (error) {
      if (actual.current !== id) return;
      liberar();
      setEstado('error');
      setMensaje(error.message === 'La cámara no entrega imágenes.' ? error.message
        : 'No se pudo analizar la imagen. Comprueba que el procesador local siga iniciado.');
    }
  }

  async function iniciar() {
    liberar();
    const id = actual.current;
    setEstado('iniciando');
    setMensaje('');
    try {
      solicitud.current = new AbortController();
      await estadoCamaraDemo(solicitud.current.signal);
      if (actual.current !== id) return;
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('La cámara no está disponible en este navegador.');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (actual.current !== id) { stream.getTracks().forEach(track => track.stop()); return; }
      flujo.current = stream;
      stream.getVideoTracks()[0].onended = () => {
        if (actual.current !== id) return;
        liberar();
        setEstado('error');
        setMensaje('La cámara dejó de estar disponible.');
      };
      video.current.srcObject = stream;
      await video.current.play();
      if (actual.current === id) analizar(id);
    } catch (error) {
      if (actual.current !== id) return;
      liberar();
      setEstado('error');
      setMensaje(error.name === 'NotAllowedError' ? 'Se denegó el permiso de cámara en el navegador.'
        : error.name === 'NotFoundError' ? 'No se encontró una cámara disponible.'
        : error.message === 'La cámara no está disponible en este navegador.' ? error.message
        : 'No se pudo iniciar. Comprueba que Django y el procesador local de cámara estén en marcha.');
    }
  }

  function detener() {
    liberar();
    setEstado('inicial');
    setMensaje('');
  }

  return <section className="border rounded p-4 mb-5">
    <h3 className="font-semibold">Probar cámara con visión artificial</h3>
    <p className="my-2 text-sm">Prueba para navegador y servidor en esta computadora. Las imágenes se analizan localmente y no crean alertas ni grabaciones.</p>
    <button type="button" onClick={iniciar} disabled={['iniciando', 'activa'].includes(estado)}
      className="bg-indigo-600 text-white rounded px-3 py-2 mr-3 disabled:opacity-50">
      {estado === 'iniciando' ? 'Iniciando…' : 'Iniciar cámara'}
    </button>
    <button type="button" onClick={detener} disabled={!['iniciando', 'activa'].includes(estado)}
      className="border rounded px-3 py-2 disabled:opacity-50">Detener cámara</button>
    {mensaje && <p role="alert" className="text-red-700 mt-2">{mensaje}</p>}
    <video ref={video} muted playsInline className="hidden" />
    <canvas ref={canvas} className={`mt-3 max-w-full ${estado === 'activa' ? '' : 'hidden'}`}
      aria-label="Cámara con detecciones" />
  </section>;
}
