// Solo datos ficticios; nunca modifica cuentas reales.
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
  await pagina.addInitScript(() => localStorage.setItem('access', 'token-ficticio'));
  const usuario = { id: 2, username: 'guardia_ficticio', email: 'guardia@example.test', role: 'Seguridad', is_active: true };
  const cambios = [];
  pagina.on('dialog', dialog => dialog.accept());
  await pagina.route('**/api/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path.endsWith('/me/')) return route.fulfill({ json: { id: 1, username: 'admin-ficticio', role: 'administrador' } });
    if (path.endsWith('/groupsAux/')) return route.fulfill({ json: [{ id: 2, name: 'Seguridad' }] });
    if (path.endsWith('/users/') && req.method() === 'GET') return route.fulfill({ json: [usuario] });
    if (path.endsWith('/users/2/') && req.method() === 'PATCH') { cambios.push(req.postDataJSON()); return route.fulfill({ json: usuario }); }
    return route.fulfill({ status: 404, json: {} });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/usuarios`);
  await pagina.getByText('guardia_ficticio').waitFor();
  async function abrirEdicion() { await pagina.getByRole('row').filter({ hasText: 'guardia_ficticio' }).getByRole('button', { name: 'Editar' }).click(); }
  await abrirEdicion();
  assert.equal(await pagina.getByLabel('Nueva contraseña', { exact: true }).count(), 0);
  await pagina.getByLabel('Cambiar contraseña de esta cuenta').check();
  const campo = pagina.getByLabel('Nueva contraseña', { exact: true });
  assert.equal(await campo.inputValue(), '');
  await campo.fill('prueba-ficticia-123');
  await pagina.getByRole('button', { name: 'Mostrar nueva contraseña' }).click();
  assert.equal(await campo.getAttribute('type'), 'text');
  await pagina.getByRole('button', { name: 'Ocultar nueva contraseña' }).click();
  assert.equal(await campo.getAttribute('type'), 'password');
  await pagina.getByLabel('Cambiar contraseña de esta cuenta').uncheck();
  await pagina.getByRole('button', { name: 'Guardar Cambios' }).click();
  await pagina.getByText('Editar Usuario').waitFor({ state: 'hidden' });
  assert.equal(Object.hasOwn(cambios[0], 'password'), false, 'Editar sin elegir cambio no envía contraseña');
  await abrirEdicion();
  await pagina.getByLabel('Cambiar contraseña de esta cuenta').check();
  assert.equal(await pagina.getByLabel('Nueva contraseña', { exact: true }).inputValue(), '', 'El campo siempre inicia vacío');
  console.log('Edición y visibilidad de contraseña verificadas con datos ficticios.');
} finally {
  await navegador?.close();
  await new Promise(ok => servidor.close(ok));
}
