// El búfer pertenece a una fuente y no comparte imágenes entre cámaras.
export function crearBufferFotogramas({ maxSegundos = 12, maxFotogramas = 90 } = {}) {
  let fotogramas = [];
  return {
    agregar(imagen, tiempo) {
      if (!(imagen instanceof Blob) || !imagen.size || !Number.isFinite(tiempo)) return;
      if (fotogramas.length && tiempo <= fotogramas[fotogramas.length - 1].tiempo) return;
      fotogramas.push({ imagen, tiempo });
      fotogramas = fotogramas.filter(f => tiempo - f.tiempo <= maxSegundos).slice(-maxFotogramas);
    },
    obtener(desde, hasta) { return fotogramas.filter(f => f.tiempo >= desde && f.tiempo <= hasta); },
    limpiar() { fotogramas = []; },
  };
}

export function ventanaClip(instante, duracion) {
  if (!Number.isFinite(instante) || !Number.isFinite(duracion) || duracion <= 0) throw new Error('Tiempo de video no disponible.');
  const largo = Math.min(4, duracion);
  const inicio = Math.max(0, Math.min(instante - 2, duracion - largo));
  return { inicio, fin: inicio + largo };
}

// Espera los dos segundos posteriores y conserva los fotogramas anteriores del
// mismo reloj monotónico que se usó para la detección.
export async function grabarClipEnVivo(buffer, instante) {
  const espera = Math.max(0, (instante + 2.2 - performance.now() / 1000) * 1000);
  await new Promise(resolve => setTimeout(resolve, espera));
  const imagenes = buffer.obtener(instante - 2.25, instante + 2.25);
  if (imagenes.length < 4 || imagenes[0].tiempo > instante - 1.5 || imagenes[imagenes.length - 1].tiempo < instante + 1.5) {
    throw new Error('No hay suficientes fotogramas para el clip.');
  }
  if (imagenes.some((f, i) => i > 0 && f.tiempo - imagenes[i - 1].tiempo > 1)) {
    throw new Error('La cámara tuvo una interrupción durante el clip.');
  }
  if (!globalThis.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error('El navegador no permite crear clips.');
  const tipo = ['video/webm;codecs=vp8', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
  if (!tipo) throw new Error('El navegador no admite clips WebM.');
  const bitmaps = await Promise.all(imagenes.map(f => createImageBitmap(f.imagen)));
  let stream, grabador, animacion;
  try {
    const canvas = document.createElement('canvas');
    const escala = Math.min(1, 640 / bitmaps[0].width, 640 / bitmaps[0].height);
    canvas.width = Math.max(2, Math.round(bitmaps[0].width * escala / 2) * 2);
    canvas.height = Math.max(2, Math.round(bitmaps[0].height * escala / 2) * 2);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo preparar el clip.');
    stream = canvas.captureStream(12);
    grabador = new MediaRecorder(stream, { mimeType: tipo, videoBitsPerSecond: 600000 });
    const partes = [];
    return await new Promise((resolve, reject) => {
      let terminado = false;
      const comienzo = performance.now();
      const timer = setTimeout(() => terminar(new Error('No se pudo completar el clip.')), 10000);
      function terminar(error) {
        if (terminado) return; terminado = true; clearTimeout(timer); cancelAnimationFrame(animacion);
        if (error) { if (grabador.state !== 'inactive') grabador.stop(); reject(error); return; }
        const blob = new Blob(partes, { type: 'video/webm' });
        if (!blob.size || blob.size > 2 * 1024 * 1024) reject(new Error('Clip vacío o demasiado grande.'));
        else resolve(blob);
      }
      function pintar() {
        if (terminado) return;
        const transcurrido = (performance.now() - comienzo) / 1000;
        if (transcurrido > 5) return terminar(new Error('La captura fue interrumpida.'));
        const objetivo = instante - 2 + Math.min(4, transcurrido);
        let indice = 0;
        for (let i = 1; i < imagenes.length; i += 1) if (Math.abs(imagenes[i].tiempo - objetivo) < Math.abs(imagenes[indice].tiempo - objetivo)) indice = i;
        ctx.drawImage(bitmaps[indice], 0, 0, canvas.width, canvas.height);
        if (transcurrido >= 4) { if (grabador.state !== 'inactive') grabador.stop(); return; }
        animacion = requestAnimationFrame(pintar);
      }
      grabador.ondataavailable = e => { if (e.data.size) partes.push(e.data); };
      grabador.onerror = () => terminar(new Error('No se pudo grabar el clip.'));
      grabador.onstop = () => terminar();
      try { ctx.drawImage(bitmaps[0], 0, 0, canvas.width, canvas.height); grabador.start(); pintar(); }
      catch { terminar(new Error('No se pudo iniciar el clip.')); }
    });
  } finally {
    cancelAnimationFrame(animacion);
    if (grabador && grabador.state !== 'inactive') grabador.stop();
    stream?.getTracks().forEach(track => track.stop()); bitmaps.forEach(bitmap => bitmap.close());
  }
}

// Inicia la captura sin retrasar la creación del evento y adjunta al terminar.
export function registrarClipEnVivo(buffer, instante, eventoId, registro, adjuntar, alFallar) {
  const captura = grabarClipEnVivo(buffer, instante).then(clip => ({ clip }), () => ({ error: true }));
  registro.then(() => captura.then(async resultado => {
    if (resultado.error) { alFallar(); return; }
    try { await adjuntar(eventoId, resultado.clip); } catch { alFallar(); }
  }), () => {});
}

// Produce video silencioso de tamaño acotado; no envía datos ni activa la IA.
export async function grabarClipArchivo(src, instante, duracion) {
  if (!globalThis.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) throw new Error('El navegador no permite crear clips.');
  const tipo = ['video/webm;codecs=vp8', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
  if (!tipo) throw new Error('El navegador no admite clips WebM.');
  const { inicio, fin } = ventanaClip(instante, duracion);
  const video = document.createElement('video');
  video.muted = true; video.playsInline = true; video.preload = 'auto';
  let stream, grabador, animacion;
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => finalizar(new Error('No se pudo abrir el video.')), 10000);
      function finalizar(error) { clearTimeout(timer); video.removeEventListener('loadeddata', listo); video.removeEventListener('error', fallo); error ? reject(error) : resolve(); }
      function listo() { finalizar(); }
      function fallo() { finalizar(new Error('No se pudo abrir el video.')); }
      video.addEventListener('loadeddata', listo, { once: true }); video.addEventListener('error', fallo, { once: true });
      video.src = src; video.load();
    });
    await new Promise((resolve, reject) => {
      if (Math.abs(video.currentTime - inicio) < 0.001) return resolve();
      const timer = setTimeout(() => reject(new Error('No se pudo ubicar el incidente.')), 10000);
      video.addEventListener('seeked', () => { clearTimeout(timer); resolve(); }, { once: true });
      video.currentTime = inicio;
    });
    const canvas = document.createElement('canvas');
    const escala = Math.min(1, 640 / video.videoWidth, 640 / video.videoHeight);
    canvas.width = Math.max(2, Math.round(video.videoWidth * escala / 2) * 2);
    canvas.height = Math.max(2, Math.round(video.videoHeight * escala / 2) * 2);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo preparar el clip.');
    stream = canvas.captureStream(12);
    grabador = new MediaRecorder(stream, { mimeType: tipo, videoBitsPerSecond: 600000 });
    const partes = [];
    return await new Promise((resolve, reject) => {
      let terminado = false;
      const timer = setTimeout(() => terminar(new Error('No se pudo completar el clip.')), 20000);
      function terminar(error) {
        if (terminado) return; terminado = true; clearTimeout(timer); cancelAnimationFrame(animacion);
        if (error) { if (grabador.state !== 'inactive') grabador.stop(); reject(error); return; }
        const blob = new Blob(partes, { type: 'video/webm' });
        if (!blob.size || blob.size > 2 * 1024 * 1024) reject(new Error('El clip supera el límite o está vacío.'));
        else resolve(blob);
      }
      function pintar() {
        if (terminado) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (video.currentTime >= fin || video.ended) { if (grabador.state !== 'inactive') grabador.stop(); return; }
        animacion = requestAnimationFrame(pintar);
      }
      grabador.ondataavailable = e => { if (e.data.size) partes.push(e.data); };
      grabador.onerror = () => terminar(new Error('No se pudo grabar el clip.'));
      grabador.onstop = () => terminar();
      try { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); grabador.start(); video.play().then(pintar).catch(() => terminar(new Error('No se pudo reproducir el video.'))); }
      catch { terminar(new Error('No se pudo iniciar el clip.')); }
    });
  } finally {
    cancelAnimationFrame(animacion); video.pause(); video.removeAttribute('src'); video.load();
    if (grabador && grabador.state !== 'inactive') grabador.stop();
    stream?.getTracks().forEach(track => track.stop());
  }
}
