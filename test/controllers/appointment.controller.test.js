const test = require('node:test');
const assert = require('node:assert/strict');
const loadWithMocks = require('../helpers/load-with-mocks');
const createStub = require('../helpers/stub');
const { createResponse } = require('../helpers/http');

const controllerPath = '../../src/modules/appointment/appointment.controller';
const servicePath = '../../src/modules/appointment/appointment.service';

const loadController = (service) => loadWithMocks(controllerPath, {
  [servicePath]: service,
});

test('appointment controller lists appointments with filters', async () => {
  const listResult = {
    data: [{ _id: 'appointment-id' }],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };
  const service = {
    getAllAppointments: createStub(async () => listResult),
  };
  const controller = loadController(service);
  const req = { query: { professionalId: 'professional-id', from: '2030-01-01T00:00:00.000Z' } };
  const res = createResponse();

  await controller.list(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body, listResult);
  assert.deepEqual(service.getAllAppointments.calls, [[req.query]]);
});

test('appointment controller creates appointment with 201', async () => {
  const created = { _id: 'appointment-id' };
  const service = {
    createAppointment: createStub(async () => created),
  };
  const controller = loadController(service);
  const req = { body: { startAt: '2030-01-01T10:00:00.000Z' } };
  const res = createResponse();

  await controller.create(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body, created);
  assert.deepEqual(service.createAppointment.calls, [[req.body]]);
});

test('appointment controller passes availability query to service', async () => {
  const slots = [new Date('2030-01-01T10:00:00.000Z')];
  const service = {
    getAvailability: createStub(async () => slots),
  };
  const controller = loadController(service);
  const req = {
    query: {
      professionalId: 'professional-id',
      serviceId: 'service-id',
      date: '2030-01-01',
      durationMinutes: '90',
    },
  };
  const res = createResponse();

  await controller.getAvailability(req, res);

  assert.equal(res.body, slots);
  assert.deepEqual(service.getAvailability.calls, [[{
    professionalId: 'professional-id',
    serviceId: 'service-id',
    date: '2030-01-01',
    durationMinutes: 90,
  }]]);
});
