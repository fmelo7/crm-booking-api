const test = require('node:test');
const assert = require('node:assert/strict');
const loadWithMocks = require('../helpers/load-with-mocks');
const createStub = require('../helpers/stub');

const servicePath = '../../src/modules/professional/professional.service';
const repositoryPath = '../../src/modules/professional/professional.repository';
const appointmentRepositoryPath = '../../src/modules/appointment/appointment.repository';

const loadService = (repository, appointmentRepository = { existsForProfessional: createStub(async () => null) }) => loadWithMocks(servicePath, {
  [repositoryPath]: repository,
  [appointmentRepositoryPath]: appointmentRepository,
});

test('professional service creates a professional when required fields are present', async () => {
  const created = { _id: 'professional-id', name: 'Ana Souza', category: 'Cabeleireira' };
  const repository = {
    create: createStub(async (data) => ({ _id: 'professional-id', ...data })),
  };
  const service = loadService(repository);

  const result = await service.createProfessional({ name: 'Ana Souza', category: 'Cabeleireira' });

  assert.deepEqual(result, created);
  assert.deepEqual(repository.create.calls, [[{ name: 'Ana Souza', category: 'Cabeleireira' }]]);
});

test('professional service rejects creation without name or category', async () => {
  const repository = {
    create: createStub(),
  };
  const service = loadService(repository);

  await assert.rejects(
    () => service.createProfessional({ name: 'Ana Souza' }),
    { status: 400, message: 'Nome e categoria são obrigatórios' }
  );
  assert.equal(repository.create.calls.length, 0);
});

test('professional service lists professionals with search and pagination', async () => {
  const professionals = [{ _id: 'professional-id', name: 'Ana Souza' }];
  const repository = {
    paginate: createStub(async () => ({ data: professionals, pagination: { total: 1 } })),
  };
  const service = loadService(repository);

  const result = await service.getProfessionals({ search: 'ana', page: 1, limit: 10 });

  assert.deepEqual(repository.paginate.calls[0][0].$or.map((item) => Object.keys(item)[0]), ['name', 'category', 'email', 'phone']);
  assert.deepEqual(repository.paginate.calls[0][1], { page: 1, limit: 10, sort: { name: 1 } });
  assert.equal(result.pagination.total, 1);
});

test('professional service returns 404 when professional is not found', async () => {
  const repository = {
    findById: createStub(async () => null),
  };
  const service = loadService(repository);

  await assert.rejects(
    () => service.getProfessionalById('missing-id'),
    { status: 404, message: 'Profissional não encontrado' }
  );
});

test('professional service updates with validators enabled', async () => {
  const updated = { _id: 'professional-id', name: 'Ana Atualizada', category: 'Cabeleireira' };
  const repository = {
    updateById: createStub(async () => updated),
  };
  const service = loadService(repository);

  const result = await service.updateProfessional('professional-id', { name: 'Ana Atualizada' });

  assert.equal(result, updated);
  assert.deepEqual(repository.updateById.calls, [[
    'professional-id',
    { name: 'Ana Atualizada' },
  ]]);
});

test('professional service deletes an existing professional', async () => {
  const deleted = { _id: 'professional-id', name: 'Ana Souza' };
  const repository = {
    deleteById: createStub(async () => deleted),
  };
  const appointmentRepository = {
    existsForProfessional: createStub(async () => null),
  };
  const service = loadService(repository, appointmentRepository);

  const result = await service.deleteProfessional('professional-id');

  assert.equal(result, deleted);
  assert.deepEqual(appointmentRepository.existsForProfessional.calls, [['professional-id']]);
  assert.deepEqual(repository.deleteById.calls, [['professional-id']]);
});

test('professional service blocks deleting a professional linked to appointments', async () => {
  const repository = {
    deleteById: createStub(),
  };
  const appointmentRepository = {
    existsForProfessional: createStub(async () => ({ _id: 'appointment-id' })),
  };
  const service = loadService(repository, appointmentRepository);

  await assert.rejects(
    () => service.deleteProfessional('professional-id'),
    { status: 409, message: 'Profissional possui agendamentos vinculados e não pode ser removido' }
  );
  assert.deepEqual(appointmentRepository.existsForProfessional.calls, [['professional-id']]);
  assert.equal(repository.deleteById.calls.length, 0);
});
