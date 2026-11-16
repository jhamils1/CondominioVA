// Prueba con video generado y API simulada, sin usar el backend real.
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdtemp, unlink, rmdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, extname, sep } from 'node:path';
import assert from 'node:assert/strict';

const temporal = await mkdtemp(join(tmpdir(), 'condominio-video-'));
const archivo = join(temporal, 'muestra.webm');
const exportados = ['todas', 'vehiculos', 'zona'].map(nombre => join(temporal, `${nombre}.webm`));
const python = resolve('../Condominio-Backend/seguridad_vision/.venv/Scripts/python.exe');
const crear = `import cv2, numpy as np, sys
w = cv2.VideoWriter(sys.argv[1], cv2.VideoWriter_fourcc(*'VP80'), 10, (320, 240))
assert w.isOpened()
for i in range(80): w.write(np.full((240,320,3), i*3, dtype=np.uint8))
w.release()`;
let navegador, servidor;
try {
  execFileSync(python, ['-c', crear, archivo]);
  const raiz = resolve('dist');
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg' };
  servidor = createServer(async (req, res) => {
    let ruta = resolve(raiz, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (!ruta.startsWith(raiz + sep)) ruta = resolve(raiz, 'index.html');
    try {
      let datos;
      try { datos = await readFile(ruta); } catch { ruta = resolve(raiz, 'index.html'); datos = await readFile(ruta); }
      res.writeHead(200, { 'content-type': mime[extname(ruta)] || 'application/octet-stream' }); res.end(datos);
    } catch { res.writeHead(500); res.end(); }
  });
  await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
  navegador = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const pagina = await navegador.newPage();
  let peticiones = 0, eventos = 0, adjunto = false;
  await pagina.addInitScript(() => localStorage.setItem('access', 'token-ficticio'));
  await pagina.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    let datos = {};
    if (url.pathname.endsWith('/me/')) datos = { username: 'admin-ficticio', role: 'administrador', capacidades: [] };
    else if (url.pathname.endsWith('/vision-camara/analizar/')) {
      peticiones++;
      datos = { detecciones: peticiones % 16 >= 15 || peticiones % 16 === 0 ? [] : [
        { clase: 'car', caja: [160, 100, 360, 300], confianza: .9 },
        { clase: 'car', caja: [590, 100, 630, 300], confianza: .85 },
        { clase: 'person', caja: [50, 100, 100, 300], confianza: .8 },
      ] };
    }
    else if (url.pathname.endsWith('/eventos-seguridad/') && route.request().method() === 'POST') {
      eventos++;
      const contenido = route.request().postDataBuffer();
      adjunto = contenido.includes(Buffer.from('name="evidencia"; filename="evidencia.jpg"')) && contenido.includes(Buffer.from([0xff, 0xd8, 0xff]));
      datos = { id: 'evento-ficticio', categoria: 'Video grabado', estado: 'PENDIENTE_REVISION' };
    }
    else if (url.pathname.endsWith('/eventos-seguridad/') || url.pathname.endsWith('/camaras/disponibles-monitor/')) datos = [];
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(datos) });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras`);
  await pagina.getByRole('button', { name: 'Configuración de análisis' }).click();
  await pagina.locator('input[type=file]').setInputFiles(archivo);
  await pagina.getByRole('button', { name: 'Dibujar zona' }).click();
  const zona = pagina.getByRole('application', { name: /Dibuja la zona/ });
  const area = await zona.boundingBox();
  for (const [x, y] of [[.1, .1], [.9, .1], [.9, .9], [.1, .9]]) {
    await zona.click({ position: { x: area.width * x, y: area.height * y } });
  }
  await pagina.getByRole('button', { name: 'Completar zona' }).click();
  assert.equal(await pagina.getByLabel('Zona prohibida marcada').count(), 0);
  await pagina.getByLabel('Tiempo mínimo detenido', { exact: false }).fill('6');
  assert.equal(await pagina.getByLabel('Registrar automáticamente los hallazgos', { exact: false }).isChecked(), true);
  await pagina.getByRole('button', { name: 'Analizar video', exact: true }).click();
  await pagina.getByText('Análisis terminado.', { exact: false }).waitFor({ timeout: 30000 });
  const muestras = peticiones;
  assert.equal(muestras, 16);
  assert.equal(eventos, 1, 'Un vehículo continuo debe generar un solo evento.');
  assert.equal(adjunto, true, 'El evento debe adjuntar un fotograma JPEG.');
  assert.equal(await pagina.getByLabel('Zona prohibida marcada').count(), 0);
  const original = pagina.locator('video.zona-original-video');
  const analizado = pagina.getByLabel('Video analizado', { exact: true });
  const canvas = pagina.getByLabel('Detecciones del video');
  async function colorEn(tiempo) {
    await analizado.evaluate((v, t) => { v.currentTime = t; }, tiempo);
    await pagina.waitForFunction(t => Math.abs(document.querySelector('video[aria-label="Video analizado"]').currentTime - t) < .1 && !document.querySelector('video[aria-label="Video analizado"]').seeking, tiempo);
    return canvas.evaluate(c => Array.from(c.getContext('2d').getImageData(160, 150, 1, 1).data));
  }
  const verde = await colorEn(1);
  const personaVisible = await canvas.evaluate(c => c.getContext('2d').getImageData(50, 150, 1, 1).data[3]);
  assert.ok(personaVisible > 0, 'La vista completa muestra personas.');
  await pagina.getByRole('button', { name: 'Solo vehículos' }).click();
  const personaOculta = await canvas.evaluate(c => c.getContext('2d').getImageData(50, 150, 1, 1).data[3]);
  assert.equal(personaOculta, 0, 'El filtro solo oculta el recuadro de la persona.');
  const fueraVisible = await canvas.evaluate(c => c.getContext('2d').getImageData(590, 150, 1, 1).data[3]);
  assert.ok(fueraVisible > 0, 'Solo vehículos muestra vehículos fuera de la zona.');
  await pagina.getByRole('button', { name: 'Vehículos en zona' }).click();
  const fueraOculto = await canvas.evaluate(c => c.getContext('2d').getImageData(590, 150, 1, 1).data[3]);
  const dentroVisible = await canvas.evaluate(c => c.getContext('2d').getImageData(160, 150, 1, 1).data[3]);
  assert.equal(fueraOculto, 0, 'Vehículos en zona oculta al vehículo fuera de ella.');
  assert.ok(dentroVisible > 0, 'El vehículo dentro de la zona conserva su recuadro.');
  const amarillo = await colorEn(5.5);
  const rojo = await colorEn(6.5);
  const desaparecido = await colorEn(7.5);
  assert.ok(verde[1] > 180 && verde[0] < 100, `Se esperaba verde: ${verde}`);
  assert.ok(amarillo[0] > 220 && amarillo[1] > 140 && amarillo[2] < 120, `Se esperaba amarillo: ${amarillo}`);
  assert.ok(rojo[0] > 220 && rojo[1] < 100 && rojo[2] < 100, `Se esperaba rojo: ${rojo}`);
  assert.equal(desaparecido[3], 0, 'Al desaparecer el vehículo no se dibuja el recuadro.');
  await original.evaluate(v => { v.currentTime = 0; });
  await original.evaluate(v => v.play());
  await pagina.waitForTimeout(10000);
  const estado = await original.evaluate(v => ({ paused: v.paused, ended: v.ended, time: v.currentTime, duration: v.duration }));
  const otro = await analizado.evaluate(v => ({ paused: v.paused, ended: v.ended, time: v.currentTime, duration: v.duration }));
  console.log('Reproductores al terminar:', JSON.stringify({ original: estado, analizado: otro, muestras, peticiones }));
  assert.equal(peticiones, muestras, 'Reproducir no debe volver a solicitar análisis.');
  assert.equal(eventos, 1, 'Reproducir no debe volver a registrar el evento.');
  assert.ok(estado.paused && otro.paused && estado.time >= estado.duration - 0.1 && otro.time >= otro.duration - 0.1, 'Ambos deben quedar detenidos al final.');
  for (const [indice, modo] of ['Todas', 'Solo vehículos', 'Vehículos en zona'].entries()) {
    await pagina.getByRole('button', { name: modo, exact: true }).click();
    const descarga = pagina.waitForEvent('download', { timeout: 30000 });
    await pagina.getByRole('button', { name: 'Descargar video analizado' }).click();
    const resultado = await descarga;
    assert.match(resultado.suggestedFilename(), /-analizado\.webm$/);
    await resultado.saveAs(exportados[indice]);
  }
  const comprobar = `import cv2, json, sys
