// Cámaras, detecciones y API simuladas: no utiliza hardware ni envía avisos reales.
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
  const modoEsperado = process.env.PISCINA_PROCESADOR === 'remoto' ? 'remoto' : 'local';
  await pagina.addInitScript(modo => { localStorage.setItem('access', 'token-ficticio'); sessionStorage.setItem('vision-procesador', modo); }, modoEsperado);
  const imagen64 = await pagina.evaluate(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 480; c.getContext('2d').fillRect(0, 0, 640, 480); return c.toDataURL('image/jpeg').split(',')[1]; });
  const imagen = Buffer.from(imagen64, 'base64');
  const reglas = {}, eventos = [], procesadores = [];
  let dosPersonas = false;
  await pagina.route('**/api/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path.endsWith('/me/')) return route.fulfill({ json: { username: 'demo', role: 'administrador', capacidades: [] } });
    if (path.endsWith('/camaras/disponibles-monitor/')) return route.fulfill({ json: [{ id: 2, nombre: 'Cámara A', activa: true }] });
    if (path.endsWith('/vision-imou/zona/')) return route.fulfill({ json: { puntos: [], segundos: 5, automatico: false, actualizado: null } });
    if (path.endsWith('/vision-imou/monitoreo/')) return route.fulfill({ json: { ocupado: false } });
    if (path.endsWith('/vision-camaras/2/zona/')) return route.fulfill({ json: { puntos: [], segundos: 5, automatico: false, version: null } });
    if (path.includes('/fotograma-monitor/') || path.endsWith('/vision-imou/fotograma/')) return route.fulfill({ contentType: 'image/jpeg', body: imagen });
    if (path.endsWith('/vision-camara/estado/')) return route.fulfill({ json: { disponible: true } });
    if (path.endsWith('/vision-camara/analizar/')) { procesadores.push(new URL(req.url()).searchParams.get('procesador')); return route.fulfill({ json: { detecciones: [{ clase: 'person', confianza: .9, caja: [200, 100, 300, 300] }, ...(dosPersonas ? [{ clase: 'person', confianza: .8, caja: [350, 100, 450, 300] }] : [])] } }); }
    const piscina = path.match(/vision-piscina\/([^/]+)\/$/);
    if (piscina) {
      const id = piscina[1];
      if (req.method() === 'PUT') reglas[id] = { ...req.postDataJSON(), version: 'v1' };
      return route.fulfill({ json: reglas[id] || { puntos: [], segundos: 10, automatico: false, version: null } });
    }
    if (path.endsWith('/eventos-seguridad/') && req.method() === 'POST') { eventos.push(req.postDataBuffer()); return route.fulfill({ json: { id: 'evento', sin_guardias: false } }); }
    return route.fulfill({ json: [] });
  });
  const base = `http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras?configuracion=analisis`;
  await pagina.goto(base);
  await pagina.getByRole('button', { name: 'Ver cámara Imou' }).click();
  await pagina.getByRole('button', { name: 'Detener IA en Imou' }).waitFor();
  await pagina.getByLabel('Tipo de incidencia:').first().selectOption('piscina');
  await pagina.getByRole('button', { name: 'Dibujar zona de piscina' }).waitFor();
  async function configurar() {
    await pagina.getByRole('button', { name: 'Dibujar zona de piscina' }).click();
    const area = pagina.getByRole('application', { name: /Dibuja la zona/ });
    const rect = await area.boundingBox();
    for (const [x, y] of [[.1, .1], [.9, .1], [.9, .9], [.1, .9]]) await area.click({ position: { x: rect.width * x, y: rect.height * y } });
    await pagina.getByRole('button', { name: 'Completar zona de piscina' }).click();
    assert.equal(await pagina.getByLabel('Tiempo sola', { exact: false }).inputValue(), '10');
    await pagina.getByLabel('Tiempo sola', { exact: false }).fill('2');
    await pagina.getByRole('checkbox', { name: 'Avisar a los guardias' }).check();
    assert.equal(await pagina.getByRole('button', { name: 'Guardar configuración', exact: true }).count(), 1);
    await pagina.getByRole('button', { name: 'Guardar configuración', exact: true }).click();
    await pagina.getByText('Configuración de piscina guardada.').waitFor();
  }
  await configurar();
  await pagina.waitForTimeout(4500);
  assert.equal(eventos.length, 1, 'La Imou envía un evento de piscina');
  assert.match(eventos[0].toString('utf8'), /Posible persona sola cerca de piscina/);
  dosPersonas = true;
  await pagina.waitForTimeout(3500);
  assert.equal(eventos.length, 1, 'Con otra persona visible no se genera un nuevo aviso');
  await pagina.getByRole('button', { name: 'Detener vista Imou' }).click();
  dosPersonas = false;
  await pagina.getByRole('button', { name: 'Cámara A', exact: true }).click();
  await pagina.getByRole('button', { name: 'Ver cámara', exact: true }).click();
  await pagina.getByLabel('Tipo de incidencia:').last().selectOption('piscina');
  await pagina.getByRole('button', { name: 'Dibujar zona de piscina' }).waitFor();
  await configurar();
  await pagina.waitForTimeout(5000);
  assert.equal(eventos.length, 2, 'Cada cámara tiene su propio evento');
  assert.notEqual(reglas.imou.puntos, reglas['catalogo-2'].puntos);
  assert.equal(reglas.imou.segundos, 2);
  assert.equal(reglas['catalogo-2'].segundos, 2);
  assert.ok(procesadores.length > 0 && procesadores.every(modo => modo === modoEsperado), 'La regla utiliza el procesador seleccionado');
  console.log('Piscina en cámaras simuladas: zonas separadas y avisos correctos.');
} finally {
  await navegador?.close();
  await new Promise(ok => servidor.close(ok));
}
