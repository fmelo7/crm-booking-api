const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const createServicesServiceApp = require('../createServicesServiceApp');
const HealthState = require('../src/nest/health/health.state');
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
  const previousInternalServiceToken = process.env.INTERNAL_SERVICE_TOKEN;
  process.env.SERVICE_NAME = 'services-api';
  process.env.NODE_ENV = 'test';
  process.env.INTERNAL_SERVICE_TOKEN = 'test-internal-token';

  const { nestApp } = await createServicesServiceApp();
  nestApp.get(HealthState).setDatabaseConnected(true);

  await nestApp.listen(0);
  const { port } = nestApp.getHttpServer().address();

  try {
    const health = await fetch(`http://127.0.0.1:${port}/api/health`);
    const metrics = await fetch(`http://127.0.0.1:${port}/api/metrics`);
    const swagger = await fetch(`http://127.0.0.1:${port}/api-docs/`);
    const openApi = await fetch(`http://127.0.0.1:${port}/api-docs/openapi.json`);
    const swaggerCss = await fetch(`http://127.0.0.1:${port}/api-docs/swagger-ui.css`);
    const privateRouteWithoutToken = await fetch(`http://127.0.0.1:${port}/api/services`);
    const unknownRoute = await fetch(`http://127.0.0.1:${port}/api/unknown`, {
      headers: { 'x-internal-token': 'test-internal-token' },
    });

    assert.equal(health.status, 200);
    assert.equal((await health.json()).service, 'services-api');
    assert.equal(metrics.status, 200);
    assert.match(await metrics.text(), /http_requests_total/);
    assert.equal(swagger.status, 200);
    assert.match(await swagger.text(), /SwaggerUIBundle/);
    assert.equal(openApi.status, 200);
    assert.equal((await openApi.json()).info.title, 'Services Internal API');
    assert.equal(swaggerCss.status, 200);
    assert.match(await swaggerCss.text(), /swagger-ui/);
    assert.equal(privateRouteWithoutToken.status, 401);
    assert.equal((await privateRouteWithoutToken.json()).error.code, 'INTERNAL_UNAUTHORIZED');
    assert.equal(unknownRoute.status, 404);
    assert.equal((await unknownRoute.json()).error.code, 'NOT_FOUND');
  } finally {
    await nestApp.close();

    if (previousServiceName === undefined) delete process.env.SERVICE_NAME;
    else process.env.SERVICE_NAME = previousServiceName;

    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;

    if (previousInternalServiceToken === undefined) delete process.env.INTERNAL_SERVICE_TOKEN;
    else process.env.INTERNAL_SERVICE_TOKEN = previousInternalServiceToken;
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
