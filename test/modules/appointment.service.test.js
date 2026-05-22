const test = require('node:test');
const assert = require('node:assert/strict');
const loadWithMocks = require('../helpers/load-with-mocks');
const createStub = require('../helpers/stub');

const servicePath = '../../src/modules/appointment/appointment.service';
const appointmentModelPath = '../../src/modules/appointment/appointment.model';
const customerModelPath = '../../src/modules/customer/customer.model';
const serviceModelPath = '../../src/modules/service/service.model';
const professionalModelPath = '../../src/modules/professional/professional.model';

const ids = {
  customerId: '665f1d6f7c2a8e0012345671',
  serviceId: '665f1d6f7c2a8e0012345672',
  professionalId: '665f1d6f7c2a8e0012345673',
  appointmentId: '665f1d6f7c2a8e0012345674',
};

const loadService = ({
  appointmentModel = {},
  customerModel = {},
  serviceModel = {},
  professionalModel = {},
}) => loadWithMocks(servicePath, {
  [appointmentModelPath]: appointmentModel,
  [customerModelPath]: customerModel,
  [serviceModelPath]: serviceModel,
  [professionalModelPath]: professionalModel,
});

const createAppointmentDoc = (overrides = {}) => {
  const doc = {
    _id: ids.appointmentId,
    customer: ids.customerId,
    service: ids.serviceId,
    professional: ids.professionalId,
    startAt: new Date('2026-06-01T14:00:00.000Z'),
    endAt: new Date('2026-06-01T15:30:00.000Z'),
    status: 'scheduled',
    reschedules: [],
    ...overrides,
  };

  doc.save = createStub(async () => doc);
  doc.populate = createStub(async () => doc);

  return doc;
};

test('appointment service creates an appointment using the real service duration', async () => {
  const appointmentModel = {
    findOne: createStub(async () => null),
    create: createStub(async (data) => ({ _id: 'appointment-id', ...data })),
  };
  const service = loadService({
    appointmentModel,
    customerModel: { findById: createStub(async () => ({ _id: ids.customerId })) },
    serviceModel: { findById: createStub(async () => ({ _id: ids.serviceId, durationMinutes: 90 })) },
    professionalModel: { findById: createStub(async () => ({ _id: ids.professionalId })) },
  });

  const result = await service.createAppointment({
    ...ids,
    startAt: '2026-06-01T14:00:00.000Z',
    notes: 'Cliente pediu encaixe',
  });

  assert.equal(result._id, 'appointment-id');
  assert.equal(result.endAt.toISOString(), '2026-06-01T15:30:00.000Z');
  assert.deepEqual(appointmentModel.findOne.calls[0], [{
    professional: ids.professionalId,
    status: 'scheduled',
    startAt: { $lt: new Date('2026-06-01T15:30:00.000Z') },
    endAt: { $gt: new Date('2026-06-01T14:00:00.000Z') },
  }]);
  assert.equal(appointmentModel.create.calls[0][0].status, 'scheduled');
});

test('appointment service rejects appointments in the past', async () => {
  const appointmentModel = { findOne: createStub() };
  const service = loadService({
    appointmentModel,
    customerModel: { findById: createStub(async () => ({ _id: ids.customerId })) },
    serviceModel: { findById: createStub(async () => ({ _id: ids.serviceId, durationMinutes: 60 })) },
    professionalModel: { findById: createStub(async () => ({ _id: ids.professionalId })) },
  });

  await assert.rejects(
    () => service.createAppointment({
      ...ids,
      startAt: '2020-01-01T14:00:00.000Z',
    }),
    { status: 400, message: 'Não é possível agendar no passado' }
  );
  assert.equal(appointmentModel.findOne.calls.length, 0);
});

test('appointment service filters appointments by date, professional, customer and status', async () => {
  const appointments = [{ _id: ids.appointmentId }];
  const populate = createStub(async () => appointments);
  const limit = createStub(() => ({ populate }));
  const skip = createStub(() => ({ limit }));
  const sort = createStub(() => ({ skip }));
  const appointmentModel = {
    find: createStub(() => ({ sort })),
    countDocuments: createStub(async () => 1),
  };
  const service = loadService({ appointmentModel });

  const result = await service.getAllAppointments({
    date: '2026-06-01',
    professionalId: ids.professionalId,
    customerId: ids.customerId,
    status: 'cancelled',
    page: 2,
    limit: 10,
  });

  assert.deepEqual(appointmentModel.find.calls[0], [{
    professional: ids.professionalId,
    customer: ids.customerId,
    status: 'cancelled',
    startAt: {
      $gte: new Date('2026-06-01T00:00:00'),
      $lt: new Date('2026-06-02T00:00:00'),
    },
  }]);
  assert.deepEqual(sort.calls, [[{ startAt: 1 }]]);
  assert.deepEqual(skip.calls, [[10]]);
  assert.deepEqual(limit.calls, [[10]]);
  assert.deepEqual(populate.calls, [['customer service professional']]);
  assert.deepEqual(appointmentModel.countDocuments.calls[0], appointmentModel.find.calls[0]);
  assert.deepEqual(result, {
    data: appointments,
    pagination: {
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: true,
    },
  });
});

