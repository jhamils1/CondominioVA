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
  let lecturasPlaca = 0;
  let fallar = false;
  let analisis = 0;
  let eventos = 0;
  const envios = [];
  let fallarIA = false;
  let moverVehiculo = false;
  let perderUnaMuestra = false;
  let evidenciasConsultadas = 0;
  let rolUsuario = 'administrador';
  let fallarGuardado = false;
  let monitorActivo = false;
  let zonaCompartida = { puntos: [], segundos: 5, automatico: false, actualizado: null };
  await pagina.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/alpr/')) {
      lecturasPlaca++;
      assert.equal(route.request().method(), 'POST');
      return route.fulfill({ json: { plate: 'ABC123', match: false, coincidencia_ambigua: false } });
    }
    if (url.pathname.endsWith('/vision-imou/monitoreo/'))
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ocupado: monitorActivo }) });
    if (url.pathname.endsWith('/vision-imou/zona/')) {
      if (route.request().method() === 'PUT' && fallarGuardado)
        return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
      if (route.request().method() === 'PUT') zonaCompartida = { ...route.request().postDataJSON(), actualizado: new Date().toISOString() };
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(zonaCompartida) });
    }
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
      if (perderUnaMuestra) {
        perderUnaMuestra = false;
        return route.fulfill({ status: 200, contentType: 'application/json', body: '{"detecciones":[]}' });
      }
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
    const body = url.pathname.endsWith('/me/') ? { username: 'usuario-ficticio', role: rolUsuario, capacidades: [] } : [];
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras`);
  const start = pagina.getByRole('button', { name: 'Ver c\u00e1mara Imou' });
  await start.waitFor();
  assert.equal(consultas, 0);
  assert.equal(await pagina.getByRole('button', { name: 'Cámara de laptop' }).count(), 1);
  await start.click();
  const vista = pagina.getByRole('img', { name: 'Vista en directo de la c\u00e1mara Imou' });
  await vista.waitFor();
  await pagina.getByText(/Registro desactivado: todavía no hay una zona guardada/).waitFor();
  await pagina.waitForFunction(() => document.querySelector('img[alt^="Vista en directo"]')?.naturalWidth === 640);
  assert.equal(lecturasPlaca, 0, 'No se envía ninguna imagen sin pulsar el botón');
  await pagina.getByRole('button', { name: 'Consultar placa de la imagen' }).click();
  await pagina.getByText('ABC123').waitFor();
  assert.equal(lecturasPlaca, 1);
  assert.equal(analisis, 0);
  await pagina.getByRole('button', { name: 'Activar IA en Imou' }).click();
  const canvas = pagina.getByLabel('Imagen Imou analizada con IA');
  await pagina.getByText(/Los recuadros corresponden a este fotograma/).waitFor();
  assert.ok(analisis > 0);
  assert.equal(lecturasPlaca, 1, 'No inicia lectura automática sin activación');
  await pagina.getByRole('button', { name: 'Activar lectura automática' }).click();
  await pagina.getByText('Lectura orientativa; comprueba la imagen y la placa.').waitFor();
  assert.equal(lecturasPlaca, 2);
  await pagina.waitForTimeout(900);
  assert.equal(lecturasPlaca, 2, 'Un mismo vehículo no causa consultas continuas');
  await pagina.getByRole('button', { name: 'Detener lectura automática' }).click();
  assert.equal(await canvas.evaluate(el => el.width), 640);
  const pixel = await canvas.evaluate(el => Array.from(el.getContext('2d').getImageData(100, 140, 1, 1).data));
  assert.ok(pixel[1] > 200 && pixel[0] < 50, 'Recuadro verde dibujado en el fotograma analizado');
  await pagina.getByRole('button', { name: 'Detener IA en Imou' }).click();
  await vista.waitFor();
  const analisisAlParar = analisis, consultasAlParar = consultas;
  await pagina.waitForTimeout(800);
  assert.equal(analisis, analisisAlParar, 'Detener IA detiene análisis');
  assert.ok(consultas > consultasAlParar, 'La cámara sigue transmitiendo con IA detenida');
  await pagina.getByRole('button', { name: 'Activar IA en Imou' }).click();
  await pagina.getByText(/Los recuadros corresponden a este fotograma/).waitFor();
  assert.equal(await pagina.getByRole('button', { name: 'Dibujar zona Imou' }).count(), 0);
  assert.equal(await pagina.getByRole('button', { name: 'Analizar video', exact: true }).count(), 0);
  if (process.env.SEGURIDAD_SCREENSHOT) await pagina.screenshot({ path: process.env.SEGURIDAD_SCREENSHOT });
  const muestrasAntesConfig = analisis;
  await pagina.getByRole('button', { name: 'Configuración de análisis' }).click();
  assert.equal(await pagina.getByRole('button', { name: 'Analizar video', exact: true }).count(), 1);
  await pagina.waitForTimeout(650);
  assert.ok(analisis > muestrasAntesConfig, 'La IA sigue activa al abrir la configuración');
  assert.equal(await vista.isVisible(), false, 'La cámara sin analizar queda oculta mientras la IA está activa');
  const analizada = await canvas.boundingBox();
  const escenario = await pagina.locator('.imou-stage').boundingBox();
  assert.ok(Math.abs(analizada.width - escenario.width) < 2, 'La imagen analizada ocupa la vista de cámara completa');
  await pagina.getByRole('button', { name: 'Dibujar zona Imou' }).click();
  const editor = pagina.getByLabel('Dibuja la zona con clics, o usa las flechas y Enter para añadir puntos');
  const cuadroZona = await editor.boundingBox();
  for (const [x, y] of [[0.1, 0.1], [0.6, 0.1], [0.6, 0.6], [0.1, 0.6]])
    await editor.click({ position: { x: cuadroZona.width * x, y: cuadroZona.height * y } });
  await pagina.getByRole('button', { name: 'Completar zona Imou' }).click();
  await pagina.getByText('Configuración Imou guardada.').waitFor();
  assert.equal(zonaCompartida.puntos.length, 4, 'Completar guarda automáticamente');
  assert.equal(await pagina.getByLabel('Zona prohibida marcada').count(), 0);
  await pagina.getByRole('button', { name: 'Volver al monitoreo' }).first().click();
  assert.equal(await pagina.getByRole('button', { name: 'Cambiar zona Imou' }).count(), 0);
  await pagina.getByRole('button', { name: 'Configuración de análisis' }).click();
  assert.equal(await pagina.getByRole('button', { name: 'Cambiar zona Imou' }).count(), 1, 'La zona persiste entre vistas');
  await pagina.getByRole('button', { name: 'Mostrar zona Imou' }).click();
  assert.equal(await pagina.getByLabel('Zona prohibida marcada').count(), 1);
  await pagina.getByRole('button', { name: 'Ocultar zona Imou' }).click();
  await pagina.getByLabel('Tiempo mínimo detenido Imou (2 a 120 segundos):').fill('2');
  await pagina.getByLabel('Tiempo mínimo detenido Imou (2 a 120 segundos):').blur();
  await pagina.waitForFunction(() => document.querySelector('input[type=number]')?.value === '2');
  await pagina.waitForTimeout(200);
  assert.equal(zonaCompartida.segundos, 2, 'El tiempo se guarda al salir del campo');
  await pagina.waitForFunction(() => {
    const c = document.querySelector('canvas[aria-label="Imagen Imou analizada con IA"]');
    if (!c) return false;
    const p = c.getContext('2d').getImageData(100, 140, 1, 1).data;
    return p[0] > 200 && p[1] < 100;
  }, null, { timeout: 10000 });
  perderUnaMuestra = true;
  await pagina.getByText('Sin vehículos detectados en esta imagen. Una pérdida breve pausa el conteo; no suma tiempo.').waitFor();
  const pixelAusente = await canvas.evaluate(el => Array.from(el.getContext('2d').getImageData(100, 140, 1, 1).data));
  assert.equal(pixelAusente[0], 0, 'No dibuja el recuadro anterior cuando no se detecta el vehículo');
  await pagina.waitForFunction(() => {
    const p = document.querySelector('canvas[aria-label="Imagen Imou analizada con IA"]').getContext('2d').getImageData(100, 140, 1, 1).data;
    return p[0] > 200 && p[1] < 100;
  }, null, { timeout: 1500 });
  moverVehiculo = true;
  await pagina.waitForFunction(() => {
    const c = document.querySelector('canvas[aria-label="Imagen Imou analizada con IA"]');
    if (!c) return false;
    const p = c.getContext('2d').getImageData(400, 140, 1, 1).data;
    return p[1] > 200 && p[0] < 50;
  }, null, { timeout: 10000 });
  assert.equal(eventos, 0);
  await pagina.setViewportSize({ width: 600, height: 900 });
  const analizadaMovil = await canvas.boundingBox();
  const escenarioMovil = await pagina.locator('.imou-stage').boundingBox();
  assert.equal(await vista.isVisible(), false, 'En pantallas pequeñas también se muestra una sola imagen');
  assert.ok(Math.abs(analizadaMovil.width - escenarioMovil.width) < 2, 'La imagen analizada ocupa la vista en pantallas pequeñas');
  await pagina.setViewportSize({ width: 1440, height: 900 });
  assert.equal(eventos, 0);
  const automatico = pagina.getByRole('checkbox', { name: /Registrar automáticamente los hallazgos de la Imou/ });
  assert.equal(await automatico.isChecked(), false);
  fallarGuardado = true;
  await automatico.click();
  await pagina.getByText(/No se pudo confirmar el guardado/).waitFor();
  assert.equal(eventos, 0, 'Un guardado fallido no activa envíos');
  assert.equal(zonaCompartida.automatico, false, 'El guardado fallido conserva la opción anterior');
  fallarGuardado = false;
  await pagina.getByRole('button', { name: 'Reintentar guardado' }).click();
  await pagina.getByText('Configuración Imou guardada.').waitFor();
  await pagina.getByText(/Registro automático activo: los nuevos hallazgos/).waitFor();
  assert.equal(zonaCompartida.automatico, true);
  moverVehiculo = false;
  const reintentar = pagina.getByRole('button', { name: 'Reintentar evento Imou' });
  await reintentar.waitFor({ timeout: 12000 });
  assert.equal(eventos, 1);
  await pagina.getByText('Registro pausado: reintenta el evento pendiente antes de continuar.').waitFor();
  assert.equal(await pagina.getByRole('button', { name: 'Cambiar zona Imou' }).isDisabled(), true);
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
  await pagina.getByRole('button', { name: 'Volver al monitoreo' }).first().click();
  await pagina.getByRole('button', { name: /Posible estacionamiento en zona prohibida/ }).click();
  const evidencia = pagina.getByRole('img', { name: 'Fotograma de evidencia del evento' });
  await evidencia.waitFor();
  await pagina.waitForFunction(() => document.querySelector('img[alt="Fotograma de evidencia del evento"]')?.naturalWidth === 640);
  assert.ok(evidenciasConsultadas >= 1);
  await pagina.getByRole('button', { name: 'Cerrar', exact: true }).click();
  assert.equal(await evidencia.count(), 0);
  moverVehiculo = true;
  await pagina.getByRole('button', { name: 'Activar IA en Imou' }).click();
  await pagina.getByText(/Los recuadros corresponden a este fotograma/).waitFor();
  monitorActivo = true;
  await pagina.getByText(/el monitor independiente está iniciado o su puerto está ocupado/).waitFor();
  moverVehiculo = false;
  await pagina.waitForTimeout(3500);
  assert.equal(eventos, 2, 'La vista no crea duplicados mientras actúa el proceso independiente');
  monitorActivo = false;
  await pagina.getByText(/Proceso independiente detenido/).waitFor();
  await pagina.waitForFunction(() => document.querySelector('canvas[aria-label="Imagen Imou analizada con IA"]'), null, { timeout: 5000 });
  await pagina.waitForTimeout(3000);
  assert.equal(eventos, 3, 'La vista recupera el registro al detener el proceso independiente');
  moverVehiculo = true;
  await pagina.getByRole('button', { name: 'Configuración de análisis' }).click();
  if (!await automatico.isChecked()) { await automatico.click(); await pagina.getByText('Configuración Imou guardada.').waitFor(); }
  await pagina.getByLabel('Tiempo mínimo detenido Imou (2 a 120 segundos):').fill('3');
  await pagina.getByLabel('Tiempo mínimo detenido Imou (2 a 120 segundos):').blur();
  await pagina.waitForTimeout(200);
  assert.equal(zonaCompartida.segundos, 3);
  await pagina.getByLabel('Tiempo mínimo detenido Imou (2 a 120 segundos):').fill('1');
  await pagina.getByLabel('Tiempo mínimo detenido Imou (2 a 120 segundos):').blur();
  await pagina.getByText(/Se conservó el valor anterior/).waitFor();
  assert.equal(zonaCompartida.segundos, 3, 'Un tiempo inválido no se guarda');
  const anterior = JSON.stringify(zonaCompartida.puntos);
  await pagina.getByRole('button', { name: 'Cambiar zona Imou' }).click();
  await pagina.getByRole('button', { name: 'Cancelar zona Imou' }).click();
  assert.equal(JSON.stringify(zonaCompartida.puntos), anterior, 'Cancelar conserva zona y configuración anteriores');
  await pagina.getByRole('button', { name: 'Cambiar zona Imou' }).click();
  const nuevoEditor = pagina.getByLabel('Dibuja la zona con clics, o usa las flechas y Enter para añadir puntos');
  const nuevoCuadro = await nuevoEditor.boundingBox();
  for (const [x, y] of [[0.2, 0.2], [0.8, 0.2], [0.8, 0.8], [0.2, 0.8]])
    await nuevoEditor.click({ position: { x: nuevoCuadro.width * x, y: nuevoCuadro.height * y } });
  fallarGuardado = true;
  await pagina.getByRole('button', { name: 'Completar zona Imou' }).click();
  await pagina.getByText(/No se pudo confirmar el guardado/).waitFor();
  assert.equal(JSON.stringify(zonaCompartida.puntos), anterior, 'Si falla se conserva la zona anterior');
  fallarGuardado = false;
  await pagina.getByRole('button', { name: 'Reintentar guardado' }).click();
  await pagina.getByText('Configuración Imou guardada.').waitFor();
  assert.notEqual(JSON.stringify(zonaCompartida.puntos), anterior, 'Reemplazo guardado');
  pagina.once('dialog', dialog => dialog.dismiss());
  await pagina.getByRole('button', { name: 'Eliminar zona Imou' }).click();
  assert.equal(zonaCompartida.puntos.length, 4, 'Cancelar eliminación conserva zona');
  fallarGuardado = true;
  pagina.once('dialog', dialog => dialog.accept());
  await pagina.getByRole('button', { name: 'Eliminar zona Imou' }).click();
  await pagina.getByText(/No se pudo confirmar el guardado/).waitFor();
  assert.equal(zonaCompartida.puntos.length, 4, 'Un fallo al eliminar conserva la zona');
  fallarGuardado = false;
  await pagina.getByRole('button', { name: 'Reintentar guardado' }).click();
  await pagina.getByText(/Registro desactivado: todavía no hay una zona guardada/).waitFor();
  assert.equal(zonaCompartida.puntos.length, 0);
  assert.equal(zonaCompartida.automatico, false, 'Eliminar desactiva avisos');
  // Reinstala solo en la API simulada para comprobar lectura y permisos del guardia.
  zonaCompartida = { puntos: JSON.parse(anterior), segundos: 3, automatico: true, actualizado: new Date().toISOString() };
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
  fallar = false; fallarIA = false; rolUsuario = 'guardia';
  await pagina.reload();
  await pagina.getByText('No tienes permiso para acceder a esta página.').waitFor();
  assert.equal(await pagina.getByRole('button', { name: 'Ver cámara Imou' }).count(), 0);
  console.log('Imou simulada: zona, control optativo, fallo y reintento idempotente sin acceso a datos reales.');
} finally {
  await navegador?.close();
  await new Promise(resolveClose => servidor.close(resolveClose));
}
