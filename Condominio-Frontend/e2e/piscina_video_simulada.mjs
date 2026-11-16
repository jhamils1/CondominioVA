// Video y respuestas simuladas; no se envían notificaciones reales.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const temporal = await mkdtemp(join(tmpdir(), 'condominio-piscina-'));
const archivo = join(temporal, 'piscina.webm');
let servidor, navegador;
try {
  const python = resolve('../Condominio-Backend/seguridad_vision/.venv/Scripts/python.exe');
  execFileSync(python, ['-c', `import cv2, numpy as np, sys
w = cv2.VideoWriter(sys.argv[1], cv2.VideoWriter_fourcc(*'VP80'), 10, (320,240))
assert w.isOpened()
for i in range(120): w.write(np.full((240,320,3), i % 255, dtype=np.uint8))
w.release()`, archivo]);
  const raiz = resolve('dist');
  const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg' };
  servidor = createServer(async (req, res) => {
    let ruta = resolve(raiz, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!ruta.startsWith(raiz + sep)) ruta = resolve(raiz, 'index.html');
    try {
      let datos;
      try { datos = await readFile(ruta); } catch { ruta = resolve(raiz, 'index.html'); datos = await readFile(ruta); }
      res.writeHead(200, { 'content-type': tipos[extname(ruta)] || 'application/octet-stream' }); res.end(datos);
    } catch { res.writeHead(500); res.end(); }
  });
  await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
  navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const pagina = await navegador.newPage();
  const eventos = [];
  const modoEsperado = process.env.PISCINA_PROCESADOR === 'remoto' ? 'remoto' : 'local';
  const procesadores = [];
  await pagina.addInitScript(modo => { localStorage.setItem('access', 'token-ficticio'); sessionStorage.setItem('vision-procesador', modo); }, modoEsperado);
  await pagina.route('**/api/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path.endsWith('/me/')) return route.fulfill({ json: { username: 'demo', role: 'administrador', capacidades: [] } });
    if (path.endsWith('/vision-camara/estado/')) return route.fulfill({ json: { disponible: true } });
    if (path.endsWith('/vision-camara/analizar/')) { procesadores.push(new URL(req.url()).searchParams.get('procesador')); return route.fulfill({ json: { detecciones: [{ clase: 'person', confianza: .9, caja: [200, 120, 300, 300] }] } }); }
    if (path.endsWith('/eventos-seguridad/') && req.method() === 'POST') { eventos.push(req.postDataBuffer()); return route.fulfill({ json: { id: 'ficticio', sin_guardias: false } }); }
    return route.fulfill({ json: [] });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras?configuracion=analisis`);
  await pagina.locator('input[type=file]').setInputFiles(archivo);
  await pagina.locator('section').filter({ has: pagina.getByRole('heading', { name: 'Analizar video', exact: true }) }).getByLabel('Tipo de incidencia:').selectOption('piscina');
  assert.equal(await pagina.getByRole('button', { name: 'Analizar video', exact: true }).isDisabled(), true);
  await pagina.getByRole('button', { name: 'Dibujar zona' }).click();
  const zona = pagina.getByRole('application', { name: /Dibuja la zona/ });
  const caja = await zona.boundingBox();
  for (const [x, y] of [[.1, .1], [.9, .1], [.9, .9], [.1, .9]]) await zona.click({ position: { x: caja.width * x, y: caja.height * y } });
  await pagina.getByRole('button', { name: 'Completar zona' }).click();
  assert.equal(await pagina.getByLabel('Tiempo mínimo sola', { exact: false }).inputValue(), '10');
  await pagina.getByRole('button', { name: 'Analizar video', exact: true }).click();
  await pagina.getByText('Análisis terminado.', { exact: false }).waitFor({ timeout: 30000 });
  assert.equal(eventos.length, 1);
  assert.ok(procesadores.length > 0 && procesadores.every(modo => modo === modoEsperado), 'El video utiliza el procesador seleccionado');
  assert.match(eventos[0].toString('utf8'), /Posible persona sola cerca de piscina/);
  assert.match(eventos[0].toString('latin1'), /name="evidencia"; filename="evidencia.jpg"/);
  await pagina.getByRole('button', { name: 'Personas en zona' }).click();
  console.log('Piscina en video: zona, 10 segundos, evidencia y aviso simulado correctos.');
} finally {
  await navegador?.close();
  if (servidor) await new Promise(ok => servidor.close(ok));
  await rm(temporal, { recursive: true, force: true });
}
