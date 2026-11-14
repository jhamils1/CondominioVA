// Recorrido simulado: no consulta ni modifica cámaras o datos reales.
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
  let rol = 'administrador', registros = [], modificaciones = 0, consultasImou = 0, direccionesBusqueda = ['192.168.20.55'];
  let evento = { id: 'evento-ficticio', categoria: 'Alerta ficticia', descripcion: 'Para revisión', estado: 'PENDIENTE_REVISION', origen: 'IA', camara: 'Imou', fecha_evento: '2026-11-06T10:00:00Z', evidencia_disponible: false };
  await pagina.route('**/api/**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname;
    if (path.endsWith('/me/')) return route.fulfill({ json: { username: 'demo', role: rol, capacidades: [] } });
    if (path.endsWith('/eventos-seguridad/') && req.method() === 'GET') return route.fulfill({ json: [evento] });
    if (path.endsWith('/evento-ficticio/historial/')) return route.fulfill({ json: [] });
    if (path.endsWith('/evento-ficticio/confirmar/') && req.method() === 'POST') {
      evento = { ...evento, estado: 'CONFIRMADA' }; return route.fulfill({ json: evento });
    }
    if (path.endsWith('/vision-imou/monitoreo/')) return route.fulfill({ json: { ocupado: false } });
    if (path.endsWith('/camaras/registrar-imou/') && req.method() === 'POST') {
      const item = { id: 2, nombre: 'Cámara Imou', ubicacion: '', fabricante: 'Imou', modelo: '', tipo: 'RED', direccion_ip: '192.168.20.20', puerto_rtsp: 554, activa: true, vinculo_imou: 'vinculada' };
      registros.push(item); return route.fulfill({ status: 201, json: item });
    }
    if (path.endsWith('/camaras/2/probar-imou/') && req.method() === 'POST') {
      consultasImou++;
      return route.fulfill({ json: { estado: consultasImou < 3 ? 'conectando' : 'disponible' } });
    }
    if (path.endsWith('/camaras/2/vincular-monitor/') && req.method() === 'POST') {
      const i = registros.findIndex(c => c.id === 2);
      registros[i] = { ...registros[i], monitor_en_catalogo: true, usuario_dispositivo: 'admin-ficticio', ruta_rtsp: '/cam/realmonitor?channel=1&subtype=0', contrasena_configurada: true };
      return route.fulfill({ json: registros[i] });
    }
    if (path.endsWith('/camaras/2/') && req.method() === 'PUT') {
      const i = registros.findIndex(c => c.id === 2);
      registros[i] = { ...registros[i], ...req.postDataJSON(), vinculo_imou: 'vinculada', monitor_en_catalogo: true };
      return route.fulfill({ json: registros[i] });
    }
    if (path.endsWith('/camaras/1/acceso-local/')) return route.fulfill({ json: { usuario: 'operador-ficticio', contrasena: 'clave-ficticia' } });
    if (path.endsWith('/camaras/2/acceso-local/')) return route.fulfill({ json: { usuario: 'admin-ficticio', ruta_rtsp_local: '/cam/realmonitor?channel=1&subtype=0' } });
    if (path.endsWith('/camaras/1/probar-red/')) return route.fulfill({ json: { estado: 'disponible' } });
    if (path.endsWith('/camaras/buscar-red/')) return route.fulfill({ json: { estado: 'completado', direcciones: direccionesBusqueda, dispositivos: direccionesBusqueda.map(ip => ({ ip, puerto_onvif: ip === '192.168.20.55' ? 8080 : null })) } });
    if (path.endsWith('/camaras/consultar-onvif/')) return route.fulfill({ json: { perfiles: [{ nombre: 'Subflujo ficticio', puerto_rtsp: 8554, ruta_rtsp: '/video-onvif' }] } });
    if (path.endsWith('/camaras/') && req.method() === 'GET') return route.fulfill({ json: registros });
    if (path.endsWith('/camaras/') && req.method() === 'POST') {
      const { contrasena_nueva, ...otros } = req.postDataJSON();
      const item = { ...otros, contrasena_configurada: !!contrasena_nueva, vinculo_imou: 'sin_vinculo', id: 1 }; registros = [item]; modificaciones++;
      return route.fulfill({ status: 201, json: item });
    }
    if (path.endsWith('/camaras/1/') && req.method() === 'PUT') {
      const { contrasena_nueva, ...otros } = req.postDataJSON();
      const item = { ...otros, contrasena_configurada: !!contrasena_nueva || registros[0].contrasena_configurada, vinculo_imou: 'sin_vinculo', id: 1 }; registros = [item]; modificaciones++;
      return route.fulfill({ json: item });
    }
    return route.fulfill({ json: [] });
  });
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/camaras`);
  await pagina.getByText('No hay cámaras registradas.').waitFor();
  const menuCamaras = pagina.locator('nav').getByRole('button', { name: 'Cámaras', exact: true });
  assert.equal(await menuCamaras.getAttribute('aria-expanded'), 'false');
  await menuCamaras.focus();
  await pagina.keyboard.press('Enter');
  assert.equal(await menuCamaras.getAttribute('aria-expanded'), 'true');
  assert.equal(await pagina.getByRole('link', { name: 'Monitor en vivo' }).count(), 1);
  assert.equal(await pagina.getByRole('link', { name: 'Gestión de cámaras' }).count(), 1);
  await pagina.getByRole('button', { name: 'Añadir cámara' }).click();
  await pagina.getByRole('button', { name: 'Buscar cámaras en la red' }).click();
  await pagina.getByRole('button', { name: 'Usar 192.168.20.55' }).click();
  assert.equal(await pagina.getByLabel('Dirección IPv4').inputValue(), '192.168.20.55');
  assert.equal(await pagina.getByLabel('Puerto ONVIF').inputValue(), '8080');
  await pagina.getByText('Puerto anunciado por el dispositivo; aún falta comprobar la conexión.').waitFor();
  await pagina.getByLabel('Ruta RTSP').fill('/ruta-manual');
  await pagina.getByLabel('Perfil de conexión').selectOption('imou_bullet_2e');
  assert.equal(await pagina.getByLabel('Ruta RTSP').inputValue(), '/cam/realmonitor?channel=1&subtype=1');
  assert.equal(await pagina.getByLabel('Ruta RTSP').getAttribute('readonly'), '');
  assert.equal(await pagina.getByLabel('Modelo').inputValue(), 'IPC-K3DN-3H0WF');
  await pagina.getByLabel('Perfil de conexión').selectOption('manual');
  assert.equal(await pagina.getByLabel('Ruta RTSP').inputValue(), '/ruta-manual');
  assert.equal(await pagina.getByLabel('Ruta RTSP').getAttribute('readonly'), null);
  await pagina.getByLabel('Nombre', { exact: true }).fill('Entrada');
  await pagina.getByLabel('Dirección IPv4').fill('192.168.20.10');
  assert.equal(await pagina.getByLabel('Puerto ONVIF').inputValue(), '80');
  await pagina.getByLabel('Usuario de la cámara').fill('operador-ficticio');
  await pagina.getByLabel('Contraseña de la cámara', { exact: true }).fill('clave-ficticia');
  await pagina.getByRole('button', { name: 'Obtener perfiles mediante ONVIF' }).click();
  await pagina.getByRole('button', { name: 'Usar Subflujo ficticio · puerto 8554' }).click();
  assert.equal(await pagina.getByLabel('Perfil de conexión').locator('option:checked').textContent(), 'ONVIF: Subflujo ficticio');
  assert.equal(await pagina.getByLabel('Ruta RTSP').inputValue(), '/video-onvif');
  assert.equal(await pagina.getByLabel('Puerto RTSP').inputValue(), '8554');
  assert.equal(await pagina.getByLabel('Ruta RTSP').getAttribute('readonly'), '');
  await pagina.getByLabel('Perfil de conexión').selectOption('manual');
  await pagina.getByRole('button', { name: 'Mostrar contraseña nueva' }).click();
  assert.equal(await pagina.getByLabel('Contraseña de la cámara', { exact: true }).getAttribute('type'), 'text');
  await pagina.getByRole('button', { name: 'Ocultar contraseña nueva' }).click();
  await pagina.getByLabel('Ruta RTSP').fill('/video');
  await pagina.getByRole('button', { name: 'Guardar cámara' }).click();
  await pagina.getByText(/Cámara guardada en el catálogo/).waitFor();
  assert.equal(registros[0].direccion_ip, '192.168.20.10');
  assert.equal('contrasena_nueva' in registros[0], false);
  await pagina.getByRole('button', { name: 'Probar conexión' }).click();
  await pagina.getByText('Conexión comprobada: se recibió una imagen de la cámara.').waitFor();
  await pagina.getByRole('button', { name: 'Editar' }).click();
  assert.equal(await pagina.getByLabel('Ruta RTSP').getAttribute('readonly'), '');
  await pagina.getByRole('button', { name: 'Permitir edición de ruta' }).click();
  assert.equal(await pagina.getByLabel('Ruta RTSP').getAttribute('readonly'), null);
  await pagina.getByRole('button', { name: 'Bloquear edición de ruta' }).click();
  assert.equal(await pagina.getByLabel('Nueva contraseña del catálogo (opcional)').inputValue(), '');
  await pagina.getByRole('button', { name: 'Mostrar contraseña actual' }).click();
  await pagina.getByRole('button', { name: 'Ocultar contraseña actual' }).waitFor();
  assert.equal(await pagina.locator('input[placeholder="Contraseña guardada"]').inputValue(), 'clave-ficticia');
  assert.equal(await pagina.locator('input[placeholder="Contraseña guardada"]').getAttribute('type'), 'text');
  await pagina.getByRole('button', { name: 'Ocultar contraseña actual' }).click();
  assert.equal(await pagina.locator('input[placeholder="Contraseña guardada"]').getAttribute('type'), 'password');
  await pagina.getByLabel('Habilitada en el catálogo').uncheck();
  await pagina.getByRole('button', { name: 'Guardar cámara' }).click();
  await pagina.getByText('Deshabilitada').waitFor();
  assert.equal(modificaciones, 2);
  await pagina.getByRole('button', { name: 'Agregar Imou configurada' }).click();
  await pagina.getByText('Coincide con la Imou configurada en este equipo.').waitFor();
  await pagina.getByRole('button', { name: 'Probar conexión' }).click();
  await pagina.getByText('Conexión comprobada: el puente recibió una imagen.').waitFor();
  assert.equal(consultasImou, 3, 'La comprobación mantiene activa la conexión hasta recibir imagen');
  assert.equal(await pagina.getByRole('link', { name: 'Abrir monitor' }).count(), 1);
  await pagina.getByRole('button', { name: 'Añadir cámara' }).click();
  direccionesBusqueda = [];
  await pagina.getByRole('button', { name: 'Buscar cámaras en la red' }).click();
  await pagina.getByText('Ningún dispositivo respondió a esta búsqueda. Esto no significa que las cámaras registradas estén desconectadas.').waitFor();
  assert.equal(await pagina.getByText('Cámara Imou · 192.168.20.20 · No respondió en esta búsqueda').count(), 1);
  direccionesBusqueda = ['192.168.20.20'];
  await pagina.getByRole('button', { name: 'Buscar cámaras en la red' }).click();
  await pagina.getByText('Cámara Imou · 192.168.20.20 · Respondió una dirección coincidente').waitFor();
  assert.equal(await pagina.getByRole('button', { name: 'Usar 192.168.20.20' }).count(), 0);
  await pagina.getByRole('button', { name: 'Cancelar' }).click();
  await pagina.locator('article').filter({ hasText: 'Cámara Imou' }).getByRole('button', { name: 'Editar' }).click();
  await pagina.waitForFunction(() => document.querySelector('input[name="ruta_rtsp"]')?.value.includes('subtype=0'));
  assert.equal(await pagina.getByLabel('Ruta RTSP').inputValue(), '/cam/realmonitor?channel=1&subtype=0');
  assert.equal(await pagina.getByLabel('Ruta RTSP').getAttribute('readonly'), '');
  await pagina.getByRole('button', { name: 'Cancelar' }).click();
  await pagina.getByRole('button', { name: 'Vincular al monitor' }).click();
  await pagina.getByText('Vinculada al monitor: la conexión usa los datos del catálogo.').waitFor();
  await pagina.locator('article').filter({ hasText: 'Cámara Imou' }).getByRole('button', { name: 'Editar' }).click();
  await pagina.getByLabel('Dirección IPv4').fill('192.168.20.21');
  await pagina.getByRole('button', { name: 'Guardar cámara' }).click();
  await pagina.getByText('Vinculada al monitor: la conexión usa los datos del catálogo.').waitFor();
  assert.equal(registros.find(c => c.id === 2).direccion_ip, '192.168.20.21');
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/eventos-seguridad`);
  await pagina.getByRole('heading', { name: 'Eventos e incidencias de seguridad' }).waitFor();
  assert.equal(await pagina.getByRole('button', { name: 'Ver cámara Imou' }).count(), 0, 'El administrador consulta eventos sin duplicar el monitor');
  rol = 'guardia';
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/camaras`);
  await pagina.reload();
  await pagina.getByText('No tienes permiso para acceder a esta página.').waitFor();
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/eventos-seguridad`);
  await pagina.getByText('No tienes permiso para acceder a esta página.').waitFor();
  await pagina.goto(`http://127.0.0.1:${servidor.address().port}/admin/monitor-camaras`);
  await pagina.getByRole('heading', { name: 'Monitor en vivo' }).waitFor();
  await pagina.locator('nav').getByText('Cámaras', { exact: true }).click();
  assert.equal(await pagina.getByRole('link', { name: 'Monitor en vivo' }).count(), 1);
  assert.equal(await pagina.getByRole('link', { name: 'Gestión de cámaras' }).count(), 0);
  await pagina.getByRole('button', { name: /Alerta ficticia/ }).click();
  await pagina.getByRole('button', { name: 'Confirmar', exact: true }).click();
  await pagina.getByText(/Estado: CONFIRMADA/).waitFor();
  assert.equal(evento.estado, 'CONFIRMADA', 'El guardia conserva la revisión desde el monitor');
  console.log('Catálogo simulado: alta, edición, desactivación y restricción del guardia correctas.');
} finally {
  await navegador?.close();
  await new Promise(ok => servidor.close(ok));
}
