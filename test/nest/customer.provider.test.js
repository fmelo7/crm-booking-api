const test = require('node:test');
const assert = require('node:assert/strict');
const CustomerProvider = require('../../src/nest/customer/customer.provider');

const createRepositoryStub = () => ({
  created: [],
  deletedIds: [],
  async create(data) {
    this.created.push(data);
    return { id: 'customer-id', _id: 'customer-id', ...data };
  },
  async paginate() {
    return { data: [], pagination: { total: 0 } };
  },
  async findById() {
    return null;
  },
  async updateById() {
    return null;
  },
  async deleteById(id) {
    this.deletedIds.push(id);
    return { id, _id: id, name: 'Maria Silva' };
  },
});

test('Nest customer provider creates using injected repository', async () => {
  const customerRepository = createRepositoryStub();
  const appointmentRepository = { existsForCustomer: async () => false };
  const provider = new CustomerProvider(customerRepository, {
    existsForCustomer: (id) => appointmentRepository.existsForCustomer(id),
  });

  const result = await provider.create({ name: 'Maria Silva' });

  assert.equal(result.name, 'Maria Silva');
  assert.deepEqual(customerRepository.created, [{ name: 'Maria Silva' }]);
});

test('Nest customer provider blocks deletion when appointment repository finds links', async () => {
  const customerRepository = createRepositoryStub();
  const appointmentRepository = { existsForCustomer: async () => true };
  const provider = new CustomerProvider(customerRepository, appointmentRepository);

  await assert.rejects(
    () => provider.remove('customer-id'),
    {
      status: 409,
      message: 'Cliente possui agendamentos vinculados e não pode ser removido',
    }
  );
  assert.deepEqual(customerRepository.deletedIds, []);
});

test('Nest customer provider does not read appointments store in standalone service', async () => {
  const previousServiceName = process.env.SERVICE_NAME;
  process.env.SERVICE_NAME = 'customers-service';
  const customerRepository = createRepositoryStub();
  const provider = new CustomerProvider(customerRepository);

  try {
    await provider.remove('customer-id');
    assert.deepEqual(customerRepository.deletedIds, ['customer-id']);
  } finally {
    if (previousServiceName === undefined) {
      delete process.env.SERVICE_NAME;
    } else {
      process.env.SERVICE_NAME = previousServiceName;
    }
  }
});
