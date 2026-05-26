const test = require('node:test');
const assert = require('node:assert/strict');
const ProfessionalProvider = require('../../src/nest/professional/professional.provider');

const createRepositoryStub = () => ({
  created: [],
  deletedIds: [],
  async create(data) {
    this.created.push(data);
    return { id: 'professional-id', _id: 'professional-id', ...data };
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
    return { id, _id: id, name: 'Ana Souza', category: 'Cabelo' };
  },
});

test('Nest professional provider creates using injected repository', async () => {
  const professionalRepository = createRepositoryStub();
  const appointmentRepository = { existsForProfessional: async () => false };
  const provider = new ProfessionalProvider(professionalRepository, appointmentRepository);

  const result = await provider.create({
    name: 'Ana Souza',
    category: 'Cabelo',
  });

  assert.equal(result.name, 'Ana Souza');
  assert.deepEqual(professionalRepository.created, [{
    name: 'Ana Souza',
    category: 'Cabelo',
  }]);
});

test('Nest professional provider blocks deletion when appointment repository finds links', async () => {
  const professionalRepository = createRepositoryStub();
  const appointmentRepository = { existsForProfessional: async () => true };
  const provider = new ProfessionalProvider(professionalRepository, appointmentRepository);

  await assert.rejects(
    () => provider.remove('professional-id'),
    {
      status: 409,
      message: 'Profissional possui agendamentos vinculados e não pode ser removido',
    }
  );
  assert.deepEqual(professionalRepository.deletedIds, []);
});
