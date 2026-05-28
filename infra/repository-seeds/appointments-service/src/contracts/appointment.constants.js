const APPOINTMENT_CONTRACT_VERSION = 1;

const AppointmentStatus = Object.freeze({
  SCHEDULED: 'scheduled',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

const AppointmentStatuses = Object.freeze(Object.values(AppointmentStatus));

module.exports = {
  APPOINTMENT_CONTRACT_VERSION,
  AppointmentStatus,
  AppointmentStatuses,
};
