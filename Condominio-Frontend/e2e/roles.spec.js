import { test, expect } from '@playwright/test';

const api = 'http://127.0.0.1:18081/api/';
const web = 'http://127.0.0.1:15173';
const roleName = 'Recepcion ficticia web';

async function login(page, username) {
  await page.goto(`${web}/login`);
  await page.locator('#username').fill(username);
  await page.locator('#password').fill('PruebaTemporal2026');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(`${web}/admin/dashboard`);
}

test('rol personalizado: creación, asignación, consulta, revocación y cierre', async ({ browser, request }, testInfo) => {
  const identity = await request.get(`${api}prueba-aislada/`);
  expect(identity.status()).toBe(200);
  expect(await identity.json()).toEqual({ entorno: 'roles-aislados', firebase: false });
  const contexts = [];
  const forbiddenOrigins = new Set();
  const scriptErrors = [];
  async function newPage() {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
    contexts.push(context);
    await context.route('**/*', route => {
      const origin = new URL(route.request().url()).origin;
      if (![web, 'http://127.0.0.1:18081'].includes(origin)) {
        forbiddenOrigins.add(origin);
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', error => scriptErrors.push(error.message));
    return page;
  }
  try {
    const admin = await newPage();
    await login(admin, 'admin_ficticio');
    await admin.goto(`${web}/admin/roles`);
    await expect(admin.getByRole('heading', { name: 'Roles y accesos' })).toBeVisible();
    for (const name of ['Administrador', 'Guardia de seguridad', 'Propietario', 'Inquilino']) {
      const row = admin.getByRole('row').filter({ has: admin.getByRole('cell', { name, exact: true }) });
      await expect(row).toBeVisible();
      await expect(row.getByRole('button', { name: /Editar|Eliminar/ })).toHaveCount(0);
    }
    await admin.getByLabel('Nombre del rol', { exact: true }).fill(roleName);
    await admin.getByRole('button', { name: 'Crear rol', exact: true }).click();
    await expect(admin.getByRole('status')).toHaveText('Rol creado sin permisos.');
    await admin.getByLabel('Seleccionar rol', { exact: true }).selectOption({ label: roleName });
    const permission = admin.getByLabel('Consultar visitas pendientes y activas');
    await expect(permission).not.toBeChecked();
    await expect(admin.getByText('Estado: Inactivo · Cuentas asignadas: 0')).toBeVisible();
    await expect(admin.getByRole('button', { name: 'Asignar rol', exact: true })).toBeDisabled();
    await admin.getByRole('button', { name: 'Activar rol', exact: true }).click();
    await expect(admin.getByText('Estado: Activo · Cuentas asignadas: 0')).toBeVisible();
    await admin.getByLabel('Asignar a cuenta de empleado activo').selectOption({ label: 'empleado_ficticio' });
    admin.once('dialog', dialog => dialog.accept());
    await admin.getByRole('button', { name: 'Asignar rol', exact: true }).click();
    await expect(admin.getByRole('status')).toHaveText('Rol asignado a la cuenta.');
    await expect(admin.getByText('Estado: Activo · Cuentas asignadas: 1')).toBeVisible();
    await admin.screenshot({ path: testInfo.outputPath('rol-asignado.png'), fullPage: true });

    const employee = await newPage();
    await login(employee, 'empleado_ficticio');
    await expect(employee.getByRole('heading', { name: `Panel de ${roleName}` })).toBeVisible();
    await expect(employee.getByRole('link', { name: 'Visitas', exact: true })).toHaveCount(0);
    for (const path of ['visitas', 'roles', 'usuarios', 'expensas', 'eventos-seguridad']) {
      await employee.goto(`${web}/admin/${path}`);
      await expect(employee.getByRole('alert')).toHaveText('No tienes permiso para acceder a esta página.');
    }
    // El permiso se concede desde React y se consulta con la misma sesión.
    await permission.click();
    await expect(admin.getByRole('status')).toHaveText('Permiso actualizado.');
    await expect(permission).toBeChecked();
    await employee.reload();
    await employee.locator('nav').getByText('Seguridad', { exact: true }).click();
    await employee.getByRole('link', { name: 'Visitas', exact: true }).click();
    await expect(employee.getByRole('heading', { name: 'Visitas pendientes y activas' })).toBeVisible();
    await expect(employee.getByRole('cell', { name: 'Visita Ficticia', exact: true })).toBeVisible();
    await employee.screenshot({ path: testInfo.outputPath('visitas-autorizadas.png'), fullPage: true });
    await expect(employee.getByRole('button', { name: /Editar|Eliminar|Nueva visita/ })).toHaveCount(0);
    await expect(employee.getByRole('columnheader', { name: /Teléfono|Cédula|CI/ })).toHaveCount(0);

    // Revocar con la sesión abierta y el menú previamente cargado.
    await permission.click();
    await expect(admin.getByRole('status')).toHaveText('Permiso actualizado.');
    await expect(permission).not.toBeChecked();
    await employee.getByRole('link', { name: 'Dashboard', exact: true }).click();
    const denied = employee.waitForResponse(response => response.url() === `${api}visitas/` && response.status() === 403);
    await employee.getByRole('link', { name: 'Visitas', exact: true }).click();
    await denied;
    await expect(employee.getByText('No tienes permiso para consultar esta información.', { exact: true })).toBeVisible();
    await expect(employee.getByRole('cell', { name: 'Visita Ficticia', exact: true })).toHaveCount(0);
    await employee.screenshot({ path: testInfo.outputPath('visitas-revocadas.png'), fullPage: true });
    await employee.reload();
    await expect(employee.getByRole('link', { name: 'Visitas', exact: true })).toHaveCount(0);
    await expect(employee.getByRole('alert')).toHaveText('No tienes permiso para acceder a esta página.');

    // Leer exclusivamente credenciales ficticias de este contexto temporal; nunca imprimirlas.
    const tokens = await employee.evaluate(() => ({ access: localStorage.getItem('access'), refresh: localStorage.getItem('refresh') }));
    await employee.getByRole('button', { name: 'Cerrar Sesión', exact: true }).click();
    await expect(employee).toHaveURL(`${web}/login`);
    expect(await employee.evaluate(() => localStorage.getItem('access') === null && localStorage.getItem('refresh') === null)).toBe(true);
    expect((await request.get(`${api}me/`, { headers: { Authorization: `Bearer ${tokens.access}` } })).status()).toBe(401);
    expect((await request.post(`${api}refresh/`, { data: { refresh: tokens.refresh } })).status()).toBe(401);

    await login(employee, 'empleado_ficticio');
    await admin.getByRole('button', { name: 'Desactivar rol', exact: true }).click();
    await expect(admin.getByText('Estado: Inactivo · Cuentas asignadas: 1')).toBeVisible();
    await employee.reload();
    await expect(employee).toHaveURL(`${web}/login`);
    await employee.locator('#username').fill('empleado_ficticio');
    await employee.locator('#password').fill('PruebaTemporal2026');
    await employee.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(employee.getByText('Usuario, contraseña o cuenta no autorizada.')).toBeVisible();
    // PaymentModal importa Stripe al cargar la aplicación, aunque no se abra.
    // Su CDN está bloqueada intencionalmente: pagos no pertenecen a esta prueba.
    const blockedStripe = forbiddenOrigins.has('https://js.stripe.com');
    expect(scriptErrors.filter(message => !(blockedStripe && message === 'Failed to load Stripe.js'))).toEqual([]);
    if (blockedStripe) testInfo.annotations.push({ type: 'aislamiento', description: 'CDN Stripe bloqueada; pagos fuera del alcance.' });
    // Recursos externos opcionales se bloquean; nunca acceder al servidor habitual.
    expect([...forbiddenOrigins].filter(origin => /localhost|127\.0\.0\.1/.test(origin))).toEqual([]);
  } finally {
    await Promise.all(contexts.map(context => context.close()));
  }
});
