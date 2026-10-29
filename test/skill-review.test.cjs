const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/skill-management.ts'), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
const scope = { exports: {} };
vm.runInNewContext(code, scope);
const { skillReviewBody } = scope.exports;
const plain = value => JSON.parse(JSON.stringify(value));
const values = { key: 'a'.repeat(64), action: 'approve', mode: 'new', name: '  Senior   Risk C++  ', skillId: 'b'.repeat(24) };

test('approval as a new skill normalizes name and excludes link identifiers', () => {
  assert.deepEqual(plain(skillReviewBody(values)), { key: values.key, action: 'approve', name: 'Senior Risk C++' });
  assert.throws(() => skillReviewBody({ ...values, name: ' ' }), /skill name/);
  assert.throws(() => skillReviewBody({ ...values, name: 'A'.repeat(101) }), /100/);
  assert.equal(skillReviewBody({ ...values, name: 'A'.repeat(100) }).name.length, 100);
});
test('link approval carries only the selected catalog ID and validates it', () => {
  assert.deepEqual(plain(skillReviewBody({ ...values, mode: 'existing' })), { key: values.key, action: 'approve', skillId: values.skillId });
  for (const skillId of ['', 'invalid', 'a'.repeat(23)]) assert.throws(() => skillReviewBody({ ...values, mode: 'existing', skillId }), /catalog skill/);
});
test('reject and reopen do not accidentally add a skill or link stale approval fields', () => {
  for (const action of ['reject', 'reopen']) {
    assert.deepEqual(plain(skillReviewBody({ ...values, action })), { key: values.key, action });
  }
  assert.throws(() => skillReviewBody({ ...values, key: 'invalid' }), /submission/);
});
