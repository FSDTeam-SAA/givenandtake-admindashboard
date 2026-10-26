const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { encode } = require('next-auth/jwt');
const root = path.resolve(__dirname, '../..');
const output = process.env.ADMIN_LOGIN_ARTIFACTS || path.join(__dirname, 'output');
fs.mkdirSync(output, { recursive: true });
const base = 'http://127.0.0.1:3109';
const audit = path.join(output, 'admin-login-fixture-audit.jsonl');
const results = [];

async function main() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  async function fixture(name, fn, options = {}) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
    const errors = [];
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === base || url.origin === 'http://localhost:3109') return route.continue();
      let body = { success: true, data: [] };
      if (url.pathname.endsWith('/user/single')) body.data = { name: 'Fixture Admin', email: 'fixture-admin@example.test' };
      if (url.pathname.endsWith('/admin/stats')) body.data = { totalCandidates: 0, totalRecruiters: 0, totalCompany: 0, totalAmount: 0, charts: { monthly: [], yearly: [] } };
      return route.fulfill({ json: body });
    });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    try {
      await fn(page, context);
      // Existing dashboard layouts nest html/body; capture that baseline separately.
      const unexpected = errors.filter(message => !/hydration|hydrating|Minified React error #(?:418|423)/i.test(message));
      assert.deepEqual(unexpected, []);
      results.push({ name, passed: true, baselineHydrationMessages: errors.length });
      console.log(`PASS ${name}`);
    } catch (error) {
      await page.screenshot({ path: path.join(output, 'admin-login-browser-failure.png'), fullPage: true });
      console.log('Failure URL:', page.url(), 'Browser errors:', errors);
      throw error;
    } finally { await context.close(); }
  }
  async function login(page, password = 'Fixture-123!') {
    await page.locator('#email').fill('fixture-admin@example.test');
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
  }
  async function stale(context, page) {
    const old = String(Date.now() - 3600_000);
    await context.addCookies([{ name: 'gnt_last_activity', value: old, url: base, httpOnly: true }]);
    await page.addInitScript(value => localStorage.setItem('gnt_last_activity', value), old);
  }
  try {
    await fixture('new login replaces stale cookie/storage and survives dashboard reload', async (page, context) => {
      await stale(context, page);
      await page.goto(base + '/login');
      await login(page);
      await page.waitForURL(base + '/');
      await page.getByText('Fixture Admin').first().waitFor();
      const session = await (await context.request.get(base + '/api/auth/session')).json();
      assert.equal(session.user.role, 'super-admin');
      assert.ok(session.authenticatedAt > Date.now() - 60_000);
      await page.reload();
      await page.getByText('Fixture Admin').first().waitFor();
      assert.equal(new URL(page.url()).pathname, '/');
      const activity = (await context.cookies()).find(cookie => cookie.name === 'gnt_last_activity');
      assert.ok(Number(activity.value) > Date.now() - 60_000);
      await page.screenshot({ path: path.join(output, 'admin-login-dashboard.png'), fullPage: true });
      await page.goto(base + '/login');
      await page.waitForURL(base + '/');
    });
    await fixture('invalid password remains on login and valid retry returns to saved filters', async page => {
      await page.goto(base + '/login?callbackUrl=' + encodeURIComponent('/education-institutions?tab=review'));
      await login(page, 'Invalid-fixture-password');
      await page.getByText('Invalid email or password. Please try again.').waitFor();
      assert.equal(new URL(page.url()).pathname, '/login');
      await login(page);
      await page.waitForURL(base + '/education-institutions?tab=review');
      await page.getByRole('heading', { name: 'Education Institutions', exact: true }).waitFor();
    });
    await fixture('temporary network failure shows an error and allows retry', async page => {
      await page.goto(base + '/login');
      await page.route('**/api/auth/callback/credentials', route => route.abort(), { times: 1 });
      await login(page);
      await page.getByText('An unexpected error occurred. Please try again.').waitFor();
      await login(page); await page.waitForURL(base + '/');
      await page.getByText('Fixture Admin').first().waitFor();
    });
    await fixture('logout clears authentication and a second login succeeds', async (page, context) => {
      await page.goto(base + '/login');
      await login(page); await page.waitForURL(base + '/');
      await page.getByText('Fixture Admin').first().waitFor();
      await page.getByRole('button', { name: 'Logout', exact: true }).click();
      await page.getByRole('button', { name: 'Logout', exact: true }).last().click();
      await page.waitForURL(base + '/login');
      assert.deepEqual(await (await context.request.get(base + '/api/auth/session')).json(), {});
      await login(page); await page.waitForURL(base + '/');
      await page.getByText('Fixture Admin').first().waitFor();
    });
    for (const destination of ['/login?callbackUrl=/login', 'https://outside.example/']) {
      await fixture(`unsafe or looping callback falls back to dashboard: ${destination}`, async page => {
        await page.goto(base + '/login?callbackUrl=' + encodeURIComponent(destination));
        await login(page); await page.waitForURL(base + '/');
        await page.getByText('Fixture Admin').first().waitFor();
      });
    }
    await fixture('expired session on login cannot sign out the newly submitted login', async (page, context) => {
      const token = await encode({ secret: 'isolated-admin-login-fixture-secret', token: {
        user: { role: 'admin', accessToken: '', _id: 'fixture-admin', email: 'fixture-admin@example.test' },
        error: 'SessionExpired', sessionExpiresAt: Date.now() - 1, authenticatedAt: Date.now() - 3600_000,
      } });
      await context.addCookies([{ name: 'next-auth.session-token', value: token, url: base, httpOnly: true }]);
      await stale(context, page);
      await page.goto(base + '/login');
      await login(page); await page.waitForURL(base + '/');
      await page.getByText('Fixture Admin').first().waitFor();
      assert.equal((await (await context.request.get(base + '/api/auth/session')).json()).error, undefined);
    });
    await fixture('blocked local storage and rapid repeated submit still login once', async page => {
      await page.addInitScript(() => {
        for (const method of ['getItem', 'setItem', 'removeItem']) {
          Storage.prototype[method] = () => { throw new DOMException('Blocked', 'SecurityError'); };
        }
      });
      const before = fs.readFileSync(audit, 'utf8').trim().split('\n').length;
      await page.goto(base + '/login');
      await page.locator('#email').fill('fixture-admin@example.test');
      await page.locator('#password').fill('Fixture-123!');
      await page.locator('form').evaluate(form => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
      await page.waitForURL(base + '/');
      await page.getByText('Fixture Admin').first().waitFor();
      const after = fs.readFileSync(audit, 'utf8').trim().split('\n').length;
      assert.equal(after - before, 1);
    }, { viewport: { width: 390, height: 844 } });
    await fixture('anonymous protected page preserves destination and mobile login layout fits', async page => {
      await page.goto(base + '/education-institutions?tab=review');
      assert.equal(new URL(page.url()).pathname, '/login');
      assert.equal(new URL(page.url()).searchParams.get('callbackUrl'), '/education-institutions?tab=review');
      await page.locator('#email').waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: path.join(output, 'admin-login-mobile.png'), fullPage: true });
    }, { viewport: { width: 320, height: 740 } });
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(output, 'admin-login-browser-results.json'), JSON.stringify(results, null, 2));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
