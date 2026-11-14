// Prueba aislada: no accede a cámaras ni datos reales.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const raiz = resolve('dist');
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg' };
const servidor = createServer(async (req, res) => {
  let ruta = resolve(raiz, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!ruta.startsWith(raiz + sep)) ruta = resolve(raiz, 'index.html');
  try {
    let data;
    try { data = await readFile(ruta); } catch { ruta = resolve(raiz, 'index.html'); data = await readFile(ruta); }
    res.writeHead(200, { 'content-type': tipos[extname(ruta)] || 'application/octet-stream' }); res.end(data);
  } catch { res.writeHead(500); res.end(); }
});
await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
let navegador;
try {
  navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const pagina = await navegador.newPage();
  await pagina.addInitScript(() => localStorage.setItem('access', 'token-ficticio'));
  let rol = 'administrador';
  let lecturas = 0;
  const zonas = { 2: { puntos: [], segundos: 5, version: null }, 3: { puntos: [], segundos: 5, version: null } };
  const logo = (await readdir(resolve('dist/assets'))).find(nombre => nombre.startsWith('logo-') && nombre.endsWith('.jpg'));
  const imagen = await readFile(resolve('dist/assets', logo));
  await pagina.route('**/api/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path.endsWith('/me/')) return route.fulfill({ json: { username: 'demo', role: rol, capacidades: [] } });
    if (path.endsWith('/eventos-seguridad/')) return route.fulfill({ json: [] });
    if (path.endsWith('/vision-camara/estado/')) return route.fulfill({ json: {} });
    if (path.endsWith('/vision-camara/analizar/')) return route.fulfill({ json: { detecciones: [{ clase: 'car', confianza: 0.9, caja: [1, 1, 100, 100] }] } });
    if (path.endsWith('/alpr/')) { lecturas++; return route.fulfill({ json: { plate: 'ABC123', match: false } }); }
    if (path.endsWith('/vision-imou/zona/')) return route.fulfill({ json: { puntos: [], segundos: 5, automatico: false, actualizado: null } });
    if (path.endsWith('/vision-imou/monitoreo/')) return route.fulfill({ json: { ocupado: false } });
    if (path.endsWith('/camaras/disponibles-monitor/')) return route.fulfill({ json: [
      { id: 2, nombre: 'Cámara A', ubicacion: '', es_imou_vinculada: false },
      { id: 3, nombre: 'Cámara B', ubicacion: '', es_imou_vinculada: false },
    ] });
    if (path.includes('/fotograma-monitor/')) return route.fulfill({ status: 200, contentType: 'image/jpeg', body: imagen });
    const coincidencia = path.match(/vision-camaras\/(\d+)\/zona\/$/);
    if (coincidencia) {
      const id = Number(coincidencia[1]);
      if (req.method() === 'PUT') zonas[id] = { ...req.postDataJSON(), version: 'version-nueva' };
      return route.fulfill({ json: zonas[id] });
    }
    return route.fulfill({ json: [] });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras`);
  await pagina.getByRole('button', { name: 'Cámara A' }).click();
  await pagina.getByRole('button', { name: 'Ver cámara', exact: true }).click();
  const img = pagina.getByAltText('Vista en vivo: Cámara A');
  await img.waitFor();
  assert.equal(lecturas, 0);
  await pagina.getByRole('button', { name: 'Activar IA en esta cámara' }).click();
  await pagina.getByRole('button', { name: 'Activar lectura automática' }).click();
  await pagina.getByText('Lectura orientativa; comprueba la imagen y la placa.').waitFor();
  assert.equal(lecturas, 1);
  await pagina.getByRole('button', { name: 'Detener lectura automática' }).click();
  await pagina.getByRole('button', { name: 'Detener IA en esta cámara' }).click();
  await pagina.getByRole('button', { name: 'Configuración de análisis', exact: true }).click();
  await pagina.getByRole('button', { name: 'Dibujar o cambiar zona' }).click();
  const area = pagina.getByRole('application');
  const caja = await area.boundingBox();
  assert.ok(caja && caja.width > 5 && caja.height > 5);
  await area.click({ position: { x: caja.width * .2, y: caja.height * .2 } });
  await area.click({ position: { x: caja.width * .8, y: caja.height * .2 } });
  await area.click({ position: { x: caja.width * .5, y: caja.height * .8 } });
  await pagina.getByRole('button', { name: 'Guardar zona' }).click();
  await pagina.waitForFunction(() => !document.querySelector('[role="application"]'));
  assert.equal(zonas[2].puntos.length, 3);
  await pagina.getByRole('button', { name: 'Cámara B' }).click();
  assert.deepEqual(zonas[3].puntos, []);
  rol = 'guardia';
  await pagina.reload();
  await pagina.getByText('No tienes permiso para acceder a esta página.').waitFor();
  assert.equal(await pagina.getByRole('button', { name: 'Cámara A' }).count(), 0);
  console.log('Zonas por cámara: recorrido simulado correcto.');
} finally {
  await navegador?.close();
  await new Promise(ok => servidor.close(ok));
}
