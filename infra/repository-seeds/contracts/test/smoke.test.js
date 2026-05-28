const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('contracts repository is buildable in isolation', () => {
  assert.equal(fs.existsSync('README.md'), true);
  assert.equal(fs.existsSync('package-lock.json'), true);
  assert.equal(fs.existsSync('docs/breaking-changes.md'), true);
  assert.equal(fs.existsSync('CHANGELOG.md'), true);

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(packageJson.private, true);
  assert.equal(typeof packageJson.scripts.test, 'string');
  assert.equal(typeof packageJson.scripts['test:contracts'], 'string');
  assert.equal(typeof packageJson.scripts.build, 'string');
});
