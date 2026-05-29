const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const test = require('node:test');
const createApiGatewayApp = require('../src/app');

test('repository scaffold is buildable in isolation', () => {
  assert.equal(fs.existsSync('README.md'), true);
  assert.equal(fs.existsSync('package-lock.json'), true);

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(packageJson.private, true);
  assert.equal(typeof packageJson.scripts.start, 'string');
  assert.equal(typeof packageJson.scripts.test, 'string');
  assert.equal(typeof packageJson.scripts.build, 'string');
});

test('api gateway serves health and metrics without monorepo imports', async () => {
  const previousServiceName = process.env.SERVICE_NAME;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.SERVICE_NAME = 'api-gateway';
  process.env.NODE_ENV = 'test';
  const app = createApiGatewayApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const health = await fetch(`http://127.0.0.1:${port}/api/health`);
    const metrics = await fetch(`http://127.0.0.1:${port}/api/metrics`);

    assert.equal(health.status, 200);
    assert.equal((await health.json()).service, 'api-gateway');
    assert.equal(metrics.status, 200);
    assert.match(await metrics.text(), /http_requests_total/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });

    if (previousServiceName === undefined) {
      delete process.env.SERVICE_NAME;
    } else {
      process.env.SERVICE_NAME = previousServiceName;
    }

    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
  }
});
