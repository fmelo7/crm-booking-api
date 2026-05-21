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

test('appointment service creates an appointment and calculates endAt', async () => {
  const appointmentModel = {
    findOne: createStub(async () => null),
    create: createStub(async (data) => ({ _id: 'appointment-id', ...data })),
  };
  const service = loadService({
    appointmentModel,
    customerModel: { findById: createStub(async () => ({ _id: ids.customerId })) },
    serviceModel: { findById: createStub(async () => ({ _id: ids.serviceId })) },
    professionalModel: { findById: createStub(async () => ({ _id: ids.professionalId })) },
  });

  const result = await service.createAppointment({
    ...ids,
    startAt: '2026-05-21T14:00:00.000Z',
    notes: 'Cliente pediu encaixe',
  });

  assert.equal(result._id, 'appointment-id');
  assert.equal(result.startAt.toISOString(), '2026-05-21T14:00:00.000Z');
  assert.equal(result.endAt.toISOString(), '2026-05-21T15:00:00.000Z');
  assert.deepEqual(appointmentModel.findOne.calls[0], [{
    professional: ids.professionalId,
    startAt: { $lt: new Date('2026-05-21T15:00:00.000Z') },
    endAt: { $gt: new Date('2026-05-21T14:00:00.000Z') },
  }]);
  assert.equal(appointmentModel.create.calls[0][0].customer, ids.customerId);
});

test('appointment service rejects missing required fields', async () => {
  const appointmentModel = {
    create: createStub(),
  };
  const service = loadService({ appointmentModel });

  await assert.rejects(
    () => service.createAppointment({}),
    { status: 400, message: 'Campos obrigatórios ausentes' }
  );
  assert.equal(appointmentModel.create.calls.length, 0);
});

test('appointment service rejects invalid ids', async () => {
  const service = loadService({});

  await assert.rejects(
    () => service.createAppointment({
      customerId: 'invalid',
      serviceId: ids.serviceId,
      professionalId: ids.professionalId,
      startAt: '2026-05-21T14:00:00.000Z',
    }),
    { status: 400, message: 'IDs inválidos para cliente, serviço ou profissional' }
  );
});

test('appointment service rejects when a related record is missing', async () => {
  const service = loadService({
    customerModel: { findById: createStub(async () => null) },
    serviceModel: { findById: createStub(async () => ({ _id: ids.serviceId })) },
    professionalModel: { findById: createStub(async () => ({ _id: ids.professionalId })) },
  });

  await assert.rejects(
    () => service.createAppointment({
      ...ids,
      startAt: '2026-05-21T14:00:00.000Z',
    }),
    { status: 404, message: 'Cliente, serviço ou profissional não encontrado' }
  );
});

test('appointment service rejects invalid startAt', async () => {
  const appointmentModel = {
    findOne: createStub(),
  };
  const service = loadService({
    appointmentModel,
    customerModel: { findById: createStub(async () => ({ _id: ids.customerId })) },
    serviceModel: { findById: createStub(async () => ({ _id: ids.serviceId })) },
    professionalModel: { findById: createStub(async () => ({ _id: ids.professionalId })) },
  });

  await assert.rejects(
    () => service.createAppointment({
      ...ids,
      startAt: 'data-invalida',
    }),
    { status: 400, message: 'startAt inválido' }
  );
  assert.equal(appointmentModel.findOne.calls.length, 0);
});

test('appointment service rejects conflicting schedules', async () => {
  const appointmentModel = {
    findOne: createStub(async () => ({ _id: 'existing-appointment' })),
    create: createStub(),
  };
  const service = loadService({
    appointmentModel,
    customerModel: { findById: createStub(async () => ({ _id: ids.customerId })) },
    serviceModel: { findById: createStub(async () => ({ _id: ids.serviceId })) },
    professionalModel: { findById: createStub(async () => ({ _id: ids.professionalId })) },
  });

  await assert.rejects(
    () => service.createAppointment({
      ...ids,
      startAt: '2026-05-21T14:00:00.000Z',
    }),
    { status: 409, message: 'Horário ocupado' }
  );
  assert.equal(appointmentModel.create.calls.length, 0);
});

test('appointment service returns 400 for invalid appointment id', async () => {
  const service = loadService({});

  await assert.rejects(
    () => service.getAppointmentById('invalid'),
    { status: 400, message: 'ID de agendamento inválido' }
  );
});

test('appointment service returns 404 when appointment is not found', async () => {
  const appointmentModel = {
    findById: createStub(() => ({
      populate: createStub(async () => null),
    })),
  };
  const service = loadService({ appointmentModel });

  await assert.rejects(
    () => service.getAppointmentById('665f1d6f7c2a8e0012345674'),
    { status: 404, message: 'Agendamento não encontrado' }
  );
});

