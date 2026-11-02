import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import process from 'node:process';

const backend = fileURLToPath(new URL('../../Condominio-Backend/', import.meta.url));
const python = join(backend, 'env', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const child = spawn(python, ['-B', '-m', 'administracion.run_roles_web_isolated', '--web-check'], {
  cwd: backend, stdio: 'inherit', windowsHide: true,
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
