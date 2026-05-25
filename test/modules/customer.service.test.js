const test = require('node:test');
const assert = require('node:assert/strict');
const loadWithMocks = require('../helpers/load-with-mocks');
const createStub = require('../helpers/stub');

const servicePath = '../../src/modules/customer/customer.service';
const repositoryPath = '../../src/modules/customer/customer.repository';
const appointmentRepositoryPath = '../../src/modules/appointment/appointment.repository';

const loadService = (repository, appointmentRepository = { existsForCustomer: createStub(async () => null) }) => loadWithMocks(servicePath, {
  [repositoryPath]: repository,
  [appointmentRepositoryPath]: appointmentRepository,
});

test('customer service creates a customer when name is present', async () => {
  const customer = { _id: 'customer-id', name: 'Maria Silva' };
  const repository = {
    create: createStub(async (data) => ({ _id: 'customer-id', ...data })),
  };
  const service = loadService(repository);

  const result = await service.createCustomer({ name: 'Maria Silva' });

  assert.deepEqual(result, customer);
  assert.deepEqual(repository.create.calls, [[{ name: 'Maria Silva' }]]);
});

test('customer service rejects creation without name', async () => {
  const repository = {
    create: createStub(),
  };
  const service = loadService(repository);

  await assert.rejects(
    () => service.createCustomer({}),
    { status: 400, message: 'Nome do cliente é obrigatório' }
  );
  assert.equal(repository.create.calls.length, 0);
});

test('customer service lists customers with search and pagination', async () => {
  const customers = [{ _id: 'customer-id', name: 'Maria Silva' }];
  const repository = {
    paginate: createStub(async () => ({
      data: customers,
      pagination: {
        page: 2,
        limit: 5,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    })),
  };
  const service = loadService(repository);

  const result = await service.getCustomers({ search: 'maria', page: 2, limit: 5 });

  assert.deepEqual(repository.paginate.calls[0][0].$or.map((item) => Object.keys(item)[0]), ['name', 'email', 'phone']);
  assert.deepEqual(repository.paginate.calls[0][1], { page: 2, limit: 5, sort: { name: 1 } });
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
  const repository = {
    findById: createStub(async () => null),
  };
  const service = loadService(repository);

  await assert.rejects(
    () => service.getCustomerById('missing-id'),
    { status: 404, message: 'Cliente não encontrado' }
  );
});

test('customer service updates with validators enabled', async () => {
  const updated = { _id: 'customer-id', name: 'Maria Atualizada' };
  const repository = {
    updateById: createStub(async () => updated),
  };
  const service = loadService(repository);

  const result = await service.updateCustomer('customer-id', { name: 'Maria Atualizada' });

  assert.equal(result, updated);
  assert.deepEqual(repository.updateById.calls, [[
    'customer-id',
    { name: 'Maria Atualizada' },
  ]]);
});

test('customer service deletes an existing customer', async () => {
  const deleted = { _id: 'customer-id', name: 'Maria Silva' };
  const repository = {
    deleteById: createStub(async () => deleted),
  };
  const appointmentRepository = {
    existsForCustomer: createStub(async () => null),
  };
  const service = loadService(repository, appointmentRepository);

  const result = await service.deleteCustomer('customer-id');

  assert.equal(result, deleted);
  assert.deepEqual(appointmentRepository.existsForCustomer.calls, [['customer-id']]);
  assert.deepEqual(repository.deleteById.calls, [['customer-id']]);
});

test('customer service blocks deleting a customer linked to appointments', async () => {
  const repository = {
    deleteById: createStub(),
  };
  const appointmentRepository = {
    existsForCustomer: createStub(async () => ({ _id: 'appointment-id' })),
  };
  const service = loadService(repository, appointmentRepository);

  await assert.rejects(
    () => service.deleteCustomer('customer-id'),
    { status: 409, message: 'Cliente possui agendamentos vinculados e não pode ser removido' }
  );
  assert.deepEqual(appointmentRepository.existsForCustomer.calls, [['customer-id']]);
  assert.equal(repository.deleteById.calls.length, 0);
});
