const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const createNestApp = require('../../src/nest/createNestApp');

let nestApp;
let expressApp;

test.before(async () => {
  const app = await createNestApp();
  nestApp = app.nestApp;
  expressApp = app.expressApp;
});

test.after(async () => {
  if (nestApp) {
    await nestApp.close();
  }
});

test('Nest appointment controller returns standardized body validation errors', async () => {
  const response = await request(expressApp)
    .post('/api/appointments')
    .send({
      customerId: 'invalid',
      serviceId: 'invalid',
      professionalId: 'invalid',
      startAt: 'not-a-date',
    })
    .expect(400);

  assert.equal(response.body.error.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  assert.equal(response.body.error.message, 'Erro de validação');
  assert.equal(response.body.error.details[0].field, 'serviceId');
});

test('Nest appointment controller returns standardized param validation errors', async () => {
  const response = await request(expressApp)
    .put('/api/appointments/invalid/reschedule')
    .send({ startAt: '2030-01-01T14:00:00.000Z' })
    .expect(400);

  assert.equal(response.body.error.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  assert.equal(response.body.error.message, 'Erro de validação');
  assert.equal(response.body.error.details[0].field, 'id');
});

test('Nest appointment controller keeps availability route ahead of id route', async () => {
  const response = await request(expressApp)
    .get('/api/appointments/availability')
    .expect(400);

  assert.equal(response.body.error.status, 400);
  assert.equal(response.body.error.message, 'Professional inválido');
});
