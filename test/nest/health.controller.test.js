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

test('Nest health controller returns degraded when database is disconnected', async () => {
  expressApp.set('dbConnected', false);

  const response = await request(expressApp)
    .get('/api/health')
    .expect(503);

  assert.equal(response.body.status, 'degraded');
  assert.equal(response.body.dbConnected, false);
});

test('Nest health controller returns ok when database is connected', async () => {
  expressApp.set('dbConnected', true);

  const response = await request(expressApp)
    .get('/api/health')
    .expect(200);

  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.dbConnected, true);
});