test('appointment service reschedules with real duration and records history', async () => {
  const appointment = createAppointmentDoc();
  const appointmentModel = {
    findById: createStub(async () => appointment),
    findOne: createStub(async () => null),
  };
  const service = loadService({
    appointmentModel,
    serviceModel: { findById: createStub(async () => ({ _id: ids.serviceId, durationMinutes: 45 })) },
  });

  const result = await service.rescheduleAppointment(ids.appointmentId, {
    startAt: '2026-06-02T16:00:00.000Z',
    notes: 'Cliente pediu para remarcar',
  });

  assert.equal(result, appointment);
  assert.equal(appointment.startAt.toISOString(), '2026-06-02T16:00:00.000Z');
  assert.equal(appointment.endAt.toISOString(), '2026-06-02T16:45:00.000Z');
  assert.equal(appointment.notes, 'Cliente pediu para remarcar');
  assert.equal(appointment.reschedules.length, 1);
  assert.equal(appointment.reschedules[0].oldStartAt.toISOString(), '2026-06-01T14:00:00.000Z');
  assert.deepEqual(appointmentModel.findOne.calls[0], [{
    _id: { $ne: ids.appointmentId },
    professional: ids.professionalId,
    status: 'scheduled',
    startAt: { $lt: new Date('2026-06-02T16:45:00.000Z') },
    endAt: { $gt: new Date('2026-06-02T16:00:00.000Z') },
  }]);
  assert.equal(appointment.save.calls.length, 1);
  assert.deepEqual(appointment.populate.calls, [['customer service professional']]);
});

test('appointment service does not reschedule a cancelled appointment', async () => {
  const appointmentModel = {
    findById: createStub(async () => createAppointmentDoc({ status: 'cancelled' })),
  };
  const service = loadService({ appointmentModel });

  await assert.rejects(
    () => service.rescheduleAppointment(ids.appointmentId, { startAt: '2026-06-02T16:00:00.000Z' }),
    { status: 409, message: 'Agendamento cancelled não pode ser reagendado' }
  );
});

test('appointment service cancels by updating status instead of deleting', async () => {
  const appointment = createAppointmentDoc();
  const appointmentModel = {
    findById: createStub(async () => appointment),
  };
  const service = loadService({ appointmentModel });

  const result = await service.cancelAppointment(ids.appointmentId);

  assert.equal(result, appointment);
  assert.equal(appointment.status, 'cancelled');
  assert.equal(appointment.save.calls.length, 1);
  assert.deepEqual(appointment.populate.calls, [['customer service professional']]);
});

test('appointment service completes by updating status', async () => {
  const appointment = createAppointmentDoc();
  const appointmentModel = {
    findById: createStub(async () => appointment),
  };
  const service = loadService({ appointmentModel });

  const result = await service.completeAppointment(ids.appointmentId);

  assert.equal(result, appointment);
  assert.equal(appointment.status, 'completed');
  assert.equal(appointment.save.calls.length, 1);
});

test('appointment service calculates availability with the selected service duration', async () => {
  const appointmentModel = {
    find: createStub(async () => [{
      startAt: new Date('2026-06-01T10:00:00'),
      endAt: new Date('2026-06-01T11:00:00'),
    }]),
  };
  const service = loadService({
    appointmentModel,
    serviceModel: { findById: createStub(async () => ({ _id: ids.serviceId, durationMinutes: 120 })) },
  });

  const slots = await service.getAvailability({
    professionalId: ids.professionalId,
    serviceId: ids.serviceId,
    date: '2026-06-01',
  });

  assert.equal(slots.at(-1).getHours(), 16);
  assert.equal(slots.some(slot => slot.getHours() === 9 && slot.getMinutes() === 0), false);
  assert.deepEqual(appointmentModel.find.calls[0][0].status, 'scheduled');
});

test('appointment service rejects invalid ids', async () => {
  const service = loadService({});

  await assert.rejects(
    () => service.createAppointment({
      customerId: 'invalid',
      serviceId: ids.serviceId,
      professionalId: ids.professionalId,
      startAt: '2026-06-01T14:00:00.000Z',
    }),
    { status: 400, message: 'IDs inválidos' }
  );

  await assert.rejects(
    () => service.cancelAppointment('invalid'),
    { status: 400, message: 'ID de agendamento inválido' }
  );
});
