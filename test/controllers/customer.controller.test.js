const test = require('node:test');
const assert = require('node:assert/strict');
const loadWithMocks = require('../helpers/load-with-mocks');
const createStub = require('../helpers/stub');
const { createResponse } = require('../helpers/http');

const controllerPath = '../../src/modules/customer/customer.controller';
const servicePath = '../../src/modules/customer/customer.service';

const loadController = (service) => loadWithMocks(controllerPath, {
  [servicePath]: service,
});

test('customer controller lists customers with query filters', async () => {
  const listResult = {
    data: [{ _id: 'customer-id', name: 'Maria Silva' }],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };
  const service = {
    getCustomers: createStub(async () => listResult),
  };
  const controller = loadController(service);
  const req = { query: { search: 'maria', page: 1 } };
  const res = createResponse();

  await controller.list(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body, listResult);
  assert.deepEqual(service.getCustomers.calls, [[req.query]]);
});

test('customer controller creates a customer with 201', async () => {
  const created = { _id: 'customer-id', name: 'Maria Silva' };
  const service = {
    createCustomer: createStub(async () => created),
  };
  const controller = loadController(service);
  const req = { body: { name: 'Maria Silva' } };
  const res = createResponse();

  await controller.create(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body, created);
  assert.deepEqual(service.createCustomer.calls, [[req.body]]);
});

test('customer controller removes a customer with 204', async () => {
  const service = {
    deleteCustomer: createStub(async () => ({ _id: 'customer-id' })),
  };
  const controller = loadController(service);
  const req = { params: { id: 'customer-id' } };
  const res = createResponse();

  await controller.remove(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.ended, true);
  assert.deepEqual(service.deleteCustomer.calls, [[req.params.id]]);
});
