const test = require('node:test');
const assert = require('node:assert/strict');
const loadWithMocks = require('../helpers/load-with-mocks');
const createStub = require('../helpers/stub');

const servicePath = '../../src/modules/customer/customer.service';
const modelPath = '../../src/modules/customer/customer.model';

const loadService = (model) => loadWithMocks(servicePath, {
  [modelPath]: model,
});

test('customer service creates a customer when name is present', async () => {
  const customer = { _id: 'customer-id', name: 'Maria Silva' };
  const model = {
    create: createStub(async (data) => ({ _id: 'customer-id', ...data })),
  };
  const service = loadService(model);

  const result = await service.createCustomer({ name: 'Maria Silva' });

  assert.deepEqual(result, customer);
  assert.deepEqual(model.create.calls, [[{ name: 'Maria Silva' }]]);
});

test('customer service rejects creation without name', async () => {
  const model = {
    create: createStub(),
  };
  const service = loadService(model);

  await assert.rejects(
    () => service.createCustomer({}),
    { status: 400, message: 'Nome do cliente é obrigatório' }
  );
  assert.equal(model.create.calls.length, 0);
});

test('customer service lists customers with search and pagination', async () => {
  const customers = [{ _id: 'customer-id', name: 'Maria Silva' }];
  const limit = createStub(async () => customers);
  const skip = createStub(() => ({ limit }));
  const sort = createStub(() => ({ skip }));
  const model = {
    find: createStub(() => ({ sort })),
    countDocuments: createStub(async () => 1),
  };
  const service = loadService(model);

  const result = await service.getCustomers({ search: 'maria', page: 2, limit: 5 });

  assert.deepEqual(model.find.calls[0][0].$or.map((item) => Object.keys(item)[0]), ['name', 'email', 'phone']);
  assert.deepEqual(sort.calls, [[{ name: 1 }]]);
  assert.deepEqual(skip.calls, [[5]]);
  assert.deepEqual(limit.calls, [[5]]);
  assert.deepEqual(model.countDocuments.calls[0], model.find.calls[0]);
  assert.deepEqual(result, {
    data: customers,
    pagination: {
      page: 2,
      limit: 5,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: true,
    },
  });
});

test('customer service returns 404 when customer is not found', async () => {
  const model = {
    findById: createStub(async () => null),
  };
  const service = loadService(model);

  await assert.rejects(
    () => service.getCustomerById('missing-id'),
    { status: 404, message: 'Cliente não encontrado' }
  );
});

test('customer service updates with validators enabled', async () => {
  const updated = { _id: 'customer-id', name: 'Maria Atualizada' };
  const model = {
    findByIdAndUpdate: createStub(async () => updated),
  };
  const service = loadService(model);

  const result = await service.updateCustomer('customer-id', { name: 'Maria Atualizada' });

  assert.equal(result, updated);
  assert.deepEqual(model.findByIdAndUpdate.calls, [[
    'customer-id',
    { name: 'Maria Atualizada' },
    { new: true, runValidators: true },
  ]]);
});

test('customer service deletes an existing customer', async () => {
  const deleted = { _id: 'customer-id', name: 'Maria Silva' };
  const model = {
    findByIdAndDelete: createStub(async () => deleted),
  };
  const service = loadService(model);

  const result = await service.deleteCustomer('customer-id');

  assert.equal(result, deleted);
  assert.deepEqual(model.findByIdAndDelete.calls, [['customer-id']]);
});
