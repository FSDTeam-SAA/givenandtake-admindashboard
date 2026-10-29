// Real admin component and query hooks; local API fixture only, no production writes.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const esbuild = require(process.env.ESBUILD_MODULE || 'esbuild');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const admin = path.resolve(__dirname, '../..');
const output = process.env.SKILL_ADMIN_ARTIFACTS || path.resolve(admin, '../artifacts');
const base = 'http://127.0.0.1:3032';
const key = character => character.repeat(64);
const id = value => value.toString(16).padStart(24, '0');
const catalog = [{ _id: id(1), name: 'Risk', active: true }, { _id: id(2), name: 'Risk' }, { _id: id(3), name: 'C++', active: false }, ...Array.from({ length: 26 }, (_, i) => ({ _id: id(i + 10), name: `Catalog skill ${i}` }))];
const submissions = [{ key: key('a'), name: 'Novel Risk skill', count: 3, status: 'pending' }, { key: key('b'), name: 'C plus plus', count: 2, status: 'pending' }, { key: key('c'), name: 'Rejected custom', count: 1, status: 'rejected' }];
const writes = [], reads = [];
let failManage = false;
const normalize = value => value.trim().replace(/\s+/g, ' ').toLowerCase();

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const bundle = await esbuild.build({ stdin: { resolveDir: admin, loader: 'tsx', contents: `
import React from 'react';import {createRoot} from 'react-dom/client';import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import Skills from './src/app/(admin-dashboard)/skills/_components/akillsPage';
createRoot(document.getElementById('root')).render(<QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}})}><Skills/></QueryClientProvider>);` }, bundle: true, write: false, format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"development"', 'process.env.NEXT_PUBLIC_BASE_URL': '"/api/v1"' }, plugins: [{ name: 'fixture', setup(build) {
    build.onResolve({ filter: /^(next-auth\/react|sonner)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
    build.onResolve({ filter: /^@\// }, args => { const file = path.join(admin, 'src', args.path.slice(2)); return { path: ['.tsx', '.ts', '.js'].map(ext => file + ext).find(fs.existsSync) || file }; });
    build.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ loader: 'js', contents: args.path === 'next-auth/react'
      ? `export const useSession=()=>location.search.includes('guest')?{data:null,status:'unauthenticated'}:{data:{user:{accessToken:'fixture-admin'}},status:'authenticated'};`
      : `export const toast={success:message=>document.getElementById('toast').textContent=message,error:message=>document.getElementById('toast').textContent=message};` }));
  } }] });
  const cssDir = path.join(admin, '.next/static/css');
  const css = fs.existsSync(cssDir) ? fs.readdirSync(cssDir, { recursive: true }).filter(file => file.endsWith('.css')).map(file => fs.readFileSync(path.join(cssDir, file), 'utf8')).join('\n') : '';
  assert.ok(css, 'Run npm run build before browser verification');
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, base);
    if (url.pathname === '/bundle.js') { res.setHeader('Content-Type', 'text/javascript'); return res.end(bundle.outputFiles[0].text); }
    if (url.pathname.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');
      assert.equal(req.headers.authorization, 'Bearer fixture-admin');
      const reply = (data, status = 200) => { res.statusCode = status; res.end(JSON.stringify({ success: status < 400, message: status < 400 ? 'Fixture complete' : 'Fixture catalog unavailable', data })); };
      if (req.method === 'GET') {
        reads.push(url.pathname + url.search);
        if (url.pathname.endsWith('/manage')) { if (failManage) return reply([], 503); return reply(catalog); }
        if (url.pathname.endsWith('/submissions')) return reply(submissions.filter(row => row.status === url.searchParams.get('status')));
        return reply([], 404);
      }
      let text = ''; for await (const chunk of req) text += chunk;
      const body = JSON.parse(text); writes.push({ method: req.method, path: url.pathname, body });
      if (url.pathname.endsWith('/submissions/review')) {
        const submission = submissions.find(row => row.key === body.key); assert.ok(submission);
        submission.status = body.action === 'approve' ? 'approved' : body.action === 'reject' ? 'rejected' : 'pending';
        if (body.action === 'approve') {
          if (body.skillId) { const skill = catalog.find(row => row._id === body.skillId); assert.ok(skill); skill.active = true; submission.skillId = skill._id; }
          else { const skill = { _id: id(catalog.length + 100), name: body.name, active: true }; catalog.push(skill); submission.skillId = skill._id; }
        }
        return reply(submission);
      }
      if (req.method === 'POST') { const skill = { _id: id(catalog.length + 100), ...body }; catalog.push(skill); return reply(skill, 201); }
      if (req.method === 'PUT') {
        const skill = catalog.find(row => row._id === url.pathname.split('/').pop()); assert.ok(skill);
        const currentName = skill.name;
        Object.assign(skill, body);
        if (body.active !== undefined) for (const duplicate of catalog.filter(row => normalize(row.name) === normalize(currentName))) duplicate.active = body.active;
        return reply(skill);
      }
      return reply([], 404);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root"></div><div role="status" id="toast"></div><script src="/bundle.js"></script></body></html>`);
  });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  await new Promise(resolve => server.listen(3032, '127.0.0.1', resolve));
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(base); await page.getByRole('heading', { name: 'Skills', exact: true }).waitFor(); await page.locator('[data-skill-id]').first().waitFor();
    assert.equal(await page.locator('[data-skill-id]').count(), 25);
    await page.getByRole('button', { name: 'Next', exact: true }).click(); assert.equal(await page.locator('[data-skill-id]').count(), 4);
    await page.getByRole('button', { name: 'Previous', exact: true }).click();
    assert.equal(await page.getByText('Risk', { exact: true }).count(), 2, 'Legacy duplicate IDs remain visible');
    await page.locator('#skill-name').fill('A'.repeat(101)); assert.equal((await page.locator('#skill-name').inputValue()).length, 100);
    await page.locator('#skill-name').fill('Custom Admin Skill'); await page.getByRole('button', { name: 'Save skill', exact: true }).click(); await page.getByText('Skill saved', { exact: true }).waitFor();
    await page.getByLabel('Search skills', { exact: true }).fill('Custom Admin Skill');
    const created = page.locator('tr').filter({ has: page.getByText('Custom Admin Skill', { exact: true }) }); await created.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('#skill-name').fill('Updated Admin Skill'); await page.getByLabel('Available in suggestions', { exact: true }).uncheck(); await page.getByRole('button', { name: 'Save skill', exact: true }).click();
    await page.getByLabel('Search skills', { exact: true }).fill('Updated Admin Skill'); const updated = page.locator('tr').filter({ has: page.getByText('Updated Admin Skill', { exact: true }) }); await updated.getByText('Inactive', { exact: true }).waitFor(); await updated.getByRole('button', { name: 'Activate', exact: true }).click(); await updated.getByText('Active', { exact: true }).waitFor();
    console.log('PASS catalog pagination, legacy IDs, name cap, add, edit and availability');
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Catalog page overflow at ' + width);
      const table = page.locator('table');
      assert.ok(await table.locator('th').first().evaluate(element => element.getBoundingClientRect().width >= 192), 'Readable catalog name column');
      if (width < 400) {
        const wrapper = table.locator('..');
        assert.equal(await wrapper.evaluate(element => element.scrollWidth > element.clientWidth), true, 'Catalog scroll stays inside table wrapper');
        await wrapper.evaluate(element => { element.scrollLeft = element.scrollWidth; });
        const action = await table.getByRole('button', { name: 'Deactivate', exact: true }).boundingBox();
        assert.ok(action && action.x >= 0 && action.x + action.width <= width, 'Catalog actions reachable by local scrolling');
        await wrapper.evaluate(element => { element.scrollLeft = 0; });
      }
      await page.screenshot({ path: path.join(output, `skills-search-admin-catalog-${width}.png`), fullPage: true });
    }
    await page.getByRole('tab', { name: 'Review submissions', exact: true }).click();
    await page.getByText('Novel Risk skill', { exact: true }).waitFor();
    await page.locator('tr').filter({ has: page.getByText('Novel Risk skill', { exact: true }) }).getByRole('button', { name: 'Review', exact: true }).click();
    await page.getByRole('button', { name: 'Approve', exact: true }).click(); await page.getByText('Review saved. Candidate profiles are unchanged.', { exact: true }).waitFor();
    await page.locator('tr').filter({ has: page.getByText('C plus plus', { exact: true }) }).getByRole('button', { name: 'Review', exact: true }).click(); await page.locator('#skill-review-mode').selectOption('existing'); await page.locator('#skill-review-target').selectOption(id(3)); await page.getByRole('button', { name: 'Approve', exact: true }).click(); await page.getByText('No pending submissions found.', { exact: true }).waitFor();
    assert.equal(catalog.find(row => row._id === id(3)).active, true);
    await page.locator('#skill-review-status').selectOption('approved'); await page.getByText('Novel Risk skill', { exact: true }).waitFor(); await page.locator('tr').filter({ has: page.getByText('Novel Risk skill', { exact: true }) }).getByRole('button', { name: 'Review again', exact: true }).click(); await page.getByRole('button', { name: 'Reject', exact: true }).click();
    await page.locator('#skill-review-status').selectOption('rejected'); await page.getByText('Novel Risk skill', { exact: true }).waitFor(); await page.locator('tr').filter({ has: page.getByText('Novel Risk skill', { exact: true }) }).getByRole('button', { name: 'Review again', exact: true }).click(); await page.getByRole('button', { name: 'Reopen', exact: true }).click(); await page.locator('#skill-review-status').selectOption('pending'); await page.getByText('Novel Risk skill', { exact: true }).waitFor();
    console.log('PASS new approval, existing link/reactivation, rejection and reopening');
    await page.locator('tr').filter({ has: page.getByText('Novel Risk skill', { exact: true }) }).getByRole('button', { name: 'Review', exact: true }).click();
    await page.locator('#skill-review-name').fill('A'.repeat(101)); assert.equal((await page.locator('#skill-review-name').inputValue()).length, 100);
    await page.locator('#skill-review-name').fill('Novel Risk skill');
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.screenshot({ path: path.join(output, `skills-search-admin-review-${width}.png`), fullPage: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No page overflow at ' + width);
      assert.ok(await page.locator('table th').first().evaluate(element => element.getBoundingClientRect().width >= 192), 'Readable review name column');
      if (width < 400) {
        const wrapper = page.locator('table').locator('..');
        assert.equal(await wrapper.evaluate(element => element.scrollWidth > element.clientWidth), true, 'Review scroll stays inside table wrapper');
        await wrapper.evaluate(element => { element.scrollLeft = element.scrollWidth; });
        const action = await page.locator('table').getByRole('button', { name: 'Review', exact: true }).boundingBox();
        assert.ok(action && action.x >= 0 && action.x + action.width <= width, 'Review action reachable by local scrolling');
        await wrapper.evaluate(element => { element.scrollLeft = 0; });
      }
    }
    console.log('PASS review form name cap and layout at 320/390/768/1280px');
    failManage = true; await page.goto(base); await page.getByText('Fixture catalog unavailable', { exact: true }).waitFor(); failManage = false; await page.getByRole('button', { name: 'Try again', exact: true }).click(); await page.locator('[data-skill-id]').first().waitFor();
    console.log('PASS catalog failure/retry');
    const before = reads.length; await page.goto(base + '/?guest'); await page.getByText('Please sign in to manage skills.', { exact: true }).waitFor(); assert.equal(reads.length, before);
    assert.deepEqual(errors, []);
    assert.ok(reads.every(value => value.startsWith('/api/v1/skill/manage') || value.startsWith('/api/v1/skill/submissions')), 'Admin never relies on deduplicated public catalog');
    assert.ok(writes.every(row => !('country' in row.body) && !('skills' in row.body)));
    assert.deepEqual(writes.filter(row => row.body.action === 'reject' || row.body.action === 'reopen').map(row => Object.keys(row.body).sort()), [['action', 'key'], ['action', 'key']]);
    fs.writeFileSync(path.join(output, 'skills-search-admin-browser-summary.json'), JSON.stringify({ pageErrors: errors, writes, reads }, null, 2));
    console.log('PASS guest gate, authenticated contracts and zero browser errors');
  } catch (error) {
    await page.screenshot({ path: path.join(output, 'skills-search-admin-browser-failure.png'), fullPage: true }); console.error(await page.locator('body').innerText()); throw error;
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
