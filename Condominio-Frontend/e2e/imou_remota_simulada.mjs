// Prueba de interfaz aislada: todas las respuestas y la imagen son ficticias.
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
    res.writeHead(200, { 'content-type': tipos[extname(ruta)] || 'application/octet-stream' });
    res.end(datos);
  } catch { res.writeHead(500); res.end(); }
});
await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
let navegador;
try {
  navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const contexto = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
  await contexto.addInitScript(() => localStorage.setItem('access', 'token-ficticio'));
  let titular = null;
  let forzarOcupado = false;
  const acciones = [];
  const eventos = [], reglas = {};
  const generador = await contexto.newPage();
  const foto64 = await generador.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 480;
    canvas.getContext('2d').fillRect(0, 0, 640, 480);
    return canvas.toDataURL('image/jpeg').split(',')[1];
  });
  await generador.close();
  const foto = Buffer.from(foto64, 'base64');
  await contexto.route('**/api/**', async route => {
    const req = route.request(), ruta = new URL(req.url()).pathname;
    if (ruta.endsWith('/me/')) return route.fulfill({ json: { username: 'admin-ficticio', role: 'administrador', capacidades: [] } });
    if (ruta.endsWith('/camaras/disponibles-monitor/')) return route.fulfill({ status: 403, json: {} });
    if (ruta.endsWith('/vision-imou/capacidad-remota/')) return route.fulfill({ json: { activa: true } });
    if (ruta.endsWith('/vision-imou/exclusion-remota/')) {
      const sesion = req.headers()['x-imou-session'];
      const accion = req.postDataJSON().accion;
      assert.match(sesion, /^[a-f0-9]{32}$/);
      acciones.push({ accion, sesion });
      if (accion === 'adquirir' && (forzarOcupado || (titular && titular !== sesion))) return route.fulfill({ status: 409, json: { concedido: false } });
      if (accion === 'adquirir') titular = sesion;
      if (accion === 'liberar' && titular === sesion) titular = null;
      return route.fulfill({ json: { concedido: true } });
    }
    if (ruta.endsWith('/vision-imou/monitoreo/')) return route.fulfill({ json: { ocupado: titular !== req.headers()['x-imou-session'] } });
    if (ruta.endsWith('/vision-imou/fotograma/')) return route.fulfill({ status: 200, contentType: 'image/jpeg', body: foto });
    if (ruta.endsWith('/vision-camara/estado/')) return route.fulfill({ json: { disponible: true } });
    if (ruta.endsWith('/vision-camara/analizar/')) return route.fulfill({ json: { detecciones: [{ clase: 'dog', confianza: .9, caja: [200, 100, 300, 300] }] } });
    if (ruta.endsWith('/vision-imou/zona/')) return route.fulfill({ json: { puntos: [], segundos: 5, automatico: false, actualizado: null } });
    if (ruta.includes('/vision-piscina/') || ruta.includes('/vision-mascota/')) {
      if (req.method() === 'PUT') reglas[ruta] = { ...req.postDataJSON(), version: 'v1' };
      return route.fulfill({ json: reglas[ruta] || { puntos: [], segundos: ruta.includes('/vision-mascota/') ? 0 : 10, automatico: false, version: null } });
    }
    if (ruta.endsWith('/eventos-seguridad/') && req.method() === 'POST') {
      assert.equal(req.headers()['x-imou-session'], titular);
      eventos.push(req.postDataBuffer());
      return route.fulfill({ status: 201, json: { id: 'evento-ficticio', sin_guardias: false } });
    }
    if (ruta.endsWith('/clip/') && req.method() === 'POST') return route.fulfill({ json: { clip_disponible: true } });
    if (ruta.endsWith('/eventos-seguridad/') || ruta.endsWith('/notificaciones-seguridad/')) return route.fulfill({ json: [] });
    return route.fulfill({ status: 404, json: {} });
  });
  const primera = await contexto.newPage();
  await primera.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras`);
  await primera.getByRole('button', { name: 'Ver cámara Imou' }).click();
  await primera.getByRole('button', { name: 'Detener vista Imou' }).waitFor();
  await primera.waitForFunction(() => document.querySelector('img[alt="Vista en directo de la cámara Imou"]'));
  const primeraSesion = acciones.find(x => x.accion === 'adquirir').sesion;
  await primera.getByRole('button', { name: 'Detener vista Imou' }).click();
  await primera.waitForFunction(() => document.querySelector('.imou-camera-message')?.textContent?.includes('Vista detenida'));
  await primera.waitForTimeout(300);
  assert.equal(titular, null);
  forzarOcupado = true;
  const segunda = await contexto.newPage();
  await segunda.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras`);
  await segunda.getByRole('button', { name: 'Ver cámara Imou' }).click();
  await segunda.getByText('No se pudo obtener el control de la cámara.', { exact: false }).waitFor();
  const segundaSesion = acciones.filter(x => x.accion === 'adquirir').at(-1).sesion;
  assert.notEqual(primeraSesion, segundaSesion);
  forzarOcupado = false;
  await segunda.getByRole('button', { name: 'Ver cámara Imou' }).click();
  await segunda.getByRole('button', { name: 'Detener vista Imou' }).waitFor();
  assert.equal(titular, segundaSesion);
  await segunda.getByRole('button', { name: 'Detener vista Imou' }).click();
  await segunda.waitForTimeout(300);
  assert.equal(titular, null);
  const configuracion = await contexto.newPage();
  await configuracion.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras?configuracion=analisis`);
  await configuracion.getByRole('button', { name: 'Ver cámara Imou' }).click();
  await configuracion.getByRole('button', { name: 'Detener IA en Imou' }).waitFor();
  await configuracion.getByLabel('Tipo de incidencia:').first().selectOption('mascota');
  await configuracion.getByRole('button', { name: 'Dibujar área restringida' }).waitFor();
  await configuracion.getByRole('button', { name: 'Dibujar área restringida' }).click();
  const zona = configuracion.getByRole('application', { name: /Dibuja la zona/ });
  const rect = await zona.boundingBox();
  for (const [x, y] of [[.1, .1], [.9, .1], [.9, .9], [.1, .9]]) await zona.click({ position: { x: rect.width * x, y: rect.height * y } });
  await configuracion.getByRole('button', { name: 'Completar área restringida' }).click();
  await configuracion.getByLabel('Tiempo en zona', { exact: false }).fill('0');
  await configuracion.getByRole('checkbox', { name: 'Avisar a los guardias' }).check();
  await configuracion.getByRole('button', { name: 'Guardar configuración', exact: true }).click();
  await configuracion.getByText('Configuración de mascota guardada.').waitFor();
  await configuracion.waitForFunction(() => document.querySelector('.imou-camera-message')?.textContent?.includes('Vista en directo'));
  await configuracion.waitForTimeout(5000);
  assert.equal(eventos.length, 1, 'La detección ficticia genera un único evento con la sesión autorizada');
  await configuracion.getByRole('button', { name: 'Detener vista Imou' }).click();
  console.log('Interfaz remota: acceso, sesiones distintas y liberación verificados con datos ficticios.');
} finally {
  await navegador?.close();
  await new Promise(ok => servidor.close(ok));
}
