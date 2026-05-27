const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const createAppointmentsServiceApp = require('../../apps/appointments-service/createAppointmentsServiceApp');

let nestApp;
let expressApp;

test.before(async () => {
  const app = await createAppointmentsServiceApp();
  nestApp = app.nestApp;
  expressApp = app.expressApp;
});

test.after(async () => {
  if (nestApp) {
    await nestApp.close();
  }
});

test('appointments service has its own health check', async () => {
  expressApp.set('dbConnected', true);

  const response = await request(expressApp)
    .get('/api/health')
    .expect(200);

  assert.equal(response.body.status, 'ok');
});

test('appointments service exposes appointment routes', async () => {
  const response = await request(expressApp)
    .get('/api/appointments/availability')
    .expect(400);

  assert.equal(response.body.error.message, 'Professional inválido');
});

test('appointments service does not expose customer routes', async () => {
  const response = await request(expressApp)
    .get('/api/customers')
    .expect(404);

  assert.equal(response.body.error.status, 404);
});
