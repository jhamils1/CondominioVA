import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { estadoDeRoles } from './rolesPredeterminados.js';

test('muestra los cuatro roles, identifica ausencias y bloquea duplicados', async () => {
  const vite = await createServer({ configFile: false, plugins: [react()],
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { default: RolList } = await vite.ssrLoadModule('/src/pages/rol/RolList.jsx');
    const roles = [{ name: 'administrador' }, { name: 'Seguridad' }, { name: 'propietario' }];
    const html = renderToStaticMarkup(React.createElement(RolList, { roles, onEnable: () => {}, enabling: '' }));
    for (const name of ['Administrador', 'Guardia de seguridad', 'Propietario', 'Inquilino']) assert.match(html, new RegExp(name));
    assert.equal((html.match(/Habilitar rol/g) || []).length, 1);
    assert.match(html, /No configurado/);
    assert.doesNotMatch(html, /Seleccionar Todos|Editar Rol|Can delete/);
    assert.deepEqual(estadoDeRoles(roles).map(r => r.status), ['ready', 'ready', 'ready', 'missing']);
    const duplicated = estadoDeRoles([...roles, { name: ' guardia de seguridad ' }]);
    assert.equal(duplicated[1].status, 'duplicate');
    const conflictHtml = renderToStaticMarkup(React.createElement(RolList, { roles: [...roles, { name: 'Guardia de seguridad' }], onEnable: () => {}, enabling: '' }));
    assert.match(conflictHtml, /Grupos duplicados: requiere revisión/);
    assert.equal((conflictHtml.match(/Habilitar rol/g) || []).length, 1);
  } finally {
    await vite.close();
  }
});
