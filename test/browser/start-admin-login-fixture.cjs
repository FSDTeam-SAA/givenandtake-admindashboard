const path = require('node:path');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const output = process.env.ADMIN_LOGIN_ARTIFACTS || path.join(__dirname, 'output');
require('node:fs').mkdirSync(output, { recursive: true });
const child = spawn(process.execPath, ['--require', path.join(__dirname, 'admin-login-fixture-preload.cjs'),
  path.join(root, 'node_modules/next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', '3109'], {
  cwd: root, stdio: 'inherit', env: {
    ...process.env, NEXTAUTH_SECRET: 'isolated-admin-login-fixture-secret', NEXTAUTH_URL: 'http://127.0.0.1:3109',
    ADMIN_FIXTURE_AUDIT: path.join(output, 'admin-login-fixture-audit.jsonl'),
  },
});
child.on('exit', code => { process.exitCode = code; });
process.on('SIGINT', () => child.kill());
