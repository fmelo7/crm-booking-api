const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const createCustomersServiceApp = require('../../apps/customers-service/createCustomersServiceApp');
const createServicesServiceApp = require('../../apps/services-service/createServicesServiceApp');
const createProfessionalsServiceApp = require('../../apps/professionals-service/createProfessionalsServiceApp');

const serviceCases = [
  {
    name: 'customers-service',
    createApp: createCustomersServiceApp,
    ownRoute: '/api/customers/invalid',
    ownExpectedStatus: 400,
    absentRoute: '/api/services',
  },
  {
    name: 'services-service',
    createApp: createServicesServiceApp,
    ownRoute: '/api/services/invalid',
    ownExpectedStatus: 400,
    absentRoute: '/api/professionals',
  },
  {
    name: 'professionals-service',
    createApp: createProfessionalsServiceApp,
    ownRoute: '/api/professionals/invalid',
    ownExpectedStatus: 400,
    absentRoute: '/api/customers',
  },
];

serviceCases.forEach(({ name, createApp, ownRoute, ownExpectedStatus, absentRoute }) => {
  test(`${name} has health and exposes only its domain routes`, async () => {
    const { nestApp, expressApp } = await createApp();

    try {
      expressApp.set('dbConnected', true);

      const healthResponse = await request(expressApp)
        .get('/api/health')
        .expect(200);

      assert.equal(healthResponse.body.status, 'ok');

      const metricsResponse = await request(expressApp)
        .get('/api/metrics')
        .expect(200);

      assert.match(metricsResponse.text, /http_requests_total/);

      const domainResponse = await request(expressApp)
        .get(ownRoute)
        .expect(ownExpectedStatus);

      assert.equal(domainResponse.body.error.status, ownExpectedStatus);

      const absentResponse = await request(expressApp)
        .get(absentRoute)
        .expect(404);

      assert.equal(absentResponse.body.error.status, 404);
    } finally {
      await nestApp.close();
    }
  });
});
