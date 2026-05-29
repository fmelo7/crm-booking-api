const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const test = require('node:test');
const createServicesServiceApp = require('../createServicesServiceApp');
const ServiceProvider = require('../src/nest/service/service.provider');

test('repository scaffold is buildable in isolation', () => {
  assert.equal(fs.existsSync('README.md'), true);
  assert.equal(fs.existsSync('package-lock.json'), true);

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.scripts.start, 'node server.js');
  assert.equal(typeof packageJson.scripts.test, 'string');
  assert.equal(typeof packageJson.scripts.build, 'string');
});

test('services service serves health and metrics without monorepo imports', async () => {
  const previousServiceName = process.env.SERVICE_NAME;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.SERVICE_NAME = 'services-service';
  process.env.NODE_ENV = 'test';

  const { nestApp, expressApp } = await createServicesServiceApp();
  expressApp.set('dbConnected', true);
  const server = http.createServer(expressApp);

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const health = await fetch(`http://127.0.0.1:${port}/api/health`);
    const metrics = await fetch(`http://127.0.0.1:${port}/api/metrics`);
    const swagger = await fetch(`http://127.0.0.1:${port}/api-docs/`);
    const openApi = await fetch(`http://127.0.0.1:${port}/api-docs/openapi.json`);

    assert.equal(health.status, 200);
    assert.equal((await health.json()).service, 'services-service');
    assert.equal(metrics.status, 200);
    assert.match(await metrics.text(), /http_requests_total/);
    assert.equal(swagger.status, 200);
    assert.match(await swagger.text(), /SwaggerUIBundle/);
    assert.equal(openApi.status, 200);
    assert.equal((await openApi.json()).info.title, 'Services Internal API');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await nestApp.close();

    if (previousServiceName === undefined) delete process.env.SERVICE_NAME;
    else process.env.SERVICE_NAME = previousServiceName;

    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});

test('service provider creates, lists, updates and removes in isolation', async () => {
  const records = [];
  let sequence = 1;
  const repository = {
    create: async (data) => {
      const item = { ...data, _id: String(sequence).padStart(24, '0') };
      sequence += 1;
      records.push(item);
      return item;
    },
    paginate: async () => ({
      data: records,
      pagination: { page: 1, limit: 20, total: records.length },
    }),
    findById: async (id) => records.find((item) => item._id === id),
    updateById: async (id, data) => {
      const item = records.find((record) => record._id === id);
      if (!item) return null;
      Object.assign(item, data);
      return item;
    },
    deleteById: async (id) => {
      const index = records.findIndex((record) => record._id === id);
      if (index < 0) return null;
      return records.splice(index, 1)[0];
    },
  };
  const provider = new ServiceProvider(repository);

  const created = await provider.create({ name: 'Corte', durationMinutes: 45, price: 120 });
  const listed = await provider.list({ page: 1, limit: 20 });
  const updated = await provider.update(created._id, { price: 130 });
  const removed = await provider.remove(created._id);

  assert.equal(created.name, 'Corte');
  assert.equal(listed.pagination.total, 1);
  assert.equal(updated.price, 130);
  assert.equal(removed._id, created._id);
  assert.equal(records.length, 0);
});
