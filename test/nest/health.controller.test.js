const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createNestApp = require('../../src/nest/createNestApp');

let nestApp;
let expressApp;
const previousServiceName = process.env.SERVICE_NAME;

test.before(async () => {
  process.env.SERVICE_NAME = 'test-api';

  const app = await createNestApp();
  nestApp = app.nestApp;
  expressApp = app.expressApp;
});

test.after(async () => {
  if (nestApp) {
    await nestApp.close();
  }

  if (previousServiceName === undefined) {
    delete process.env.SERVICE_NAME;
  } else {
    process.env.SERVICE_NAME = previousServiceName;
  }
});

test('Nest health controller returns degraded when database is disconnected', async () => {
  expressApp.set('dbConnected', false);

  const response = await request(expressApp)
    .get('/api/health')
    .expect(503);

  assert.equal(response.body.status, 'degraded');
  assert.equal(response.body.dbConnected, false);
  assert.equal(response.body.service, 'test-api');
  assert.equal(response.body.requestId, response.headers['x-request-id']);
  assert.equal(response.body.traceId, response.headers['x-trace-id']);
});

test('Nest health controller returns ok when database is connected', async () => {
  expressApp.set('dbConnected', true);

  const response = await request(expressApp)
    .get('/api/health')
    .expect(200);

  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.dbConnected, true);
});

test('Nest health controller preserves incoming trace id', async () => {
  expressApp.set('dbConnected', true);

  const response = await request(expressApp)
    .get('/api/health')
    .set('x-trace-id', 'trace-health-test')
    .expect(200);

  assert.equal(response.headers['x-trace-id'], 'trace-health-test');
  assert.equal(response.body.traceId, 'trace-health-test');
});

test('Nest app serves the frontend from apps/frontend/public', async () => {
  const response = await request(expressApp)
    .get('/')
    .expect(200);

  assert.match(response.text, /<title>Sev365 Booking<\/title>/);
});
