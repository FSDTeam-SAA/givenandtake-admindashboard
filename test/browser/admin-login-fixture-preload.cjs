// Isolated NextAuth integration fixture: never forward credentials to a real API.
const fs = require('node:fs');
const realFetch = globalThis.fetch;
globalThis.fetch = async function (input, options) {
  const url = typeof input === 'string' ? input : input.url || String(input);
  if (url.endsWith('/user/login')) {
    const body = JSON.parse(options.body);
    const ok = body.email === 'fixture-admin@example.test' && body.password === 'Fixture-123!';
    fs.appendFileSync(process.env.ADMIN_FIXTURE_AUDIT, JSON.stringify({ endpoint: 'login', ok }) + '\n');
    await new Promise(resolve => setTimeout(resolve, 250));
    const now = Math.floor(Date.now() / 1000);
    const accessToken = `fixture.${Buffer.from(JSON.stringify({ exp: now + 900 })).toString('base64url')}.fixture`;
    return Response.json(ok ? { success: true, data: {
      _id: 'fixture-admin', email: body.email, role: 'super-admin', accessToken,
      refreshToken: 'fixture-refresh', sessionExpiresAt: now + 3600,
    } } : { success: false }, { status: ok ? 200 : 401 });
  }
  if (url.startsWith('http://127.0.0.1:')) return realFetch(input, options);
  throw new Error('External server request blocked by isolated admin login fixture');
};
