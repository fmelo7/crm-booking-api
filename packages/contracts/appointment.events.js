const { APPOINTMENT_CONTRACT_VERSION } = require('./appointment.constants');

const APPOINTMENT_EVENTS_VERSION = APPOINTMENT_CONTRACT_VERSION;

const AppointmentEvents = Object.freeze({
  CREATED: 'appointment.created',
  RESCHEDULED: 'appointment.rescheduled',
  CANCELLED: 'appointment.cancelled',
  COMPLETED: 'appointment.completed',
});

module.exports = {
  APPOINTMENT_EVENTS_VERSION,
  AppointmentEvents,
};
