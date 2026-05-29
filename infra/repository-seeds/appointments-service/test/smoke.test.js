const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const test = require('node:test');
const createAppointmentsServiceApp = require('../createAppointmentsServiceApp');
const AppointmentProvider = require('../src/nest/appointment/appointment.provider');

test('repository scaffold is buildable in isolation', () => {
  assert.equal(fs.existsSync('README.md'), true);
  assert.equal(fs.existsSync('package-lock.json'), true);

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.scripts.start, 'node server.js');
  assert.equal(typeof packageJson.scripts.test, 'string');
  assert.equal(typeof packageJson.scripts.build, 'string');
});

test('appointments service serves health and metrics without monorepo imports', async () => {
  const previousServiceName = process.env.SERVICE_NAME;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.SERVICE_NAME = 'appointments-service';
  process.env.NODE_ENV = 'test';

  const { nestApp, expressApp } = await createAppointmentsServiceApp();
  expressApp.set('dbConnected', true);
  const server = http.createServer(expressApp);

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const health = await fetch(`http://127.0.0.1:${port}/api/health`);
    const metrics = await fetch(`http://127.0.0.1:${port}/api/metrics`);
    const swagger = await fetch(`http://127.0.0.1:${port}/api-docs/`);
    const openApi = await fetch(`http://127.0.0.1:${port}/api-docs/openapi.json`);

    assert.equal(health.status, 200);
    assert.equal((await health.json()).service, 'appointments-service');
    assert.equal(metrics.status, 200);
    assert.match(await metrics.text(), /http_requests_total/);
    assert.equal(swagger.status, 200);
    assert.match(await swagger.text(), /SwaggerUIBundle/);
    assert.equal(openApi.status, 200);
    assert.equal((await openApi.json()).info.title, 'Appointments API');
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    await nestApp.close();

    if (previousServiceName === undefined) {
      delete process.env.SERVICE_NAME;
    } else {
      process.env.SERVICE_NAME = previousServiceName;
    }

    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
  }
});

test('appointment provider creates, lists, reschedules, cancels and completes in isolation', async () => {
  const records = [];
  let sequence = 1;
  const customerId = '507f1f77bcf86cd799439011';
  const serviceId = '507f1f77bcf86cd799439012';
  const professionalId = '507f1f77bcf86cd799439013';
  const later = (days, hour = 10) => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + days);
    date.setUTCHours(hour, 0, 0, 0);
    return date.toISOString();
  };
  const attachDocumentMethods = (appointment) => {
    appointment.save = async () => appointment;
    appointment.populate = async () => appointment;
    return appointment;
  };
  const repository = {
    create: async (data) => {
      const appointment = attachDocumentMethods({
        ...data,
        _id: String(sequence).padStart(24, '0'),
        id: String(sequence).padStart(24, '0'),
        reschedules: [],
      });
      sequence += 1;
      records.push(appointment);
      return appointment;
    },
    paginate: async () => ({
      data: records,
      pagination: { page: 1, limit: 20, total: records.length },
    }),
    findById: async (id) => records.find((item) => item._id === id),
    findByIdPopulated: async (id) => records.find((item) => item._id === id),
    findConflict: async ({ professionalId: targetProfessional, startDate, endDate, excludeId }) =>
      records.find((item) =>
        item._id !== excludeId &&
        item.professional === targetProfessional &&
        item.status === 'scheduled' &&
        item.startAt < endDate &&
        item.endAt > startDate
      ),
    findScheduledOverlapping: async ({ professionalId: targetProfessional }) =>
      records.filter((item) => item.professional === targetProfessional && item.status === 'scheduled'),
  };
  const provider = new AppointmentProvider(repository, {
    findCustomer: async (id) => ({ _id: id }),
    findService: async (id) => ({ _id: id, durationMinutes: 45 }),
    findProfessional: async (id) => ({ _id: id }),
  });

  const created = await provider.create({
    customerId,
    serviceId,
    professionalId,
    startAt: later(2),
    notes: 'primeira consulta',
  });
  const listed = await provider.list({ page: 1, limit: 20 });
  const rescheduled = await provider.reschedule(created._id, { startAt: later(3), notes: 'novo horario' });
  const toCancel = await provider.create({ customerId, serviceId, professionalId, startAt: later(4) });
  const cancelled = await provider.cancel(toCancel._id);
  const toComplete = await provider.create({ customerId, serviceId, professionalId, startAt: later(5) });
  const completed = await provider.complete(toComplete._id);

  assert.equal(created.status, 'scheduled');
  assert.equal(listed.pagination.total, 1);
  assert.equal(rescheduled.notes, 'novo horario');
  assert.equal(rescheduled.reschedules.length, 1);
  assert.equal(cancelled.status, 'cancelled');
  assert.equal(completed.status, 'completed');
});
