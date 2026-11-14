// Prueba aislada con respuestas ficticias; no conecta al backend ni envía avisos.
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
  const pagina = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
  await pagina.addInitScript(() => localStorage.setItem('access', 'token-ficticio'));
  let evento = { id: 'evento-ficticio', categoria: 'Vehículo en zona', descripcion: 'Incidencia ficticia', estado: 'PENDIENTE_REVISION', origen: 'IA', camara: 'Entrada', fecha_evento: '2026-11-14T10:00:00Z', evidencia_disponible: true };
  const acciones = [];
  let candidatoEstado = 'candidato', fallaEntrega = false;
  await pagina.route('**/api/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path.endsWith('/me/')) return route.fulfill({ json: { username: 'guardia-ficticio', role: 'guardia', capacidades: [] } });
    if (path.endsWith('/eventos-seguridad/') && req.method() === 'GET') return route.fulfill({ json: [evento, { ...evento, id: 'resuelto', categoria: 'Incidencia resuelta', estado: 'RESUELTA', evidencia_disponible: false }, { ...evento, id: 'descartado', categoria: 'Evento descartado ficticio', estado: 'FALSO_POSITIVO', evidencia_disponible: false }] });
    if (path.endsWith('/historial/')) return route.fulfill({ json: [] });
    if (path.endsWith('/evidencia/')) return route.fulfill({ status: 200, contentType: 'image/jpeg', body: Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2Q==', 'base64') });
    if (path.endsWith('/confirmar/')) { evento = { ...evento, estado: 'CONFIRMADA' }; return route.fulfill({ json: evento }); }
    if (path.endsWith('/registrar-placa/')) { acciones.push('placa'); return route.fulfill({ json: { placa: 'TEST123' } }); }
    if (path.endsWith('/destinatario-placa/') && req.method() === 'GET') return route.fulfill({ json: { estado: candidatoEstado, vehiculo_id: 1, nombre: 'Residente ficticio', tipo: 'inquilino', cuenta_activa: true } });
    if (path.endsWith('/destinatario-placa/') && req.method() === 'POST') { acciones.push('verificar'); return route.fulfill({ status: 201, json: { estado: 'verificado' } }); }
    if (path.endsWith('/preparar-aviso-residente/')) { acciones.push('preparar'); return route.fulfill({ json: { estado: 'preparado' } }); }
    if (path.endsWith('/encolar-aviso-residente/')) { acciones.push('encolar'); return fallaEntrega ? route.fulfill({ status: 503, json: {} }) : route.fulfill({ json: { estado: 'encolado' } }); }
    return route.fulfill({ status: 404, json: {} });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/eventos-seguridad`);
  await pagina.getByText('Vehículo en zona').waitFor();
  assert.equal(await pagina.getByText('Incidencia resuelta').count(), 0);
  await pagina.getByText('Vehículo en zona').click();
  await pagina.getByAltText('Fotograma de evidencia del evento').waitFor();
  await pagina.getByLabel('Placa verificada por el guardia').fill('TEST123');
  await pagina.getByRole('button', { name: 'Registrar placa revisada' }).click();
  await pagina.getByText('Placa registrada en el historial del evento.').waitFor();
  await pagina.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await pagina.getByText('Incidencia confirmada y trasladada al historial.', { exact: false }).waitFor();
  assert.equal(await pagina.getByRole('button', { name: 'Historial de incidencias' }).getAttribute('aria-pressed'), 'true');
  await pagina.getByRole('button', { name: 'Buscar residente por placa registrada' }).waitFor();
  assert.deepEqual(acciones, ['placa']);
  await pagina.getByRole('button', { name: 'Buscar residente por placa registrada' }).click();
  await pagina.getByText('Persona vinculada:', { exact: false }).waitFor();
  assert.deepEqual(acciones, ['placa']);
  await pagina.getByRole('button', { name: 'Confirmar destinatario y enviar aviso' }).click();
  await pagina.getByText('Aviso guardado y en cola;', { exact: false }).waitFor();
  assert.deepEqual(acciones, ['placa', 'verificar', 'preparar', 'encolar']);
  candidatoEstado = 'sin_coincidencia';
  await pagina.getByRole('button', { name: 'Buscar residente por placa registrada' }).click();
  await pagina.getByText('No se pudo identificar un residente activo único', { exact: false }).waitFor();
  assert.equal(await pagina.getByRole('button', { name: 'Confirmar destinatario y enviar aviso' }).count(), 0);
  assert.deepEqual(acciones, ['placa', 'verificar', 'preparar', 'encolar']);
  candidatoEstado = 'candidato'; fallaEntrega = true;
  await pagina.getByRole('button', { name: 'Buscar residente por placa registrada' }).click();
  await pagina.getByRole('button', { name: 'Confirmar destinatario y enviar aviso' }).click();
  await pagina.getByText('El aviso quedó preparado, pero no se pudo solicitar la entrega', { exact: false }).waitFor();
  fallaEntrega = false;
  await pagina.getByRole('button', { name: 'Reintentar aviso al residente' }).click();
  await pagina.getByText('Aviso guardado y en cola;', { exact: false }).waitFor();
  await pagina.getByText('Incidencia resuelta').waitFor();
  assert.equal(await pagina.getByText('Vehículo en zona').count(), 1);
  assert.equal(await pagina.getByText('Evento descartado ficticio').count(), 0);
  await pagina.getByRole('button', { name: 'Eventos descartados' }).click();
  await pagina.getByText('Evento descartado ficticio').waitFor();
  assert.equal(await pagina.getByText('Vehículo en zona').count(), 0);
  await pagina.getByRole('button', { name: 'Pendientes de revisión' }).click();
  assert.equal(await pagina.getByText('Vehículo en zona').count(), 0);
  console.log('Recorrido ficticio de incidencia y aviso aprobado');
} finally {
  await navegador?.close();
  await new Promise(ok => servidor.close(ok));
}
