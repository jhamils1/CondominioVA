// Navegador y dispositivos simulados; no usa cámaras ni servicios reales.
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
  const eventos = [];
  const lecturas = [];
  let claseDetectada = 'car';
  await pagina.addInitScript(() => {
    localStorage.setItem('access', 'token-ficticio');
    const fuente = document.createElement('canvas'); fuente.width = 640; fuente.height = 480;
    const contexto = fuente.getContext('2d'); contexto.fillRect(0, 0, 640, 480);
    setInterval(() => contexto.fillRect(0, 0, 640, 480), 100);
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
      enumerateDevices: async () => [{ kind: 'videoinput', deviceId: 'a', label: 'Laptop' }, { kind: 'videoinput', deviceId: 'b', label: 'USB' }],
      getUserMedia: async ({ video }) => {
        const stream = fuente.captureStream(10);
        const track = stream.getVideoTracks()[0];
        track.getSettings = () => ({ deviceId: video?.deviceId?.exact || 'a' });
        return stream;
      },
    } });
  });
  await pagina.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/me/')) return route.fulfill({ json: { username: 'demo', role: 'administrador', capacidades: [] } });
    if (path.endsWith('/vision-camara/estado/')) return route.fulfill({ json: { disponible: true } });
    if (path.endsWith('/vision-camara/analizar/')) return route.fulfill({ json: { detecciones: [{ clase: claseDetectada, confianza: .9, caja: [200, 150, 300, 300] }] } });
    if (path.endsWith('/alpr/')) {
      lecturas.push(route.request().postDataBuffer());
      const respuestas = [
        { plate: 'ABC123', match: false, score: 0.997, status: 'ok' },
        { plate: 'ABC123', match: false, score: 0.997, status: 'ok' },
        { plate: 'XYZ456', match: true, score: 0.9, status: 'ok', lectura: { propietario: 'Persona ficticia' } },
        { plate: null, match: false, score: null, status: 'no-plate-found' },
        { plate: 'ABC123', match: false, coincidencia_ambigua: true, status: 'ok' },
      ];
      return route.fulfill({ json: respuestas[Math.min(lecturas.length - 1, respuestas.length - 1)] });
    }
    if (path.endsWith('/eventos-seguridad/') && route.request().method() === 'POST') { eventos.push(route.request().postDataBuffer()); return route.fulfill({ json: { id: 'ficticio', sin_guardias: false } }); }
    return route.fulfill({ json: [] });
  });
  const base = `http://127.0.0.1:${servidor.address().port}`;
  await pagina.goto(`${base}/admin/monitor-camaras?configuracion=analisis`);
  await pagina.getByRole('button', { name: 'Cámara de laptop' }).click();
  await pagina.getByLabel('Cámara:', { exact: false }).selectOption('b');
  assert.equal(await pagina.getByRole('button', { name: 'Iniciar cámara' }).isEnabled(), true);
  await pagina.getByLabel('Cámara:', { exact: false }).selectOption('a');
  await pagina.getByRole('button', { name: 'Iniciar cámara' }).click();
  await pagina.getByRole('button', { name: 'Dibujar zona' }).waitFor();
  const incidenciaLocal = pagina.getByRole('heading', { name: 'Incidencias · zona de estacionamiento' });
  const placasLocal = pagina.getByRole('region', { name: 'Lectura de placas de la cámara local' });
  const guardarLocal = pagina.getByRole('button', { name: 'Guardar configuración', exact: true });
  assert.equal(await guardarLocal.count(), 1);
  assert.ok((await incidenciaLocal.boundingBox()).y < (await placasLocal.boundingBox()).y);
  assert.ok((await placasLocal.boundingBox()).y < (await guardarLocal.boundingBox()).y);
  const video = pagina.getByLabel('Cámara de laptop en directo');
  const canvas = pagina.getByLabel('Cámara con detecciones');
  assert.equal(await video.isVisible(), false, 'La imagen directa no se duplica con el análisis');
  assert.equal(await canvas.isVisible(), true);
  const visualizacion = pagina.getByRole('group', { name: 'Mostrar detecciones' });
  await visualizacion.getByRole('button', { name: 'Solo vehículos' }).click();
  assert.equal(await visualizacion.getByRole('button', { name: 'Solo vehículos' }).getAttribute('aria-pressed'), 'true');
  assert.equal(lecturas.length, 0, 'No se envía ninguna imagen al proveedor sin acción del usuario');
  await pagina.getByRole('button', { name: 'Activar lectura automática' }).click();
  await pagina.waitForFunction(() => document.body.textContent.includes('Lectura orientativa; comprueba la imagen y la placa.'));
  assert.equal(lecturas.length, 1);
  await pagina.getByRole('button', { name: 'Detener lectura automática' }).click();
  await pagina.getByRole('button', { name: 'Detener IA de laptop' }).click();
  assert.equal(await video.isVisible(), true);
  assert.equal(await canvas.isVisible(), false);
  await pagina.getByRole('button', { name: 'Consultar placa de la imagen' }).click();
  await pagina.getByText('Placa detectada').waitFor();
  await pagina.getByText('99.7%', { exact: true }).waitFor();
  await pagina.getByText('Sin coincidencia registrada', { exact: true }).waitFor();
  if (process.env.PLACA_SCREENSHOT) await pagina.locator('.resultado-placa').screenshot({ path: process.env.PLACA_SCREENSHOT });
  assert.equal(lecturas.length, 2, 'La consulta puntual funciona incluso con la IA detenida');
  assert.match(lecturas[1].toString('utf8'), /local-[0-9a-f]{24}/);
  await pagina.getByRole('button', { name: 'Activar IA de laptop' }).click();
  await pagina.getByRole('button', { name: 'Dibujar zona' }).waitFor();
  await pagina.getByRole('button', { name: 'Dibujar zona' }).click();
  const dibujo = pagina.getByLabel('Dibuja la zona con clics, o usa las flechas y Enter para añadir puntos');
  const caja = await dibujo.boundingBox();
  for (const [x, y] of [[0.1, 0.1], [0.9, 0.1], [0.9, 0.9], [0.1, 0.9]]) await dibujo.click({ position: { x: caja.width * x, y: caja.height * y } });
  await pagina.getByRole('button', { name: 'Completar zona' }).click();
  await pagina.getByLabel('Tiempo mínimo detenido (2 a 120 segundos):').fill('2');
  await pagina.getByRole('checkbox', { name: /Registrar automáticamente los hallazgos/ }).check();
  await pagina.getByRole('button', { name: 'Guardar configuración' }).click();
  await pagina.getByText('Configuración guardada en este navegador.').waitFor();
  await pagina.getByLabel('Cámara:', { exact: false }).selectOption('b');
  await pagina.getByRole('button', { name: 'Dibujar zona' }).waitFor();
  await pagina.getByRole('button', { name: 'Consultar placa de la imagen' }).click();
  await pagina.getByText('Vehículo registrado', { exact: true }).waitFor();
  await pagina.getByText('Persona ficticia', { exact: false }).waitFor();
  const identificador = datos => datos.toString('utf8').match(/local-[0-9a-f]{24}/)?.[0];
  assert.ok(identificador(lecturas[2]));
  assert.notEqual(identificador(lecturas[1]), identificador(lecturas[2]), 'Cada cámara local usa una referencia independiente');
  await pagina.getByRole('button', { name: 'Consultar placa de la imagen' }).click();
  await pagina.getByText('Placa no detectada', { exact: true }).waitFor();
  assert.equal(await pagina.getByText('0.0%', { exact: true }).count(), 0);
  await pagina.getByRole('button', { name: 'Consultar placa de la imagen' }).click();
  await pagina.getByText('Coincidencia ambigua', { exact: true }).waitFor();
  await pagina.getByLabel('Cámara:', { exact: false }).selectOption('a');
  await pagina.getByText('Configuración guardada recuperada para esta cámara.').waitFor();
  assert.equal(await pagina.getByLabel('Tiempo mínimo detenido (2 a 120 segundos):').inputValue(), '2');
  await pagina.goto(`${base}/admin/monitor-camaras`);
  assert.equal(await pagina.locator('.camara-local-compacta').isVisible(), true, 'La cámara local aparece en el monitor');
  assert.equal(await pagina.getByLabel('Cámara:', { exact: false }).inputValue(), 'a', 'La selección persiste en la pestaña');
  await pagina.getByRole('button', { name: /Agregar cámara/ }).click();
  await pagina.getByLabel('Cámara local (laptop o USB)').check();
  await pagina.getByRole('button', { name: 'Mostrar seleccionadas' }).click();
  const panel = pagina.locator('.camara-local-compacta');
  await panel.getByRole('button', { name: 'Iniciar cámara' }).click();
  await panel.getByRole('button', { name: 'Detener cámara' }).waitFor();
  await panel.getByRole('button', { name: 'Ampliar cámara local' }).click();
  await panel.getByRole('button', { name: 'Reducir cámara local' }).click();
  assert.equal(await panel.getByRole('button', { name: 'Detener cámara' }).isEnabled(), true);
  await pagina.waitForTimeout(4000);
  assert.ok(eventos.length > 0, 'La webcam configurada debe generar un evento');
  assert.match(eventos.at(-1).toString('latin1'), /name="evidencia"; filename="evidencia.jpg"/);
  claseDetectada = 'person';
  await pagina.goto(`${base}/admin/monitor-camaras?configuracion=analisis`);
  await pagina.getByRole('button', { name: 'Cámara de laptop' }).click();
  await pagina.getByRole('button', { name: 'Iniciar cámara' }).click();
  await pagina.getByRole('button', { name: /^(Dibujar zona|Cambiar zona)$/ }).waitFor();
  await pagina.locator('.seguridad-webcam').getByLabel('Tipo de incidencia:').selectOption('piscina');
  await pagina.getByRole('button', { name: 'Dibujar zona de piscina' }).click();
  const areaPiscina = pagina.getByRole('application', { name: /Dibuja la zona/ });
  const marcoPiscina = await areaPiscina.boundingBox();
  for (const [x, y] of [[.1, .1], [.9, .1], [.9, .9], [.1, .9]]) await areaPiscina.click({ position: { x: marcoPiscina.width * x, y: marcoPiscina.height * y } });
  await pagina.getByRole('button', { name: 'Completar zona de piscina' }).click();
  assert.equal(await pagina.getByLabel('Tiempo sola', { exact: false }).inputValue(), '10');
  await pagina.getByLabel('Tiempo sola', { exact: false }).fill('2');
  await pagina.getByRole('checkbox', { name: 'Avisar a los guardias' }).check();
  await pagina.getByRole('button', { name: 'Guardar configuración', exact: true }).click();
  await pagina.getByText('Configuración de piscina guardada.').waitFor();
  await pagina.waitForTimeout(4500);
  assert.ok(eventos.some(datos => datos.toString('utf8').includes('Posible persona sola cerca de piscina')), 'La webcam genera aviso de piscina con evidencia');
  await pagina.getByLabel('Cámara:', { exact: false }).selectOption('b');
  await pagina.getByRole('button', { name: 'Dibujar zona de piscina' }).waitFor();
  assert.equal(await pagina.getByRole('checkbox', { name: 'Avisar a los guardias' }).isChecked(), false, 'La segunda webcam conserva su propia regla');
  await pagina.getByLabel('Cámara:', { exact: false }).selectOption('a');
  await pagina.getByRole('checkbox', { name: 'Avisar a los guardias' }).waitFor();
  assert.equal(await pagina.getByRole('checkbox', { name: 'Avisar a los guardias' }).isChecked(), true, 'La primera webcam recupera su regla');
  await pagina.locator('.seguridad-webcam').getByLabel('Tipo de incidencia:').selectOption('estacionamiento');
  assert.equal(await pagina.getByLabel('Tiempo mínimo detenido', { exact: false }).inputValue(), '2', 'La regla de estacionamiento se conserva');
  console.log('Cámara local simulada: selección, ajustes independientes, mosaico y ampliación correctos.');
} finally {
  await navegador?.close();
  await new Promise(ok => servidor.close(ok));
}