test('appointment service reschedules an appointment and recalculates endAt', async () => {
  const updatedAppointment = { _id: ids.appointmentId, startAt: new Date('2026-05-21T16:00:00.000Z') };
  const populate = createStub(async () => updatedAppointment);
  const appointmentModel = {
    findById: createStub(async () => ({
      _id: ids.appointmentId,
      professional: ids.professionalId,
    })),
    findOne: createStub(async () => null),
    findByIdAndUpdate: createStub(() => ({ populate })),
  };
  const service = loadService({ appointmentModel });

  const result = await service.rescheduleAppointment(ids.appointmentId, {
    startAt: '2026-05-21T16:00:00.000Z',
    notes: 'Cliente pediu para remarcar',
  });

  assert.equal(result, updatedAppointment);
  assert.deepEqual(appointmentModel.findOne.calls[0], [{
    _id: { $ne: ids.appointmentId },
    professional: ids.professionalId,
    startAt: { $lt: new Date('2026-05-21T17:00:00.000Z') },
    endAt: { $gt: new Date('2026-05-21T16:00:00.000Z') },
  }]);
  assert.deepEqual(appointmentModel.findByIdAndUpdate.calls[0], [
    ids.appointmentId,
    {
      startAt: new Date('2026-05-21T16:00:00.000Z'),
      endAt: new Date('2026-05-21T17:00:00.000Z'),
      notes: 'Cliente pediu para remarcar',
    },
    { new: true, runValidators: true },
  ]);
  assert.deepEqual(populate.calls, [['customer service professional']]);
});

test('appointment service rejects reschedule with invalid id', async () => {
  const service = loadService({});

  await assert.rejects(
    () => service.rescheduleAppointment('invalid', { startAt: '2026-05-21T16:00:00.000Z' }),
    { status: 400, message: 'ID de agendamento inválido' }
  );
});

test('appointment service rejects reschedule without startAt', async () => {
  const service = loadService({});

  await assert.rejects(
    () => service.rescheduleAppointment(ids.appointmentId, {}),
    { status: 400, message: 'startAt é obrigatório para reagendar' }
  );
});

test('appointment service rejects reschedule when appointment is not found', async () => {
  const appointmentModel = {
    findById: createStub(async () => null),
  };
  const service = loadService({ appointmentModel });

  await assert.rejects(
    () => service.rescheduleAppointment(ids.appointmentId, { startAt: '2026-05-21T16:00:00.000Z' }),
    { status: 404, message: 'Agendamento não encontrado' }
  );
});

test('appointment service rejects reschedule with invalid startAt', async () => {
  const appointmentModel = {
    findById: createStub(async () => ({
      _id: ids.appointmentId,
      professional: ids.professionalId,
    })),
    findOne: createStub(),
  };
  const service = loadService({ appointmentModel });

  await assert.rejects(
    () => service.rescheduleAppointment(ids.appointmentId, { startAt: 'data-invalida' }),
    { status: 400, message: 'startAt inválido' }
  );
  assert.equal(appointmentModel.findOne.calls.length, 0);
});

test('appointment service rejects reschedule with conflicting schedules', async () => {
  const appointmentModel = {
    findById: createStub(async () => ({
      _id: ids.appointmentId,
      professional: ids.professionalId,
    })),
    findOne: createStub(async () => ({ _id: 'another-appointment' })),
    findByIdAndUpdate: createStub(),
  };
  const service = loadService({ appointmentModel });

  await assert.rejects(
    () => service.rescheduleAppointment(ids.appointmentId, { startAt: '2026-05-21T16:00:00.000Z' }),
    { status: 409, message: 'Horário ocupado' }
  );
  assert.equal(appointmentModel.findByIdAndUpdate.calls.length, 0);
});

test('appointment service cancels an existing appointment', async () => {
  const canceled = { _id: ids.appointmentId };
  const appointmentModel = {
    findByIdAndDelete: createStub(async () => canceled),
  };
  const service = loadService({ appointmentModel });

  const result = await service.cancelAppointment(ids.appointmentId);

  assert.equal(result, canceled);
  assert.deepEqual(appointmentModel.findByIdAndDelete.calls, [[ids.appointmentId]]);
});

test('appointment service rejects cancel with invalid id', async () => {
  const service = loadService({});

  await assert.rejects(
    () => service.cancelAppointment('invalid'),
    { status: 400, message: 'ID de agendamento inválido' }
  );
});

test('appointment service rejects cancel when appointment is not found', async () => {
  const appointmentModel = {
    findByIdAndDelete: createStub(async () => null),
  };
  const service = loadService({ appointmentModel });

  await assert.rejects(
    () => service.cancelAppointment(ids.appointmentId),
    { status: 404, message: 'Agendamento não encontrado' }
  );
});
