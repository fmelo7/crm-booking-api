const test = require('node:test');
const assert = require('node:assert/strict');
const loadWithMocks = require('../helpers/load-with-mocks');
const createStub = require('../helpers/stub');

const servicePath = '../../src/modules/service/service.service';
const modelPath = '../../src/modules/service/service.model';

const loadService = (model) => loadWithMocks(servicePath, {
  [modelPath]: model,
});

test('service module creates a service when name is present', async () => {
  const created = { _id: 'service-id', name: 'Corte de cabelo' };
  const model = {
    create: createStub(async (data) => ({ _id: 'service-id', ...data })),
  };
  const service = loadService(model);

  const result = await service.createService({ name: 'Corte de cabelo' });

  assert.deepEqual(result, created);
  assert.deepEqual(model.create.calls, [[{ name: 'Corte de cabelo' }]]);
});

test('service module rejects creation without name', async () => {
  const model = {
    create: createStub(),
  };
  const service = loadService(model);

  await assert.rejects(
    () => service.createService({}),
    { status: 400, message: 'Nome do serviço é obrigatório' }
  );
  assert.equal(model.create.calls.length, 0);
});

test('service module lists services with search and pagination', async () => {
  const services = [{ _id: 'service-id', name: 'Corte de cabelo' }];
  const limit = createStub(async () => services);
  const skip = createStub(() => ({ limit }));
  const sort = createStub(() => ({ skip }));
  const model = {
    find: createStub(() => ({ sort })),
    countDocuments: createStub(async () => 1),
  };
  const service = loadService(model);

  const result = await service.getServices({ search: 'corte', page: 1, limit: 10 });

  assert.deepEqual(model.find.calls[0][0].$or.map((item) => Object.keys(item)[0]), ['name', 'description']);
  assert.deepEqual(sort.calls, [[{ name: 1 }]]);
  assert.deepEqual(skip.calls, [[0]]);
  assert.deepEqual(limit.calls, [[10]]);
  assert.equal(result.pagination.total, 1);
});

test('service module returns 404 when service is not found', async () => {
  const model = {
    findById: createStub(async () => null),
  };
  const service = loadService(model);

  await assert.rejects(
    () => service.getServiceById('missing-id'),
    { status: 404, message: 'Serviço não encontrado' }
  );
});

test('service module updates with validators enabled', async () => {
  const updated = { _id: 'service-id', name: 'Barba' };
  const model = {
    findByIdAndUpdate: createStub(async () => updated),
  };
  const service = loadService(model);

  const result = await service.updateService('service-id', { name: 'Barba' });

  assert.equal(result, updated);
  assert.deepEqual(model.findByIdAndUpdate.calls, [[
    'service-id',
    { name: 'Barba' },
    { new: true, runValidators: true },
  ]]);
});

test('service module deletes an existing service', async () => {
  const deleted = { _id: 'service-id', name: 'Corte de cabelo' };
  const model = {
    findByIdAndDelete: createStub(async () => deleted),
  };
  const service = loadService(model);

  const result = await service.deleteService('service-id');

  assert.equal(result, deleted);
  assert.deepEqual(model.findByIdAndDelete.calls, [['service-id']]);
});
