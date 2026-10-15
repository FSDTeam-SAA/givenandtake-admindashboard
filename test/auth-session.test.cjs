const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
function config(fetch) {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/lib/authOptions.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  const context = { exports: {}, fetch, Buffer, console, process: { env: {} }, require: () => value => value };
  vm.runInNewContext(outputText, context);
  return context.exports.authOptions;
}
const accessToken = exp => `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
test('admin sessions keep refresh credentials out of the client session', async () => {
  const auth = config(() => assert.fail('no refresh is needed'));
  const token = await auth.callbacks.jwt({ token: {}, user: {
    _id: 'admin', email: 'admin@example.com', role: 'admin', refreshToken: 'private-refresh',
    accessToken: accessToken(Math.floor(Date.now() / 1000) + 900), sessionExpiresAt: Math.floor(Date.now() / 1000) + 3600,
  } });
  const session = await auth.callbacks.session({ session: {}, token });
  assert.equal(session.user.refreshToken, undefined);
  assert.equal(token.refreshToken, 'private-refresh');
});
test('expired admin access tokens refresh without extending the session', async () => {
  const refreshed = accessToken(Math.floor(Date.now() / 1000) + 900);
  const auth = config(async () => ({ ok: true, json: async () => ({ success: true, data: { accessToken: refreshed, refreshToken: 'new-refresh' } }) }));
  const deadline = Date.now() + 3600_000;
  const token = await auth.callbacks.jwt({ token: { user: { accessToken: 'old' }, refreshToken: 'refresh', sessionExpiresAt: deadline, accessExpiresAt: 0 } });
  assert.equal(token.user.accessToken, refreshed);
  assert.equal(token.sessionExpiresAt, deadline);
});
test('expired admin sessions require signing in again', async () => {
  const auth = config(() => assert.fail('expired sessions cannot refresh'));
  const token = await auth.callbacks.jwt({ token: { user: { accessToken: 'old' }, refreshToken: 'refresh', sessionExpiresAt: Date.now() - 1 } });
  assert.equal(token.error, 'SessionExpired');
  assert.equal(token.user.accessToken, '');
});
