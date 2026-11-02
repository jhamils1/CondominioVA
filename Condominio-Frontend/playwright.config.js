import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  workers: 1,
  retries: 0,
  timeout: 90000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:15173',
    channel: 'msedge',
    headless: true,
    viewport: { width: 1440, height: 1000 },
    serviceWorkers: 'block',
    // No guardar tokens/cuerpos de login en trazas o videos.
    trace: 'off',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 15173 --strictPort',
    url: 'http://127.0.0.1:15173',
    reuseExistingServer: false,
    env: { VITE_API_URL: 'http://127.0.0.1:18081/api/' },
    timeout: 30000,
  },
});
