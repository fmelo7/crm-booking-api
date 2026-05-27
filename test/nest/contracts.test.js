const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const contracts = require('../../packages/contracts');

const id = '64b7f8f8f8f8f8f8f8f8f801';
const otherId = '64b7f8f8f8f8f8f8f8f8f802';
const thirdId = '64b7f8f8f8f8f8f8f8f8f803';

test('appointment contracts validate public appointment DTOs', () => {
  const result = contracts.createAppointmentRequestSchema.safeParse({
    customerId: id,
    serviceId: otherId,
    professionalId: thirdId,
    startAt: '2030-01-01T14:00:00.000Z',
    notes: 'Cliente pediu encaixe',
  });

  assert.equal(result.success, true);
  assert.equal(result.data.customerId, id);
});

test('appointment contracts reject invalid public appointment DTOs', () => {
  const result = contracts.createAppointmentRequestSchema.safeParse({
    customerId: 'invalid',
    serviceId: otherId,
    professionalId: thirdId,
    startAt: 'not-a-date',
  });

  assert.equal(result.success, false);
  assert.equal(result.error.issues[0].path.length > 0, true);
});

test('appointment contracts validate versioned event payloads', () => {
  const result = contracts.appointmentEventSchema.safeParse({
    eventId: 'event-1',
    eventName: contracts.AppointmentEvents.CREATED,
    version: contracts.APPOINTMENT_CONTRACT_VERSION,
    occurredAt: '2030-01-01T14:00:00.000Z',
    correlationId: 'request-1',
    data: {
      appointmentId: id,
      customerId: id,
      serviceId: otherId,
      professionalId: thirdId,
      startAt: '2030-01-01T14:00:00.000Z',
      endAt: '2030-01-01T15:00:00.000Z',
      status: contracts.AppointmentStatus.SCHEDULED,
    },
  });

  assert.equal(result.success, true);
});

test('contracts package does not import app or infrastructure modules', () => {
  const packageRoot = path.resolve(__dirname, '../../packages/contracts');
  const forbidden = [
    `${path.sep}src${path.sep}`,
    `${path.sep}packages${path.sep}domains${path.sep}`,
    `${path.sep}node_modules${path.sep}@nestjs${path.sep}`,
    `${path.sep}node_modules${path.sep}mongoose${path.sep}`,
    `${path.sep}node_modules${path.sep}pg${path.sep}`,
  ];

  const loadedContractModules = Object.values(require.cache)
    .filter((module) => module.id.startsWith(packageRoot));

  assert.ok(loadedContractModules.length > 0);
  loadedContractModules.forEach((module) => {
    module.children.forEach((child) => {
      assert.equal(
        forbidden.some((pattern) => child.id.includes(pattern)),
        false,
        `${module.id} should not load ${child.id}`
      );
    });
  });
});
