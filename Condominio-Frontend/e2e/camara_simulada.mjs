// Solo navegador y API simulados; no usa cámara, backend, base de datos o Firebase reales.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const raiz = resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const servidor = createServer(async (req, res) => {
  let ruta = resolve(raiz, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!ruta.startsWith(raiz + sep)) ruta = resolve(raiz, 'index.html');
  try {
    let bytes;
    try { bytes = await readFile(ruta); } catch { ruta = resolve(raiz, 'index.html'); bytes = await readFile(ruta); }
    res.writeHead(200, { 'content-type': mime[extname(ruta)] || 'application/octet-stream' }); res.end(bytes);
  } catch { res.writeHead(500); res.end(); }
});
await new Promise(resolveListen => servidor.listen(0, '127.0.0.1', resolveListen));
let navegador;
try {
  navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const pagina = await navegador.newPage();
  const envios = [];
  let analisis = 0;
  await pagina.addInitScript(() => {
    localStorage.setItem('access', 'token-ficticio');
    const fuente = document.createElement('canvas'); fuente.width = 640; fuente.height = 480;
    const ctx = fuente.getContext('2d'); ctx.fillRect(0, 0, 640, 480);
    setInterval(() => { ctx.fillStyle = 'black'; ctx.fillRect(0, 0, 640, 480); }, 100);
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: async () => fuente.captureStream(10) }, configurable: true });
  });
  await pagina.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let body = {};
    let status = 200;
    if (url.pathname.endsWith('/me/')) body = { username: 'guardia-ficticio', role: 'guardia', capacidades: [] };
    else if (url.pathname.endsWith('/vision-camara/estado/')) body = { disponible: true };
    else if (url.pathname.endsWith('/vision-camara/analizar/')) { analisis++; body = { detecciones: [{ clase: 'car', confianza: 0.9, caja: [200, 150, 300, 300] }] }; }
    else if (url.pathname.endsWith('/eventos-seguridad/') && route.request().method() === 'POST') {
      envios.push(route.request().postDataJSON());
      if (envios.length === 1) { status = 503; body = { detail: 'fallo simulado' }; }
      else body = { ...envios.at(-1), sin_guardias: false };
    } else if (url.pathname.endsWith('/eventos-seguridad/')) body = [];
    await route.fulfill({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) });
  });
  const base = `http://127.0.0.1:${servidor.address().port}`;
  await pagina.goto(base + '/admin/monitor-camaras');
  await pagina.getByRole('button', { name: 'Cámara de laptop' }).click();
  await pagina.getByRole('button', { name: 'Configuración de análisis' }).click();
  await pagina.getByRole('button', { name: 'Iniciar cámara' }).click();
  await pagina.getByRole('button', { name: 'Dibujar zona' }).waitFor({ timeout: 15000 });
  await pagina.getByRole('button', { name: 'Detener IA de laptop' }).click();
  const videoVivo = pagina.getByLabel('Cámara de laptop en directo');
  await videoVivo.waitFor();
  const analisisDetenido = analisis;
  await pagina.waitForTimeout(800);
  assert.equal(analisis, analisisDetenido);
  assert.equal(await videoVivo.evaluate(v => v.srcObject.getVideoTracks()[0].readyState), 'live');
  await pagina.getByRole('button', { name: 'Activar IA de laptop' }).click();
  await pagina.getByRole('button', { name: 'Dibujar zona' }).waitFor({ timeout: 15000 });
  await pagina.getByRole('button', { name: 'Dibujar zona' }).click();
  const dibujo = pagina.getByLabel('Dibuja la zona con clics, o usa las flechas y Enter para añadir puntos');
  const caja = await dibujo.boundingBox();
  for (const [x, y] of [[0.1, 0.1], [0.9, 0.1], [0.9, 0.9], [0.1, 0.9]])
    await dibujo.click({ position: { x: caja.width * x, y: caja.height * y } });
  await pagina.getByRole('button', { name: 'Completar zona' }).click();
  assert.equal(await pagina.getByLabel('Zona prohibida marcada').count(), 0);
  await pagina.getByRole('button', { name: 'Mostrar zona' }).click();
  assert.equal(await pagina.getByLabel('Zona prohibida marcada').count(), 1);
  await pagina.getByRole('button', { name: 'Ocultar zona' }).click();
  await pagina.getByLabel('Tiempo mínimo detenido (2 a 120 segundos):').fill('2');
  const habilitar = pagina.getByRole('checkbox', { name: /Registrar automáticamente los hallazgos de esta cámara/ });
  await habilitar.check();
  await pagina.getByRole('button', { name: 'Reintentar registro' }).waitFor({ timeout: 15000 });
  assert.equal(await habilitar.isChecked(), false);
  await pagina.getByRole('button', { name: 'Reintentar registro' }).click();
  await pagina.getByText('Evento registrado y enviado a la bandeja de guardias.').waitFor();
  assert.equal(envios.length, 2);
  assert.deepEqual(envios[0], envios[1]);
  await pagina.getByRole('button', { name: 'Detener cámara' }).click();
  assert.equal(await pagina.getByRole('button', { name: 'Mostrar zona' }).count(), 0);
  console.log('Prueba simulada correcta: zona, visibilidad, envío fallido y reintento idempotente.');
} finally {
  await navegador?.close();
  await new Promise(resolveClose => servidor.close(resolveClose));
}
