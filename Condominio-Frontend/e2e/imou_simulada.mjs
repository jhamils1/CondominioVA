// Solo navegador y API simulados; no usa cámara, backend, base de datos o Firebase reales.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

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
  const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } });
  await pagina.addInitScript(() => localStorage.setItem('access', 'token-ficticio'));
  const jpeg = await pagina.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
    return canvas.toDataURL('image/jpeg').split(',')[1];
  });
  let consultas = 0;
  let fallar = false;
  let analisis = 0;
  let eventos = 0;
  const envios = [];
  let fallarIA = false;
  let moverVehiculo = false;
  let evidenciasConsultadas = 0;
  await pagina.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/vision-imou/fotograma/')) {
      consultas++;
      assert.equal(route.request().method(), 'POST');
      assert.equal(route.request().headers().authorization, 'Bearer token-ficticio');
      return route.fulfill({ status: fallar ? 503 : consultas === 1 ? 202 : 200,
        contentType: fallar || consultas === 1 ? 'text/plain' : 'image/jpeg',
        body: fallar || consultas === 1 ? '' : Buffer.from(jpeg, 'base64') });
    }
    if (url.pathname.endsWith('/vision-camara/estado/')) {
      return route.fulfill({ status: fallarIA ? 503 : 200, contentType: 'application/json', body: '{}' });
    }
    if (url.pathname.endsWith('/vision-camara/analizar/')) {
      analisis++;
      assert.equal(route.request().method(), 'POST');
      assert.ok(route.request().headers()['content-type'].startsWith('multipart/form-data'));
      return route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ detecciones: [{ clase: 'car', confianza: 0.9,
          caja: moverVehiculo ? [400, 100, 500, 200] : [100, 100, 200, 200] }] }) });
    }
    if (url.pathname.endsWith('/evidencia/')) {
      evidenciasConsultadas++;
      assert.equal(route.request().headers().authorization, 'Bearer token-ficticio');
      return route.fulfill({ status: 200, contentType: 'image/jpeg', body: Buffer.from(jpeg, 'base64') });
    }
    if (url.pathname.endsWith('/eventos-seguridad/') && route.request().method() === 'POST') {
      eventos++;
      const request = route.request();
      const form = await new Response(request.postDataBuffer(), { headers: { 'content-type': request.headers()['content-type'] } }).formData();
      const bytes = Buffer.from(await form.get('evidencia').arrayBuffer());
      assert.deepEqual(bytes, Buffer.from(jpeg, 'base64'), 'La evidencia debe ser el fotograma analizado');
      envios.push({ id: form.get('id'), categoria: form.get('categoria'), camara: form.get('camara'),
        descripcion: form.get('descripcion'), fecha_evento: form.get('fecha_evento'),
        evidenciaHash: createHash('sha256').update(bytes).digest('hex') });
      return route.fulfill({ status: eventos === 1 ? 503 : 201, contentType: 'application/json',
        body: JSON.stringify(eventos === 1 ? { detail: 'error simulado' } : { ...envios.at(-1),
          sin_guardias: false, evidencia_disponible: true, estado: 'PENDIENTE_REVISION', origen: 'MANUAL' }) });
    }
    const body = url.pathname.endsWith('/me/') ? { username: 'guardia-ficticio', role: 'guardia', capacidades: [] } : [];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/eventos-seguridad`);
  const start = pagina.getByRole('button', { name: 'Ver c\u00e1mara Imou' });
  await start.waitFor();
  assert.equal(consultas, 0);
  assert.equal(await pagina.getByRole('button', { name: 'Iniciar c\u00e1mara', exact: true }).count(), 1);
  await start.click();
  const vista = pagina.getByRole('img', { name: 'Vista en directo de la c\u00e1mara Imou' });
  await vista.waitFor();
  await pagina.waitForFunction(() => document.querySelector('img[alt^="Vista en directo"]')?.naturalWidth === 640);
  assert.equal(analisis, 0);
  await pagina.getByRole('button', { name: 'Activar IA en Imou' }).click();
  const canvas = pagina.getByLabel('Imagen Imou analizada con IA');
  await pagina.getByText(/Los recuadros corresponden a este fotograma/).waitFor();
  assert.ok(analisis > 0);
  assert.equal(await canvas.evaluate(el => el.width), 640);
  const pixel = await canvas.evaluate(el => Array.from(el.getContext('2d').getImageData(100, 140, 1, 1).data));
  assert.ok(pixel[1] > 200 && pixel[0] < 50, 'Recuadro verde dibujado en el fotograma analizado');
  const directa = await vista.boundingBox();
  const analizada = await canvas.boundingBox();
  assert.ok(Math.abs(directa.y - analizada.y) < 2, 'Ambas imágenes deben comenzar a la misma altura');
  assert.ok(Math.abs(directa.width - analizada.width) < 2, 'Ambas imágenes deben tener el mismo ancho');
  assert.ok(analizada.x > directa.x, 'La imagen analizada debe estar a la derecha');
  await pagina.getByRole('button', { name: 'Dibujar zona Imou' }).click();
  const editor = pagina.getByLabel('Dibuja la zona con clics, o usa las flechas y Enter para añadir puntos');
  const cuadroZona = await editor.boundingBox();
  for (const [x, y] of [[0.1, 0.1], [0.6, 0.1], [0.6, 0.6], [0.1, 0.6]])
    await editor.click({ position: { x: cuadroZona.width * x, y: cuadroZona.height * y } });
  await pagina.getByRole('button', { name: 'Completar zona Imou' }).click();
  assert.equal(await pagina.getByLabel('Zona prohibida marcada').count(), 0);
  await pagina.getByRole('button', { name: 'Mostrar zona Imou' }).click();
  assert.equal(await pagina.getByLabel('Zona prohibida marcada').count(), 1);
  await pagina.getByRole('button', { name: 'Ocultar zona Imou' }).click();
  await pagina.getByLabel('Tiempo mínimo detenido Imou (2 a 120 segundos):').fill('2');
  await pagina.waitForFunction(() => {
    const c = document.querySelector('canvas[aria-label="Imagen Imou analizada con IA"]');
    if (!c) return false;
    const p = c.getContext('2d').getImageData(100, 140, 1, 1).data;
    return p[0] > 200 && p[1] < 100;
  }, null, { timeout: 10000 });
  moverVehiculo = true;
  await pagina.waitForFunction(() => {
    const c = document.querySelector('canvas[aria-label="Imagen Imou analizada con IA"]');
    if (!c) return false;
    const p = c.getContext('2d').getImageData(400, 140, 1, 1).data;
    return p[1] > 200 && p[0] < 50;
  }, null, { timeout: 10000 });
  assert.equal(eventos, 0);
  await pagina.setViewportSize({ width: 600, height: 900 });
  const directaMovil = await vista.boundingBox();
  const analizadaMovil = await canvas.boundingBox();
  assert.ok(analizadaMovil.y > directaMovil.y, 'En pantallas pequeñas las imágenes se apilan');
  await pagina.setViewportSize({ width: 1440, height: 900 });
  assert.equal(eventos, 0);
  const automatico = pagina.getByRole('checkbox', { name: /Registrar automáticamente los hallazgos de la Imou/ });
  assert.equal(await automatico.isChecked(), false);
  await automatico.check();
  moverVehiculo = false;
  const reintentar = pagina.getByRole('button', { name: 'Reintentar evento Imou' });
  await reintentar.waitFor({ timeout: 12000 });
  assert.equal(eventos, 1);
  assert.equal(await automatico.isChecked(), false);
  assert.match(envios[0].camara, /Imou/);
  assert.match(envios[0].descripcion, /Requiere revisión/);
  await pagina.getByRole('button', { name: 'Detener IA en Imou' }).click();
  await pagina.waitForTimeout(250);
  const analisisDetenido = analisis;
  await pagina.waitForTimeout(700);
  assert.equal(analisis, analisisDetenido);
  assert.equal(await canvas.count(), 0);
  assert.equal(await vista.count(), 1);
  assert.equal(await reintentar.count(), 1, 'El reintento se conserva al detener la IA');
  await reintentar.click();
  await pagina.getByText(/Evento registrado para revisión de los guardias activos/).waitFor();
  assert.equal(eventos, 2);
  assert.deepEqual(envios[0], envios[1], 'El reintento conserva identificador y contenido');
  assert.equal(await reintentar.count(), 0);
  await pagina.getByRole('button', { name: /Posible estacionamiento en zona prohibida/ }).click();
  const evidencia = pagina.getByRole('img', { name: 'Fotograma de evidencia del evento' });
  await evidencia.waitFor();
  await pagina.waitForFunction(() => document.querySelector('img[alt="Fotograma de evidencia del evento"]')?.naturalWidth === 640);
  assert.equal(evidenciasConsultadas, 1);
  await pagina.getByRole('button', { name: 'Cerrar', exact: true }).click();
  assert.equal(await evidencia.count(), 0);
  await pagina.getByRole('button', { name: 'Activar IA en Imou' }).click();
  await pagina.getByText(/Los recuadros corresponden a este fotograma/).waitFor();
  await automatico.check();
  await pagina.getByLabel('Tiempo mínimo detenido Imou (2 a 120 segundos):').fill('3');
  assert.equal(await automatico.isChecked(), false, 'Cambiar el umbral detiene el registro');
  await pagina.getByRole('button', { name: 'Detener IA en Imou' }).click();
  fallarIA = true;
  await pagina.getByRole('button', { name: 'Activar IA en Imou' }).click();
  await pagina.getByText(/No se pudo iniciar el análisis/).waitFor();
  assert.equal(await vista.count(), 1);
  assert.equal(await canvas.count(), 0);
  await pagina.getByRole('button', { name: 'Detener vista Imou' }).click();
  await pagina.waitForTimeout(350);
  const detenido = consultas;
  await pagina.waitForTimeout(500);
  assert.equal(consultas, detenido);
  assert.equal(await vista.count(), 0);
  fallar = true;
  await start.click();
  await pagina.getByText(/No se pudo recibir la imagen/).waitFor();
  assert.equal(await vista.count(), 0);
  assert.equal(await start.isEnabled(), true);
  console.log('Imou simulada: zona, control optativo, fallo y reintento idempotente sin acceso a datos reales.');
} finally {
  await navegador?.close();
  await new Promise(resolveClose => servidor.close(resolveClose));
}
