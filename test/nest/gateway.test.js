const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const createNestApp = require('../../src/nest/createNestApp');
const { isPublicPath } = require('../../apps/api/gateway');
const {
  getAppointmentsServiceUrl,
  getServiceUrl,
  SERVICE_PROXY_CONFIGS,
} = require('../../apps/api/serviceProxy');

let nestApp;
let expressApp;
const previousEnv = {
  GATEWAY_AUTH_MODE: process.env.GATEWAY_AUTH_MODE,
  GATEWAY_BEARER_TOKENS: process.env.GATEWAY_BEARER_TOKENS,
  GATEWAY_PUBLIC_PATHS: process.env.GATEWAY_PUBLIC_PATHS,
  APPOINTMENTS_SERVICE_URL: process.env.APPOINTMENTS_SERVICE_URL,
  CUSTOMERS_SERVICE_URL: process.env.CUSTOMERS_SERVICE_URL,
  SERVICES_SERVICE_URL: process.env.SERVICES_SERVICE_URL,
  PROFESSIONALS_SERVICE_URL: process.env.PROFESSIONALS_SERVICE_URL,
  INTERNAL_SERVICE_TOKEN: process.env.INTERNAL_SERVICE_TOKEN,
  APPOINTMENTS_SERVICE_INTERNAL_TOKEN: process.env.APPOINTMENTS_SERVICE_INTERNAL_TOKEN,
  CUSTOMERS_SERVICE_INTERNAL_TOKEN: process.env.CUSTOMERS_SERVICE_INTERNAL_TOKEN,
  SERVICES_SERVICE_INTERNAL_TOKEN: process.env.SERVICES_SERVICE_INTERNAL_TOKEN,
  PROFESSIONALS_SERVICE_INTERNAL_TOKEN: process.env.PROFESSIONALS_SERVICE_INTERNAL_TOKEN,
};
const originalFetch = global.fetch;

test.before(async () => {
  process.env.GATEWAY_AUTH_MODE = 'bearer';
  process.env.GATEWAY_BEARER_TOKENS = 'test-token';
  delete process.env.APPOINTMENTS_SERVICE_URL;
  delete process.env.CUSTOMERS_SERVICE_URL;
  delete process.env.SERVICES_SERVICE_URL;
  delete process.env.PROFESSIONALS_SERVICE_URL;
  delete process.env.INTERNAL_SERVICE_TOKEN;
  delete process.env.APPOINTMENTS_SERVICE_INTERNAL_TOKEN;
  delete process.env.CUSTOMERS_SERVICE_INTERNAL_TOKEN;
  delete process.env.SERVICES_SERVICE_INTERNAL_TOKEN;
  delete process.env.PROFESSIONALS_SERVICE_INTERNAL_TOKEN;
  delete process.env.GATEWAY_PUBLIC_PATHS;

  const app = await createNestApp();
  nestApp = app.nestApp;
  expressApp = app.expressApp;
});

test.after(async () => {
  if (nestApp) {
    await nestApp.close();
  }

  Object.entries(previousEnv).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
      return;
    }

    process.env[key] = value;
  });

  global.fetch = originalFetch;
});

test('gateway keeps health route public when bearer auth is enabled', async () => {
  expressApp.set('dbConnected', true);

  const response = await request(expressApp)
    .get('/api/health')
    .expect(200);

  assert.equal(response.headers['x-gateway-runtime'], 'api');
  assert.equal(response.body.status, 'ok');
});

test('gateway rejects protected api routes without bearer token', async () => {
  const response = await request(expressApp)
    .get('/api/customers')
    .expect(401);

  assert.equal(response.body.error.code, 'UNAUTHORIZED');
  assert.equal(response.body.error.message, 'Token de autenticação ausente ou inválido');
});

test('gateway public path matcher supports exact paths and prefixes', () => {
  assert.equal(isPublicPath('/api/health'), true);
  assert.equal(isPublicPath('/api-docs/'), true);
  assert.equal(isPublicPath('/api/customers'), false);
});

test('gateway resolves appointments service url from env', () => {
  process.env.APPOINTMENTS_SERVICE_URL = 'http://appointments-service:3001/';

  assert.equal(getAppointmentsServiceUrl(), 'http://appointments-service:3001');

  delete process.env.APPOINTMENTS_SERVICE_URL;
});

test('gateway has internal service routing for every backend domain', () => {
  process.env.CUSTOMERS_SERVICE_URL = 'http://customers-service:3002/';

  assert.deepEqual(
    Object.keys(SERVICE_PROXY_CONFIGS).sort(),
    ['appointments', 'customers', 'professionals', 'services']
  );
  assert.equal(getServiceUrl('customers'), 'http://customers-service:3002');

  delete process.env.CUSTOMERS_SERVICE_URL;
});

test('gateway proxies appointment routes to appointments service when configured', async () => {
  process.env.APPOINTMENTS_SERVICE_URL = 'http://appointments-service:3001';
  process.env.INTERNAL_SERVICE_TOKEN = 'internal-test-token';

  let proxiedRequest;
  global.fetch = async (url, options) => {
    proxiedRequest = { url, options };

    return new Response(JSON.stringify({ data: [{ id: 'appointment-id' }] }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  };

  const response = await request(expressApp)
    .get('/api/appointments?status=scheduled')
    .set('authorization', 'Bearer test-token')
    .set('x-trace-id', 'trace-gateway-test')
    .expect(200);

  assert.equal(proxiedRequest.url, 'http://appointments-service:3001/api/appointments?status=scheduled');
  assert.equal(proxiedRequest.options.method, 'GET');
  assert.equal(proxiedRequest.options.headers['x-request-id'], response.headers['x-request-id']);
  assert.equal(proxiedRequest.options.headers['x-trace-id'], 'trace-gateway-test');
  assert.equal(proxiedRequest.options.headers['x-internal-token'], 'internal-test-token');
  assert.equal(response.headers['x-gateway-target'], 'appointments-service');
  assert.deepEqual(response.body, { data: [{ id: 'appointment-id' }] });

  delete process.env.APPOINTMENTS_SERVICE_URL;
  global.fetch = originalFetch;
});

test('gateway proxies support service routes to their internal service when configured', async () => {
  process.env.CUSTOMERS_SERVICE_URL = 'http://customers-service:3002';
  process.env.CUSTOMERS_SERVICE_INTERNAL_TOKEN = 'customers-internal-token';

  let proxiedRequest;
  global.fetch = async (url, options) => {
    proxiedRequest = { url, options };

    return new Response(JSON.stringify({ data: [{ id: 'customer-id' }] }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });
  };

  const response = await request(expressApp)
    .get('/api/customers?search=Maria')
    .set('authorization', 'Bearer test-token')
    .expect(200);

  assert.equal(proxiedRequest.url, 'http://customers-service:3002/api/customers?search=Maria');
  assert.equal(proxiedRequest.options.headers['x-internal-token'], 'customers-internal-token');
  assert.equal(response.headers['x-gateway-target'], 'customers-service');
  assert.deepEqual(response.body, { data: [{ id: 'customer-id' }] });

  delete process.env.CUSTOMERS_SERVICE_URL;
  delete process.env.CUSTOMERS_SERVICE_INTERNAL_TOKEN;
  global.fetch = originalFetch;
});
