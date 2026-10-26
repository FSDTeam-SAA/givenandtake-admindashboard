const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');

function load(file, requireModule = require, extra = {}) {
  const source = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  });
  const context = { exports: {}, require: requireModule, URL, Date, process: { env: {} }, ...extra };
  vm.runInNewContext(outputText, context);
  return context.exports;
}
const policy = load('src/lib/admin-session.ts');
const origin = 'https://admin.evpitch.com';

for (const callback of [null, '', '/login', '/login?callbackUrl=/login', '/login/', '/%6cogin',
  '/forgot-password', '/reset-password', '/verify-email', '/api/auth/signout', '/_next/static/a',
  'https://outside.example/users', '//outside.example/users', 'javascript:alert(1)', '/%invalid']) {
  test(`login callback safely falls back to dashboard: ${callback}`, () => {
    assert.equal(policy.loginDestination(callback, origin), '/');
  });
}
for (const callback of ['/users?page=2&search=Jane', '/education-institutions?tab=review#pending', `${origin}/job-posts?page=3`]) {
  test(`login preserves a valid destination: ${callback}`, () => {
    const url = new URL(callback, origin);
    assert.equal(policy.loginDestination(callback, origin), url.pathname + url.search + url.hash);
  });
}

test('fresh authentication supersedes stale inactivity from the previous login', () => {
  const now = Date.now();
  assert.equal(policy.activityTimestamp(String(now - 3600_000), now - 10, now), now - 10);
});
test('existing inactive sessions still expire and legacy tokens remain compatible', () => {
  const now = Date.now(), old = now - 3600_000;
  assert.equal(policy.activityTimestamp(String(old), old - 100, now), old);
  assert.equal(policy.activityTimestamp(String(old), undefined, now), old);
});
test('missing, malformed, and future activity values cannot break the timer', () => {
  const now = Date.now();
  for (const value of [undefined, null, '', 'NaN', 'Infinity', '-1', '0']) {
    assert.equal(policy.activityTimestamp(value, now - 3600_000, now), now);
  }
  assert.equal(policy.activityTimestamp(String(now + 3600_000), now, now), now);
});
test('blocked browser storage does not prevent a successful login', () => {
  const isolated = load('src/lib/admin-session.ts', require, {
    localStorage: { setItem() { throw new Error('Storage blocked'); } },
  });
  assert.doesNotThrow(() => isolated.startLoginActivity());
});

function middleware(token) {
  return load('middleware.ts', name => {
    if (name === 'next/server') return { NextResponse };
    if (name === 'next-auth/jwt') return { getToken: async () => token };
    if (name === './src/lib/admin-session') return policy;
    throw new Error(`Unexpected import ${name}`);
  }).middleware;
}
function request(activity) {
  return new NextRequest(`${origin}/users?page=2`, {
    headers: activity ? { cookie: `gnt_last_activity=${activity}` } : {},
  });
}
const staff = (extra = {}) => ({ user: { role: 'admin' }, sessionExpiresAt: Date.now() + 3600_000, ...extra });
test('middleware accepts a new login with the previous session activity cookie', async () => {
  const now = Date.now();
  const response = await middleware(staff({ authenticatedAt: now }))(request(now - 3600_000));
  assert.equal(response.status, 200);
  assert.ok(Number(response.cookies.get('gnt_last_activity').value) >= now);
});
test('middleware sends genuinely inactive sessions to login and retains query filters', async () => {
  const old = Date.now() - 3600_000;
  const response = await middleware(staff({ authenticatedAt: old }))(request(old));
  const url = new URL(response.headers.get('location'));
  assert.equal(url.pathname, '/login');
  assert.equal(url.searchParams.get('reason'), 'inactive');
  assert.equal(url.searchParams.get('callbackUrl'), '/users?page=2');
  assert.equal(response.cookies.get('next-auth.session-token').value, '');
});
for (const token of [null, staff({ error: 'SessionExpired' }), staff({ sessionExpiresAt: Date.now() - 1 })]) {
  test(`middleware rejects missing or expired authentication: ${token?.error || token?.sessionExpiresAt || 'none'}`, async () => {
    const response = await middleware(token)(request());
    const url = new URL(response.headers.get('location'));
    assert.equal(url.pathname, '/login');
    assert.equal(url.searchParams.get('callbackUrl'), '/users?page=2');
  });
}
test('legacy active sessions, public auth endpoints, and role restrictions still work', async () => {
  assert.equal((await middleware(staff())(request(Date.now()))).status, 200);
  for (const route of ['/login', '/api/auth/session', '/api/auth/callback/credentials']) {
    assert.equal((await middleware(null)(new NextRequest(origin + route))).status, 200);
  }
  const restricted = new NextRequest(origin + '/payment-details');
  assert.equal(new URL((await middleware(staff())(restricted)).headers.get('location')).pathname, '/');
  assert.equal((await middleware(staff({ user: { role: 'super-admin' } }))(restricted)).status, 200);
});
