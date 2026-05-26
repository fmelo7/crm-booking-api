const test = require('node:test');
const assert = require('node:assert/strict');
const ServiceProvider = require('../../src/nest/service/service.provider');

const createRepositoryStub = () => ({
  created: [],
  deletedIds: [],
  async create(data) {
    this.created.push(data);
    return { id: 'service-id', _id: 'service-id', ...data };
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
    return { id, _id: id, name: 'Corte completo' };
  },
});

test('Nest service provider creates using injected repository', async () => {
  const serviceRepository = createRepositoryStub();
  const appointmentRepository = { existsForService: async () => false };
  const provider = new ServiceProvider(serviceRepository, appointmentRepository);

  const result = await provider.create({
    name: 'Corte completo',
    durationMinutes: 60,
    price: 120,
  });

  assert.equal(result.name, 'Corte completo');
  assert.deepEqual(serviceRepository.created, [{
    name: 'Corte completo',
    durationMinutes: 60,
    price: 120,
  }]);
});

test('Nest service provider blocks deletion when appointment repository finds links', async () => {
  const serviceRepository = createRepositoryStub();
  const appointmentRepository = { existsForService: async () => true };
  const provider = new ServiceProvider(serviceRepository, appointmentRepository);

  await assert.rejects(
    () => provider.remove('service-id'),
    {
      status: 409,
      message: 'Serviço possui agendamentos vinculados e não pode ser removido',
    }
  );
  assert.deepEqual(serviceRepository.deletedIds, []);
});
