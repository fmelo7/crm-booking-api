const test = require('node:test');
const assert = require('node:assert/strict');
const loadWithMocks = require('../helpers/load-with-mocks');
const createStub = require('../helpers/stub');

const servicePath = '../../src/modules/service/service.service';
const repositoryPath = '../../src/modules/service/service.repository';
const appointmentRepositoryPath = '../../src/modules/appointment/appointment.repository';

const loadService = (repository, appointmentRepository = { existsForService: createStub(async () => null) }) => loadWithMocks(servicePath, {
  [repositoryPath]: repository,
  [appointmentRepositoryPath]: appointmentRepository,
});

test('service module creates a service when name is present', async () => {
  const created = { _id: 'service-id', name: 'Corte de cabelo' };
  const repository = {
    create: createStub(async (data) => ({ _id: 'service-id', ...data })),
  };
  const service = loadService(repository);

  const result = await service.createService({ name: 'Corte de cabelo' });

  assert.deepEqual(result, created);
  assert.deepEqual(repository.create.calls, [[{ name: 'Corte de cabelo' }]]);
});

test('service module rejects creation without name', async () => {
  const repository = {
    create: createStub(),
  };
  const service = loadService(repository);

  await assert.rejects(
    () => service.createService({}),
    { status: 400, message: 'Nome do serviço é obrigatório' }
  );
  assert.equal(repository.create.calls.length, 0);
});

test('service module lists services with search and pagination', async () => {
  const services = [{ _id: 'service-id', name: 'Corte de cabelo' }];
  const repository = {
    paginate: createStub(async () => ({ data: services, pagination: { total: 1 } })),
  };
  const service = loadService(repository);

  const result = await service.getServices({ search: 'corte', page: 1, limit: 10 });

  assert.deepEqual(repository.paginate.calls[0][0].$or.map((item) => Object.keys(item)[0]), ['name', 'description']);
  assert.deepEqual(repository.paginate.calls[0][1], { page: 1, limit: 10, sort: { name: 1 } });
  assert.equal(result.pagination.total, 1);
});

test('service module returns 404 when service is not found', async () => {
  const repository = {
    findById: createStub(async () => null),
  };
  const service = loadService(repository);

  await assert.rejects(
    () => service.getServiceById('missing-id'),
    { status: 404, message: 'Serviço não encontrado' }
  );
});

test('service module updates with validators enabled', async () => {
  const updated = { _id: 'service-id', name: 'Barba' };
  const repository = {
    updateById: createStub(async () => updated),
  };
  const service = loadService(repository);

  const result = await service.updateService('service-id', { name: 'Barba' });

  assert.equal(result, updated);
  assert.deepEqual(repository.updateById.calls, [[
    'service-id',
    { name: 'Barba' },
  ]]);
});

test('service module deletes an existing service', async () => {
  const deleted = { _id: 'service-id', name: 'Corte de cabelo' };
  const repository = {
    deleteById: createStub(async () => deleted),
  };
  const appointmentRepository = {
    existsForService: createStub(async () => null),
  };
  const service = loadService(repository, appointmentRepository);

  const result = await service.deleteService('service-id');

  assert.equal(result, deleted);
  assert.deepEqual(appointmentRepository.existsForService.calls, [['service-id']]);
  assert.deepEqual(repository.deleteById.calls, [['service-id']]);
});

test('service module blocks deleting a service linked to appointments', async () => {
  const repository = {
    deleteById: createStub(),
  };
  const appointmentRepository = {
    existsForService: createStub(async () => ({ _id: 'appointment-id' })),
  };
  const service = loadService(repository, appointmentRepository);

  await assert.rejects(
    () => service.deleteService('service-id'),
    { status: 409, message: 'Serviço possui agendamentos vinculados e não pode ser removido' }
  );
  assert.deepEqual(appointmentRepository.existsForService.calls, [['service-id']]);
  assert.equal(repository.deleteById.calls.length, 0);
});
