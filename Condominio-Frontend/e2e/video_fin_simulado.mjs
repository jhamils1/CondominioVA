// Prueba con video generado y API simulada, sin usar el backend real.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdtemp, unlink, rmdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const temporal = await mkdtemp(join(tmpdir(), 'condominio-video-'));
const archivo = join(temporal, 'muestra.webm');
const python = resolve('../Condominio-Backend/seguridad_vision/.venv/Scripts/python.exe');
const crear = `import cv2, numpy as np, sys
w = cv2.VideoWriter(sys.argv[1], cv2.VideoWriter_fourcc(*'VP80'), 10, (320, 240))
assert w.isOpened()
for i in range(30): w.write(np.full((240,320,3), i*5, dtype=np.uint8))
w.release()`;
let navegador, servidor;
try {
  execFileSync(python, ['-c', crear, archivo]);
  const raiz = resolve('dist');
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg' };
  servidor = createServer(async (req, res) => {
    let ruta = resolve(raiz, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!ruta.startsWith(raiz + sep)) ruta = resolve(raiz, 'index.html');
    try {
      let datos;
      try { datos = await readFile(ruta); } catch { ruta = resolve(raiz, 'index.html'); datos = await readFile(ruta); }
      res.writeHead(200, { 'content-type': mime[extname(ruta)] || 'application/octet-stream' }); res.end(datos);
    } catch { res.writeHead(500); res.end(); }
  });
  await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
  navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const pagina = await navegador.newPage();
  let peticiones = 0;
  await pagina.addInitScript(() => localStorage.setItem('access', 'token-ficticio'));
  await pagina.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let datos = {};
    if (url.pathname.endsWith('/me/')) datos = { username: 'guardia-ficticio', role: 'guardia', capacidades: [] };
    else if (url.pathname.endsWith('/vision-camara/analizar/')) { peticiones++; datos = { detecciones: [] }; }
    else if (url.pathname.endsWith('/eventos-seguridad/')) datos = [];
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(datos) });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras`);
  await pagina.getByRole('button', { name: 'Configuración de análisis' }).click();
  await pagina.locator('input[type=file]').setInputFiles(archivo);
  await pagina.getByRole('button', { name: 'Analizar video', exact: true }).click();
  await pagina.getByText('Análisis terminado.', { exact: false }).waitFor({ timeout: 30000 });
  const muestras = peticiones;
  assert.equal(muestras, 6);
  const original = pagina.locator('video.zona-original-video');
  const analizado = pagina.getByLabel('Video analizado', { exact: true });
  await original.evaluate(v => v.play());
  await pagina.waitForTimeout(5000);
  const estado = await original.evaluate(v => ({ paused: v.paused, ended: v.ended, time: v.currentTime, duration: v.duration }));
  const otro = await analizado.evaluate(v => ({ paused: v.paused, ended: v.ended, time: v.currentTime, duration: v.duration }));
  console.log('Reproductores al terminar:', JSON.stringify({ original: estado, analizado: otro, muestras, peticiones }));
  assert.equal(peticiones, muestras, 'Reproducir no debe volver a solicitar análisis.');
  assert.ok(estado.paused && otro.paused && estado.time >= estado.duration - 0.1 && otro.time >= otro.duration - 0.1, 'Ambos deben quedar detenidos al final.');
  console.log('Fin de video correcto; no se repitió el análisis.');
} finally {
  await navegador?.close();
  if (servidor) await new Promise(ok => servidor.close(ok));
  await unlink(archivo).catch(() => {});
  await rmdir(temporal);
}