for ruta in sys.argv[1:]:
 c=cv2.VideoCapture(ruta); assert c.isOpened(), ruta
 mejor=[-255,-255,-255]; cuadros=0; ultima_fecha=0
 while True:
  ok,f=c.read()
  if not ok: break
  cuadros+=1; ultima_fecha=c.get(cv2.CAP_PROP_POS_MSEC)
  for i,x in enumerate((50,160,590)):
   p=f[145:155,x-2:x+3].astype('int16'); mejor[i]=max(mejor[i], int((p[:,:,1]-p[:,:,2]).max()))
 c.release(); print(json.dumps({'cuadros':cuadros,'ultimo_ms':ultima_fecha,'verde':mejor}))`;
  const medidas = execFileSync(python, ['-c', comprobar, ...exportados], { encoding: 'utf8' }).trim().split(/\r?\n/).map(linea => JSON.parse(linea));
  for (const m of medidas) {
    assert.ok(m.cuadros > 20, 'El WebM descargado contiene video reproducible');
    assert.ok(m.ultimo_ms >= 6500, `La descarga debe incluir el final de un video de 8 s: ${m.ultimo_ms}`);
  }
  assert.ok(medidas[0].verde[0] > 60 && medidas[0].verde[1] > 60 && medidas[0].verde[2] > 60, 'Todas incluye persona y ambos vehículos');
  assert.ok(medidas[1].verde[0] < 40 && medidas[1].verde[1] > 60 && medidas[1].verde[2] > 60, 'Solo vehículos excluye persona');
  assert.ok(medidas[2].verde[0] < 40 && medidas[2].verde[1] > 60 && medidas[2].verde[2] < 40, 'Zona incluye solo el vehículo dentro');
  assert.equal(peticiones, muestras, 'Exportar no ejecuta nuevamente la IA.');
  assert.equal(eventos, 1, 'Exportar no registra nuevos eventos.');
  let descargasCanceladas = 0;
  const detectarDescarga = () => { descargasCanceladas++; };
  pagina.on('download', detectarDescarga);
  await pagina.getByRole('button', { name: 'Descargar video analizado' }).click();
  await pagina.getByRole('button', { name: 'Cancelar descarga' }).click();
  await pagina.getByText('Exportación cancelada.').waitFor();
  await pagina.getByRole('button', { name: 'Descargar video analizado' }).waitFor({ state: 'visible' });
  await pagina.waitForTimeout(500);
  assert.equal(descargasCanceladas, 0, 'Cancelar no debe producir un archivo parcial.');
  pagina.off('download', detectarDescarga);
  await pagina.getByLabel('Registrar automáticamente los hallazgos', { exact: false }).uncheck();
  await pagina.getByRole('button', { name: 'Analizar video', exact: true }).click();
  await pagina.getByText('Análisis terminado.', { exact: false }).waitFor({ timeout: 30000 });
  assert.equal(eventos, 1, 'Desactivar el registro impide nuevos avisos.');
  console.log('Fin de video correcto; no se repitió el análisis.');
} finally {
  await navegador?.close();
  if (servidor) await new Promise(ok => servidor.close(ok));
  await unlink(archivo).catch(() => {});
  for (const ruta of exportados) await unlink(ruta).catch(() => {});
  await rmdir(temporal);
}
