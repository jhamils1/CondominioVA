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
  const origenesLectura = [];
  const zonas = { 2: { puntos: [], segundos: 5, version: null }, 3: { puntos: [], segundos: 5, version: null } };
  const logo = (await readdir(resolve('dist/assets'))).find(nombre => nombre.startsWith('logo-') && nombre.endsWith('.jpg'));
  const imagen = await readFile(resolve('dist/assets', logo));
  await pagina.route('**/api/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path.endsWith('/me/')) return route.fulfill({ json: { username: 'demo', role: rol, capacidades: [] } });
    if (path.endsWith('/eventos-seguridad/')) return route.fulfill({ json: [] });
    if (path.endsWith('/vision-camara/estado/')) return route.fulfill({ json: {} });
    if (path.endsWith('/vision-camara/analizar/')) return route.fulfill({ json: { detecciones: [{ clase: 'car', confianza: 0.9, caja: [1, 1, 100, 100] }] } });
    if (path.endsWith('/alpr/')) { lecturas++; origenesLectura.push(req.postDataBuffer().toString()); return route.fulfill({ json: { plate: 'ABC123', match: false } }); }
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
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras?camara=2`);
  await pagina.getByRole('button', { name: 'Cámaras', exact: true }).click();
  await pagina.getByRole('heading', { name: 'Cámara A', exact: true }).waitFor();
  await pagina.getByRole('button', { name: 'Reducir Cámara A' }).click();
  await pagina.getByRole('button', { name: 'Ampliar cámara Imou' }).click();
  assert.equal(await pagina.getByRole('heading', { name: 'Cámara A', exact: true }).isVisible(), true);
  await pagina.getByRole('button', { name: 'Reducir cámara Imou' }).click();
  const panelA = pagina.locator('section.imou-panel').filter({ has: pagina.getByRole('heading', { name: 'Cámara A', exact: true }) });
  const panelB = pagina.locator('section.imou-panel').filter({ has: pagina.getByRole('heading', { name: 'Cámara B', exact: true }) });
  await panelA.getByRole('button', { name: 'Ver cámara', exact: true }).click();
  await panelB.getByRole('button', { name: 'Ver cámara', exact: true }).click();
  await pagina.getByAltText('Vista en vivo: Cámara A').waitFor();
  await pagina.getByAltText('Vista en vivo: Cámara B').waitFor();
  await pagina.getByRole('button', { name: /Agregar cámara/ }).click();
  const selector = pagina.getByRole('dialog', { name: 'Seleccionar cámaras' });
  await selector.getByLabel('Cámara B', { exact: true }).uncheck();
  await selector.getByRole('button', { name: 'Mostrar seleccionadas' }).click();
  assert.equal(await pagina.getByAltText('Vista en vivo: Cámara B').isVisible(), false);
  await pagina.getByRole('button', { name: /Agregar cámara/ }).click();
  await selector.getByLabel('Cámara B', { exact: true }).check();
  await selector.getByRole('button', { name: 'Mostrar seleccionadas' }).click();
  await pagina.getByAltText('Vista en vivo: Cámara B').waitFor();
  assert.equal(await panelB.getByRole('button', { name: 'Detener vista' }).isEnabled(), true);
  if (process.env.MOSAICO_SCREENSHOT) await pagina.screenshot({ path: process.env.MOSAICO_SCREENSHOT });
  const anchoNormal = (await panelA.boundingBox()).width;
  await pagina.getByRole('button', { name: 'Ampliar Cámara A' }).click();
  await pagina.getByAltText('Vista en vivo: Cámara A').waitFor();
  assert.ok((await panelA.boundingBox()).width > anchoNormal, 'Solo la cámara seleccionada se amplía en el mosaico');
  assert.equal(await pagina.getByAltText('Vista en vivo: Cámara B').isVisible(), true);
  await pagina.getByRole('button', { name: 'Reducir Cámara A' }).click();
  assert.ok(Math.abs((await panelA.boundingBox()).width - anchoNormal) < 2, 'La misma cámara vuelve a su tamaño');
  await pagina.getByAltText('Vista en vivo: Cámara B').waitFor();
  assert.equal(await panelB.getByRole('button', { name: 'Detener vista' }).isEnabled(), true, 'La segunda vista continúa activa al ampliar y volver');
  await pagina.getByRole('link', { name: 'Configuración de incidencias' }).click();
  await pagina.getByLabel('Cámara seleccionada para configurar').getByText('Cámara A', { exact: true }).waitFor();
  await panelA.getByRole('button', { name: 'Detener vista' }).click();
  await pagina.getByRole('button', { name: 'Ver cámara', exact: true }).click();
  const img = pagina.getByAltText('Vista en vivo: Cámara A');
  await img.waitFor();
  assert.equal(lecturas, 0);
  await pagina.getByRole('button', { name: 'Consultar placa de la imagen' }).click();
  await pagina.getByText('Placa detectada', { exact: true }).waitFor();
  assert.match(origenesLectura[0], /catalogo-2/, 'La consulta puntual conserva la cámara de origen');
  await pagina.getByRole('button', { name: 'Detener IA en esta cámara' }).waitFor();
  const incidenciaA = pagina.getByRole('heading', { name: 'Configuración de incidencias para Cámara A' });
  const placasA = pagina.getByRole('region', { name: 'Lectura de placas de Cámara A' });
  const guardarA = pagina.getByRole('button', { name: 'Guardar configuración', exact: true });
  assert.equal(await guardarA.count(), 1);
  assert.ok((await incidenciaA.boundingBox()).y < (await placasA.boundingBox()).y);
  assert.ok((await placasA.boundingBox()).y < (await guardarA.boundingBox()).y);
  const visualizacion = pagina.getByRole('group', { name: 'Mostrar detecciones' });
  await visualizacion.getByRole('button', { name: 'Solo vehículos' }).click();
  assert.equal(await visualizacion.getByRole('button', { name: 'Solo vehículos' }).getAttribute('aria-pressed'), 'true');
  await pagina.getByRole('button', { name: 'Activar lectura automática' }).click();
  await pagina.getByText('Lectura orientativa; comprueba la imagen y la placa.').waitFor();
  assert.equal(lecturas, 2);
  await pagina.getByRole('button', { name: 'Detener lectura automática' }).click();
  await pagina.getByRole('button', { name: 'Detener IA en esta cámara' }).click();
  await pagina.getByRole('button', { name: 'Dibujar o cambiar zona' }).click();
  const area = pagina.getByRole('application');
  const caja = await area.boundingBox();
  assert.ok(caja && caja.width > 5 && caja.height > 5);
  await area.click({ position: { x: caja.width * .2, y: caja.height * .2 } });
  await area.click({ position: { x: caja.width * .8, y: caja.height * .2 } });
  await area.click({ position: { x: caja.width * .5, y: caja.height * .8 } });
  await pagina.getByRole('button', { name: 'Completar zona' }).click();
  await pagina.waitForFunction(() => !document.querySelector('[role="application"]'));
  assert.equal(zonas[2].puntos.length, 0);
  await pagina.getByRole('button', { name: 'Guardar configuración', exact: true }).click();
  await pagina.getByText('Configuración guardada.', { exact: true }).waitFor();
  assert.equal(zonas[2].puntos.length, 3);
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras?configuracion=analisis&camara=3`);
  await pagina.getByRole('heading', { name: 'Cámara B', exact: true }).waitFor();
  assert.equal(await pagina.getByRole('heading', { name: 'Configuración de incidencias', exact: true }).count(), 1);
  assert.deepEqual(zonas[3].puntos, []);
  await pagina.getByLabel('Cámara seleccionada para configurar').getByText('Cámara B', { exact: true }).waitFor();
  await pagina.getByRole('button', { name: 'Ver cámara', exact: true }).click();
  await pagina.getByAltText('Vista en vivo: Cámara B').waitFor();
  await pagina.getByRole('button', { name: 'Consultar placa de la imagen' }).click();
  await pagina.getByText('Placa detectada', { exact: true }).waitFor();
  assert.match(origenesLectura[2], /catalogo-3/, 'La consulta de la segunda cámara conserva su propio origen');
  await pagina.getByRole('button', { name: 'Dibujar o cambiar zona' }).click();
  const zonaB = pagina.getByRole('application');
  const cuadroB = await zonaB.boundingBox();
  for (const [x, y] of [[.1, .1], [.7, .1], [.4, .7]]) await zonaB.click({ position: { x: cuadroB.width * x, y: cuadroB.height * y } });
  await pagina.getByRole('button', { name: 'Completar zona' }).click();
  await pagina.getByRole('spinbutton', { name: 'Tiempo mínimo detenido (2 a 120 segundos):' }).fill('8');
  await pagina.getByRole('button', { name: 'Guardar configuración', exact: true }).click();
  await pagina.getByText('Configuración guardada.', { exact: true }).waitFor();
  assert.equal(zonas[3].segundos, 8);
  assert.equal(zonas[2].segundos, 5, 'El tiempo de la otra cámara no cambia');
  assert.notDeepEqual(zonas[2].puntos, zonas[3].puntos, 'Cada cámara guarda su propia zona');
  rol = 'guardia';
  await pagina.reload();
  await pagina.getByText('No tienes permiso para acceder a esta página.').waitFor();
  assert.equal(await pagina.getByRole('button', { name: 'Cámara A' }).count(), 0);
  console.log('Zonas por cámara: recorrido simulado correcto.');
} finally {
  await navegador?.close();
  await new Promise(ok => servidor.close(ok));
}
