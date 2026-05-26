const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const createNestApp = require('../../src/nest/createNestApp');
const Customer = require('../../src/modules/customer/customer.model');
const Service = require('../../src/modules/service/service.model');
const Professional = require('../../src/modules/professional/professional.model');
const Appointment = require('../../src/modules/appointment/appointment.model');

let app;
let mongo;
let nestApp;

test.before(async () => {
  mongo = await MongoMemoryServer.create({
    instance: {
      ip: '127.0.0.1',
    },
  });
  await mongoose.connect(mongo.getUri());
  const createdApp = await createNestApp();
  nestApp = createdApp.nestApp;
  app = createdApp.expressApp;
  app.set('dbConnected', true);
});

test.after(async () => {
  if (nestApp) {
    await nestApp.close();
  }
  await mongoose.disconnect();
  if (mongo) {
    await mongo.stop();
  }
});

test.beforeEach(async () => {
  await Promise.all([
    Customer.deleteMany({}),
    Service.deleteMany({}),
    Professional.deleteMany({}),
    Appointment.deleteMany({}),
  ]);
});

const createFixture = async ({ durationMinutes = 90 } = {}) => {
  const [customer, service, professional] = await Promise.all([
    Customer.create({
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '11999999999',
    }),
    Service.create({
      name: 'Corte completo',
      durationMinutes,
      price: 120,
    }),
    Professional.create({
      name: 'Ana Souza',
      category: 'Cabelo',
      email: 'ana@example.com',
      phone: '11888888888',
    }),
  ]);

  return { customer, service, professional };
};

test('POST /api/appointments creates an appointment with real service duration', async () => {
  const { customer, service, professional } = await createFixture({ durationMinutes: 90 });

  const response = await request(app)
    .post('/api/appointments')
    .send({
      customerId: customer.id,
      serviceId: service.id,
      professionalId: professional.id,
      startAt: '2030-01-01T14:00:00.000Z',
      notes: 'Cliente pediu encaixe',
    })
    .expect(201);

  assert.equal(response.body.customer, customer.id);
  assert.equal(response.body.service, service.id);
  assert.equal(response.body.professional, professional.id);
  assert.equal(response.body.id, response.body._id);
  assert.equal(response.body.status, 'scheduled');
  assert.equal(response.body.endAt, '2030-01-01T15:30:00.000Z');
});

test('POST /api/appointments rejects real schedule conflicts', async () => {
  const { customer, service, professional } = await createFixture({ durationMinutes: 90 });

  await request(app)
    .post('/api/appointments')
    .send({
      customerId: customer.id,
      serviceId: service.id,
      professionalId: professional.id,
      startAt: '2030-01-01T14:00:00.000Z',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/appointments')
    .send({
      customerId: customer.id,
      serviceId: service.id,
      professionalId: professional.id,
      startAt: '2030-01-01T15:00:00.000Z',
    })
    .expect(409);

  assert.equal(response.body.error.status, 409);
  assert.equal(response.body.error.message, 'Horário ocupado');
  assert.equal(await Appointment.countDocuments(), 1);
});

test('GET /api/appointments filters by date range and professional', async () => {
  const { customer, service, professional } = await createFixture({ durationMinutes: 60 });
  const otherProfessional = await Professional.create({
    name: 'Bia Lima',
    category: 'Unhas',
  });

  await Appointment.create([
    {
      customer: customer.id,
      service: service.id,
      professional: professional.id,
      startAt: new Date('2030-01-02T10:00:00.000Z'),
      endAt: new Date('2030-01-02T11:00:00.000Z'),
      status: 'scheduled',
    },
    {
      customer: customer.id,
      service: service.id,
      professional: otherProfessional.id,
      startAt: new Date('2030-01-02T12:00:00.000Z'),
      endAt: new Date('2030-01-02T13:00:00.000Z'),
      status: 'scheduled',
    },
  ]);

  const response = await request(app)
    .get('/api/appointments')
    .query({
      from: '2030-01-02T00:00:00.000Z',
      to: '2030-01-02T23:59:59.999Z',
      professionalId: professional.id,
      page: 1,
      limit: 10,
    })
    .expect(200);

  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].id, response.body.data[0]._id);
  assert.equal(response.body.data[0].professional._id, professional.id);
  assert.equal(response.body.data[0].professional.id, professional.id);
  assert.deepEqual(response.body.pagination, {
    page: 1,
    limit: 10,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
});

test('DELETE /api resources rejects removing records linked to appointments', async () => {
  const { customer, service, professional } = await createFixture({ durationMinutes: 60 });

  await Appointment.create({
    customer: customer.id,
    service: service.id,
    professional: professional.id,
    startAt: new Date('2030-01-02T10:00:00.000Z'),
    endAt: new Date('2030-01-02T11:00:00.000Z'),
    status: 'scheduled',
  });

  const cases = [
    [`/api/customers/${customer.id}`, 'Cliente possui agendamentos vinculados e não pode ser removido'],
    [`/api/services/${service.id}`, 'Serviço possui agendamentos vinculados e não pode ser removido'],
    [`/api/professionals/${professional.id}`, 'Profissional possui agendamentos vinculados e não pode ser removido'],
  ];

  for (const [path, message] of cases) {
    const response = await request(app)
      .delete(path)
      .expect(409);

    assert.equal(response.body.error.status, 409);
    assert.equal(response.body.error.message, message);
  }

  assert.equal(await Customer.exists({ _id: customer.id }).then(Boolean), true);
  assert.equal(await Service.exists({ _id: service.id }).then(Boolean), true);
  assert.equal(await Professional.exists({ _id: professional.id }).then(Boolean), true);
});

test('GET /api/customers searches customers and paginates', async () => {
  await Customer.create([
    { name: 'Maria Silva', email: 'maria@example.com', phone: '11999999999' },
    { name: 'Joao Pereira', email: 'joao@example.com', phone: '11888888888' },
  ]);

  const response = await request(app)
    .get('/api/customers')
    .query({ search: 'maria', page: 1, limit: 5 })
    .expect(200);

  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.data[0].name, 'Maria Silva');
  assert.equal(response.body.data[0].id, response.body.data[0]._id);
  assert.equal(response.body.pagination.total, 1);
});

test('API returns standardized validation errors', async () => {
  const response = await request(app)
    .get('/api/appointments')
    .query({ professionalId: 'invalid' })
    .expect(400);

  assert.equal(response.body.error.status, 400);
  assert.equal(response.body.error.code, 'VALIDATION_ERROR');
  assert.equal(response.body.error.message, 'Erro de validação');
  assert.equal(response.body.error.details[0].field, 'professionalId');
});
