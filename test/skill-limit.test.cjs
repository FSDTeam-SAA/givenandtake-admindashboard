const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { z } = require('zod');

test('catalogue editing accepts the longest live skill and shares the profile limit', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/app/(admin-dashboard)/skills/_components/akillsPage.tsx'), 'utf8');
  const expression = source.match(/const skillSchema = (z\.object\(\{[\s\S]*?\}\))/)[1];
  const schema = vm.runInNewContext(expression, { z });
  for (const length of [50, 78, 100]) assert.equal(schema.safeParse({ name: 'A'.repeat(length) }).success, true);
  assert.equal(schema.safeParse({ name: 'A'.repeat(101) }).success, false);
  assert.match(source, /maxLength=\{100\}/);
});
