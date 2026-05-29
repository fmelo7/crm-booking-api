const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

test('repository scaffold is buildable in isolation', () => {
  assert.equal(fs.existsSync('README.md'), true);
  assert.equal(fs.existsSync('package-lock.json'), true);

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(packageJson.private, true);
  assert.equal(typeof packageJson.scripts.test, 'string');
  assert.equal(typeof packageJson.scripts.build, 'string');
});

test('frontend seed contains real static assets and nginx gateway proxy', () => {
  const requiredAssets = [
    'public/index.html',
    'public/app.js',
    'public/styles.css',
    'nginx.conf',
  ];
  const missing = requiredAssets.filter((file) => !fs.existsSync(file));
  const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
  const nginx = fs.readFileSync('nginx.conf', 'utf8');
  const html = fs.readFileSync('public/index.html', 'utf8');

  assert.deepEqual(missing, []);
  assert.match(dockerfile, /^FROM nginx:/m);
  assert.match(dockerfile, /COPY public\/ \/usr\/share\/nginx\/html\//);
  assert.match(nginx, /location \/api\//);
  assert.match(nginx, /proxy_pass http:\/\/api:3000/);
  assert.match(html, /<script src="\/app\.js"><\/script>/);
  assert.match(html, /<link rel="stylesheet" href="\/styles\.css">/);
});

test('frontend fetches only gateway api paths', () => {
  const app = fs.readFileSync('public/app.js', 'utf8');
  const fetchCalls = [...app.matchAll(/fetch\(([^,\n)]+)/g)].map((match) => match[1].trim());
  const apiCalls = [...app.matchAll(/\bapi\(\s*([`'"][^`'"]+)/g)]
    .map((match) => match[1].slice(1));
  const directFetchViolations = fetchCalls.filter((arg) => arg !== 'path');
  const apiPathViolations = apiCalls.filter((arg) => !arg.startsWith('/api/'));

  assert.deepEqual(directFetchViolations, []);
  assert.deepEqual(apiPathViolations, []);
  assert.equal(/https?:\/\//.test(app), false);
});
