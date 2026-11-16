// Cambios de procesador y cámara simulados; no hay tráfico a proveedores externos.
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
  try { let datos; try { datos = await readFile(ruta); } catch { ruta = resolve(raiz, 'index.html'); datos = await readFile(ruta); }
    res.writeHead(200, { 'content-type': tipos[extname(ruta)] || 'application/octet-stream' }); res.end(datos);
  } catch { res.writeHead(500); res.end(); }
});
await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
let navegador;
try {
  navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const pagina = await navegador.newPage();
  let remotoDisponible = false;
  const analisis = [];
  await pagina.addInitScript(() => {
    localStorage.setItem('access', 'token-ficticio');
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext('2d'); ctx.fillRect(0, 0, 640, 480);
    setInterval(() => ctx.fillRect(0, 0, 640, 480), 100);
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
      getUserMedia: async () => canvas.captureStream(10),
      enumerateDevices: async () => [],
    } });
  });
  await pagina.route('**/api/**', async route => {
    const url = new URL(route.request().url()), path = url.pathname;
    if (path.endsWith('/me/')) return route.fulfill({ json: { username: 'demo', role: 'administrador', capacidades: [] } });
    if (path.endsWith('/vision-camara/estado/')) {
      const modo = url.searchParams.get('procesador');
      if (modo === 'remoto' && !remotoDisponible) return route.fulfill({ status: 503, json: { detail: 'No disponible' } });
      return route.fulfill({ json: { disponible: true, procesador: modo } });
    }
    if (path.endsWith('/vision-camara/analizar/')) { analisis.push(url.searchParams.get('procesador')); return route.fulfill({ json: { detecciones: [] } }); }
    return route.fulfill({ json: [] });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras?configuracion=analisis`);
  const panel = pagina.getByRole('region', { name: 'Procesador de IA' });
  await panel.getByLabel('Usar').selectOption('remoto');
  await panel.getByRole('button', { name: 'Aplicar cambio' }).click();
  await panel.getByText(/no está configurada o no responde/).waitFor();
  assert.equal(await pagina.evaluate(() => sessionStorage.getItem('vision-procesador')), null);
  assert.equal(analisis.length, 0, 'Cambiar el selector no envía imágenes');
  remotoDisponible = true;
  const navegacion = pagina.waitForNavigation();
  await panel.getByRole('button', { name: 'Aplicar cambio' }).click();
  await navegacion;
  assert.equal(await pagina.evaluate(() => sessionStorage.getItem('vision-procesador')), 'remoto');
  await pagina.getByRole('button', { name: 'Cámara de laptop' }).click();
  await pagina.getByRole('button', { name: 'Iniciar cámara' }).click();
  await pagina.waitForFunction(() => document.querySelector('[aria-label="Cámara con detecciones"]:not([hidden])'));
  await pagina.waitForTimeout(700);
  assert.ok(analisis.length > 0);
  assert.ok(analisis.every(modo => modo === 'remoto'), 'El análisis utiliza el procesador seleccionado');
  await pagina.getByRole('region', { name: 'Procesador de IA' }).getByLabel('Usar').selectOption('local');
  const vuelta = pagina.waitForNavigation();
  await pagina.getByRole('region', { name: 'Procesador de IA' }).getByRole('button', { name: 'Aplicar cambio' }).click();
  await vuelta;
  assert.equal(await pagina.evaluate(() => sessionStorage.getItem('vision-procesador')), 'local');
  console.log('Procesador simulado: opción local, remoto disponible y error sin cambio correctos.');
} finally {
  await navegador?.close();
  await new Promise(ok => servidor.close(ok));
}
