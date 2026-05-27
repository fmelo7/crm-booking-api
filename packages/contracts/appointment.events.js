const APPOINTMENT_EVENTS_VERSION = 1;

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
