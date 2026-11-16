// Compone los resultados ya calculados localmente; no ejecuta inferencia ni envía eventos.
export async function exportarVideo({ src, ancho, alto, duracion, resultados, intervalo,
  modo, segundos, tieneZona, zonaVisible, dibujar, signal, onProgreso }) {
  if (!globalThis.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    throw new Error('Este navegador no permite exportar el video analizado.');
  }
  const tipo = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    .find(opcion => MediaRecorder.isTypeSupported(opcion));
  if (!tipo) throw new Error('Este navegador no admite la exportación de video WebM.');
  if (!src || !ancho || !alto || !duracion || !resultados.length) throw new Error('El análisis ya no está disponible.');
  const fuente = document.createElement('video');
  fuente.muted = true;
  fuente.playsInline = true;
  fuente.preload = 'auto';
  const canvas = document.createElement('canvas');
  canvas.width = ancho; canvas.height = alto;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar el video analizado.');
  let stream, grabador, animacion;
  const cancelado = () => new DOMException('Cancelado', 'AbortError');
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => terminar(new Error('No se pudo abrir el video para exportar.')), 10000);
      function terminar(error) {
        clearTimeout(timeout); fuente.removeEventListener('loadeddata', listo);
        fuente.removeEventListener('error', fallo); signal.removeEventListener('abort', abortar);
        error ? reject(error) : resolve();
      }
      function listo() { terminar(); }
      function fallo() { terminar(new Error('No se pudo abrir el video para exportar.')); }
      function abortar() { terminar(cancelado()); }
      if (signal.aborted) return abortar();
      fuente.addEventListener('loadeddata', listo, { once: true });
      fuente.addEventListener('error', fallo, { once: true });
      signal.addEventListener('abort', abortar, { once: true });
      fuente.src = src; fuente.load();
    });
    if (signal.aborted) throw cancelado();
    stream = canvas.captureStream(30);
    grabador = new MediaRecorder(stream, { mimeType: tipo, videoBitsPerSecond: 4000000 });
    const partes = [];
    const blob = await new Promise((resolve, reject) => {
      let terminado = false, completo = false;
      const tiempoMaximo = setTimeout(() => rechazar(new Error('La exportación tardó demasiado. Mantén abierta esta pestaña e inténtalo de nuevo.')), (duracion * 3 + 30) * 1000);
      function limpiar() { clearTimeout(tiempoMaximo); signal.removeEventListener('abort', abortar); fuente.removeEventListener('ended', finalizar); fuente.removeEventListener('error', fallo); }
      function rechazar(error) {
        if (terminado) return;
        terminado = true; limpiar();
        if (grabador.state !== 'inactive') grabador.stop();
        reject(error);
      }
      function abortar() { rechazar(cancelado()); }
      function fallo() { rechazar(new Error('No se pudo reproducir el video durante la exportación.')); }
      function finalizar() {
        completo = true;
        if (grabador.state !== 'inactive') grabador.stop();
      }
      function pintar() {
        if (terminado) return;
        try {
        ctx.drawImage(fuente, 0, 0, ancho, alto);
        const indice = Math.min(Math.floor(fuente.currentTime / intervalo), resultados.length - 1);
        dibujar(ctx, resultados[Math.max(0, indice)] || [], segundos, tieneZona, modo);
        if (zonaVisible.length >= 3) {
          ctx.beginPath();
          zonaVisible.forEach((p, i) => i ? ctx.lineTo(p.x * ancho, p.y * alto) : ctx.moveTo(p.x * ancho, p.y * alto));
          ctx.closePath(); ctx.fillStyle = 'rgba(239,68,68,0.28)'; ctx.fill();
          ctx.strokeStyle = '#dc2626'; ctx.lineWidth = 2; ctx.stroke();
        }
        onProgreso(Math.min(100, Math.floor(fuente.currentTime * 100 / duracion)));
        animacion = requestAnimationFrame(pintar);
        } catch { rechazar(new Error('No se pudieron dibujar las detecciones en el video.')); }
      }
      grabador.ondataavailable = event => { if (event.data.size) partes.push(event.data); };
      grabador.onerror = () => rechazar(new Error('No se pudo grabar el video analizado.'));
      grabador.onstop = () => {
        if (terminado) return;
        terminado = true; limpiar();
        if (!completo) return reject(new Error('La exportación terminó antes de completar el video.'));
        const resultado = new Blob(partes, { type: 'video/webm' });
        if (!resultado.size) reject(new Error('El video exportado está vacío.'));
        else resolve(resultado);
      };
      signal.addEventListener('abort', abortar, { once: true });
      fuente.addEventListener('ended', finalizar, { once: true });
      fuente.addEventListener('error', fallo, { once: true });
      if (signal.aborted) return abortar();
      try { pintar(); grabador.start(250); fuente.play().catch(fallo); }
      catch { rechazar(new Error('No se pudo iniciar la exportación.')); }
    });
    return blob;
  } finally {
    cancelAnimationFrame(animacion);
    fuente.pause(); fuente.removeAttribute('src'); fuente.load();
    if (grabador && grabador.state !== 'inactive') grabador.stop();
    stream?.getTracks().forEach(track => track.stop());
  }
}
