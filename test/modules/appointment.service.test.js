const test = require('node:test');
const assert = require('node:assert/strict');
const loadWithMocks = require('../helpers/load-with-mocks');
const createStub = require('../helpers/stub');

const servicePath = '../../src/modules/appointment/appointment.service';
const appointmentRepositoryPath = '../../src/modules/appointment/appointment.repository';
const customerRepositoryPath = '../../src/modules/customer/customer.repository';
const serviceRepositoryPath = '../../src/modules/service/service.repository';
const professionalRepositoryPath = '../../src/modules/professional/professional.repository';

const ids = {
  customerId: '665f1d6f7c2a8e0012345671',
  serviceId: '665f1d6f7c2a8e0012345672',
  professionalId: '665f1d6f7c2a8e0012345673',
  appointmentId: '665f1d6f7c2a8e0012345674',
};

const loadService = ({
  appointmentRepository = {},
  customerRepository = {},
  serviceRepository = {},
  professionalRepository = {},
}) => loadWithMocks(servicePath, {
  [appointmentRepositoryPath]: appointmentRepository,
  [customerRepositoryPath]: customerRepository,
  [serviceRepositoryPath]: serviceRepository,
  [professionalRepositoryPath]: professionalRepository,
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
  const appointmentRepository = {
    findConflict: createStub(async () => null),
    create: createStub(async (data) => ({ _id: 'appointment-id', ...data })),
  };
  const service = loadService({
    appointmentRepository,
    customerRepository: { findById: createStub(async () => ({ _id: ids.customerId })) },
    serviceRepository: { findById: createStub(async () => ({ _id: ids.serviceId, durationMinutes: 90 })) },
    professionalRepository: { findById: createStub(async () => ({ _id: ids.professionalId })) },
  });

  const result = await service.createAppointment({
    ...ids,
    startAt: '2026-06-01T14:00:00.000Z',
    notes: 'Cliente pediu encaixe',
  });

  assert.equal(result._id, 'appointment-id');
  assert.equal(result.endAt.toISOString(), '2026-06-01T15:30:00.000Z');
  assert.deepEqual(appointmentRepository.findConflict.calls[0], [{
    professionalId: ids.professionalId,
    startDate: new Date('2026-06-01T14:00:00.000Z'),
    endDate: new Date('2026-06-01T15:30:00.000Z'),
  }]);
  assert.equal(appointmentRepository.create.calls[0][0].status, 'scheduled');
});

test('appointment service rejects appointments in the past', async () => {
  const appointmentRepository = { findConflict: createStub() };
  const service = loadService({
    appointmentRepository,
    customerRepository: { findById: createStub(async () => ({ _id: ids.customerId })) },
    serviceRepository: { findById: createStub(async () => ({ _id: ids.serviceId, durationMinutes: 60 })) },
    professionalRepository: { findById: createStub(async () => ({ _id: ids.professionalId })) },
  });

  await assert.rejects(
    () => service.createAppointment({
      ...ids,
      startAt: '2020-01-01T14:00:00.000Z',
    }),
    { status: 400, message: 'Não é possível agendar no passado' }
  );
  assert.equal(appointmentRepository.findConflict.calls.length, 0);
});

test('appointment service filters appointments by date, professional, customer and status', async () => {
  const appointments = [{ _id: ids.appointmentId }];
  const appointmentRepository = {
    paginate: createStub(async () => ({
      data: appointments,
      pagination: {
        page: 2,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    })),
  };
  const service = loadService({ appointmentRepository });

  const result = await service.getAllAppointments({
    date: '2026-06-01',
    professionalId: ids.professionalId,
    customerId: ids.customerId,
    status: 'cancelled',
    page: 2,
    limit: 10,
  });

  assert.deepEqual(appointmentRepository.paginate.calls[0][0], {
    professional: ids.professionalId,
    customer: ids.customerId,
    status: 'cancelled',
    startAt: {
      $gte: new Date('2026-06-01T00:00:00'),
      $lt: new Date('2026-06-02T00:00:00'),
    },
  });
  assert.deepEqual(appointmentRepository.paginate.calls[0][1], {
    page: 2,
    limit: 10,
    sort: { startAt: 1 },
    populate: 'customer service professional',
  });
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
  const appointmentRepository = {
    findById: createStub(async () => appointment),
    findConflict: createStub(async () => null),
  };
  const service = loadService({
    appointmentRepository,
    serviceRepository: { findById: createStub(async () => ({ _id: ids.serviceId, durationMinutes: 45 })) },
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
  assert.deepEqual(appointmentRepository.findConflict.calls[0], [{
    professionalId: ids.professionalId,
    startDate: new Date('2026-06-02T16:00:00.000Z'),
    endDate: new Date('2026-06-02T16:45:00.000Z'),
    excludeId: ids.appointmentId,
  }]);
  assert.equal(appointment.save.calls.length, 1);
  assert.deepEqual(appointment.populate.calls, [['customer service professional']]);
});

test('appointment service does not reschedule a cancelled appointment', async () => {
  const appointmentRepository = {
    findById: createStub(async () => createAppointmentDoc({ status: 'cancelled' })),
  };
  const service = loadService({ appointmentRepository });

  await assert.rejects(
    () => service.rescheduleAppointment(ids.appointmentId, { startAt: '2026-06-02T16:00:00.000Z' }),
    { status: 409, message: 'Agendamento cancelled não pode ser reagendado' }
  );
});

test('appointment service cancels by updating status instead of deleting', async () => {
  const appointment = createAppointmentDoc();
  const appointmentRepository = {
    findById: createStub(async () => appointment),
  };
  const service = loadService({ appointmentRepository });

  const result = await service.cancelAppointment(ids.appointmentId);

  assert.equal(result, appointment);
  assert.equal(appointment.status, 'cancelled');
  assert.equal(appointment.save.calls.length, 1);
  assert.deepEqual(appointment.populate.calls, [['customer service professional']]);
});

test('appointment service completes by updating status', async () => {
  const appointment = createAppointmentDoc();
  const appointmentRepository = {
    findById: createStub(async () => appointment),
  };
  const service = loadService({ appointmentRepository });

  const result = await service.completeAppointment(ids.appointmentId);

  assert.equal(result, appointment);
  assert.equal(appointment.status, 'completed');
  assert.equal(appointment.save.calls.length, 1);
});

test('appointment service calculates availability with the selected service duration', async () => {
  const appointmentRepository = {
    findScheduledOverlapping: createStub(async () => [{
      startAt: new Date('2026-06-01T10:00:00'),
      endAt: new Date('2026-06-01T11:00:00'),
    }]),
  };
  const service = loadService({
    appointmentRepository,
    serviceRepository: { findById: createStub(async () => ({ _id: ids.serviceId, durationMinutes: 120 })) },
  });

  const slots = await service.getAvailability({
    professionalId: ids.professionalId,
    serviceId: ids.serviceId,
    date: '2026-06-01',
  });

  assert.equal(slots.at(-1).getHours(), 16);
  assert.equal(slots.some(slot => slot.getHours() === 9 && slot.getMinutes() === 0), false);
  assert.deepEqual(appointmentRepository.findScheduledOverlapping.calls[0], [{
    professionalId: ids.professionalId,
    startDate: new Date('2026-06-01T09:00:00'),
    endDate: new Date('2026-06-01T18:00:00'),
  }]);
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
