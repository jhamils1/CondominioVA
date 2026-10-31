import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

test('un empleado guardado exige selección explícita entre los cuatro roles', async () => {
  const vite = await createServer({ configFile: false, plugins: [react()],
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true }, appType: 'custom' });
  try {
    const { default: CuentaPerfil } = await vite.ssrLoadModule('/src/components/CuentaPerfil.jsx');
    const html = renderToStaticMarkup(React.createElement(CuentaPerfil, { tipo: 'empleado', perfilId: 123 }));
    assert.match(html, /Cuenta de acceso/);
    assert.match(html, /Crear cuenta nueva/);
    assert.match(html, /Vincular cuenta existente/);
    for (const role of ['Administrador', 'Guardia de seguridad', 'Propietario', 'Inquilino']) assert.match(html, new RegExp(role));
    assert.match(html, /Selecciona un rol/);
    assert.doesNotMatch(html, /vuelve a editarlo/);
  } finally {
    await vite.close();
  }
});
