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

test('Nest professional controller returns standardized body validation errors', async () => {
  const response = await request(expressApp)
    .post('/api/professionals')
    .send({
      name: 'An',
      category: 'Cabelo',
    })
    .expect(400);

  assert.equal(response.body.error.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  assert.equal(response.body.error.message, 'Erro de validação');
  assert.equal(response.body.error.details[0].field, 'name');
});

test('Nest professional controller returns standardized param validation errors', async () => {
  const response = await request(expressApp)
    .get('/api/professionals/invalid')
    .expect(400);

  assert.equal(response.body.error.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  assert.equal(response.body.error.message, 'Erro de validação');
  assert.equal(response.body.error.details[0].field, 'id');
});
