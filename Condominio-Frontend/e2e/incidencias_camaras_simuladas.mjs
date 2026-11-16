// API, imágenes y detecciones simuladas. No conecta cámaras ni envía avisos reales.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const raiz = resolve('dist');
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg' };
const servidor = createServer(async (req, res) => {
  let ruta = resolve(raiz, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!ruta.startsWith(raiz + sep)) ruta = resolve(raiz, 'index.html');
  try {
    let datos;
    try { datos = await readFile(ruta); } catch { ruta = resolve(raiz, 'index.html'); datos = await readFile(ruta); }
    res.writeHead(200, { 'content-type': tipos[extname(ruta)] || 'application/octet-stream' }); res.end(datos);
  } catch { res.writeHead(500); res.end(); }
});
await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
let navegador;
try {
  navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const pagina = await navegador.newPage();
  await pagina.addInitScript(() => localStorage.setItem('access', 'token-ficticio'));
  const imagen64 = await pagina.evaluate(() => { const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; c.getContext('2d').fillRect(0, 0, 1920, 1080); return c.toDataURL('image/jpeg').split(',')[1]; });
  const imagen = Buffer.from(imagen64, 'base64');
  const eventos = [];
  await pagina.route('**/api/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path.endsWith('/me/')) return route.fulfill({ json: { username: 'demo', role: 'administrador', capacidades: [] } });
    if (path.endsWith('/camaras/disponibles-monitor/')) return route.fulfill({ json: [{ id: 2, nombre: 'Cámara A', activa: true }, { id: 3, nombre: 'Cámara B', activa: true }] });
    if (path.endsWith('/vision-camaras/2/zona/')) return route.fulfill({ json: { puntos: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }], segundos: 2, automatico: true, version: 'v1' } });
    if (path.endsWith('/vision-camaras/3/zona/')) return route.fulfill({ json: { puntos: [], segundos: 5, automatico: false, version: null } });
    if (path.includes('/fotograma-monitor/')) return route.fulfill({ contentType: 'image/jpeg', body: imagen });
    if (path.endsWith('/vision-camara/estado/')) return route.fulfill({ json: { disponible: true } });
    if (path.endsWith('/vision-camara/analizar/')) return route.fulfill({ json: { detecciones: [{ clase: 'car', confianza: .9, caja: [100, 100, 250, 250] }] } });
    if (path.endsWith('/eventos-seguridad/') && req.method() === 'POST') { eventos.push(req.postDataBuffer()); return eventos.length === 1 ? route.fulfill({ status: 503, json: { detail: 'fallo simulado' } }) : route.fulfill({ json: { id: 'evento', sin_guardias: false } }); }
    return route.fulfill({ json: [] });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras`);
  const a = pagina.locator('section.camara-mosaico-catalogo').filter({ has: pagina.getByRole('heading', { name: 'Cámara A' }) });
  const b = pagina.locator('section.camara-mosaico-catalogo').filter({ has: pagina.getByRole('heading', { name: 'Cámara B' }) });
  await a.getByRole('button', { name: 'Ver cámara' }).click();
  await b.getByRole('button', { name: 'Ver cámara' }).click();
  await pagina.waitForFunction(() => document.querySelector('[aria-label="Imagen analizada: Cámara A"]'));
  await pagina.waitForTimeout(5000);
  assert.equal(eventos.length, 1, 'Solo la cámara configurada debe crear un evento');
  assert.match(eventos[0].toString('latin1'), /name="evidencia"; filename="evidencia.jpg"/);
  assert.match(eventos[0].toString('utf8'), /Cámara A/);
  const iniImagen = eventos[0].indexOf(Buffer.from([0xff, 0xd8, 0xff]));
  const finImagen = eventos[0].indexOf(Buffer.from([0xff, 0xd9]), iniImagen) + 2;
  assert.ok(iniImagen >= 0 && finImagen > iniImagen);
  const tamano = await pagina.evaluate(async bytes => {
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }));
    return [bitmap.width, bitmap.height];
  }, [...eventos[0].subarray(iniImagen, finImagen)]);
  assert.deepEqual(tamano, [1280, 720], 'La evidencia se ajusta al límite del servidor');
  await a.getByRole('button', { name: 'Reintentar evento' }).click();
  await pagina.waitForFunction(() => document.body.textContent.includes('Evento enviado a revisión'));
  assert.equal(eventos.length, 2);
  const id = datos => datos.toString('utf8').match(/name="id"\r\n\r\n([^\r]+)/)?.[1];
  assert.ok(id(eventos[0]));
  assert.equal(id(eventos[0]), id(eventos[1]), 'El reintento conserva el identificador');
  console.log('Dos cámaras simuladas: zona independiente, un evento y evidencia correctos.');
} finally {
  await navegador?.close();
  await new Promise(ok => servidor.close(ok));
}
