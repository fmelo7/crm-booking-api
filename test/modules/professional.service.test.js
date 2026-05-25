const test = require('node:test');
const assert = require('node:assert/strict');
const loadWithMocks = require('../helpers/load-with-mocks');
const createStub = require('../helpers/stub');

const servicePath = '../../src/modules/professional/professional.service';
const modelPath = '../../src/modules/professional/professional.model';

const loadService = (model) => loadWithMocks(servicePath, {
  [modelPath]: model,
});

test('professional service creates a professional when required fields are present', async () => {
  const created = { _id: 'professional-id', name: 'Ana Souza', category: 'Cabeleireira' };
  const model = {
    create: createStub(async (data) => ({ _id: 'professional-id', ...data })),
  };
  const service = loadService(model);

  const result = await service.createProfessional({ name: 'Ana Souza', category: 'Cabeleireira' });

  assert.deepEqual(result, created);
  assert.deepEqual(model.create.calls, [[{ name: 'Ana Souza', category: 'Cabeleireira' }]]);
});

test('professional service rejects creation without name or category', async () => {
  const model = {
    create: createStub(),
  };
  const service = loadService(model);

  await assert.rejects(
    () => service.createProfessional({ name: 'Ana Souza' }),
    { status: 400, message: 'Nome e categoria são obrigatórios' }
  );
  assert.equal(model.create.calls.length, 0);
});

test('professional service lists professionals with search and pagination', async () => {
  const professionals = [{ _id: 'professional-id', name: 'Ana Souza' }];
  const limit = createStub(async () => professionals);
  const skip = createStub(() => ({ limit }));
  const sort = createStub(() => ({ skip }));
  const model = {
    find: createStub(() => ({ sort })),
    countDocuments: createStub(async () => 1),
  };
  const service = loadService(model);

  const result = await service.getProfessionals({ search: 'ana', page: 1, limit: 10 });

  assert.deepEqual(model.find.calls[0][0].$or.map((item) => Object.keys(item)[0]), ['name', 'category', 'email', 'phone']);
  assert.deepEqual(sort.calls, [[{ name: 1 }]]);
  assert.deepEqual(skip.calls, [[0]]);
  assert.deepEqual(limit.calls, [[10]]);
  assert.equal(result.pagination.total, 1);
});

test('professional service returns 404 when professional is not found', async () => {
  const model = {
    findById: createStub(async () => null),
  };
  const service = loadService(model);

  await assert.rejects(
    () => service.getProfessionalById('missing-id'),
    { status: 404, message: 'Profissional não encontrado' }
  );
});

test('professional service updates with validators enabled', async () => {
  const updated = { _id: 'professional-id', name: 'Ana Atualizada', category: 'Cabeleireira' };
  const model = {
    findByIdAndUpdate: createStub(async () => updated),
  };
  const service = loadService(model);

  const result = await service.updateProfessional('professional-id', { name: 'Ana Atualizada' });

  assert.equal(result, updated);
  assert.deepEqual(model.findByIdAndUpdate.calls, [[
    'professional-id',
    { name: 'Ana Atualizada' },
    { new: true, runValidators: true },
  ]]);
});

test('professional service deletes an existing professional', async () => {
  const deleted = { _id: 'professional-id', name: 'Ana Souza' };
  const model = {
    findByIdAndDelete: createStub(async () => deleted),
  };
  const service = loadService(model);

  const result = await service.deleteProfessional('professional-id');

  assert.equal(result, deleted);
  assert.deepEqual(model.findByIdAndDelete.calls, [['professional-id']]);
});
