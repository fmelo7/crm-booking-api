const test = require('node:test');
const assert = require('node:assert/strict');

const createNestApp = require('../../src/nest/createNestApp');
const appEntrypoint = require('../../src/app');
const apiAppEntrypoint = require('../../apps/api/app');
const contracts = require('../../packages/contracts');

test('app entrypoint exports the NestJS app factory', () => {
  assert.equal(appEntrypoint, createNestApp);
});

test('api app entrypoint exports the NestJS app factory', () => {
  assert.equal(apiAppEntrypoint, createNestApp);
});

test('contracts package exports appointment events without infrastructure dependencies', () => {
  assert.equal(contracts.APPOINTMENT_EVENTS_VERSION, 1);
  assert.equal(contracts.AppointmentEvents.CREATED, 'appointment.created');
});
