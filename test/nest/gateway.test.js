const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const createNestApp = require('../../src/nest/createNestApp');
const { isPublicPath } = require('../../apps/api/gateway');
const { getAppointmentsServiceUrl } = require('../../apps/api/serviceProxy');

let nestApp;
let expressApp;
const previousEnv = {
  GATEWAY_AUTH_MODE: process.env.GATEWAY_AUTH_MODE,
  GATEWAY_BEARER_TOKENS: process.env.GATEWAY_BEARER_TOKENS,
  GATEWAY_PUBLIC_PATHS: process.env.GATEWAY_PUBLIC_PATHS,
  APPOINTMENTS_SERVICE_URL: process.env.APPOINTMENTS_SERVICE_URL,
};
const originalFetch = global.fetch;

test.before(async () => {
  process.env.GATEWAY_AUTH_MODE = 'bearer';
  process.env.GATEWAY_BEARER_TOKENS = 'test-token';
  delete process.env.APPOINTMENTS_SERVICE_URL;
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
});

test('gateway proxies appointment routes to appointments service when configured', async () => {
  process.env.APPOINTMENTS_SERVICE_URL = 'http://appointments-service:3001';

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
    .expect(200);

  assert.equal(proxiedRequest.url, 'http://appointments-service:3001/api/appointments?status=scheduled');
  assert.equal(proxiedRequest.options.method, 'GET');
  assert.equal(proxiedRequest.options.headers['x-request-id'], response.headers['x-request-id']);
  assert.equal(response.headers['x-gateway-target'], 'appointments-service');
  assert.deepEqual(response.body, { data: [{ id: 'appointment-id' }] });

  delete process.env.APPOINTMENTS_SERVICE_URL;
  global.fetch = originalFetch;
});
